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

def generate_maze_html(prompt, model):
    # Use Groq to generate HTML/JS for a 3D maze
    messages = [
        {"role": "user", "content": prompt}
    ]
    payload = {
        "model": model,
        "messages": messages,
        "stream": False
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    html_code = ""
    if response.ok:
        data = response.json()
        html_code = data["choices"][0]["message"]["content"]
    else:
        html_code = "<p>Error generating maze code.</p>"
    # Save to file
    file_path = "demos/maze3d.html"
    with open(file_path, "w") as f:
        f.write(html_code)
    return f"Maze HTML file created: {file_path}"

def gradio_chatbot():
    with gr.Blocks(css="assets/custom_footer.css") as demo:
        with gr.Tab("Chatbot"):
            with gr.Row():
                with gr.Column(scale=8):
                    chatbot = gr.Chatbot()
                with gr.Column(scale=4):
                    pass
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
                    yield updated_history, ""
            msg.submit(respond, inputs=[msg, chatbot, model_dropdown], outputs=[chatbot, msg])
            send.click(respond, inputs=[msg, chatbot, model_dropdown], outputs=[chatbot, msg])
        with gr.Tab("3D Maze Generator"):
            maze_prompt = gr.Textbox(
                label="Describe your 3D maze (or leave default)",
                value=(
                    "Please make a simple HTML page that contains JS code to generate a maze (30x30 blocks) using the recursive backtracking algorithm.\n"
                    "- Use robust, error-free code with proper initialization of all maze data structures and boundaries.\n"
                    "- Avoid any undefined or out-of-bounds array access.\n"
                    "- The user can use mouse click to rotate the scene.\n"
                    "- The camera should be placed above the center of the maze and show the entire maze in a top-down manner.\n"
                    "- Use three.js lib, here are the CDNs to use:\n"
                    "import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';\n"
                    "import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';\n"
                    "- Add comments to explain the main parts of the code."
                )
            )
            maze_model = gr.Dropdown(
                label="Choose Model",
                choices=["openai/gpt-oss-20b", "openai/gpt-oss-120b"],
                value=DEFAULT_MODEL
            )
            generate_btn = gr.Button("Generate Maze HTML")
            output_label = gr.Label()
            maze_url = gr.HTML("<a href='demos/maze3d.html' target='_blank'>Open generated maze in browser</a>")

            def maze_generate_fn(prompt, model):
                result = generate_maze_html(prompt, model)
                url_html = "<a href='demos/maze3d.html' target='_blank'>Open generated maze in browser</a>"
                return result, url_html

            generate_btn.click(
                maze_generate_fn,
                inputs=[maze_prompt, maze_model],
                outputs=[output_label, maze_url]
            )
    demo.launch()

if __name__ == "__main__":
    gradio_chatbot()
