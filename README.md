# 系統分析書撰寫助手 | System Analysis Assistant

AI 驅動的系統分析書迭代撰寫助手。透過對話引導您從模糊想法逐步產出結構化的開發文件。

## ✨ 功能特色

- 💬 **即時串流對話** — 打字機效果的即時回應
- 📄 **雙欄介面** — 左欄對話、右欄即時 Markdown 預覽
- 🔄 **迭代式文件產出** — 自動版本追蹤 (v1 → v2 → v3…)
- 📥 **匯出功能** — 下載 / 複製 Markdown 文件
- 💾 **本地儲存** — 對話與文件自動保存在瀏覽器中
- ⚡ **測試連線** — 進入前驗證 API Key 有效性

## 🚀 快速開始

### 線上使用

👉 [**系統分析書撰寫助手**](https://timsutotoro.github.io/system-analysis-assistant/)

1. 開啟網頁後輸入您的 [Gemini API Key](https://aistudio.google.com/apikey)
2. 測試連線通過後即可開始使用
3. 描述您想開發的系統，AI 會引導您完成分析書

### 本地開發

```bash
git clone https://github.com/timsutotoro/system-analysis-assistant.git
cd system-analysis-assistant
npm install
npm run dev
```

## 🛠️ 技術架構

| 層面 | 技術 |
|------|------|
| 框架 | React 19 + Vite 6 + TypeScript |
| 樣式 | Tailwind CSS 3 |
| LLM | Google Generative AI SDK (Streaming) |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| 儲存 | 瀏覽器 LocalStorage |
| 部署 | GitHub Pages + GitHub Actions |

## 📄 License

MIT
