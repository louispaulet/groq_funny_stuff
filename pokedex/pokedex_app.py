import os
from typing import List

import gradio as gr
import requests


DEFAULT_BASE_URL = (
    os.getenv("POKEDEX_CHAT_BASE_URL")
    or "https://groq-endpoint.louispaulet13.workers.dev"
).rstrip("/")
SYSTEM_PROMPT = (
    "You are a remote Pokédex assistant. Answer questions about Pokémon in two or three sentences. "
    "Highlight typings, notable strengths or weaknesses, and other concise Pokédex facts. "
    "If the question falls outside Pokémon, politely redirect the user."
)
REQUEST_TIMEOUT = float(os.getenv("POKEDEX_CHAT_TIMEOUT", "20.0"))


class RemoteChatError(RuntimeError):
    """Raised when the remote /chat service returns an error or malformed payload."""


def normalize_base_url(raw: str) -> str:
    candidate = (raw or "").strip()
    if not candidate:
        raise ValueError("No base URL configured for the Pokédex service.")
    return candidate.rstrip("/")


def build_messages(history: List[List[str]], user_prompt: str) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history:
        if not turn:
            continue
        user_part = turn[0] if len(turn) > 0 else ""
        assistant_part = turn[1] if len(turn) > 1 else ""
        if user_part:
            messages.append({"role": "user", "content": str(user_part)})
        if assistant_part:
            messages.append({"role": "assistant", "content": str(assistant_part)})
    messages.append({"role": "user", "content": user_prompt})
    return messages


def post_chat(base_url: str, messages: list[dict[str, str]]) -> str:
    url = f"{base_url}/chat"
    try:
        response = requests.post(
            url,
            json={"messages": messages},
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:  # pragma: no cover - network failure path
        raise RemoteChatError(f"Request error: {exc}") from exc

    if not response.ok:
        snippet = response.text[:200].strip()
        raise RemoteChatError(
            f"Service returned {response.status_code}: {snippet or response.reason}"
        )

    try:
        payload = response.json()
    except ValueError as exc:
        raise RemoteChatError("Service response was not valid JSON.") from exc

    choices = payload.get("choices") or []
    if not choices:
        raise RemoteChatError("Service response did not include any choices.")

    message = choices[0].get("message") or {}
    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        raise RemoteChatError("Service returned an empty message.")

    return content.strip()


def call_remote_pokedex(history: List[List[str]], user_prompt: str, base_url: str) -> str:
    messages = build_messages(history, user_prompt)
    return post_chat(base_url, messages)


def build_ui():
    with gr.Blocks(css="pokedex/assets/custom_footer.css", theme=gr.themes.Soft()) as demo:
        gr.Markdown("# Pokédex — Remote Chat")
        gr.Markdown(
            "Connects to a remote `/chat` endpoint. Update the base URL if you are running a local worker."
        )

        endpoint_box = gr.Textbox(
            label="Service base URL",
            value=DEFAULT_BASE_URL,
            placeholder="https://groq-endpoint.example.workers.dev",
        )

        chatbot = gr.Chatbot(height=300)
        with gr.Row():
            msg = gr.Textbox(
                label="Ask a question",
                placeholder="e.g., What type is Gengar?",
                elem_id="custom-msg-box",
            )
            send = gr.Button("Send", elem_id="custom-send-btn")

        def respond(message, history, base_url):
            history = history or []
            user_message = (message or "").strip()
            if not user_message:
                return history, ""

            try:
                normalized_base = normalize_base_url(base_url or DEFAULT_BASE_URL)
            except ValueError as config_error:
                reply = f"⚠️ {config_error}"
                return history + [[user_message, reply]], ""

            try:
                reply = call_remote_pokedex(history, user_message, normalized_base)
            except RemoteChatError as service_error:
                reply = f"⚠️ Unable to reach Pokédex service: {service_error}"

            return history + [[user_message, reply]], ""

        inputs = [msg, chatbot, endpoint_box]
        outputs = [chatbot, msg]
        msg.submit(respond, inputs=inputs, outputs=outputs)
        send.click(respond, inputs=inputs, outputs=outputs)

        gr.Markdown(
            "Tip: Provide Pokémon-focused questions. Responses stream from the configured remote service."
        )
    return demo


if __name__ == "__main__":
    ui = build_ui()
    ui.launch()
