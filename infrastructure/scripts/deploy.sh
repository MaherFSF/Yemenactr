#!/bin/bash
# YETO Platform - Deployment Script
# ============================================
# This script builds and deploys the YETO application to AWS ECS
# Usage: ./deploy.sh [environment]
# ============================================

set -e

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME="yeto"
ECR_REPO="${PROJECT_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi
    
    log_info "All prerequisites met."
}

# Get AWS account ID
get_account_id() {
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
    log_info "AWS Account ID: ${AWS_ACCOUNT_ID}"
}

# Login to ECR
ecr_login() {
    log_info "Logging in to Amazon ECR..."
    aws ecr get-login-password --region ${AWS_REGION} | \
        docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    # Get git commit hash for tagging
    GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
    
    # Build the image
    docker build \
        --build-arg NODE_ENV=${ENVIRONMENT} \
        -t ${ECR_REPO}:${GIT_HASH} \
        -t ${ECR_REPO}:latest \
        .
    
    log_info "Docker image built successfully."
}

# Push image to ECR
push_image() {
    log_info "Pushing image to ECR..."
    
    GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
    
    # Tag for ECR
    docker tag ${ECR_REPO}:${GIT_HASH} ${ECR_URI}:${GIT_HASH}
    docker tag ${ECR_REPO}:latest ${ECR_URI}:latest
    
    # Push both tags
    docker push ${ECR_URI}:${GIT_HASH}
    docker push ${ECR_URI}:latest
    
    log_info "Image pushed to ECR: ${ECR_URI}:${GIT_HASH}"
}

# Update ECS service
update_ecs_service() {
    log_info "Updating ECS service..."
    
    CLUSTER_NAME="${PROJECT_NAME}-cluster"
    SERVICE_NAME="${PROJECT_NAME}-service"
    
    # Force new deployment
    aws ecs update-service \
        --cluster ${CLUSTER_NAME} \
        --service ${SERVICE_NAME} \
        --force-new-deployment \
        --region ${AWS_REGION} \
        > /dev/null
    
    log_info "ECS service update initiated."
}

# Wait for deployment to complete
wait_for_deployment() {
    log_info "Waiting for deployment to stabilize..."
    
    CLUSTER_NAME="${PROJECT_NAME}-cluster"
    SERVICE_NAME="${PROJECT_NAME}-service"
    
    aws ecs wait services-stable \
        --cluster ${CLUSTER_NAME} \
        --services ${SERVICE_NAME} \
        --region ${AWS_REGION}
    
    log_info "Deployment completed successfully!"
}

# Invalidate CloudFront cache
invalidate_cloudfront() {
    log_info "Invalidating CloudFront cache..."
    
    # Get CloudFront distribution ID
    DISTRIBUTION_ID=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Aliases.Items[0]=='${PROJECT_NAME}.causewaygrp.com'].Id" \
        --output text \
        --region ${AWS_REGION})
    
    if [ -n "$DISTRIBUTION_ID" ]; then
        aws cloudfront create-invalidation \
            --distribution-id ${DISTRIBUTION_ID} \
            --paths "/*" \
            --region ${AWS_REGION} \
            > /dev/null
        log_info "CloudFront cache invalidated."
    else
        log_warn "CloudFront distribution not found. Skipping cache invalidation."
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # This would typically be done via ECS exec or a separate migration task
    # For now, we'll skip this step and recommend running migrations manually
    log_warn "Database migrations should be run manually or via ECS exec."
    log_warn "Run: aws ecs execute-command --cluster ${PROJECT_NAME}-cluster --task <task-id> --container ${PROJECT_NAME}-web --interactive --command 'pnpm db:push'"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    HEALTH_URL="https://${PROJECT_NAME}.causewaygrp.com/api/health"
    
    for i in {1..5}; do
        if curl -s -o /dev/null -w "%{http_code}" ${HEALTH_URL} | grep -q "200"; then
            log_info "Health check passed!"
            return 0
        fi
        log_warn "Health check attempt $i failed. Retrying in 10 seconds..."
        sleep 10
    done
    
    log_error "Health check failed after 5 attempts."
    return 1
}

# Main deployment flow
main() {
    echo "============================================"
    echo "  YETO Platform Deployment"
    echo "  Environment: ${ENVIRONMENT}"
    echo "  Region: ${AWS_REGION}"
    echo "============================================"
    echo ""
    
    check_prerequisites
    get_account_id
    ecr_login
    build_image
    push_image
    update_ecs_service
    wait_for_deployment
    invalidate_cloudfront
    health_check
    
    echo ""
    echo "============================================"
    echo "  Deployment Complete!"
    echo "  URL: https://${PROJECT_NAME}.causewaygrp.com"
    echo "============================================"
}

# Run main function
main
