import { useState } from 'react';
import { KeyRound, Cpu, X, ChevronDown, Zap, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { testConnection } from '../services/llm';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    modelName: string;
    onSave: (apiKey: string, modelName: string) => void;
    isFirstTime: boolean;
}

const AVAILABLE_MODELS = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash（推薦，穩定版）' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro（高品質，穩定版）' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite（輕量省配額）' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite（最輕量）' },
    { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview（最新預覽）' },
    { value: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview（最新輕量預覽）' },
];

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export default function SettingsModal({
    isOpen,
    onClose,
    apiKey: initialApiKey,
    modelName: initialModelName,
    onSave,
    isFirstTime,
}: SettingsModalProps) {
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [modelName, setModelName] = useState(initialModelName || 'gemini-2.5-flash');
    const [showKey, setShowKey] = useState(false);

    // Test connection state
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [hasPassedTest, setHasPassedTest] = useState(false);

    if (!isOpen) return null;

    const handleTest = async () => {
        if (!apiKey.trim()) return;
        setTestStatus('testing');
        setTestMessage('');
        setHasPassedTest(false);

        const result = await testConnection(apiKey.trim(), modelName);
        setTestStatus(result.success ? 'success' : 'error');
        setTestMessage(result.message);
        if (result.success) {
            setHasPassedTest(true);
        }
    };

    const handleSave = () => {
        if (!apiKey.trim() || !hasPassedTest) return;
        onSave(apiKey.trim(), modelName);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && apiKey.trim() && !hasPassedTest) {
            handleTest();
        } else if (e.key === 'Enter' && hasPassedTest) {
            handleSave();
        }
    };

    // Reset test state when key or model changes
    const handleApiKeyChange = (val: string) => {
        setApiKey(val);
        setTestStatus('idle');
        setTestMessage('');
        setHasPassedTest(false);
    };
    const handleModelChange = (val: string) => {
        setModelName(val);
        setTestStatus('idle');
        setTestMessage('');
        setHasPassedTest(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-surface-100">
                                {isFirstTime ? '歡迎使用' : 'API 設定'}
                            </h2>
                            <p className="text-xs text-surface-400">
                                {isFirstTime ? '請先設定並測試您的 Gemini API Key' : '修改 API 設定'}
                            </p>
                        </div>
                    </div>
                    {!isFirstTime && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-surface-700/50 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-surface-400" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="px-6 pb-6 space-y-4">
                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5" />
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={e => handleApiKeyChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="AIza..."
                                className="w-full bg-surface-800/80 border border-surface-600/50 rounded-xl px-4 py-3 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all font-mono"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-400 hover:text-surface-200 transition-colors"
                            >
                                {showKey ? '隱藏' : '顯示'}
                            </button>
                        </div>
                        <p className="text-xs text-surface-500">
                            您可在{' '}
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-400 hover:text-brand-300 underline"
                            >
                                Google AI Studio
                            </a>{' '}
                            取得免費的 API Key。此 Key 僅保存在您的瀏覽器中。
                        </p>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
                            <Cpu className="w-3.5 h-3.5" />
                            模型選擇
                        </label>
                        <div className="relative">
                            <select
                                value={modelName}
                                onChange={e => handleModelChange(e.target.value)}
                                className="w-full appearance-none bg-surface-800/80 border border-surface-600/50 rounded-xl px-4 py-3 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all cursor-pointer"
                            >
                                {AVAILABLE_MODELS.map(m => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Test Connection Result */}
                    {testMessage && (
                        <div
                            className={`px-4 py-3 rounded-xl text-sm whitespace-pre-wrap border ${testStatus === 'success'
                                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                                : 'bg-red-950/30 border-red-500/30 text-red-300'
                                } animate-slide-up`}
                        >
                            <div className="flex items-start gap-2">
                                {testStatus === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                                )}
                                <span>{testMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Test Connection Button */}
                    <button
                        onClick={handleTest}
                        disabled={!apiKey.trim() || testStatus === 'testing'}
                        className="w-full py-3 rounded-xl bg-surface-700 hover:bg-surface-600 disabled:bg-surface-800 disabled:text-surface-600 text-surface-200 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-surface-600/50 hover:border-surface-500/50"
                    >
                        {testStatus === 'testing' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                測試連線中…
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                測試連線
                            </>
                        )}
                    </button>

                    {/* Save / Start Button */}
                    <button
                        onClick={handleSave}
                        disabled={!hasPassedTest}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 ${hasPassedTest
                            ? 'bg-brand-600 hover:bg-brand-500 text-white hover:shadow-lg hover:shadow-brand-600/25'
                            : 'bg-surface-800 text-surface-500 cursor-not-allowed border border-surface-700/50'
                            }`}
                    >
                        {hasPassedTest
                            ? isFirstTime
                                ? '✓ 連線正常，開始使用'
                                : '✓ 連線正常，儲存設定'
                            : isFirstTime
                                ? '請先測試連線'
                                : '請先測試連線後再儲存'}
                    </button>
                </div>
            </div>
        </div>
    );
}
