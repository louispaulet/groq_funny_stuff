import gradio as gr
import requests

API_KEY = "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"
API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-20b"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def chat_stream(history):
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
        "model": MODEL,
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
    with gr.Blocks() as demo:
        chatbot = gr.Chatbot()
        msg = gr.Textbox(label="Your message")
        send = gr.Button("Send")
        def respond(message, history):
            history = history or []
            # Add the new user message with empty assistant reply for streaming
            temp_history = history + [[message, ""]]
            bot_stream = chat_stream(temp_history)
            for partial in bot_stream:
                # Update the last assistant message with the partial output
                updated_history = history + [[message, partial]]
                yield updated_history
        send.click(respond, inputs=[msg, chatbot], outputs=chatbot)
    demo.launch()

if __name__ == "__main__":
    gradio_chatbot()
