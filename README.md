# groq_funny_stuff

![Illustration banner showing the Groq AllIn Studio experiences](all_in/allin_illustration_banner.png)

Groq AllIn Studio is the flagship experience in this repo: a single React workspace that bundles the AllergyFinder, Object Maker, STL Studio, Pokédex, News Analyzer, Flux-powered image labs, SVG tooling, playful remixers, and related utilities behind one shell. The live deployment is available at https://groq-allin.thefrenchartist.dev/. The `all_in` directory is the sole production target in this repository.

## Overview
- `all_in/` contains the deployable Groq AllIn Studio workspace and is the recommended way to run the demos together.
- The root `Makefile` provides install/run/test/deploy/clean commands for the Groq AllIn Studio workspace.
- Production deployments target Groq AllIn Studio.
- Keep the existing top navigation tabs as-is. When new experiences are added, surface them on the overview page instead of
  adding new buttons to the navbar.
- Embedded workspaces currently include:
  - **AllergyFinder** (allergen lookups and barcode-aware chats)
  - **Object Maker** (schema design studio with a `/obj` execution flow plus a saved "Zoo")
  - **STL Studio** (3D printing companion with inline previews)
  - **Pokédex** (remote facts with optional base URL overrides)
  - **Flux Image Lab**, **Pizza Maker**, and **Car Maker** (Flux-backed image creation with gallery persistence)
  - **SVG Prompt Lab** and **Flag Foundry** (text-to-SVG tooling and timed flag reconstructions)
  - **News Analyzer** and **Six Degrees Of** (live news briefings and parody remixes)
  - **Bank Holiday Planner (BHP)** (a PTO optimizer that calls the `/obj` helper under the hood)

## Prerequisites
- Node.js 18+ and npm for Groq AllIn Studio.
- A Groq API key for the browser clients (`.env.local` files are gitignored).

## Quick Start
### Recommended: Groq AllIn Studio workspace
- Install dependencies: `make install allin` *(or `cd all_in && npm install`)*
- Run locally: `make run allin` *(or `npm run dev` inside `all_in/`)*
- Deploy: `make deploy allin` *(wraps `npm run deploy` inside `all_in/`)*
- Production URL: https://groq-allin.thefrenchartist.dev/
- Default dev port: `5175` (`ALLIN_PORT` overrides when using `make run`).

## Projects
### Groq AllIn Studio — React + Vite (primary target)
Unified workspace with shared layout, navigation, and chat components. Experiences ship in curated groups on the overview page while the core navigation stays focused on the flagship assistants. Configure per-experience chat or generation endpoints with `.env.local` keys:
- `VITE_CHAT_BASE_URL` — default chat endpoint (`/chat` appended automatically)
- `VITE_ALLERGY_CHAT_BASE_URL`, `VITE_STL_CHAT_BASE_URL`, `VITE_POKEDEX_CHAT_BASE_URL`, `VITE_NEWS_BASE_URL`, `VITE_OBJECTMAKER_CHAT_BASE_URL` — optional overrides for assistants that call Groq-hosted chat endpoints
- `VITE_IMAGE_API_BASE_URL` — optional override for Flux-based image requests (Flux Image Lab, Pizza Maker, Car Maker)
- `VITE_SVG_API_BASE_URL` — optional override for `/svg` worker requests (SVG Prompt Lab, Flag Foundry)

#### Experience catalog
- **AllergyFinder** — barcode-aware allergy coach that can edit saved allergen profiles and surface risk callouts inline.
- **Object Maker** — schema design and `/obj` execution studio with builder and "Zoo" views for iterating on structured outputs.
- **STL Studio** — 3D printing copilot with a chat-driven STL previewer for reviewing meshes and slicing tips.
- **Pokédex** — focused Pokémon companion that routes to a remote service with optional base URL overrides from the UI.
- **Flux Image Lab** — direct Flux prompt console with prompt history, seed control, and gallery persistence for saved renders.
- **Pizza Maker** — guided culinary image prompts that translate ingredient selections into Flux renderings for hero shots.
- **Car Maker** — cinematic automotive prompt builder that stages concept vehicles with Flux-backed imagery.
- **SVG Prompt Lab** — text-to-SVG canvas that returns raw markup, persists generations to cookies, and supports instant remixing.
- **Flag Foundry** — paced SVG worker harness that rebuilds national flags with `react-country-flag` references for comparison.
- **News Analyzer** — Cloudflare Worker-backed news briefings with filtering, timeline context, and grounded responses.
- **Six Degrees Of** — sequential parody remixer that streams six escalating rewrites for playful breaks.
- **Bank Holiday Planner (BHP)** — PTO optimizer that calls the Object Maker `/obj` helper to build long-form vacation itineraries.

## Extras
- `demos/` — static HTML experiments for Groq streaming APIs.

## Testing Notes
- Groq AllIn Studio: `npm run lint` and `npm run test` (inside `all_in/`) or `make test` from the repo root.

Questions or tweaks? Check `all_in/README.md` for deeper implementation details.
