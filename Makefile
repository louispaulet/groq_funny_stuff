VENV_DIR=.venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip

.PHONY: venv install run clean

venv:
	python3 -m venv $(VENV_DIR)

install: venv
	$(PIP) install --upgrade pip
	$(PIP) install -r src/requirements.txt

run: venv
	$(PYTHON) src/app.py

clean:
	rm -rf $(VENV_DIR)
