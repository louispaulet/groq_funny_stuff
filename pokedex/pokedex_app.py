import re
import gradio as gr
from typing import Tuple, Optional

try:
    # when run as module: python -m src.pokedex_app
    from .pokedex_data import POKEDEX, AVAILABLE_NAMES
    from .pokemon_names import NAME_ALIASES, SLUG_TO_DISPLAY
except Exception:  # pragma: no cover
    # when run directly: python src/pokedex_app.py
    from pokedex_data import POKEDEX, AVAILABLE_NAMES
    from pokemon_names import NAME_ALIASES, SLUG_TO_DISPLAY


def find_pokemon_in_text(text: str) -> Optional[str]:
    q = text.lower()
    # 1) Prefer local dataset keys/names for richer answers
    for key in sorted(POKEDEX.keys(), key=lambda k: -len(k)):
        name = POKEDEX[key]["name"].lower()
        if re.search(rf"\b{re.escape(name)}\b", q) or re.search(rf"\b{re.escape(key)}\b", q):
            return key
    # 2) Search all known species aliases
    for alias in sorted(NAME_ALIASES.keys(), key=lambda a: -len(a)):
        # Use custom ASCII-alnum boundaries so aliases with symbols (e.g., nidoran♀) match
        pattern = rf"(?<![A-Za-z0-9]){re.escape(alias)}(?![A-Za-z0-9])"
        if re.search(pattern, q):
            return NAME_ALIASES[alias]
    return None


def detect_topic(text: str) -> str:
    q = text.lower()
    # ordered by specificity
    if any(w in q for w in ["evolve", "evolution", "evolves", "evolving"]):
        return "evolution"
    if any(w in q for w in ["weak", "weakness", "vulnerable", "super effective against it"]):
        return "weaknesses"
    if any(w in q for w in ["strong", "strength", "effective against", "resistant to"]):
        return "strengths"
    if any(w in q for w in ["type", "typing", "element"]):
        return "types"
    if any(w in q for w in ["abilit", "hidden ability"]):
        return "abilities"
    if any(w in q for w in ["height", "tall", "size", "how big"]):
        return "height"
    if any(w in q for w in ["weight", "heavy", "weigh"]):
        return "weight"
    if any(w in q for w in ["stat", "hp", "attack", "defense", "speed"]):
        return "stats"
    if any(w in q for w in ["where", "habitat", "find"]):
        return "location"
    if any(w in q for w in ["move", "moveset", "learn"]):
        return "moves"
    # default to general info
    return "general"


def format_answer(p: dict, topic: str) -> str:
    name = p["name"]
    types = "/".join(p["types"])
    if topic == "evolution":
        return (
            f"{name}’s evolutionary line is: {p['evolution']}. "
            f"It’s a {types}-type Pokémon; evolution methods can vary by game version."
        )
    if topic == "weaknesses":
        weak = ", ".join(p.get("weaknesses", [])) or "various types"
        return (
            f"{name} is weak to: {weak}. "
            f"Knowing it’s {types}-type helps you plan resistances and coverage."
        )
    if topic == "strengths":
        strong = ", ".join(p.get("strengths", [])) or "specific matchups"
        return (
            f"{name} performs well versus: {strong}. "
            f"Its {types} typing shapes both offense and defense in battle."
        )
    if topic == "types":
        return (
            f"{name} is a {types}-type Pokémon. "
            f"This typing defines its STAB moves and matchups."
        )
    if topic == "abilities":
        abilities = ", ".join(p["abilities"]) if p.get("abilities") else "varied abilities"
        return (
            f"{name} can have: {abilities}. "
            f"Abilities synergize with its {types} toolkit and playstyle."
        )
    if topic == "height":
        return (
            f"{name} is about {p['height_m']} m tall. "
            f"Size doesn’t affect core mechanics, but informs its Pokédex profile."
        )
    if topic == "weight":
        return (
            f"{name} weighs roughly {p['weight_kg']} kg. "
            f"Its build complements its typical role and animations."
        )
    if topic == "stats":
        return (
            f"{name} is known for characteristic stats fitting a {types}-type. "
            f"Exact base stats vary by form/generation; check a detailed chart for min–max spreads."
        )
    if topic == "location":
        return (
            f"Where to find {name} depends on the game version and region. "
            f"Consult that game’s location data; as a {types}-type, its habitats vary widely."
        )
    if topic == "moves":
        return (
            f"{name} learns moves via leveling, TMs/TRs, and tutoring. "
            f"Prioritize STAB {types}-type moves and coverage based on your team needs."
        )
    # general
    desc = p.get("description", f"{name} is a {types}-type Pokémon.")
    return (
        f"{desc} "
        f"In battle, its {types} typing guides both offenses and defenses."
    )


def answer_question(question: str) -> str:
    if not question or not question.strip():
        return "Ask about a Pokémon by name, like ‘Tell me about Pikachu’."

    key = find_pokemon_in_text(question)
    if not key:
        names = ", ".join(AVAILABLE_NAMES[:8])
        return (
            "I couldn’t spot a Pokémon name in your question. "
            f"Try something like: ‘What are Charizard’s weaknesses?’ Available examples: {names}."
        )
    topic = detect_topic(question)
    if key in POKEDEX:
        pokemon = POKEDEX[key]
        return format_answer(pokemon, topic)
    # Fallback for species we recognize but don't have details for
    display = SLUG_TO_DISPLAY.get(key, key.capitalize())
    if topic == "evolution":
        return (
            f"I recognize {display}, but this lightweight Pokédex lacks its full evolution details. "
            f"For complete lines and methods, check a comprehensive Pokédex."
        )
    return (
        f"I recognize {display}, a Pokémon species. "
        f"This lightweight Pokédex doesn’t include its full details, but you can still ask about well-known examples like Charizard or Pikachu."
    )


def build_ui():
    with gr.Blocks(css="pokedex/assets/custom_footer.css", theme=gr.themes.Soft()) as demo:
        gr.Markdown("# Pokédex — Ask about a Pokémon")
        chatbot = gr.Chatbot(height=300)
        with gr.Row():
            msg = gr.Textbox(label="Ask a question", placeholder="e.g., What type is Gengar?", elem_id="custom-msg-box")
            send = gr.Button("Send", elem_id="custom-send-btn")

        def respond(message, history):
            history = history or []
            reply = answer_question(message)
            return history + [[message, reply]], ""

        msg.submit(respond, [msg, chatbot], [chatbot, msg])
        send.click(respond, [msg, chatbot], [chatbot, msg])

        gr.Markdown("Tip: Ask about types, weaknesses, abilities, evolution, height/weight, moves, or general info.")
    return demo


if __name__ == "__main__":
    ui = build_ui()
    ui.launch()
