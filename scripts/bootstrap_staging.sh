#!/bin/bash
# =============================================================================
# YETO Platform - Staging Bootstrap Script
# Yemen Economic Transparency Observatory
# =============================================================================
#
# This script deploys YETO to a staging environment for testing.
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - SSH access to staging server (if remote)
#   - .env.staging file configured
#
# Usage:
#   ./scripts/bootstrap_staging.sh [--remote HOST]
#
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
STAGING_ENV_FILE=".env.staging"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_OVERRIDE="docker-compose.staging.yml"

# Print banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║   YETO - Staging Deployment                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse arguments
REMOTE_HOST=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --remote) REMOTE_HOST="$2"; shift ;;
        -h|--help) 
            echo "Usage: $0 [--remote HOST]"
            echo "  --remote HOST  Deploy to remote staging server via SSH"
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

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check staging environment file
print_step "Checking staging configuration..."
if [ ! -f "$STAGING_ENV_FILE" ]; then
    print_error "Staging environment file not found: $STAGING_ENV_FILE"
    print_warning "Creating template..."
    cat > "$STAGING_ENV_FILE" << 'EOF'
# YETO Staging Environment
NODE_ENV=staging

# Database
DATABASE_URL=mysql://yeto:CHANGE_ME@db:3306/yeto
DB_ROOT_PASSWORD=CHANGE_ME
DB_USER=yeto
DB_PASSWORD=CHANGE_ME
DB_NAME=yeto

# Authentication
JWT_SECRET=CHANGE_ME_STAGING_SECRET

# Application
VITE_APP_ID=yeto-staging
VITE_APP_TITLE=YETO (Staging)
VITE_APP_LOGO=/yeto-logo.svg

# Domain
DOMAIN=staging.yeto.causewaygrp.com
ACME_EMAIL=admin@causewaygrp.com

# OAuth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# API Keys (update with actual values)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
EOF
    print_error "Please update $STAGING_ENV_FILE with actual values and re-run"
    exit 1
fi
print_success "Staging configuration found"

# Validate required environment variables
print_step "Validating environment variables..."
source "$STAGING_ENV_FILE"

REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "DOMAIN")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "CHANGE_ME" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "Missing or unconfigured variables: ${MISSING_VARS[*]}"
    exit 1
fi
print_success "Environment variables validated"

# Run pre-deployment checks
print_step "Running pre-deployment checks..."

# Type check
echo "  Running type check..."
if ! pnpm typecheck 2>/dev/null; then
    print_error "Type check failed. Fix errors before deploying."
    exit 1
fi
print_success "Type check passed"

# Tests
echo "  Running tests..."
if ! pnpm test 2>/dev/null; then
    print_warning "Some tests failed. Review before proceeding."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
print_success "Tests completed"

# Build application
print_step "Building application..."
pnpm build
print_success "Build completed"

# Deploy
if [ -n "$REMOTE_HOST" ]; then
    print_step "Deploying to remote host: $REMOTE_HOST"
    
    # Create deployment package
    DEPLOY_PACKAGE="yeto-staging-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$DEPLOY_PACKAGE" \
        dist/ \
        drizzle/ \
        docker-compose.yml \
        docker-compose.staging.yml \
        Dockerfile \
        package.json \
        pnpm-lock.yaml \
        scripts/ \
        client/public/
    
    # Upload to remote
    scp "$DEPLOY_PACKAGE" "$REMOTE_HOST:/tmp/"
    scp "$STAGING_ENV_FILE" "$REMOTE_HOST:/tmp/.env"
    
    # Execute remote deployment
    ssh "$REMOTE_HOST" << 'REMOTE_SCRIPT'
        set -e
        cd /opt/yeto || mkdir -p /opt/yeto && cd /opt/yeto
        
        # Backup current deployment
        if [ -d "dist" ]; then
            mv dist "dist.backup.$(date +%Y%m%d-%H%M%S)"
        fi
        
        # Extract new deployment
        tar -xzf /tmp/yeto-staging-*.tar.gz
        mv /tmp/.env .env
        
        # Pull latest images and restart
        docker compose -f docker-compose.yml -f docker-compose.staging.yml pull
        docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build
        
        # Wait for health check
        echo "Waiting for application to be healthy..."
        for i in {1..60}; do
            if curl -sf http://localhost:3000/api/trpc/monitoring.getLiveness > /dev/null; then
                echo "Application is healthy!"
                break
            fi
            if [ $i -eq 60 ]; then
                echo "Health check timeout"
                exit 1
            fi
            sleep 2
        done
        
        # Cleanup
        rm /tmp/yeto-staging-*.tar.gz
        
        echo "Staging deployment complete!"
REMOTE_SCRIPT
    
    # Cleanup local package
    rm "$DEPLOY_PACKAGE"
    
else
    print_step "Deploying locally..."
    
    # Copy staging env
    cp "$STAGING_ENV_FILE" .env
    
    # Start services
    if [ -f "$COMPOSE_OVERRIDE" ]; then
        docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" up -d --build
    else
        docker compose -f "$COMPOSE_FILE" up -d --build
    fi
    
    # Wait for health check
    print_step "Waiting for application to be healthy..."
    for i in {1..60}; do
        if curl -sf http://localhost:3000/api/trpc/monitoring.getLiveness > /dev/null 2>&1; then
            print_success "Application is healthy!"
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "Health check timeout"
            docker compose logs --tail=50
            exit 1
        fi
        echo -n "."
        sleep 2
    done
fi

# Run database migrations
print_step "Running database migrations..."
if [ -n "$REMOTE_HOST" ]; then
    ssh "$REMOTE_HOST" "cd /opt/yeto && docker compose exec -T web pnpm db:push"
else
    docker compose exec -T web pnpm db:push 2>/dev/null || pnpm db:push
fi
print_success "Database migrations complete"

# Print summary
echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║   ✓ Staging deployment complete!                                          ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
if [ -n "$REMOTE_HOST" ]; then
echo "║   URL: https://$DOMAIN                                                    ║"
else
echo "║   URL: http://localhost:3000                                              ║"
fi
echo "║                                                                           ║"
echo "║   Verify:                                                                 ║"
echo "║   - Check application logs: docker compose logs -f web                    ║"
echo "║   - Run smoke tests: ./scripts/smoke_test.sh                              ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
