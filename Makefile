# YETO Platform - Makefile
# One-command validation and deployment scripts

.PHONY: all check test lint typecheck build dev clean docker-up docker-down db-push db-seed validate help

# Default target
all: check

# ============================================
# VALIDATION (make check)
# ============================================

# Run all validation checks
check: lint typecheck test validate
	@echo "✅ All checks passed!"

# Run linting
lint:
	@echo "🔍 Running linter..."
	pnpm lint

# Run TypeScript type checking
typecheck:
	@echo "🔍 Running type check..."
	pnpm typecheck

# Run tests
test:
	@echo "🧪 Running tests..."
	pnpm test

# Run validation scripts
validate:
	@echo "🔍 Running validation scripts..."
	pnpm validate

# ============================================
# DEVELOPMENT
# ============================================

# Start development server
dev:
	@echo "🚀 Starting development server..."
	pnpm dev

# Build for production
build:
	@echo "🏗️ Building for production..."
	pnpm build

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf .next
	rm -rf node_modules/.cache

# ============================================
# DATABASE
# ============================================

# Push database schema changes
db-push:
	@echo "📦 Pushing database schema..."
	pnpm db:push

# Seed database with sample data
db-seed:
	@echo "🌱 Seeding database..."
	npx tsx server/seed.ts

# ============================================
# DOCKER
# ============================================

# Start all Docker services
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d

# Stop all Docker services
docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down

# Rebuild Docker images
docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build --no-cache

# View Docker logs
docker-logs:
	docker-compose logs -f

# ============================================
# DEPLOYMENT
# ============================================

# Deploy to staging
deploy-staging:
	@echo "🚀 Deploying to staging..."
	./scripts/deploy-staging.sh

# Deploy to production
deploy-prod:
	@echo "🚀 Deploying to production..."
	./scripts/deploy-prod.sh

# ============================================
# UTILITIES
# ============================================

# Generate requirements coverage report
req-coverage:
	@echo "📊 Generating requirements coverage report..."
	python3 scripts/req_coverage_check.py

# Generate mockup coverage report
mockup-coverage:
	@echo "📊 Generating mockup coverage report..."
	python3 scripts/mockup_coverage_check.py

# Update STATUS.md
status-update:
	@echo "📝 Updating STATUS.md..."
	./scripts/update-status.sh

# ============================================
# HELP
# ============================================

help:
	@echo "YETO Platform - Available Commands"
	@echo ""
	@echo "Validation:"
	@echo "  make check          - Run all validation checks (lint, typecheck, test, validate)"
	@echo "  make lint           - Run linter"
	@echo "  make typecheck      - Run TypeScript type checking"
	@echo "  make test           - Run tests"
	@echo "  make validate       - Run validation scripts"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start development server"
	@echo "  make build          - Build for production"
	@echo "  make clean          - Clean build artifacts"
	@echo ""
	@echo "Database:"
	@echo "  make db-push        - Push database schema changes"
	@echo "  make db-seed        - Seed database with sample data"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up      - Start all Docker services"
	@echo "  make docker-down    - Stop all Docker services"
	@echo "  make docker-build   - Rebuild Docker images"
	@echo "  make docker-logs    - View Docker logs"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-staging - Deploy to staging"
	@echo "  make deploy-prod    - Deploy to production"
	@echo ""
	@echo "Utilities:"
	@echo "  make req-coverage   - Generate requirements coverage report"
	@echo "  make mockup-coverage- Generate mockup coverage report"
	@echo "  make status-update  - Update STATUS.md"
	@echo "  make help           - Show this help message"
