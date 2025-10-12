# %% [markdown]
"""\
# Pizza Object Generator Notebook (Python Script)

This script is authored as a `.py` notebook compatible with Jupytext/Colab-style
imports. It generates imaginative pizza concepts with the Groq API and renders
corresponding images using Together AI's FLUX image model. Outputs are written
as JSON descriptors alongside PNG image files for each pizza.
"""

# %%
from __future__ import annotations

import base64
import json
import os
import textwrap
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List, Optional

# External dependencies. These imports will succeed in Google Colab after
# `pip install groq together`.
from groq import Groq  # type: ignore
from together import Together  # type: ignore

# %% [markdown]
"""## Configuration helpers"""

# %%
DEFAULT_TEXT_MODEL = "openai/gpt-oss-120b"
DEFAULT_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell-Free"
IMAGE_REQUESTS_PER_MINUTE = 6


@dataclass
class PizzaConcept:
    """A structured representation of a pizza concept."""

    title: str
    description: str
    image_prompt: str
    image_path: Optional[Path] = None

    def to_serializable(self) -> dict:
        data = asdict(self)
        # Convert Path objects to strings for JSON compatibility
        if self.image_path is not None:
            data["image_path"] = str(self.image_path)
        return data


# %% [markdown]
"""## API client factories"""

# %%
def build_groq_client(api_key: Optional[str] = None) -> Groq:
    """Instantiate a Groq text client using the provided or environment API key."""

    key = api_key or os.environ.get("GROQ_API_KEY")
    if not key:
        raise RuntimeError(
            "GROQ_API_KEY is required. Set it in your environment before running this script."
        )
    return Groq(api_key=key)


def build_together_client(api_key: Optional[str] = None) -> Together:
    """Instantiate a Together image client using the provided or environment API key."""

    key = api_key or os.environ.get("TOGETHER_API_KEY")
    if not key:
        raise RuntimeError(
            "TOGETHER_API_KEY is required. Set it in your environment before running this script."
        )
    return Together(api_key=key)


# %% [markdown]
"""## Groq prompt construction"""

# %%
def pizza_prompt(num_pizzas: int) -> str:
    """Create a structured prompt instructing the Groq model to return JSON."""

    return textwrap.dedent(
        f"""
        You are a culinary creative assistant. Invent {num_pizzas} distinct pizzas.

        Return **only** valid JSON following this exact schema:
        {{
          "pizzas": [
            {{
              "title": "string",
              "description": "1-2 sentences describing the pizza",
              "image_prompt": "Imagery instructions for an image generator"
            }}
          ]
        }}

        Requirements:
        - Use unique ingredients, styles, and inspirations for each pizza.
        - Make sure the `image_prompt` is concise but vivid enough for FLUX image generation.
        - Stay grounded in appetizing, realistic concepts (avoid fantastical or unsafe ingredients).
        - Do not include markdown fences or commentary outside the JSON object.
        """
    ).strip()


# %% [markdown]
"""## Pizza generation via Groq"""

# %%
def fetch_pizza_concepts(client: Groq, count: int) -> List[PizzaConcept]:
    """Fetch a list of pizza concepts from the Groq API."""

    response = client.chat.completions.create(
        model=DEFAULT_TEXT_MODEL,
        temperature=0.8,
        max_tokens=800,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You produce structured culinary ideation."},
            {"role": "user", "content": pizza_prompt(count)},
        ],
    )

    content = response.choices[0].message.content  # type: ignore[index]
    payload = json.loads(content)
    pizzas = []
    for item in payload.get("pizzas", []):
        pizzas.append(
            PizzaConcept(
                title=item["title"].strip(),
                description=item["description"].strip(),
                image_prompt=item.get("image_prompt", item["description"]).strip(),
            )
        )
    if len(pizzas) != count:
        raise ValueError(
            f"Expected {count} pizzas but received {len(pizzas)}. Raw payload: {payload}"
        )
    return pizzas


# %% [markdown]
"""## Together image generation"""

# %%
def ensure_output_dirs(base_dir: Path) -> tuple[Path, Path]:
    """Create the output directories for JSON metadata and image assets."""

    json_dir = base_dir / "pizza_json"
    image_dir = base_dir / "pizza_images"
    json_dir.mkdir(parents=True, exist_ok=True)
    image_dir.mkdir(parents=True, exist_ok=True)
    return json_dir, image_dir


def slugify(value: str) -> str:
    """Convert titles to filesystem-friendly slugs."""

    return "-".join(
        "".join(ch for ch in value.lower() if ch.isalnum() or ch in {" ", "-"}).split()
    )


def generate_images(
    client: Together,
    pizzas: Iterable[PizzaConcept],
    image_dir: Path,
    requests_per_minute: int = IMAGE_REQUESTS_PER_MINUTE,
) -> None:
    """Generate images for each pizza concept respecting Together's rate limits."""

    interval = 60.0 / max(1, requests_per_minute)
    last_request_ts: Optional[float] = None

    for concept in pizzas:
        now = time.monotonic()
        if last_request_ts is not None:
            elapsed = now - last_request_ts
            if elapsed < interval:
                sleep_for = interval - elapsed
                time.sleep(sleep_for)
        last_request_ts = time.monotonic()

        prompt = f"Food photography of {concept.title} pizza. {concept.image_prompt}"
        response = client.images.generate(
            prompt=prompt,
            model=DEFAULT_IMAGE_MODEL,
            steps=10,
            n=1,
        )
        image_b64 = response.data[0].b64_json  # type: ignore[index]
        image_bytes = base64.b64decode(image_b64)

        slug = slugify(concept.title)
        image_path = image_dir / f"{slug}.png"
        with image_path.open("wb") as fp:
            fp.write(image_bytes)
        concept.image_path = image_path


# %% [markdown]
"""## Persistence helpers"""

# %%
def persist_pizzas(pizzas: Iterable[PizzaConcept], json_dir: Path) -> None:
    """Write each pizza to its own JSON file."""

    for concept in pizzas:
        slug = slugify(concept.title)
        json_path = json_dir / f"{slug}.json"
        with json_path.open("w", encoding="utf-8") as fp:
            json.dump(concept.to_serializable(), fp, indent=2, ensure_ascii=False)


# %% [markdown]
"""## High-level orchestration"""

# %%
def generate_pizza_batch(
    output_root: Path,
    count: int = 10,
    groq_key: Optional[str] = None,
    together_key: Optional[str] = None,
) -> List[PizzaConcept]:
    """Create pizzas, render images, and persist JSON payloads."""

    groq_client = build_groq_client(groq_key)
    together_client = build_together_client(together_key)

    pizzas = fetch_pizza_concepts(groq_client, count)
    json_dir, image_dir = ensure_output_dirs(output_root)

    generate_images(together_client, pizzas, image_dir)
    persist_pizzas(pizzas, json_dir)

    return pizzas


# %% [markdown]
"""## Display helpers for interactive sessions"""

# %%
def display_pizzas(pizzas: Iterable[PizzaConcept]) -> None:
    """Render pizzas in a notebook-friendly layout using IPython display."""

    try:
        from IPython.display import Image, display  # type: ignore
    except Exception as exc:  # pragma: no cover - IPython not available outside notebooks
        raise RuntimeError("IPython is required for display_pizzas inside notebooks") from exc

    for concept in pizzas:
        display({
            "title": concept.title,
            "description": concept.description,
            "image": Image(filename=str(concept.image_path)) if concept.image_path else None,
        })


# %% [markdown]
"""## Script entry point"""

# %%
def main() -> None:
    base_output = Path.cwd() / "pizza_outputs"
    pizzas = generate_pizza_batch(base_output)
    print(f"Generated {len(pizzas)} pizzas in {base_output}.")


if __name__ == "__main__":
    main()
