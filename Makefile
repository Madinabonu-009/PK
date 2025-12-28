.PHONY: help install dev build test clean docker-build docker-up docker-down logs

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(BLUE)Play Kids - Available Commands:$(NC)'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo '$(BLUE)Installing dependencies...$(NC)'
	cd backend && npm install
	cd frontend && npm install
	cd bot && npm install
	@echo '$(GREEN)✓ Dependencies installed$(NC)'

dev: ## Start development servers
	@echo '$(BLUE)Starting development servers...$(NC)'
	@echo '$(YELLOW)Backend: http://localhost:3000$(NC)'
	@echo '$(YELLOW)Frontend: http://localhost:5173$(NC)'
	@echo '$(YELLOW)API Docs: http://localhost:3000/api-docs$(NC)'
	@make -j3 dev-backend dev-frontend dev-bot

dev-backend: ## Start backend dev server
	cd backend && npm run dev

dev-frontend: ## Start frontend dev server
	cd frontend && npm run dev

dev-bot: ## Start bot dev server
	cd bot && npm run dev

build: ## Build all projects
	@echo '$(BLUE)Building projects...$(NC)'
	cd backend && npm run build --if-present
	cd frontend && npm run build
	@echo '$(GREEN)✓ Build complete$(NC)'

test: ## Run all tests
	@echo '$(BLUE)Running tests...$(NC)'
	cd backend && npm test
	cd frontend && npm test
	@echo '$(GREEN)✓ Tests complete$(NC)'

test-coverage: ## Run tests with coverage
	@echo '$(BLUE)Running tests with coverage...$(NC)'
	cd backend && npm run test:coverage
	cd frontend && npm run test:coverage
	@echo '$(GREEN)✓ Coverage reports generated$(NC)'

lint: ## Run linters
	@echo '$(BLUE)Running linters...$(NC)'
	cd backend && npm run lint --if-present
	cd frontend && npm run lint
	@echo '$(GREEN)✓ Linting complete$(NC)'

lint-fix: ## Fix linting issues
	@echo '$(BLUE)Fixing linting issues...$(NC)'
	cd backend && npm run lint:fix --if-present
	cd frontend && npm run lint:fix
	@echo '$(GREEN)✓ Linting fixed$(NC)'

clean: ## Clean all build artifacts and dependencies
	@echo '$(BLUE)Cleaning...$(NC)'
	rm -rf backend/node_modules backend/dist backend/coverage backend/logs
	rm -rf frontend/node_modules frontend/dist frontend/coverage
	rm -rf bot/node_modules bot/logs
	@echo '$(GREEN)✓ Cleaned$(NC)'

docker-build: ## Build Docker images
	@echo '$(BLUE)Building Docker images...$(NC)'
	docker-compose build
	@echo '$(GREEN)✓ Docker images built$(NC)'

docker-up: ## Start Docker containers
	@echo '$(BLUE)Starting Docker containers...$(NC)'
	docker-compose up -d
	@echo '$(GREEN)✓ Containers started$(NC)'
	@echo '$(YELLOW)Frontend: http://localhost$(NC)'
	@echo '$(YELLOW)Backend: http://localhost:3000$(NC)'

docker-down: ## Stop Docker containers
	@echo '$(BLUE)Stopping Docker containers...$(NC)'
	docker-compose down
	@echo '$(GREEN)✓ Containers stopped$(NC)'

docker-logs: ## Show Docker logs
	docker-compose logs -f

docker-restart: ## Restart Docker containers
	@make docker-down
	@make docker-up

logs: ## Show application logs
	@echo '$(BLUE)Showing logs...$(NC)'
	tail -f backend/logs/*.log

setup: ## Initial project setup
	@echo '$(BLUE)Setting up project...$(NC)'
	@make install
	@echo '$(YELLOW)Creating .env files from examples...$(NC)'
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi
	@if [ ! -f bot/.env ]; then cp bot/.env.example bot/.env; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env; fi
	@echo '$(GREEN)✓ Setup complete$(NC)'
	@echo ''
	@echo '$(YELLOW)Next steps:$(NC)'
	@echo '  1. Edit .env files with your credentials'
	@echo '  2. Run: make dev'

health: ## Check application health
	@echo '$(BLUE)Checking health...$(NC)'
	@curl -s http://localhost:3000/api/health | json_pp || echo '$(YELLOW)Backend not running$(NC)'

backup: ## Backup data files
	@echo '$(BLUE)Creating backup...$(NC)'
	@mkdir -p backups
	@tar -czf backups/backup-$$(date +%Y%m%d-%H%M%S).tar.gz backend/data
	@echo '$(GREEN)✓ Backup created$(NC)'

restore: ## Restore from latest backup
	@echo '$(BLUE)Restoring from backup...$(NC)'
	@tar -xzf $$(ls -t backups/*.tar.gz | head -1) -C .
	@echo '$(GREEN)✓ Restored$(NC)'

security-audit: ## Run security audit
	@echo '$(BLUE)Running security audit...$(NC)'
	cd backend && npm audit
	cd frontend && npm audit
	cd bot && npm audit
	@echo '$(GREEN)✓ Audit complete$(NC)'

update-deps: ## Update dependencies
	@echo '$(BLUE)Updating dependencies...$(NC)'
	cd backend && npm update
	cd frontend && npm update
	cd bot && npm update
	@echo '$(GREEN)✓ Dependencies updated$(NC)'

migrate: ## Run database migrations
	@echo '$(BLUE)Running migrations...$(NC)'
	cd backend && npm run migrate
	@echo '$(GREEN)✓ Migrations complete$(NC)'

test-all: ## Run comprehensive integration tests
	@echo '$(BLUE)Running comprehensive tests...$(NC)'
	cd backend && npm run test:all
	@echo '$(GREEN)✓ All tests complete$(NC)'

docs: ## Open API documentation
	@echo '$(BLUE)API Documentation:$(NC)'
	@echo '$(YELLOW)http://localhost:3000/api-docs$(NC)'
	@echo '$(YELLOW)Make sure backend is running$(NC)'

production: ## Deploy to production
	@echo '$(BLUE)Deploying to production...$(NC)'
	@make test
	@make build
	@make docker-build
	@make docker-up
	@make migrate
	@make health
	@echo '$(GREEN)✓ Production deployment complete$(NC)'
