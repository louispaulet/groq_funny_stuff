VENV_DIR=.venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip

.PHONY: venv install run pokedex chat clean

venv:
	python3 -m venv $(VENV_DIR)

install: venv
	$(PIP) install --upgrade pip
	$(PIP) install -r src/requirements.txt

run:
	@# No-op so that `make run chat` or `make run pokedex` only launches the chosen app
	@:

pokedex: venv
	$(PYTHON) src/pokedex_app.py

chat: venv
	$(PYTHON) src/app.py

clean:
	rm -rf $(VENV_DIR)
