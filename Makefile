TEMPLATES_SRC  := server/templates
TEMPLATES_DEST := $(HOME)/opencbs_templates/templates
COMPOSE        := docker compose -f docker-compose-production.yml

.PHONY: copy-templates deploy redeploy ps logs down teardown

## Copy report templates to ~/opencbs_templates/templates
copy-templates:
	mkdir -p $(TEMPLATES_DEST)
	cp -r $(TEMPLATES_SRC)/. $(TEMPLATES_DEST)/
	@echo "Templates copied to $(TEMPLATES_DEST)"

## First-time deploy: copy templates then bring up all services
deploy: copy-templates
	$(COMPOSE) up -d --build

## Redeploy after a code change (same as deploy)
redeploy: deploy

## Show service status and health
ps:
	$(COMPOSE) ps

## Follow API logs (Ctrl-C to stop)
logs:
	$(COMPOSE) logs -f api

## Stop all services (data volumes are preserved)
down:
	$(COMPOSE) down

## DANGER: stop all services and destroy all data volumes
teardown:
	@echo "WARNING: This will destroy all data volumes. Press Ctrl-C within 5 seconds to abort."
	@sleep 5
	$(COMPOSE) down -v
