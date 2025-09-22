# Project Notes for Agents

- Assistant replies now surface their OpenFoodFacts evidence under a collapsed **Sources** section (see `src/components/chat/MessageBubble.jsx`).
- The allergen resolver caches both `context` and `sources` objects; make sure any changes keep both fields in sync (see `src/pages/ChatPage.jsx`).
- Source links are constructed via `buildSourcesFromMatch` in `src/lib/openFoodFacts/sources.js`. Update the accompanying tests in `src/lib/openFoodFacts/__tests__/sources.test.js` whenever you adjust this logic.
- Before finishing work, run `make test` (or the broader test suite) so the Sources feature keeps its coverage.
