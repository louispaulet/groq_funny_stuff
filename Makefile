VENV_DIR=.venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip

POKEDEX_PORT ?= 7860
CHAT_PORT ?= 7861
ALLERGYFINDER_PORT ?= 5173
STLVIEWER_PORT ?= 5174

.PHONY: venv install run clean chat pokedex allergyfinder stlviewer test

venv:
	python3 -m venv $(VENV_DIR)

# Parse second goal as app selector: `make install chat` or `make run pokedex`
APP := $(word 2,$(MAKECMDGOALS))

# Treat targets as selectors so `make run pokedex` works
chat pokedex allergyfinder stlviewer:
	@:

install: venv
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ] && [ "$(APP)" != "allergyfinder" ] && [ "$(APP)" != "stlviewer" ]; then \
	  echo "Usage: make install chat|pokedex|allergyfinder|stlviewer"; exit 1; \
	fi
	$(PIP) install --upgrade pip
	@if [ "$(APP)" = "chat" ]; then $(PIP) install -r chat/requirements.txt; fi
	@if [ "$(APP)" = "pokedex" ]; then $(PIP) install -r pokedex/requirements.txt; fi
	@if [ "$(APP)" = "allergyfinder" ]; then cd allergyfinder && npm install; fi
	@if [ "$(APP)" = "stlviewer" ]; then cd groq-chat-stl-viewer && npm install; fi

run:
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ] && [ "$(APP)" != "allergyfinder" ] && [ "$(APP)" != "stlviewer" ]; then \
	  echo "Usage: make run chat|pokedex|allergyfinder|stlviewer"; exit 1; \
	fi
	@if [ "$(APP)" = "chat" ]; then $(PYTHON) chat/app.py --server.port $(CHAT_PORT) --server.headless true; fi
	@if [ "$(APP)" = "pokedex" ]; then $(PYTHON) pokedex/pokedex_app.py --server.port $(POKEDEX_PORT) --server.headless true; fi
	@if [ "$(APP)" = "allergyfinder" ]; then cd allergyfinder && npm run dev -- --host --port $(ALLERGYFINDER_PORT); fi
	@if [ "$(APP)" = "stlviewer" ]; then cd groq-chat-stl-viewer && npm run dev -- --host --port $(STLVIEWER_PORT); fi

test:
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ] && [ "$(APP)" != "allergyfinder" ] && [ "$(APP)" != "stlviewer" ]; then \
	  echo "Usage: make test chat|pokedex|allergyfinder|stlviewer"; exit 1; \
	fi
	@if [ "$(APP)" = "chat" ] || [ "$(APP)" = "pokedex" ]; then \
	  if [ ! -x "$(PYTHON)" ]; then \
	    echo "Virtualenv missing. Run make install $(APP) first."; exit 1; \
	  fi; \
	fi
	@if [ "$(APP)" = "chat" ]; then \
	  $(PYTHON) -m pytest chat || { code=$$?; if [ $$code -ne 5 ]; then exit $$code; fi; echo "No chat tests detected."; }; \
	fi
	@if [ "$(APP)" = "pokedex" ]; then $(PYTHON) -m pytest pokedex/tests; fi
	@if [ "$(APP)" = "allergyfinder" ]; then cd allergyfinder && npm run lint; fi
	@if [ "$(APP)" = "stlviewer" ]; then cd groq-chat-stl-viewer && npm run lint; fi

clean:
	rm -rf $(VENV_DIR)
