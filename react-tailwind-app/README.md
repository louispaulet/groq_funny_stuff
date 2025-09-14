# Groq Chat — React + Tailwind (Vite)

Interactive chat UI powered by Groq models, built with React, Vite, and Tailwind. Includes streaming responses, model selection, Markdown with syntax highlighting, dark mode, and an inline 3D STL preview (URLs or ASCII STL text).

## Features

- Chat UI with message history and titles
- Streaming responses via Groq-compatible OpenAI SDK
- Model selector (e.g., `openai/gpt-oss-20b`, `openai/gpt-oss-120b`)
- Markdown rendering with sanitized HTML and code highlighting
- Dark/light theme toggle with persistent preference
- Inline 3D STL preview from fenced code blocks or `.stl` URLs

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 3, Heroicons
- OpenAI JS client (baseURL set to Groq's OpenAI-compatible API)
- marked + DOMPurify + highlight.js
- three.js + @react-three/fiber + @react-three/drei

## Quick Start

Requirements: Node.js 18+ and npm.

1) Install dependencies

```bash
cd react-tailwind-app
npm install
```

2) Configure environment

Create a `.env.local` file in this folder with your Groq API key:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Note: `.env.local` is gitignored (do not commit secrets).

3) Run the dev server

```bash
npm run dev
```

Open the printed local URL (typically http://localhost:5173).

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview build locally
- `npm run lint` — run ESLint

## Configuration

- API client is created in `src/hooks/useGroqClient.js` using `VITE_GROQ_API_KEY` and `baseURL=https://api.groq.com/openai/v1`.
- Streaming is handled in `src/hooks/useChatStream.js`.
- Model options live in `src/components/ModelSelector.jsx`.
- Markdown rendering is in `src/lib/markdown.js` with sanitization and highlighting.
- Theme handling is in `src/theme/ThemeContext.jsx`.

## 3D STL Preview

Assistant messages are scanned for STL content and, when present, a 3D preview is shown:

- Fenced code block labeled `stl`:

  ```
  ```stl
  solid name
    facet normal 0 0 1
      outer loop
        vertex 0 0 0
        vertex 1 0 0
        vertex 0 1 0
      endloop
    endfacet
  endsolid
  ```
  ```

- Plain-text ASCII STL (heuristic detection)
- Direct links to `.stl` files in the message

For remote `.stl` URLs, a lightweight Vite middleware proxy (`/stl-proxy`) avoids CORS issues during dev/preview.

## Security Note

This demo uses the OpenAI SDK in the browser with `dangerouslyAllowBrowser: true`. That means your API key is exposed to the client. For production, put API access behind your own server and proxy requests.

## Project Structure (selected)

- `src/pages/ChatPage.jsx` — main chat page and state
- `src/components/chat/*` — chat UI (composer, list, bubbles)
- `src/components/stl/*` — STL viewer (react-three-fiber)
- `src/lib/*` — helpers for chat, markdown, etc.

## Troubleshooting

- No responses? Verify `VITE_GROQ_API_KEY` and network access.
- STL not rendering? Ensure valid ASCII STL or a reachable `.stl` URL.
- Styling off? Confirm Tailwind is loaded and no build errors.
