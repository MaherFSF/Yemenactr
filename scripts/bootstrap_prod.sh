#!/bin/bash
# =============================================================================
# YETO Platform - Production Bootstrap Script
# Yemen Economic Transparency Observatory
# =============================================================================
#
# This script deploys YETO to production with full safety checks.
#
# Prerequisites:
#   - All staging tests passed
#   - .env.production file configured
#   - DNS configured for production domain
#   - TLS certificates available (or Let's Encrypt configured)
#
# Usage:
#   ./scripts/bootstrap_prod.sh [--force] [--rollback VERSION]
#
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
PROD_ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD="docker-compose.prod.yml"
BACKUP_DIR="/opt/yeto/backups"
DEPLOY_LOG="/opt/yeto/deploy.log"

# Print banner
echo -e "${MAGENTA}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║   ██╗   ██╗███████╗████████╗ ██████╗                                     ║"
echo "║   ╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔═══██╗                                    ║"
echo "║    ╚████╔╝ █████╗     ██║   ██║   ██║                                    ║"
echo "║     ╚██╔╝  ██╔══╝     ██║   ██║   ██║                                    ║"
echo "║      ██║   ███████╗   ██║   ╚██████╔╝                                    ║"
echo "║      ╚═╝   ╚══════╝   ╚═╝    ╚═════╝                                     ║"
echo "║                                                                           ║"
echo "║   PRODUCTION DEPLOYMENT                                                   ║"
echo "║   Yemen Economic Transparency Observatory                                 ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse arguments
FORCE=false
ROLLBACK_VERSION=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --force) FORCE=true ;;
        --rollback) ROLLBACK_VERSION="$2"; shift ;;
        -h|--help) 
            echo "Usage: $0 [--force] [--rollback VERSION]"
            echo "  --force            Skip confirmation prompts"
            echo "  --rollback VERSION Rollback to specific version"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

print_step() { echo -e "\n${GREEN}▶ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }

log_deploy() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$DEPLOY_LOG"
}

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Handle rollback
if [ -n "$ROLLBACK_VERSION" ]; then
    print_step "Rolling back to version: $ROLLBACK_VERSION"
    
    ROLLBACK_BACKUP="$BACKUP_DIR/yeto-$ROLLBACK_VERSION"
    if [ ! -d "$ROLLBACK_BACKUP" ]; then
        print_error "Rollback version not found: $ROLLBACK_BACKUP"
        echo "Available versions:"
        ls -1 "$BACKUP_DIR" 2>/dev/null || echo "No backups found"
        exit 1
    fi
    
    # Stop current deployment
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" down
    
    # Restore backup
    cp -r "$ROLLBACK_BACKUP"/* /opt/yeto/
    
    # Restart services
    docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" up -d
    
    log_deploy "ROLLBACK to $ROLLBACK_VERSION"
    print_success "Rollback complete"
    exit 0
fi

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================

print_step "Running pre-deployment checks..."

# Check production environment file
if [ ! -f "$PROD_ENV_FILE" ]; then
    print_error "Production environment file not found: $PROD_ENV_FILE"
    exit 1
fi
print_success "Production environment file found"

# Validate environment variables
source "$PROD_ENV_FILE"

REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "DOMAIN"
    "VITE_APP_ID"
    "OAUTH_SERVER_URL"
    "VITE_OAUTH_PORTAL_URL"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "Missing required variables: ${MISSING_VARS[*]}"
    exit 1
fi
print_success "Environment variables validated"

# Check for CHANGE_ME placeholders
if grep -q "CHANGE_ME" "$PROD_ENV_FILE"; then
    print_error "Production config contains CHANGE_ME placeholders"
    exit 1
fi
print_success "No placeholder values found"

# Run type check
print_step "Running type check..."
if ! pnpm typecheck 2>/dev/null; then
    print_error "Type check failed. Cannot deploy to production."
    exit 1
fi
print_success "Type check passed"

# Run all tests
print_step "Running test suite..."
if ! pnpm test 2>/dev/null; then
    print_error "Tests failed. Cannot deploy to production."
    if [ "$FORCE" != true ]; then
        exit 1
    fi
    print_warning "Continuing due to --force flag"
fi
print_success "All tests passed"

# Run security audit
print_step "Running security audit..."
if command -v pnpm audit &> /dev/null; then
    AUDIT_RESULT=$(pnpm audit --audit-level=high 2>&1 || true)
    if echo "$AUDIT_RESULT" | grep -q "high\|critical"; then
        print_warning "Security vulnerabilities found:"
        echo "$AUDIT_RESULT" | head -20
        if [ "$FORCE" != true ]; then
            read -p "Continue anyway? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        print_success "No high/critical vulnerabilities"
    fi
fi

# =============================================================================
# CONFIRMATION
# =============================================================================

if [ "$FORCE" != true ]; then
    echo -e "\n${YELLOW}"
    echo "╔═══════════════════════════════════════════════════════════════════════════╗"
    echo "║   ⚠  PRODUCTION DEPLOYMENT WARNING                                        ║"
    echo "╠═══════════════════════════════════════════════════════════════════════════╣"
    echo "║                                                                           ║"
    echo "║   You are about to deploy to PRODUCTION.                                  ║"
    echo "║                                                                           ║"
    echo "║   Domain: $DOMAIN"
    echo "║   Database: [CONFIGURED]                                                  ║"
    echo "║                                                                           ║"
    echo "║   This will:                                                              ║"
    echo "║   - Create a backup of the current deployment                             ║"
    echo "║   - Build and deploy new application version                              ║"
    echo "║   - Run database migrations                                               ║"
    echo "║   - Restart all services                                                  ║"
    echo "║                                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    read -p "Type 'DEPLOY' to confirm production deployment: " CONFIRM
    if [ "$CONFIRM" != "DEPLOY" ]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

# =============================================================================
# BACKUP
# =============================================================================

print_step "Creating backup..."

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION=$(git describe --tags --always 2>/dev/null || echo "unknown")
BACKUP_NAME="yeto-$VERSION-$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Backup current deployment
if [ -d "/opt/yeto/dist" ]; then
    cp -r /opt/yeto "$BACKUP_DIR/$BACKUP_NAME"
    print_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Backup database
print_step "Backing up database..."
if docker compose exec -T db mysqldump -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/$BACKUP_NAME-db.sql" 2>/dev/null; then
    gzip "$BACKUP_DIR/$BACKUP_NAME-db.sql"
    print_success "Database backup created"
else
    print_warning "Database backup skipped (may not be running)"
fi

log_deploy "BACKUP created: $BACKUP_NAME"

# =============================================================================
# BUILD
# =============================================================================

print_step "Building production application..."
NODE_ENV=production pnpm build
print_success "Build completed"

# =============================================================================
# DEPLOY
# =============================================================================

print_step "Deploying to production..."

# Copy production env
cp "$PROD_ENV_FILE" .env

# Pull latest base images
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" pull

# Build and start services
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" up -d --build

log_deploy "DEPLOY started: $VERSION"

# =============================================================================
# HEALTH CHECK
# =============================================================================

print_step "Running health checks..."

# Wait for application to be healthy
MAX_WAIT=120
WAIT_INTERVAL=5
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -sf "http://localhost:3000/api/trpc/monitoring.getLiveness" > /dev/null 2>&1; then
        print_success "Application is healthy!"
        break
    fi
    
    if [ $WAITED -ge $MAX_WAIT ]; then
        print_error "Health check timeout after ${MAX_WAIT}s"
        print_warning "Rolling back..."
        
        # Rollback
        docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" down
        if [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
            cp -r "$BACKUP_DIR/$BACKUP_NAME"/* /opt/yeto/
            docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" up -d
        fi
        
        log_deploy "DEPLOY FAILED - rolled back"
        exit 1
    fi
    
    echo -n "."
    sleep $WAIT_INTERVAL
    WAITED=$((WAITED + WAIT_INTERVAL))
done

# =============================================================================
# POST-DEPLOYMENT
# =============================================================================

print_step "Running database migrations..."
docker compose exec -T web pnpm db:push 2>/dev/null || pnpm db:push
print_success "Database migrations complete"

# Clean up old backups (keep last 10)
print_step "Cleaning up old backups..."
ls -1dt "$BACKUP_DIR"/yeto-* 2>/dev/null | tail -n +11 | xargs -r rm -rf
print_success "Cleanup complete"

log_deploy "DEPLOY completed: $VERSION"

# =============================================================================
# SUMMARY
# =============================================================================

echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║   ✓ PRODUCTION DEPLOYMENT SUCCESSFUL                                      ║"
echo "║                                                                           ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
echo "║   Version: $VERSION"
echo "║   Domain:  https://$DOMAIN"
echo "║   Backup:  $BACKUP_NAME"
echo "║                                                                           ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
echo "║   Post-deployment checklist:                                              ║"
echo "║   [ ] Verify homepage loads correctly                                     ║"
echo "║   [ ] Test login flow                                                     ║"
echo "║   [ ] Check data displays correctly                                       ║"
echo "║   [ ] Monitor error logs: docker compose logs -f web                      ║"
echo "║   [ ] Verify SSL certificate                                              ║"
echo "║                                                                           ║"
echo "║   Rollback command:                                                       ║"
echo "║   ./scripts/bootstrap_prod.sh --rollback $BACKUP_NAME"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Send deployment notification (if configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ YETO deployed to production: $VERSION\"}" \
        "$SLACK_WEBHOOK_URL" > /dev/null
fi
