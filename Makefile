# YETO Platform - Makefile
# Yemen Economic Transparency Observatory
# One-command validation and deployment scripts
#
# Usage: make <target>
# Run 'make help' for available commands

.PHONY: all check check-quick test test-watch lint typecheck build dev clean docker-up docker-down db-push db-seed db-studio db-migrate validate help ingest ingest-worldbank ingest-imf ingest-fao audit audit-fix coverage report-connectors report-health

# Default target
all: check

# ============================================
# VALIDATION (make check)
# ============================================

# Run all validation checks (comprehensive)
check: lint typecheck test validate audit-check
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║           ✅ All checks passed successfully!               ║"
	@echo "╚════════════════════════════════════════════════════════════╝"

# Run quick checks (typecheck + test only)
check-quick:
	@echo "🚀 Running quick checks..."
	@pnpm typecheck
	@pnpm test
	@echo "✅ Quick checks passed!"

# Run security audit check (non-blocking)
audit-check:
	@echo "🔒 Running security audit..."
	@pnpm audit --audit-level=high 2>&1 || echo "⚠️  Security warnings (review recommended)"

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
# DATA INGESTION
# ============================================

# Run all data connectors
ingest:
	@echo "📥 Running all data connectors..."
	@node -e "require('./server/connectors').runAllConnectors().then(r => console.log(JSON.stringify(r, null, 2)))"

# Run World Bank connector
ingest-worldbank:
	@echo "📥 Running World Bank connector..."
	@node -e "const { WorldBankConnector } = require('./server/connectors'); new WorldBankConnector().fetchAllIndicators().then(r => console.log('Fetched', r.length, 'series'))"

# Run IMF connector
ingest-imf:
	@echo "📥 Running IMF connector..."
	@node -e "require('./server/connectors/imfConnector').ingestIMFData().then(r => console.log(JSON.stringify(r, null, 2)))"

# Run FAO connector
ingest-fao:
	@echo "📥 Running FAO connector..."
	@node -e "require('./server/connectors/faoConnector').ingestFAOData().then(r => console.log(JSON.stringify(r, null, 2)))"

# Run ACLED connector
ingest-acled:
	@echo "📥 Running ACLED connector..."
	@node -e "require('./server/connectors/acledConnector').ingestACLEDData().then(r => console.log(JSON.stringify(r, null, 2)))"

# Run IOM DTM connector
ingest-dtm:
	@echo "📥 Running IOM DTM connector..."
	@node -e "require('./server/connectors/iomDtmConnector').ingestDTMData().then(r => console.log(JSON.stringify(r, null, 2)))"

# ============================================
# SECURITY
# ============================================

# Run full security audit
audit:
	@echo "🔒 Running security audit..."
	pnpm audit

# Fix security vulnerabilities
audit-fix:
	@echo "🔧 Fixing security vulnerabilities..."
	pnpm audit --fix

# ============================================
# TESTING
# ============================================

# Run tests in watch mode
test-watch:
	@echo "🧪 Running tests in watch mode..."
	pnpm test:watch

# Run tests with coverage
coverage:
	@echo "📊 Running tests with coverage..."
	pnpm test -- --coverage

# ============================================
# REPORTS
# ============================================

# Show connector status
report-connectors:
	@echo "📊 Connector Status Report"
	@echo "========================="
	@node -e "const c = require('./server/connectors'); console.log(JSON.stringify(c.ENHANCED_CONNECTOR_REGISTRY.map(x => ({id: x.id, name: x.name, status: x.status, priority: x.priority})), null, 2))"

# Show system health
report-health:
	@echo "📊 System Health Report"
	@echo "======================="
	@echo "Node version: $$(node --version)"
	@echo "pnpm version: $$(pnpm --version)"
	@echo "Disk usage: $$(df -h . | tail -1 | awk '{print $$5}')"

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

# Open Drizzle Studio
db-studio:
	@echo "🗄️  Opening Drizzle Studio..."
	pnpm db:studio

# Run database migrations
db-migrate:
	@echo "🗄️  Running database migrations..."
	pnpm drizzle-kit generate
	pnpm drizzle-kit migrate

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
	@echo "Data Ingestion:"
	@echo "  make ingest         - Run all data connectors"
	@echo "  make ingest-worldbank - Run World Bank connector"
	@echo "  make ingest-imf     - Run IMF connector"
	@echo "  make ingest-fao     - Run FAO connector"
	@echo "  make ingest-acled   - Run ACLED connector"
	@echo "  make ingest-dtm     - Run IOM DTM connector"
	@echo ""
	@echo "Security:"
	@echo "  make audit          - Run security audit"
	@echo "  make audit-fix      - Fix security vulnerabilities"
	@echo ""
	@echo "Reports:"
	@echo "  make report-connectors - Show connector status"
	@echo "  make report-health  - Show system health"
	@echo ""
	@echo "Utilities:"
	@echo "  make req-coverage   - Generate requirements coverage report"
	@echo "  make mockup-coverage- Generate mockup coverage report"
	@echo "  make status-update  - Update STATUS.md"
	@echo "  make db-studio      - Open Drizzle Studio"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make help           - Show this help message"
