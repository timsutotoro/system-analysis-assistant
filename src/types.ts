/** 對話訊息 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: number;
}

/** 應用程式狀態 */
export interface AppState {
    apiKey: string;
    modelName: string;
    messages: ChatMessage[];
    documentMarkdown: string;
    documentVersion: number;
}

/** Storage Keys */
export const STORAGE_KEYS = {
    API_KEY: 'sa-assistant-api-key',
    MODEL_NAME: 'sa-assistant-model-name',
    MESSAGES: 'sa-assistant-messages',
    DOCUMENT: 'sa-assistant-document',
    DOCUMENT_VERSION: 'sa-assistant-doc-version',
} as const;
