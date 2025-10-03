# groq_funny_stuff

Groq AllIn Studio is the flagship experience in this repo: a single React workspace that bundles the Pokédex, AllergyFinder, and STL viewer demos behind one shell. The live deployment is available at https://groq-allin.thefrenchartist.dev/. The legacy folders remain for focused local work, but only `all_in` is packaged for production.

## Overview
- `all_in/` contains the deployable Groq AllIn Studio workspace and is the recommended way to run the demos together.
- `chat/`, `pokedex/`, `allergyfinder/`, and `groq-chat-stl-viewer/` mirror the original standalone projects that now ship inside Groq AllIn Studio.
- The root `Makefile` exposes consistent install/run/test targets for both the unified app and the legacy subprojects.
- Production deployments target Groq AllIn Studio; the other directories are development artifacts.

## Prerequisites
- Node.js 18+ and npm for Groq AllIn Studio and the other Vite/React frontends.
- Python 3.10+ for the standalone Gradio apps in `chat/` and `pokedex/` (useful for local iteration).
- A Groq API key for the browser clients (`.env.local` files are gitignored).

## Quick Start
### Recommended: Groq AllIn Studio workspace
- Install dependencies: `make install allin` *(or `cd all_in && npm install`)*
- Run locally: `make run allin` *(or `npm run dev` inside `all_in/`)*
- Deploy: `make deploy allin` *(wraps `npm run deploy` inside `all_in/`)*
- Production URL: https://groq-allin.thefrenchartist.dev/
- Default dev port: `5175` (`ALLIN_PORT` overrides when using `make run`).

### Legacy standalone demos (optional)
These folders match the experiences embedded in Groq AllIn Studio and can still be run individually for debugging.
- Install dependencies: `make install chat|pokedex|allergyfinder|stlviewer`
- Launch a demo: `make run chat|pokedex|allergyfinder|stlviewer`
- Test or lint: `make test chat|pokedex|allergyfinder|stlviewer`
- Clean the shared Python virtualenv: `make clean`

Default ports when run directly: Pokédex 7860, Chat 7861, AllergyFinder 5173, STL Viewer 5174. Override by exporting `POKEDEX_PORT`, `CHAT_PORT`, etc., before calling `make run`.

## Projects
### Groq AllIn Studio — React + Vite (primary target)
Unified workspace with shared layout, navigation, and chat components. Switch between the embedded experiences via the top navigation. Configure per-experience chat endpoints with `.env.local` keys:
- `VITE_CHAT_BASE_URL` — default chat endpoint (`/chat` appended automatically)
- `VITE_ALLERGY_CHAT_BASE_URL`, `VITE_STL_CHAT_BASE_URL`, `VITE_POKEDEX_CHAT_BASE_URL` — optional overrides for each tab

### Legacy Gradio apps
- **Remote Chat (`chat/`)** — minimal Gradio UI that forwards prompts to a remote worker. Environment flags: `CHAT_BASE_URL` (default `https://groq-endpoint.louispaulet13.workers.dev`) and `CHAT_REQUEST_TIMEOUT` (seconds).
- **Pokédex (`pokedex/`)** — local Gradio chat over a Pokédex dataset. Includes `pokedex/scripts/generate_pokemon_names.py` to refresh the derived name map.

### Legacy React demos
- **AllergyFinder (`allergyfinder/`)** — Groq-powered allergy assistant that enriches prompts with OpenFoodFacts lookups. Requires `VITE_GROQ_API_KEY`.
- **Groq Chat STL Viewer (`groq-chat-stl-viewer/`)** — chat interface that renders inline 3D STL previews using `three.js` and a development `stl-proxy` helper. Requires `VITE_GROQ_API_KEY`.

## Extras
- `demos/` — static HTML experiments for Groq streaming APIs.
- `api_examples/` — quick tests (e.g., `test_openfoodfacts.html`) supporting AllergyFinder.
- `third_party/` — shared assets sourced from external projects.

## Testing Notes
- Groq AllIn Studio: `npm run lint` (inside `all_in/`).
- Gradio apps: `make test chat` or `make test pokedex` (requires created virtualenv).
- AllergyFinder: `cd allergyfinder && npm run lint` (also triggers `node --test` when using `make test allergyfinder`).
- STL Viewer: `cd groq-chat-stl-viewer && npm run lint`.

Questions or tweaks? Check each subdirectory's README for deeper implementation details.
