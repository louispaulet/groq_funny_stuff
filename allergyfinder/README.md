# AllergyFinder — OpenFoodFacts Allergy Assistant (React + Vite)

AllergyFinder is a Groq-powered chat experience that enriches every food-allergy question with live data from OpenFoodFacts (OFF). Ask about a product and the assistant fetches ingredient and allergen details to help you make safer choices.

## Features

- Groq streaming chat UI with titled conversations and history
- Automatic OpenFoodFacts lookup for each user prompt
- Context-aware prompt engineering so the model references OFF data first
- Markdown rendering with sanitized HTML and syntax highlighting
- Light/dark theme toggle with persistent preference

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 3, Heroicons
- OpenAI JS client pointing at Groq's OpenAI-compatible endpoint
- marked + DOMPurify + highlight.js for markdown

## Quick Start

Requirements: Node.js 18+ and npm.

1. Install dependencies

   ```bash
   cd allergyfinder
   npm install
   ```

2. Configure environment

   Create a `.env.local` file in this folder with your Groq API key:

   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

   The key is required for Groq LLM access; keep it private.

3. Run the dev server

   ```bash
   npm run dev
   ```

   Open the printed local URL (typically http://localhost:5173).

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Implementation Notes

- The browser now delegates all LLM work to the Cloudflare `/chat` worker via `src/lib/remoteChat.js` (no API key stored locally).
- `src/pages/ChatPage.jsx` manages conversations, cancellation, and renders the worker responses with STL previews and OFF sources when supplied.
- OpenFoodFacts helpers in `src/lib/openFoodFacts` expose utilities reused by the worker to assemble context and citations.

## Safety Reminder

OpenFoodFacts is community maintained. Always verify allergen information on the product packaging before consuming a food.
