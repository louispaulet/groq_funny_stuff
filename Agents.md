# Agents Notes

- Treat `all_in/` as the source of truth: it embeds AllergyFinder, STL Viewer, and the remote Pokédex under one React shell.
- Deployment flows target only the All-In workspace (`make deploy allin`). No other project in this repo is published as-is.
- Keep the legacy folders (`chat/`, `pokedex/`, `allergyfinder/`, `groq-chat-stl-viewer/`) for regression testing and focused development, but sync meaningful UI/feature changes back into `all_in/`.
