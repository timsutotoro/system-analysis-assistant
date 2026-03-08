import { useState, useCallback, useEffect } from 'react';
import { Settings, Trash2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import ChatPanel from './components/ChatPanel';
import PreviewPanel from './components/PreviewPanel';
import SettingsModal from './components/SettingsModal';
import * as storage from './services/storage';
import { sendMessage } from './services/llm';
import type { ChatMessage } from './types';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function App() {
    // --- State ---
    const [apiKey, setApiKey] = useState(() => storage.getApiKey());
    const [modelName, setModelName] = useState(() => storage.getModelName());
    const [messages, setMessages] = useState<ChatMessage[]>(() => storage.getMessages());
    const [documentMarkdown, setDocumentMarkdown] = useState(() => storage.getDocument());
    const [documentVersion, setDocumentVersion] = useState(() => storage.getDocumentVersion());

    const [isSettingsOpen, setIsSettingsOpen] = useState(!apiKey);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [showPreview, setShowPreview] = useState(true);

    // --- Persistence ---
    useEffect(() => { storage.saveMessages(messages); }, [messages]);
    useEffect(() => { storage.saveDocument(documentMarkdown); }, [documentMarkdown]);
    useEffect(() => { storage.saveDocumentVersion(documentVersion); }, [documentVersion]);

    // --- Handlers ---
    const handleSaveSettings = useCallback((newKey: string, newModel: string) => {
        setApiKey(newKey);
        setModelName(newModel);
        storage.setApiKey(newKey);
        storage.setModelName(newModel);
    }, []);

    const handleSendMessage = useCallback(async (content: string) => {
        if (!apiKey || isLoading) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsLoading(true);
        setStreamingContent('');

        try {
            const result = await sendMessage(
                apiKey,
                modelName,
                updatedMessages,
                documentMarkdown,
                (chunk) => {
                    setStreamingContent(prev => prev + chunk);
                },
            );

            // 建立 agent 訊息（只顯示對話部分）
            const agentMessage: ChatMessage = {
                id: generateId(),
                role: 'agent',
                content: result.chatContent || '（已更新文件，請查看右側預覽。）',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, agentMessage]);

            // 更新文件
            if (result.documentContent) {
                setDocumentMarkdown(result.documentContent);
                setDocumentVersion(prev => prev + 1);
                // 自動顯示預覽面板
                setShowPreview(true);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知錯誤';
            const agentMessage: ChatMessage = {
                id: generateId(),
                role: 'agent',
                content: `❌ **發生錯誤**：${errorMsg}\n\n請檢查您的 API Key 是否正確，或嘗試切換模型。`,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, agentMessage]);
        } finally {
            setIsLoading(false);
            setStreamingContent('');
        }
    }, [apiKey, modelName, messages, documentMarkdown, isLoading]);

    const handleClearChat = useCallback(() => {
        if (!window.confirm('確定要清除所有對話與文件嗎？此操作無法復原。')) return;
        setMessages([]);
        setDocumentMarkdown('');
        setDocumentVersion(0);
        storage.clearAll();
        // 保留 API key 和 model
        storage.setApiKey(apiKey);
        storage.setModelName(modelName);
    }, [apiKey, modelName]);

    // --- Render ---
    return (
        <div className="h-screen flex flex-col bg-surface-950">
            {/* Top Bar */}
            <header className="flex-shrink-0 h-12 border-b border-surface-800/60 flex items-center justify-between px-4 glass-panel">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">SA</span>
                    </div>
                    <h1 className="text-sm font-semibold text-surface-200 hidden sm:block">
                        系統分析書撰寫助手
                    </h1>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-8 h-8 rounded-lg hover:bg-surface-700/50 flex items-center justify-center transition-colors text-surface-400 hover:text-surface-200"
                        title={showPreview ? '隱藏預覽' : '顯示預覽'}
                    >
                        {showPreview ? (
                            <PanelLeftClose className="w-4 h-4" />
                        ) : (
                            <PanelLeftOpen className="w-4 h-4" />
                        )}
                    </button>
                    <button
                        onClick={handleClearChat}
                        className="w-8 h-8 rounded-lg hover:bg-red-900/30 flex items-center justify-center transition-colors text-surface-400 hover:text-red-400"
                        title="清除對話"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-8 h-8 rounded-lg hover:bg-surface-700/50 flex items-center justify-center transition-colors text-surface-400 hover:text-surface-200"
                        title="設定"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Chat Panel */}
                <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-surface-800/40 transition-all duration-300`}>
                    <ChatPanel
                        messages={messages}
                        streamingContent={streamingContent}
                        isLoading={isLoading}
                        onSendMessage={handleSendMessage}
                    />
                </div>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="w-1/2 animate-fade-in">
                        <PreviewPanel
                            documentMarkdown={documentMarkdown}
                            documentVersion={documentVersion}
                        />
                    </div>
                )}
            </main>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                apiKey={apiKey}
                modelName={modelName}
                onSave={handleSaveSettings}
                isFirstTime={!apiKey}
            />
        </div>
    );
}
