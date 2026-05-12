# ================================================================
# AI Loan Governance Platform — Makefile
# Convenience targets wrapping Docker Compose and npm.
# ================================================================

.PHONY: help up down logs build test e2e db-shell kafka-shell opa-test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all infrastructure containers
	docker-compose -f infra/docker/docker-compose.yml up -d --remove-orphans

down: ## Stop all infrastructure containers
	docker-compose -f infra/docker/docker-compose.yml down

logs: ## Tail all container logs
	docker-compose -f infra/docker/docker-compose.yml logs -f --tail=100

logs-svc: ## Tail a specific service log: make logs-svc SVC=loan-postgres
	docker logs -f $(SVC)

build: ## Build all TypeScript packages and services
	npm run build

install: ## Install all npm workspace dependencies
	npm install

db-shell: ## Open psql shell in the Postgres container
	docker exec -it loan-postgres psql -U loanapp -d loandb

db-migrate: ## Re-run raw schema migrations (Legacy)
	docker exec loan-postgres psql -U loanapp -d loandb -f /migrations/001_initial_schema.sql

db-seed: ## Run seed data
	docker exec loan-postgres psql -U loanapp -d loandb -f /migrations/002_seed_data.sql

prisma-generate: ## Generate Prisma client locally
	npm run prisma:generate

prisma-migrate-dev: ## Run Prisma migrate dev
	npm run prisma:migrate:dev

prisma-migrate-deploy: ## Run Prisma migrate deploy
	npm run prisma:migrate:deploy

prisma-studio: ## Open Prisma Studio
	npm run prisma:studio

db-baseline: ## Baseline production DB with initial schema
	bash scripts/db-baseline.sh

kafka-shell: ## Open Kafka CLI inside the Kafka container
	docker exec -it loan-kafka bash

kafka-topics: ## List all Kafka topics
	docker exec loan-kafka kafka-topics --bootstrap-server localhost:9092 --list

opa-test: ## Run OPA policy unit tests
	docker exec loan-opa opa test /policies -v

opa-eval: ## Evaluate a policy: make opa-eval POLICY=loan/approval INPUT='{"input":{...}}'
	curl -s -X POST http://localhost:8181/v1/data/$(POLICY) -H 'Content-Type: application/json' -d '$(INPUT)' | jq .

e2e: ## Run E2E smoke test (requires all services running)
	bash scripts/test-e2e.sh

temporal-ns: ## Create the Temporal namespace for loan-governance
	docker exec loan-temporal tctl --namespace loan-governance namespace register || true

reset: ## Stop containers, remove volumes (DESTRUCTIVE)
	docker-compose -f infra/docker/docker-compose.yml down -v --remove-orphans

status: ## Show container health status
	docker-compose -f infra/docker/docker-compose.yml ps
