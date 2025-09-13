import gradio as gr
import requests

API_KEY = "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"
API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-20b"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def chat_stream(history, model):
    # history: list of [user, assistant] pairs
    messages = []
    for pair in history:
        user_msg = pair[0]
        assistant_msg = pair[1] if len(pair) > 1 and pair[1] else None
        messages.append({"role": "user", "content": user_msg})
        if assistant_msg:
            messages.append({"role": "assistant", "content": assistant_msg})
    # Add a placeholder for the next user message (handled in respond)
    payload = {
        "model": model,
        "messages": messages,
        "stream": True
    }
    response = requests.post(API_URL, headers=headers, json=payload, stream=True)
    output = ""
    for line in response.iter_lines():
        if line:
            try:
                data = line.decode("utf-8")
                if data.startswith("data: "):
                    data = data[6:]
                if data == "[DONE]":
                    break
                import json
                chunk = json.loads(data)
                delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                output += delta
                yield output
            except Exception:
                continue

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
            temp_history = history + [[message, ""]]
            bot_stream = chat_stream(temp_history, model)
            for partial in bot_stream:
                updated_history = history + [[message, partial]]
                # Clear the textbox after sending
                yield updated_history, ""
        msg.submit(respond, inputs=[msg, chatbot, model_dropdown], outputs=[chatbot, msg])
        send.click(respond, inputs=[msg, chatbot, model_dropdown], outputs=[chatbot, msg])
    demo.launch()

if __name__ == "__main__":
    gradio_chatbot()
