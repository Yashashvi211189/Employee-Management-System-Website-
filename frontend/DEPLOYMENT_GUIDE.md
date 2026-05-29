# 🚀 Deployment Guide - Nilaya AI Website

## Current Setup
- ✅ Git Repository: `https://github.com/Trushank03/Nilaya AI_2.0.git`
- ✅ Netlify Configuration: Already set up (`.netlify/` directory exists)
- ✅ Netlify Plugin: `@netlify/plugin-nextjs` installed
- ✅ Build Command: `pnpm run build` or `npm run build`

---

## Option 1: Deploy to Netlify (Recommended - Already Configured)

### Method A: Automatic Deployment via Git (EASIEST)

#### Step 1: Commit and Push Changes
```bash
# Stage all changes
git add .

# Commit with message
git commit -m "Added holidays page and performance optimizations"

# Push to GitHub
git push origin main
```

**That's it!** Netlify will automatically:
- Detect the push
- Build your site
- Deploy the new version

### Method B: Manual Deployment via Netlify CLI

#### Step 1: Install Netlify CLI (if not installed)
```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify
```bash
netlify login
```

#### Step 3: Deploy
```bash
# For preview deployment
netlify deploy

# For production deployment
netlify deploy --prod
```

### Method C: Deploy via Netlify Dashboard

1. Go to your Netlify dashboard: https://app.netlify.com/
2. Find your Nilaya AI project
3. Click **"Deploys"** tab
4. Click **"Trigger deploy"** → **"Deploy site"**

---

## Option 2: Deploy to Vercel (Alternative Platform)

Vercel is actually **better optimized for Next.js** (created by the Next.js team).

### Why Vercel?
- ✅ Built specifically for Next.js
- ✅ Better image optimization
- ✅ Faster build times
- ✅ Automatic performance monitoring
- ✅ Better edge function support

### Method A: Deploy via GitHub (EASIEST)

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

#### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `Trushank03/Nilaya AI_2.0`
4. Vercel will auto-detect Next.js settings
5. Click **"Deploy"**

#### Configuration (Vercel will auto-detect, but verify):
```
Framework Preset: Next.js
Build Command: npm run build (or pnpm run build)
Output Directory: .next
Install Command: npm install (or pnpm install)
```

### Method B: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# For preview deployment
vercel

# For production deployment
vercel --prod
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

### 1. Build Test
```bash
npm run build
# or
pnpm run build
```
✅ Should complete without errors

### 2. Environment Variables
If you have any environment variables, add them in:

**Netlify:**
- Dashboard → Site settings → Environment variables

**Vercel:**
- Dashboard → Project Settings → Environment Variables

### 3. Domain Configuration (Optional)

**Netlify:**
- Dashboard → Domain settings → Add custom domain

**Vercel:**
- Dashboard → Project Settings → Domains

---

## 🔧 Updated Netlify Configuration

I'll update your `netlify.toml` for optimal Next.js deployment:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404

# Image optimization
[[headers]]
  for = "/image/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Font optimization
[[headers]]
  for = "/*.woff2"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🚀 Quick Deploy Commands

### For Netlify (Current Setup)
```bash
# Commit and push (auto-deploys)
git add .
git commit -m "Update: Added holidays page and optimizations"
git push origin main

# OR manual deploy
netlify deploy --prod
```

### For Vercel (New Setup)
```bash
# Install and deploy
npm install -g vercel
vercel login
vercel --prod
```

---

## 📊 Comparison: Netlify vs Vercel

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Next.js Support | ✅ Good | ✅ **Excellent** (Native) |
| Image Optimization | ✅ Good | ✅ **Better** |
| Build Speed | ✅ Fast | ✅ **Faster** |
| Free Tier | 300 build mins | 100 GB bandwidth |
| Edge Functions | ✅ Yes | ✅ **Better** |
| Analytics | Paid | Free |
| Price | Free tier available | Free tier available |

**Recommendation:** Since you're using Next.js, **Vercel is technically superior**, but your current Netlify setup works fine!

---

## 🎯 Deployment Steps Summary

### Redeploy to Netlify (Quickest):
```bash
git add .
git commit -m "Added holidays page and performance optimizations"
git push origin main
```
✅ Auto-deploys in 2-3 minutes!

### Deploy to Vercel (Best for Next.js):
```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy
vercel --prod
```
✅ Deploys in 1-2 minutes!

---

## 🔍 Post-Deployment Testing

After deployment, test:

1. ✅ Homepage loads fast
2. ✅ All images load properly
3. ✅ Holidays page works (`/holidays`)
4. ✅ Team page loads
5. ✅ Products page loads
6. ✅ Forms work (if any)
7. ✅ Navigation works
8. ✅ Mobile responsive

### Performance Testing:
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **Lighthouse**: Chrome DevTools → Lighthouse

---

## 🐛 Troubleshooting

### Build Fails on Netlify
```bash
# Check build locally first
npm run build

# If it works locally but fails on Netlify:
# 1. Check Node version in netlify.toml
# 2. Clear Netlify cache (Dashboard → Deploys → Options → Clear cache)
# 3. Check environment variables
```

### Images Not Loading
```bash
# Check next.config.mjs
# Ensure image domains are configured
# Verify image paths start with /
```

### 404 Errors
```bash
# For dynamic routes, ensure [[...slug]] folders are named correctly
# Check that all page files export default components
```

---

## 📞 Need Help?

**Netlify Support**: https://answers.netlify.com/  
**Vercel Support**: https://vercel.com/support  
**Next.js Docs**: https://nextjs.org/docs

---

## ✅ What's Included in This Deployment

### New Features:
- 🎉 Holidays page (`/holidays`)
- 🚀 Image optimization
- ⚡ Performance improvements
- 📱 Mobile responsive design
- 🎨 Crazy festive animations

### Optimizations:
- ✅ WebP/AVIF image formats
- ✅ Lazy loading
- ✅ Reduced animation complexity
- ✅ Optimized bundle sizes
- ✅ Static page generation

### Pages:
- `/` - Homepage
- `/holidays` - **NEW!** Holidays page
- `/products` - Products
- `/team` - Team
- `/about` - About
- `/blog` - Blog
- `/contact` - Contact
- And more...

---

**Ready to deploy?** Just run:
```bash
git add .
git commit -m "Deploy with holidays page and optimizations"
git push origin main
```

Your Netlify site will automatically update! 🚀

