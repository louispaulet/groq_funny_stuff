VENV_DIR=.venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip

.PHONY: venv install run clean chat pokedex

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
	@if [ "$(APP)" = "chat" ]; then $(PYTHON) chat/app.py; fi
	@if [ "$(APP)" = "pokedex" ]; then $(PYTHON) pokedex/pokedex_app.py; fi

clean:
	rm -rf $(VENV_DIR)
