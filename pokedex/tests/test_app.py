from starlette.testclient import TestClient

from pokedex.pokedex_app import MANIFEST_PATH, build_messages, build_ui


def test_manifest_route_serves_local_file():
    assert MANIFEST_PATH.exists()
    ui = build_ui()
    client = TestClient(ui.app)
    response = client.get("/manifest.json")
    assert response.status_code == 200
    payload = response.json()
    assert payload.get("name") == "Pokédex Remote Chat"
    assert payload.get("short_name") == "Pokédex"


def test_build_messages_includes_system_and_history():
    history = [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello"},
    ]
    messages = build_messages(history, "Tell me about Pikachu")
    assert messages[0]["role"] == "system"
    assert messages[-1] == {"role": "user", "content": "Tell me about Pikachu"}
    # Ensure prior turns survive unchanged
    assert any(m.get("content") == "Hello" for m in messages)
