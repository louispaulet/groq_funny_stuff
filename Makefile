VENV_DIR=.venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip

POKEDEX_PORT ?= 7860
CHAT_PORT ?= 7861
ALLERGYFINDER_PORT ?= 5173
STLVIEWER_PORT ?= 5174
ALLIN_PORT ?= 5175

.PHONY: venv install run clean chat pokedex allergyfinder stlviewer allin test deploy

venv:
	python3 -m venv $(VENV_DIR)

# Parse second goal as app selector: `make install chat` or `make run pokedex`
APP := $(word 2,$(MAKECMDGOALS))

# Treat targets as selectors so `make run pokedex` works
chat pokedex allergyfinder stlviewer allin:
	@:

install: venv
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ] && [ "$(APP)" != "allergyfinder" ] && [ "$(APP)" != "stlviewer" ] && [ "$(APP)" != "allin" ]; then \
	  echo "Usage: make install chat|pokedex|allergyfinder|stlviewer|allin"; exit 1; \
	fi
	$(PIP) install --upgrade pip
	@if [ "$(APP)" = "chat" ]; then $(PIP) install -r chat/requirements.txt; fi
	@if [ "$(APP)" = "pokedex" ]; then $(PIP) install -r pokedex/requirements.txt; fi
	@if [ "$(APP)" = "allergyfinder" ]; then cd allergyfinder && npm install; fi
	@if [ "$(APP)" = "stlviewer" ]; then cd groq-chat-stl-viewer && npm install; fi
	@if [ "$(APP)" = "allin" ]; then cd all_in && npm install; fi

run:
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ] && [ "$(APP)" != "allergyfinder" ] && [ "$(APP)" != "stlviewer" ] && [ "$(APP)" != "allin" ]; then \
	  echo "Usage: make run chat|pokedex|allergyfinder|stlviewer|allin"; exit 1; \
	fi
	@if [ "$(APP)" = "chat" ]; then $(PYTHON) chat/app.py --server.port $(CHAT_PORT) --server.headless true; fi
	@if [ "$(APP)" = "pokedex" ]; then $(PYTHON) pokedex/pokedex_app.py --server.port $(POKEDEX_PORT) --server.headless true; fi
	@if [ "$(APP)" = "allergyfinder" ]; then cd allergyfinder && npm run dev -- --host --port $(ALLERGYFINDER_PORT); fi
	@if [ "$(APP)" = "stlviewer" ]; then cd groq-chat-stl-viewer && npm run dev -- --host --port $(STLVIEWER_PORT); fi
	@if [ "$(APP)" = "allin" ]; then cd all_in && npm run dev -- --host --port $(ALLIN_PORT); fi

test:
	@if [ "$(APP)" != "chat" ] && [ "$(APP)" != "pokedex" ] && [ "$(APP)" != "allergyfinder" ] && [ "$(APP)" != "stlviewer" ] && [ "$(APP)" != "allin" ]; then \
	  echo "Usage: make test chat|pokedex|allergyfinder|stlviewer|allin"; exit 1; \
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
	@if [ "$(APP)" = "allergyfinder" ]; then cd allergyfinder && npm run lint && node --test src/lib/openFoodFacts/__tests__/*.test.js; fi
	@if [ "$(APP)" = "stlviewer" ]; then cd groq-chat-stl-viewer && npm run lint; fi
	@if [ "$(APP)" = "allin" ]; then cd all_in && npm run lint; fi

deploy:
	@if [ "$(APP)" != "allin" ]; then \
	  echo "Usage: make deploy allin"; exit 1; \
	fi
	@if [ "$(APP)" = "allin" ]; then cd all_in && npm run deploy; fi

clean:
	rm -rf $(VENV_DIR)

# ---------------------------------------------
# ObjectMaker cURL tests (for the /obj endpoint)
# ---------------------------------------------

OBJ_BASE_URL ?= https://groq-endpoint.louispaulet13.workers.dev
OBJ_TYPE ?= pizza
OBJ_TITLE ?= diavola
OBJ_USER ?= cli-make-test
SYSTEM_PROMPT ?= You are an object maker. Produce a single JSON object that strictly conforms to the provided JSON Schema. Do not include commentary or markdown. Only return the JSON object.

.PHONY: objtest-pizza
objtest-pizza:
	@OBJ_BASE_URL="$(OBJ_BASE_URL)" OBJ_TYPE="$(OBJ_TYPE)" \
	  OBJ_TITLE="$(OBJ_TITLE)" OBJ_USER="$(OBJ_USER)" SYSTEM_PROMPT="$(SYSTEM_PROMPT)" \
	  scripts/objtest_pizza.sh
