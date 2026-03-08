import { FileText, Download, Copy, Check, FileQuestion } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewPanelProps {
    documentMarkdown: string;
    documentVersion: number;
}

export default function PreviewPanel({
    documentMarkdown,
    documentVersion,
}: PreviewPanelProps) {
    const [copied, setCopied] = useState(false);

    const handleDownload = () => {
        if (!documentMarkdown) return;
        const blob = new Blob([documentMarkdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-analysis-v${documentVersion}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = async () => {
        if (!documentMarkdown) return;
        try {
            await navigator.clipboard.writeText(documentMarkdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const textarea = document.createElement('textarea');
            textarea.value = documentMarkdown;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-surface-700/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-surface-100">系統分析書預覽</h2>
                        <p className="text-xs text-surface-500">
                            {documentVersion > 0 ? (
                                <span className="inline-flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    版本 v{documentVersion}
                                </span>
                            ) : (
                                '等待生成…'
                            )}
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                {documentMarkdown && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-700/50 transition-all"
                            title="複製 Markdown"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">已複製</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    複製
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-700/50 transition-all"
                            title="下載 .md 檔案"
                        >
                            <Download className="w-3.5 h-3.5" />
                            下載 .md
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                {documentMarkdown ? (
                    <div className="markdown-preview">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeString = String(children).replace(/\n$/, '');
                                    if (match) {
                                        return (
                                            <SyntaxHighlighter
                                                style={oneDark}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{
                                                    margin: 0,
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.8rem',
                                                }}
                                            >
                                                {codeString}
                                            </SyntaxHighlighter>
                                        );
                                    }
                                    return (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {documentMarkdown}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 rounded-2xl bg-surface-800/50 border border-surface-700/30 flex items-center justify-center">
                            <FileQuestion className="w-8 h-8 text-surface-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-surface-400 font-medium">尚無文件</p>
                            <p className="text-surface-600 text-sm max-w-xs">
                                開始與 AI 對話後，系統分析書將會自動出現在此處
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
