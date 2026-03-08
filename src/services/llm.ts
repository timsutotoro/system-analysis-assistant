/**
 * LLM Service — 封裝 Gemini API 呼叫與回應解析
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage } from '../types';
import { buildSystemPrompt } from './prompt';

/** 解析後的 LLM 回應 */
export interface ParsedResponse {
    chatContent: string;
    documentContent: string | null;
}

/** Token 管理：保留最近 N 輪對話 */
const MAX_HISTORY_ROUNDS = 10;

/**
 * 解析 LLM 回應，拆分對話與文件內容
 */
export function parseResponse(rawText: string): ParsedResponse {
    const docStartTag = '<!-- DOCUMENT_START -->';
    const docEndTag = '<!-- DOCUMENT_END -->';

    const startIdx = rawText.indexOf(docStartTag);
    const endIdx = rawText.indexOf(docEndTag);

    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
        // 沒有文件標記 → 純對話
        return {
            chatContent: rawText.trim(),
            documentContent: null,
        };
    }

    const chatContent = rawText.substring(0, startIdx).trim();
    const documentContent = rawText
        .substring(startIdx + docStartTag.length, endIdx)
        .trim();

    return {
        chatContent,
        documentContent,
    };
}

/**
 * 建構傳送給 Gemini 的對話歷史
 * 保留最近 MAX_HISTORY_ROUNDS 輪 + 最新版文件全文
 */
function buildChatHistory(
    messages: ChatMessage[],
    currentDocument: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    // 取最近 N 輪（每輪 = 1 user + 1 agent）
    const recentMessages = messages.slice(-(MAX_HISTORY_ROUNDS * 2));

    const history = recentMessages
        .filter((_, i) => i < recentMessages.length - 1) // 排除最後一則（會作為當前輸入）
        .map(msg => ({
            role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
            parts: [{ text: msg.content }],
        }));

    // 如果有現有文件，在歷史開頭加入 context
    if (currentDocument) {
        history.unshift({
            role: 'user',
            parts: [{ text: `[系統備註] 以下是目前最新版的系統分析書內容，請在後續的對話中基於此版本進行修訂：\n\n${currentDocument}` }],
        });
        history.splice(1, 0, {
            role: 'model',
            parts: [{ text: '了解，我已讀取目前最新版的系統分析書。請繼續與我討論，我會基於此版本進行更新。' }],
        });
    }

    return history;
}

/**
 * 發送訊息給 Gemini 並取得回應（Streaming）
 */
export async function sendMessage(
    apiKey: string,
    modelName: string,
    messages: ChatMessage[],
    currentDocument: string,
    onStreamChunk: (chunk: string) => void,
): Promise<ParsedResponse> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemPrompt(),
    });

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error('最後一則訊息必須為使用者訊息');
    }

    const history = buildChatHistory(messages, currentDocument);

    const chat = model.startChat({ history });

    const result = await chat.sendMessageStream(lastMessage.content);

    let fullText = '';
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onStreamChunk(chunkText);
    }

    return parseResponse(fullText);
}

/**
 * 測試 API Key 與模型連線是否有效
 * 發送一個極短的請求來驗證
 */
export async function testConnection(
    apiKey: string,
    modelName: string,
): Promise<{ success: boolean; message: string; availableModels?: string[] }> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('回覆「連線成功」四個字即可。');
        const text = result.response.text();

        return {
            success: true,
            message: `✅ 連線成功！模型 ${modelName} 回應正常。\n回覆：${text.substring(0, 50)}`,
        };
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);

        // 判斷錯誤類型給出更友善的提示
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
            return {
                success: false,
                message: '❌ API Key 無效。請確認您的 Key 是否正確，或到 Google AI Studio 重新產生。',
            };
        }
        if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('is not found')) {
            return {
                success: false,
                message: `❌ 模型 "${modelName}" 不存在或不可用。請切換其他模型再試。`,
            };
        }
        if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RATE_LIMIT')) {
            return {
                success: false,
                message: '⚠️ API Key 有效，但已達到使用配額限制。請稍後再試或更換 Key。',
            };
        }
        if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
            return {
                success: false,
                message: '❌ 此 API Key 沒有使用 Gemini API 的權限。請確認已在 Google Cloud 啟用 Generative Language API。',
            };
        }

        return {
            success: false,
            message: `❌ 連線失敗：${errMsg}`,
        };
    }
}
