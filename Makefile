ALLIN_DIR := all_in
ALLIN_PORT := 5175

.PHONY: install run build lint test check deploy clean

install:
	cd $(ALLIN_DIR) && npm install

run:
	cd $(ALLIN_DIR) && npm run dev -- --host --port $(ALLIN_PORT) --strictPort

build:
	cd $(ALLIN_DIR) && npm run build

lint:
	cd $(ALLIN_DIR) && npm run lint

test:
	cd $(ALLIN_DIR) && npm run test

check: lint test

deploy:
	cd $(ALLIN_DIR) && npm run deploy

clean:
	rm -rf $(ALLIN_DIR)/node_modules
