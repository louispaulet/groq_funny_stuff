# groq_funny_stuff

![Illustration banner showing the Groq AllIn Studio experiences](all_in/allin_illustration_banner.png)

Groq AllIn Studio is the flagship experience in this repo: a single React workspace that bundles the Pokédex, AllergyFinder, STL viewer, and News Analyzer demos behind one shell. The live deployment is available at https://groq-allin.thefrenchartist.dev/. The `all_in` directory is the sole production target in this repository.

## Overview
- `all_in/` contains the deployable Groq AllIn Studio workspace and is the recommended way to run the demos together.
- The root `Makefile` provides install/run/test/deploy/clean commands for the Groq AllIn Studio workspace.
- Production deployments target Groq AllIn Studio.

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
Unified workspace with shared layout, navigation, and chat components. Switch between the embedded experiences via the top navigation. Configure per-experience chat endpoints with `.env.local` keys:
- `VITE_CHAT_BASE_URL` — default chat endpoint (`/chat` appended automatically)
- `VITE_ALLERGY_CHAT_BASE_URL`, `VITE_STL_CHAT_BASE_URL`, `VITE_POKEDEX_CHAT_BASE_URL`, `VITE_NEWS_BASE_URL` — optional overrides for each tab

**News Analyzer overview.** The News Analyzer workspace classifies the news of the day into “good” and “bad” buckets. It rotates through four GroqCloud-hosted LLMs—one request per second—to avoid HTTP429 (Too Many Requests) responses while still keeping the analysis stream steady. The interface already supports filtering by good or bad news, and an upcoming mixer will let you tune the blend to your preferred ratio. The underlying question the project explores: what balance of uplifting versus challenging stories helps someone feel informed without feeling overwhelmed?

**Six Degrees interface.** The Remix Lab now ships with the refreshed Six Degrees Of parody playground. It pairs the playful gradient shell from the React workspace with clearer copy, a progress pulse, and a timeline that retains every degree so you can scroll back through the transformation. The run panel accepts a seed sentence, locks while the six remix passes stream in from Groq, and lets you reset the canvas with one click when you are ready for a fresh prompt.

**Flux image generation.** Flux-based image synthesis is now wired into the AllIn Studio shell. When the Flux backend is enabled through your environment variables the Image tab exposes prompts, negative prompts, resolution presets, seed locking, and a history rail so teams can keep their favorite generations. Flux runs on Groq hardware, so the UI highlights end-to-end latency, model variants (Flux Schnell and Flux Pro), and exposes a “reroll” shortcut for rapid iteration. This capability shares auth and rate limits with the other chat endpoints, so keep the same `.env.local` pattern when providing credentials.

## Extras
- `demos/` — static HTML experiments for Groq streaming APIs.

## Testing Notes
- Groq AllIn Studio: `npm run lint` and `npm run test` (inside `all_in/`) or `make test` from the repo root.

Questions or tweaks? Check `all_in/README.md` for deeper implementation details.
