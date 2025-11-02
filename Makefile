ALLIN_DIR := all_in
ALLIN_PORT := 5175
INSTALL_STAMP := $(ALLIN_DIR)/node_modules/.install.stamp

.PHONY: install run build lint test check deploy clean sitemap

install: $(INSTALL_STAMP)

$(INSTALL_STAMP): $(ALLIN_DIR)/package-lock.json
	cd $(ALLIN_DIR) && npm install --legacy-peer-deps
	touch $(INSTALL_STAMP)

run:
	./scripts/run_allin_dev.sh $(ALLIN_DIR) $(ALLIN_PORT)

build:
	cd $(ALLIN_DIR) && npm run build

lint: install
	cd $(ALLIN_DIR) && npm run lint

test: install
	cd $(ALLIN_DIR) && npm run test

check: lint test

sitemap: install
	cd $(ALLIN_DIR) && npm run generate:sitemap

deploy: sitemap
	cd $(ALLIN_DIR) && npm run deploy

clean:
	rm -rf $(ALLIN_DIR)/node_modules
