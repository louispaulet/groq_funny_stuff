ALLIN_DIR := all_in
ALLIN_PORT ?= 5175

.PHONY: install run test deploy clean

install:
	cd $(ALLIN_DIR) && npm install

run:
	cd $(ALLIN_DIR) && npm run dev -- --host --port $(ALLIN_PORT)

test:
	cd $(ALLIN_DIR) && npm run lint
	cd $(ALLIN_DIR) && npm run test

deploy:
	cd $(ALLIN_DIR) && npm run deploy

clean:
	rm -rf $(ALLIN_DIR)/node_modules
