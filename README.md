# groq_funny_stuff

![Illustration banner showing the Groq AllIn Studio experiences](all_in/allin_illustration_banner.png)

Groq AllIn Studio is the flagship experience in this repo: a single React workspace that bundles specialist copilots, structured data labs, image generators, and playful experiments under one navigation shell. The live deployment is available at https://groq-allin.thefrenchartist.dev/, and the `all_in` directory is the only production target in this repository.

## Architecture
* The `all_in/` app is a Vite-powered React front end that mounts every page inside a `BrowserRouter`, `HelmetProvider`, `ThemeProvider`, and shared `AppShell`. The shell owns the navbar, footer, theme toggle, and keeps the experience list in sync with `src/config/experiences.js` so new workspaces surface on the overview rather than the top navigation.【F:all_in/src/main.jsx†L1-L12】【F:all_in/src/App.jsx†L1-L200】【F:all_in/src/components/layout/AppShell.jsx†L1-L131】【F:all_in/src/config/experiences.js†L1-L119】
* Core chat behaviour (conversation history, barcode scanning, cookie persistence, and Groq API calls) is abstracted by `useChatSession`, which normalizes base URLs, injects AllergyFinder context, and calls the shared `/chat` worker endpoint via `callRemoteChat`. Structured generations reuse `createRemoteObject` to negotiate `/obj` paths with schema-aware retries.【F:all_in/src/components/chat/useChatSession.js†L22-L360】【F:all_in/src/lib/remoteChat.js†L1-L83】【F:all_in/src/lib/objectApi.js†L1-L128】【F:all_in/src/lib/objectApi.js†L129-L205】
* The Cloudflare Worker that backs the studio exposes focused routes—`/chat`, `/flavor-finder`, `/news`, `/flux`, `/svg`, `/svg_deluxe`, and `/obj`—letting each experience call the same low-latency services with zero bespoke wiring.【F:all_in/src/pages/AboutPage.jsx†L3-L162】
* `MetadataManager` centralizes page titles, descriptions, canonical URLs, and social tags via `react-helmet-async`, auto-populating entries for every experience route.【F:all_in/src/seo/MetadataManager.jsx†L1-L146】
* Static SEO assets (`robots.txt`, `sitemap.xml`) live in `all_in/public/` so Vite copies them directly into every Pages deployment.【F:all_in/public/robots.txt†L1-L4】【F:all_in/public/sitemap.xml†L1-L106】
* Refresh the sitemap whenever routes change: `npm run generate:sitemap` regenerates `public/sitemap.xml` from the route configuration (honours `SITE_URL` if set).【F:all_in/scripts/generate-sitemap.mjs†L1-L129】

## Cloud worker routes

| Route | Purpose |
| --- | --- |
| `POST /chat` | Conversational core for every assistant; accepts OpenAI-style message payloads and can be enriched with server-side lookups.【F:all_in/src/pages/AboutPage.jsx†L3-L11】 |
| `GET /flavor-finder/<foodOrBarcode>` | AllergyFinder helper that fetches Open Food Facts data when a barcode or URL is detected.【F:all_in/src/pages/AboutPage.jsx†L12-L19】【F:all_in/src/components/chat/useChatSession.js†L228-L292】 |
| `GET /news/<category>` | Curated feed that powers News Analyzer’s headline panels.【F:all_in/src/pages/AboutPage.jsx†L20-L27】【F:all_in/src/pages/NewsAnalyzerPage.jsx†L141-L176】 |
| `GET /flux/<prompt>` | Flux image generation endpoint consumed by the Flux Image Lab, Pizza Maker, and Car Maker galleries.【F:all_in/src/pages/AboutPage.jsx†L28-L43】【F:all_in/src/pages/ImageGeneratorPage.jsx†L41-L199】【F:all_in/src/pages/PizzaMakerPage.jsx†L200-L264】【F:all_in/src/pages/CarMakerPage.jsx†L253-L321】 |
| `GET /svg/<prompt>` & `GET /svg_deluxe/<prompt>` | SVG worker routes for the Prompt Lab, Flag Foundry, and Emotion Emoji Foundry (deluxe route serializes oss-120B renders with pacing).【F:all_in/src/pages/AboutPage.jsx†L28-L35】【F:all_in/src/pages/SvgPlaygroundPage.jsx†L172-L199】【F:all_in/src/pages/FlagFoundryPage.jsx†L361-L404】【F:all_in/src/components/emotion-foundry/EmotionEmojiFoundry.jsx†L111-L200】 |
| `POST /obj/<type>` (and variants) | Structured JSON generation used by Object Maker, Bank Holiday Planner, Mermaid Display, Timeline Studio, Pong Showdown, and News Analyzer classifications.【F:all_in/src/pages/AboutPage.jsx†L44-L51】【F:all_in/src/pages/useObjectMakerBuilderState.js†L139-L207】【F:all_in/src/pages/BankHolidayPlannerPage.jsx†L443-L472】【F:all_in/src/pages/MermaidStudioPage.jsx†L81-L160】【F:all_in/src/pages/TimelineStudioPage.jsx†L320-L359】【F:all_in/src/pages/PongShowdownPage.jsx†L243-L283】【F:all_in/src/pages/NewsAnalyzerPage.jsx†L67-L138】 |

## Experience catalogue

### Specialist chat & research copilots
* **AllergyFinder** – Extends the shared chat stack with saved allergy profiles, barcode detection, and Open Food Facts lookups before streaming Groq replies, making label triage and risk callouts immediate.【F:all_in/src/config/experiences.js†L13-L45】【F:all_in/src/components/chat/useChatSession.js†L228-L315】
* **STL Studio** – Reuses the conversational UI with STL viewer support to discuss meshes, slicing, and 3D printing workflows inside the same Groq `/chat` loop.【F:all_in/src/config/experiences.js†L80-L106】【F:all_in/src/components/chat/useChatSession.js†L22-L138】
* **Pokédex** – Focused encyclopedia that calls a remote service through the shared chat endpoint with optional base URL overrides for alternate datasets.【F:all_in/src/config/experiences.js†L107-L158】【F:all_in/src/lib/remoteChat.js†L14-L83】
* **News Analyzer** – Pulls curated feeds from `/news/<category>` and optionally classifies headlines via `/obj`, letting analysts pin topics while tracking model usage stats.【F:all_in/src/pages/NewsAnalyzerPage.jsx†L12-L200】
* **Six Degrees Of** – Runs a six-step parody chain by repeatedly sending the previous punchline back through `/chat`, pacing each beat for comedic effect.【F:all_in/src/pages/SixDegreesPage.jsx†L1-L171】

### Structured automation labs
* **Object Maker** – Combines a schema-design chat loop with JSON extraction helpers and `/obj` calls to materialize structured objects, saving the outputs into a local “Zoo.”【F:all_in/src/pages/useObjectMakerBuilderState.js†L67-L207】
* **Bank Holiday Planner (BHP)** – Feeds localized holiday calendars into `/obj` with a strict schema to optimize PTO streaks and render calendar heatmaps for five countries.【F:all_in/src/pages/BankHolidayPlannerPage.jsx†L443-L509】
* **Mermaid Display** – Requests Mermaid source via `/obj`, validates the diagram client-side, and archives every render in a cookie-backed gallery for quick iteration.【F:all_in/src/pages/MermaidStudioPage.jsx†L81-L160】
* **Timeline Studio** – Orchestrates cinematic story arcs through `/obj`, pairing preset scenarios with custom prompts and exportable narrative cards.【F:all_in/src/pages/TimelineStudioPage.jsx†L320-L377】
* **Pong Showdown** – An autonomous Pong match that triggers `/obj/pong_theme` whenever rallies or scores change, repainting the arena with Groq-generated palettes while respecting rate limits.【F:all_in/src/pages/PongShowdownPage.jsx†L243-L360】

### Visual generation studios
* **Flux Image Lab** – Sends free-form prompts to `/flux`, stores every render in cookie history, and lets users reopen saved shots or clear the gallery on demand.【F:all_in/src/pages/ImageGeneratorPage.jsx†L41-L199】
* **Pizza Maker** – Converts ingredient selections into a culinary prompt via `/chat`, then renders the hero shot through `/flux`, persisting annotated gallery entries for future inspiration.【F:all_in/src/pages/PizzaMakerPage.jsx†L200-L318】
* **Car Maker** – Similar flow for automotive art direction: `/chat` distills the design brief, `/flux` delivers the imagery, and a gallery tracks the cinematic results.【F:all_in/src/pages/CarMakerPage.jsx†L253-L321】
* **SVG Prompt Lab** – Lets users swap between standard `/svg` and deluxe `/svg_deluxe` routes, sanitizes markup for preview, and saves generations with route metadata for easy remixing.【F:all_in/src/pages/SvgPlaygroundPage.jsx†L119-L199】
* **Flag Foundry** – Auto-queues European nations and lets visitors trigger other continents, pacing `/svg` requests every two seconds while showing Unicode reference flags for comparison.【F:all_in/src/pages/FlagFoundryPage.jsx†L361-L439】
* **Emotion Emoji Foundry** – Sequentially calls `/svg_deluxe` for seven core emotions, spacing requests by five seconds and tracking countdowns so deluxe renders stay within limits.【F:all_in/src/components/emotion-foundry/EmotionEmojiFoundry.jsx†L111-L200】

### Playful & research spaces
* **Game of Life Lab** – Purely client-side cellular automaton with toroidal wrap, preset seeds, live controls, and density stats for experimentation without backend calls.【F:all_in/src/pages/GameOfLifeLabPage.jsx†L1-L200】
* **DALL·E vs Flux Comparison** – Loads a static CSV of 186 prompt pairs, paginates the gallery, and surfaces download helpers for qualitative research.【F:all_in/src/pages/DalleVsFluxPage.jsx†L1-L200】
* **Second-Hand Food Market** – A satire storefront fed by local JSON that demonstrates rich storytelling components and cross-links to other experiences—no API calls required.【F:all_in/src/pages/SecondHandFoodMarketPage.jsx†L1-L183】

## Local development
* Install dependencies: `make install`
* Run the studio locally: `make run` (defaults to port `5175` with `--host` enabled)
* Lint and test: `make lint` / `make test`
* Build or deploy: `make build` / `make deploy` (deploys the latest build to Cloudflare Pages)
* Clean dependencies: `make clean`
* Need a fresh install? `make clean install` removes the cached stamp and reinstalls packages.

All commands simply shell into `all_in/` and wrap the corresponding npm scripts, so you can run them directly if you prefer.【F:Makefile†L1-L31】

Questions or tweaks? Check `all_in/README.md` for deeper implementation details, and keep new experiences surfaced on the overview page rather than adding navigation tabs.

## Cloudflare Pages deployment
* Authenticate (per developer/machine): `wrangler login`
* One-time setup: `wrangler pages project create groq-allin --production-branch main`. (Project now lives at https://dash.cloudflare.com/c3b4ea7fa6d620cb4ed20c889fabdcdd/pages/view/groq-allin.)
* Deployments: `make deploy` builds the Vite app and runs `wrangler pages deploy dist --project-name groq-allin --branch main`.
* Client routing: `_redirects` in `all_in/public/` ensures `/*` rewrites to `/index.html` so BrowserRouter routes resolve on Cloudflare Pages.
* Production URL: published versions are available at https://groq-allin.pages.dev/ (and the existing https://groq-allin.thefrenchartist.dev/ once the DNS CNAME is updated to point at the Cloudflare Pages project).
