TEMPLATES_SRC := server/templates
TEMPLATES_DEST := $(HOME)/opencbs_templates

.PHONY: copy-templates
copy-templates:
	mkdir -p $(TEMPLATES_DEST)
	cp -r $(TEMPLATES_SRC)/. $(TEMPLATES_DEST)/
	@echo "Templates copied to $(TEMPLATES_DEST)"
