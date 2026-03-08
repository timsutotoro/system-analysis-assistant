import { useRef, useEffect, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
    messages: ChatMessage[];
    streamingContent: string;
    isLoading: boolean;
    onSendMessage: (content: string) => void;
}

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-3 py-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
        </div>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser
                        ? 'bg-brand-600/20 border border-brand-500/30'
                        : 'bg-emerald-600/20 border border-emerald-500/30'
                    }`}
            >
                {isUser ? (
                    <User className="w-4 h-4 text-brand-400" />
                ) : (
                    <Bot className="w-4 h-4 text-emerald-400" />
                )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] ${isUser ? 'chat-bubble-user' : 'chat-bubble-agent'}`}>
                <div className={isUser ? 'text-sm text-surface-200' : 'chat-markdown text-surface-300'}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>
            </div>
        </div>
    );
}

function StreamingBubble({ content }: { content: string }) {
    return (
        <div className="flex gap-3 animate-slide-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600/20 border border-emerald-500/30">
                <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="max-w-[85%] chat-bubble-agent">
                <div className="chat-markdown text-surface-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export default function ChatPanel({
    messages,
    streamingContent,
    isLoading,
    onSendMessage,
}: ChatPanelProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        onSendMessage(trimmed);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-surface-700/40">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/20">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-surface-100">系統分析師 AI</h2>
                        <p className="text-xs text-surface-500">描述您的想法，我會協助您撰寫系統分析書</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                        <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center">
                            <Bot className="w-8 h-8 text-brand-400" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-surface-300 font-medium">開始對話</p>
                            <p className="text-surface-500 text-sm max-w-xs">
                                描述您想要開發的系統或工具，例如：「我想做一個記帳 App」、「幫我規劃一個內部報修系統」
                            </p>
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Streaming content */}
                {isLoading && streamingContent && (
                    <StreamingBubble content={streamingContent} />
                )}

                {/* Typing indicator */}
                {isLoading && !streamingContent && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-surface-700/40">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="描述您的系統想法，或回答上方的問題…"
                            rows={1}
                            disabled={isLoading}
                            className="w-full bg-surface-800/60 border border-surface-600/40 rounded-xl px-4 py-3 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 transition-all resize-none disabled:opacity-50"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-surface-700 disabled:text-surface-500 text-white flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/25 disabled:shadow-none"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-surface-600 mt-2 text-center">
                    按 Enter 發送，Shift+Enter 換行
                </p>
            </div>
        </div>
    );
}
