# Groq All-In

Groq All-In combines the three existing demos — AllergyFinder, STL Viewer, and the remote Pokedex — into a single Vite/React workspace with a consistent layout. Each experience keeps its custom prompt and helpers while sharing navigation, theme controls, and chat shell components.

## Features
- Shared layout with top-level navigation, dark-mode toggle, and per-experience landing cards.
- Reusable chat surface (sidebar, threaded history, composer) tailored by configuration.
- STL workspace keeps inline 3D previews using `three`, `@react-three/fiber`, and a local `/stl-proxy` helper.
- Pokedex workspace supports overriding the remote service base URL; others read from configuration and environment variables.
- Tailwind-powered styling with a unified brand palette across all pages.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Open the URL reported by Vite (defaults to http://localhost:5173) and use the top navigation to switch between workspaces.

## Configuration
The app looks for the following environment variables (via `import.meta.env` or `process.env` when pre-rendered):

- `VITE_CHAT_BASE_URL` — default base URL for all chat calls (`/chat` is appended automatically).
- `VITE_ALLERGY_CHAT_BASE_URL`, `VITE_STL_CHAT_BASE_URL`, `VITE_POKEDEX_CHAT_BASE_URL` — optional per-experience overrides.

You can change the Pokedex base URL from inside the UI. Other experiences read their configured base URL at load time; to point them elsewhere, set the corresponding environment variable before starting Vite (for example, `VITE_STL_CHAT_BASE_URL=https://example.com npm run dev`).

## Project Structure
- `src/config/experiences.js` — declarative metadata (titles, prompts, colors, model lists) for each workspace.
- `src/components/layout/AppShell.jsx` — shared header/navigation wrapper.
- `src/components/chat/` — reusable chat UI pieces (message list, composer, chat controller).
- `src/components/stl/` — STL canvas, lazy loader, and activation helpers reused by the STL workspace.
- `src/lib/` — utilities for Markdown rendering, remote chat requests, and formatting helpers.
- `src/pages/` — overview page plus per-experience wrapper.

## Notes
- The STL viewer relies on `fetch` to stream STL files through `/stl-proxy` during development and preview builds, mirroring the behaviour of the original demo.
- If you need to reset a conversation, use the *Clear* button inside the composer, or start a new chat from the sidebar.

