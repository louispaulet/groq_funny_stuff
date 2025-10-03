VENV_DIR=.venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip

POKEDEX_PORT ?= 7860
CHAT_PORT ?= 7861

.PHONY: venv install run clean chat pokedex test

venv:
	python3 -m venv $(VENV_DIR)

# Parse second goal as app selector: `make install chat` or `make run pokedex`
APP := $(word 2,$(MAKECMDGOALS))

# Treat `chat` and `pokedex` as no-op goals so they can be used as selectors
chat pokedex:
	@:

install: venv
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ]; then \
	  echo "Usage: make install chat|pokedex"; exit 1; \
	fi
	$(PIP) install --upgrade pip
	@if [ "$(APP)" = "chat" ]; then $(PIP) install -r chat/requirements.txt; fi
	@if [ "$(APP)" = "pokedex" ]; then $(PIP) install -r pokedex/requirements.txt; fi

run:
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ]; then \
	  echo "Usage: make run chat|pokedex"; exit 1; \
	fi
	@if [ "$(APP)" = "chat" ]; then $(PYTHON) chat/app.py --server.port $(CHAT_PORT) --server.headless true; fi
	@if [ "$(APP)" = "pokedex" ]; then $(PYTHON) pokedex/pokedex_app.py --server.port $(POKEDEX_PORT) --server.headless true; fi

test:
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ]; then \
	  echo "Usage: make test chat|pokedex"; exit 1; \
	fi
	@if [ ! -x "$(PYTHON)" ]; then \
	  echo "Virtualenv missing. Run make install $(APP) first."; exit 1; \
	fi
	@if [ "$(APP)" = "chat" ]; then \
	  $(PYTHON) -m pytest chat || { code=$$?; if [ $$code -ne 5 ]; then exit $$code; fi; echo "No chat tests detected."; }; \
	fi
	@if [ "$(APP)" = "pokedex" ]; then $(PYTHON) -m pytest pokedex/tests; fi

clean:
	rm -rf $(VENV_DIR)
