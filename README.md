# groq_funny_stuff

## Pokédex (Gradio app)

A lightweight, local Pokédex chat where you can ask questions about a Pokémon and get a concise 2–3 sentence answer.

Run it:

- Install deps: `make install chat` or `make install pokedex`
- Run app: `make run chat` or `make run pokedex`
Direct run:

- `python pokedex/pokedex_app.py`
- `python chat/app.py`

Update Pokédex names (optional):

- `python pokedex/scripts/generate_pokemon_names.py` (writes to `pokedex/pokemon_names.py`)

Examples:

- "What are Charizard’s weaknesses?"
- "Tell me about Pikachu"
- "Which type is Gengar?"

Notes:

- Uses a small built-in dataset (no network required).
- Supports topics like types, weaknesses, abilities, evolution, height/weight, moves, and general info.
