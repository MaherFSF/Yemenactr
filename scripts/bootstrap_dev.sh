#!/bin/bash
# =============================================================================
# YETO Platform - Development Bootstrap Script
# Yemen Economic Transparency Observatory
# =============================================================================
#
# This script sets up a local development environment for YETO.
#
# Prerequisites:
#   - Node.js 22.x or higher
#   - pnpm 9.x or higher
#   - Docker and Docker Compose (optional, for local services)
#
# Usage:
#   ./scripts/bootstrap_dev.sh [--with-docker]
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║   ██╗   ██╗███████╗████████╗ ██████╗                                     ║"
echo "║   ╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔═══██╗                                    ║"
echo "║    ╚████╔╝ █████╗     ██║   ██║   ██║                                    ║"
echo "║     ╚██╔╝  ██╔══╝     ██║   ██║   ██║                                    ║"
echo "║      ██║   ███████╗   ██║   ╚██████╔╝                                    ║"
echo "║      ╚═╝   ╚══════╝   ╚═╝    ╚═════╝                                     ║"
echo "║                                                                           ║"
echo "║   Yemen Economic Transparency Observatory                                 ║"
echo "║   Development Environment Setup                                           ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse arguments
WITH_DOCKER=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --with-docker) WITH_DOCKER=true ;;
        -h|--help) 
            echo "Usage: $0 [--with-docker]"
            echo "  --with-docker  Start local Docker services (MySQL, Redis, etc.)"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Function to print step
print_step() {
    echo -e "\n${GREEN}▶ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 22.x or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_warning "Node.js version is $NODE_VERSION. Recommended: 22.x or higher."
fi
print_success "Node.js $(node -v) found"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm not found. Installing..."
    corepack enable
    corepack prepare pnpm@latest --activate
fi
print_success "pnpm $(pnpm -v) found"

# Check Docker (if --with-docker)
if [ "$WITH_DOCKER" = true ]; then
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker."
        exit 1
    fi
    print_success "Docker found"
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    print_success "Docker Compose found"
fi

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

print_step "Working directory: $PROJECT_ROOT"

# Install dependencies
print_step "Installing dependencies..."
pnpm install
print_success "Dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_step "Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success ".env file created from template"
        print_warning "Please update .env with your configuration values"
    else
        print_warning ".env.example not found. Creating minimal .env..."
        cat > .env << 'EOF'
# YETO Development Environment
NODE_ENV=development

# Database (update with your connection string)
DATABASE_URL=mysql://yeto:yeto_password@localhost:3306/yeto

# Authentication
JWT_SECRET=dev-jwt-secret-change-in-production

# Application
VITE_APP_ID=yeto-dev
VITE_APP_TITLE=YETO (Dev)
VITE_APP_LOGO=/yeto-logo.svg

# OAuth (update with your OAuth provider)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login
EOF
        print_success "Minimal .env file created"
    fi
else
    print_success ".env file already exists"
fi

# Start Docker services if requested
if [ "$WITH_DOCKER" = true ]; then
    print_step "Starting Docker services..."
    docker compose up -d db redis
    
    # Wait for database to be ready
    print_step "Waiting for database to be ready..."
    for i in {1..30}; do
        if docker compose exec -T db mysqladmin ping -h localhost --silent 2>/dev/null; then
            print_success "Database is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Database failed to start within 30 seconds"
            exit 1
        fi
        echo -n "."
        sleep 1
    done
fi

# Run database migrations
print_step "Running database migrations..."
if pnpm db:push 2>/dev/null; then
    print_success "Database schema pushed"
else
    print_warning "Database migration skipped (database may not be available)"
fi

# Run type checking
print_step "Running type check..."
if pnpm typecheck 2>/dev/null; then
    print_success "Type check passed"
else
    print_warning "Type check had issues (non-blocking)"
fi

# Run tests
print_step "Running tests..."
if pnpm test 2>/dev/null; then
    print_success "All tests passed"
else
    print_warning "Some tests failed (non-blocking for dev setup)"
fi

# Print summary
echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                           ║"
echo "║   ✓ Development environment is ready!                                     ║"
echo "║                                                                           ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
echo "║   Next steps:                                                             ║"
echo "║                                                                           ║"
echo "║   1. Update .env with your configuration                                  ║"
echo "║   2. Start the development server:                                        ║"
echo "║      $ pnpm dev                                                           ║"
echo "║                                                                           ║"
echo "║   3. Open http://localhost:3000 in your browser                           ║"
echo "║                                                                           ║"
echo "║   Useful commands:                                                        ║"
echo "║   - pnpm dev          Start development server                            ║"
echo "║   - pnpm test         Run tests                                           ║"
echo "║   - pnpm typecheck    Run TypeScript type checking                        ║"
echo "║   - pnpm lint         Run ESLint                                          ║"
echo "║   - pnpm db:push      Push database schema                                ║"
echo "║   - pnpm db:studio    Open Drizzle Studio                                 ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
