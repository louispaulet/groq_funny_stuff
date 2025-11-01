ALLIN_DIR := all_in
ALLIN_PORT := 5175
INSTALL_STAMP := $(ALLIN_DIR)/node_modules/.install.stamp

.PHONY: install run build lint test check deploy clean

install: $(INSTALL_STAMP)

$(INSTALL_STAMP): $(ALLIN_DIR)/package-lock.json
	cd $(ALLIN_DIR) && npm install
	touch $(INSTALL_STAMP)

run:
	cd $(ALLIN_DIR) && npm run dev -- --host --port $(ALLIN_PORT) --strictPort

build:
	cd $(ALLIN_DIR) && npm run build

lint: install
	cd $(ALLIN_DIR) && npm run lint

test: install
	cd $(ALLIN_DIR) && npm run test

check: lint test

deploy: install
	cd $(ALLIN_DIR) && npm run deploy

clean:
	rm -rf $(ALLIN_DIR)/node_modules
