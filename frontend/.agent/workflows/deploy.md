---
description: Deploy Nilaya frontend to production server
---

# Nilaya Frontend Deployment Guide

## Prerequisites
- SSH access to server: `sammy@139.59.77.118`
- Server password: `OLsbd!@#45b`

---

## Step 1: Local - Build the Application

```bash
cd /home/tushar/Pictures/nilaya_frontend/Nilaya_2.0_By_Me_Frontend

# Install dependencies (if needed)
npm install

# Build the production bundle
npm run build
```

---

## Step 2: Local - Create Deployment Bundle

```bash
# Remove old bundle and create new one
rm -rf ./deploy_bundle && mkdir -p ./deploy_bundle/.next

# Copy standalone files
cp -r .next/standalone/* ./deploy_bundle/

# Copy .next folder (excluding cache)
rsync -a --exclude cache .next/ ./deploy_bundle/.next/

# Copy public folder
cp -r public ./deploy_bundle/public

# Create tarball
cd deploy_bundle
   tar -czf ../nilaya-standalone.tar.gz .
cd ..
```

---

## Step 3: Local - Upload to Server

```bash
# Upload the tarball to server
scp ./nilaya-standalone.tar.gz sammy@139.59.77.118:/home/sammy/nextjs-nilaya/
```
Enter password when prompted: `OLsbd!@#45b`

---

## Step 4: Production Server - Extract and Restart

```bash
# SSH to server
ssh sammy@139.59.77.118

# Navigate to project directory
cd ~/nextjs-nilaya

# Remove old standalone and extract new bundle
rm -rf standalone && mkdir -p standalone
tar -xzf nilaya-standalone.tar.gz -C standalone

# Verify files exist
ls -la standalone/server.js
ls -la standalone/.next/BUILD_ID

# Restart the application
pm2 restart nilaya-nextjs
pm2 save

# Check status and logs
pm2 status
pm2 logs nilaya-nextjs --lines 50 --nostream
```

---

## Quick One-Liner Commands

### From Local Machine (all-in-one):
// turbo-all
```bash
cd /home/tushar/Pictures/nilaya_frontend/Nilaya_2.0_By_Me_Frontend && \
npm run build && \
rm -rf ./deploy_bundle && mkdir -p ./deploy_bundle/.next && \
cp -r .next/standalone/* ./deploy_bundle/ && \
rsync -a --exclude cache .next/ ./deploy_bundle/.next/ && \
cp -r public ./deploy_bundle/public && \
cd deploy_bundle && tar -czf ../nilaya-standalone.tar.gz . && cd .. && \
scp ./nilaya-standalone.tar.gz sammy@139.59.77.118:/home/sammy/nextjs-nilaya/
```

### From Server (after upload):
```bash
cd ~/nextjs-nilaya && \
rm -rf standalone && mkdir -p standalone && \
tar -xzf nilaya-standalone.tar.gz -C standalone && \
pm2 restart nilaya-nextjs && pm2 save && pm2 status
```

---

## Troubleshooting

### Check if app is running:
```bash
pm2 status
pm2 logs nilaya-nextjs --lines 100
```

### If pm2 process doesn't exist, start fresh:
```bash
cd ~/nextjs-nilaya/standalone
pm2 stop nilaya-nextjs || true
pm2 delete nilaya-nextjs || true
PORT=3001 NODE_ENV=production pm2 start server.js --name nilaya-nextjs --update-env
pm2 save
```

### Check nginx status:
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Restart nginx (if needed):
```bash
sudo systemctl restart nginx
```

---

## Important Notes

1. **Port**: The app runs on port **3001** (nginx proxies to this port)
2. **API URL**: Make sure `/lib/config.js` has the production URL uncommented:
   ```javascript
   export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nilaya.com";
   ```
3. **Domain**: https://nilaya.com
4. **PM2 Process Name**: `nilaya-nextjs`
