#!/bin/bash
# Cron job for nightly sector coaching pack generation
# Add to crontab: 0 2 * * * /path/to/cron-coaching-packs.sh

set -e

# Navigate to project directory
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Run the coaching pack generation script
echo "[$(date)] Starting sector coaching pack generation..."
npm run coaching-packs:generate

# Log completion
echo "[$(date)] Sector coaching pack generation completed"

# Optional: Send notification or update monitoring dashboard
# curl -X POST https://your-monitoring-endpoint.com/coaching-packs-completed
