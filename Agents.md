# Agents Notes

- Treat `all_in/` as the source of truth: it houses Groq AllIn Studio, which embeds AllergyFinder, STL Viewer, and the remote Pokédex under one React shell.
- Deployment flows target only Groq AllIn Studio (`make deploy allin` → https://groq-allin.thefrenchartist.dev/). No other project in this repo is published as-is.
- Keep the legacy folders (`chat/`, `pokedex/`, `allergyfinder/`, `groq-chat-stl-viewer/`) for regression testing and focused development, but sync meaningful UI/feature changes back into Groq AllIn Studio.
- Do not add new experiences to the top navigation. Preserve the current navbar buttons and surface future additions on the
  overview page instead.
