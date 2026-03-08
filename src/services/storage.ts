import { STORAGE_KEYS } from '../types';
import type { ChatMessage } from '../types';

/** 讀取 API Key */
export function getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) ?? '';
}

/** 儲存 API Key */
export function setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

/** 讀取模型名稱 */
export function getModelName(): string {
    return localStorage.getItem(STORAGE_KEYS.MODEL_NAME) ?? 'gemini-2.5-flash';
}

/** 儲存模型名稱 */
export function setModelName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.MODEL_NAME, name);
}

/** 讀取對話紀錄 */
export function getMessages(): ChatMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as ChatMessage[];
    } catch {
        return [];
    }
}

/** 儲存對話紀錄 */
export function saveMessages(messages: ChatMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

/** 讀取文件草稿 */
export function getDocument(): string {
    return localStorage.getItem(STORAGE_KEYS.DOCUMENT) ?? '';
}

/** 儲存文件草稿 */
export function saveDocument(markdown: string): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENT, markdown);
}

/** 讀取文件版本號 */
export function getDocumentVersion(): number {
    const v = localStorage.getItem(STORAGE_KEYS.DOCUMENT_VERSION);
    return v ? parseInt(v, 10) : 0;
}

/** 儲存文件版本號 */
export function saveDocumentVersion(version: number): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_VERSION, version.toString());
}

/** 清除所有資料 */
export function clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
