import logging
import os

import gradio as gr
import requests

DEFAULT_MODEL = "openai/gpt-oss-20b"
BASE_URL = os.getenv("CHAT_BASE_URL", "https://groq-endpoint.louispaulet13.workers.dev").rstrip("/")
REQUEST_TIMEOUT = float(os.getenv("CHAT_REQUEST_TIMEOUT", "30"))


logging.basicConfig(level=logging.INFO, format="[chat] %(message)s")
LOGGER = logging.getLogger("chat.remote")


def _preview(text: str, limit: int = 200) -> str:
    if not text:
        return ""
    text = str(text).strip()
    return text if len(text) <= limit else f"{text[:limit]}..."


def build_messages(history, user_input):
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    for pair in history or []:
        if not pair:
            continue
        user_part = pair[0] if len(pair) > 0 else ""
        assistant_part = pair[1] if len(pair) > 1 else ""
        if user_part:
            messages.append({"role": "user", "content": str(user_part)})
        if assistant_part:
            messages.append({"role": "assistant", "content": str(assistant_part)})
    messages.append({"role": "user", "content": user_input})
    return messages


def call_remote_chat(history, user_input, model):
    if not BASE_URL:
        raise RuntimeError("CHAT_BASE_URL is not configured.")

    payload = {"messages": build_messages(history, user_input)}
    if model:
        payload["model"] = model

    url = f"{BASE_URL}/chat"
    LOGGER.info("→ POST %s — model=%s — question=%s", url, model or "default", _preview(user_input))

    response = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
    duration = response.elapsed.total_seconds() * 1000

    try:
        data = response.json()
    except ValueError as exc:
        LOGGER.error("← %s %s — invalid JSON: %s", url, response.status_code, _preview(response.text))
        raise RuntimeError("Remote chat returned invalid JSON") from exc

    if not response.ok:
        LOGGER.error("← %s %s — body: %s", url, response.status_code, _preview(response.text))
        raise RuntimeError(f"Remote chat returned HTTP {response.status_code}")

    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not content:
        LOGGER.error("← %s %s — empty message", url, response.status_code)
        raise RuntimeError("Remote chat returned an empty message")

    LOGGER.info(
        "← %s %s in %.0fms — response=%s",
        url,
        response.status_code,
        duration,
        _preview(content),
    )
    return content

def gradio_chatbot():
    with gr.Blocks(css="chat/assets/custom_footer.css") as demo:
        with gr.Row():
            with gr.Column(scale=8):
                chatbot = gr.Chatbot()
            with gr.Column(scale=4):
                pass  # Empty column for spacing if needed
        with gr.Row():
            with gr.Column(scale=9):
                msg = gr.Textbox(label="Your message", elem_id="custom-msg-box")
            with gr.Column(scale=1):
                send = gr.Button("Send", elem_id="custom-send-btn")
        model_dropdown = gr.Dropdown(
            label="Choose Model",
            choices=["openai/gpt-oss-20b", "openai/gpt-oss-120b"],
            value=DEFAULT_MODEL
        )
        def respond(message, history, model):
            history = history or []
            user_message = (message or "").strip()
            if not user_message:
                return history, ""

            try:
                assistant_message = call_remote_chat(history, user_message, model)
            except Exception as error:
                assistant_message = f"⚠️ {error}"

            updated_history = history + [[user_message, assistant_message]]
            return updated_history, ""
        msg.submit(respond, inputs=[msg, chatbot, model_dropdown], outputs=[chatbot, msg])
        send.click(respond, inputs=[msg, chatbot, model_dropdown], outputs=[chatbot, msg])
    demo.launch()

if __name__ == "__main__":
    gradio_chatbot()
