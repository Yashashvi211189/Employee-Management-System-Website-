#!/bin/bash
# Manual Deployment Script - Pull from GitHub → Deploy to Server
# This script pulls code from GitHub locally, then uploads to server

set -e  # Exit on error

echo "=================================================="
echo "Nilaya Backend - Manual Deployment"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Pull from GitHub
echo -e "${BLUE}📥 Step 1/5: Pulling latest code from GitHub...${NC}"
cd /home/tushar/Music/Nilaya_Backend
git pull origin main
echo -e "${GREEN}✅ Code updated from GitHub${NC}"
echo ""

# Step 2: Create deployment package
echo -e "${BLUE}📦 Step 2/5: Creating deployment package...${NC}"
tar -czf /tmp/nilaya_backend.tar.gz \
    --exclude='myenv' \
    --exclude='node_modules' \
    --exclude='build' \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='db.sqlite3' \
    --exclude='*.log' \
    --exclude='.git' \
    .
echo -e "${GREEN}✅ Package created: /tmp/nilaya_backend.tar.gz${NC}"
echo ""

# Step 3: Upload to server
echo -e "${BLUE}📤 Step 3/5: Uploading to production server...${NC}"
scp /tmp/nilaya_backend.tar.gz sammy@139.59.77.118:/tmp/
echo -e "${GREEN}✅ Uploaded to server${NC}"
echo ""

# Step 4: Deploy on server
echo -e "${BLUE}🚀 Step 4/5: Deploying on server...${NC}"
ssh sammy@139.59.77.118 << 'ENDSSH'

echo "  → Extracting files..."
cd ~/myprojectdir/Nilaya_Backend
tar -xzf /tmp/nilaya_backend.tar.gz

echo "  → Activating virtual environment..."
source myenv/bin/activate

echo "  → Running migrations (if any new ones)..."
DJANGO_SETTINGS_MODULE=myproject.settings_production python manage.py migrate --noinput

echo "  → Collecting static files..."
DJANGO_SETTINGS_MODULE=myproject.settings_production python manage.py collectstatic --noinput

echo "  → Restarting backend service..."
sudo systemctl restart nilaya_backend

echo "  → Waiting for service to start..."
sleep 3

ENDSSH
echo -e "${GREEN}✅ Deployed successfully${NC}"
echo ""

# Step 5: Verify
echo -e "${BLUE}🔍 Step 5/5: Verifying deployment...${NC}"
ssh sammy@139.59.77.118 << 'ENDSSH'

echo "  → Checking service status..."
sudo systemctl is-active nilaya_backend --quiet && echo "  ✅ Service is running" || echo "  ❌ Service is not running"

echo "  → Testing API..."
curl -s https://nilaya.com/api/team/ > /dev/null && echo "  ✅ API is responding" || echo "  ❌ API is not responding"

ENDSSH

echo ""
echo "=================================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "Your backend is now running the latest code from GitHub"
echo ""
echo "URLs:"
echo "  • API: https://nilaya.com/api/team/"
echo "  • Admin: https://nilaya.com/admin/"
echo ""
echo "To view logs:"
echo "  ssh sammy@139.59.77.118 'sudo journalctl -u nilaya_backend -f'"
echo ""

# Cleanup
rm /tmp/nilaya_backend.tar.gz

