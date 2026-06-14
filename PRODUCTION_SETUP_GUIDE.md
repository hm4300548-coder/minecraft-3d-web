# Production Setup Guide

## Overview
This guide walks through the critical steps to make the system production-ready. All 7 critical issues have been identified and fixes implemented. Follow these steps to complete the setup.

---

## Step 1: Configure Supabase Project ✅ AUTOMATED (Needs YOUR Info)

### Get Your Supabase Credentials:
1. Go to https://supabase.com/dashboard
2. Create a new project or use existing one
3. Copy your **Project URL** (format: `https://xxxxxxxxxxxx.supabase.co`)
4. Copy your **Anon Public Key** (starts with `sb_anon_`)

### Update Environment Variables:

**File:** `.env`
```env
# Replace these with your actual Supabase project values
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=sb_anon_YOUR_ACTUAL_KEY_HERE
```

**File:** `server/` (for Railway/Render):
The server will now automatically load from `.env` file with multiple fallback paths.

---

## Step 2: Configure Backend URL ✅ AUTOMATED

### What Changed:
- ✅ Created `Config.js` module for environment-aware URL detection
- ✅ Frontend now automatically detects if running on localhost or production
- ✅ Uses `Config.getBackendUrl()` to determine correct backend URL

### In Production:
The frontend will automatically use:
- **Development:** `http://localhost:3000`
- **Production:** Your deployed backend URL (same domain or from env var)

### Override if Needed:
Set environment variable in your build system:
```bash
REACT_APP_BACKEND_URL=https://your-backend-domain.railway.app
```

---

## Step 3: Deploy Backend to Railway ✅ READY

### Current Setup:
- ✅ `railway.json` configured correctly
- ✅ Build command: `cd server && npm install`
- ✅ Start command: `cd server && npm start`
- ✅ Environment variables auto-loaded from `.env`

### To Deploy:

1. **Connect Repository:**
   ```bash
   railway init
   railway link
   ```

2. **Set Environment Variables:**
   ```bash
   railway variables set SUPABASE_URL=https://your-project.supabase.co
   railway variables set SUPABASE_ANON_KEY=sb_anon_your_key
   railway variables set ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

4. **Get Your Backend URL:**
   - Railway assigns: `https://your-project.up.railway.app`
   - Use this in frontend environment variable

---

## Step 4: Deploy Frontend to Vercel ✅ READY

### Current Setup:
- ✅ Static site configuration (removed `vercel.json` per user request)
- ✅ All files at root level
- ✅ `index.html` properly configured

### To Deploy:

1. **Connect Repository:**
   - Go to vercel.com
   - Connect your GitHub repository
   - Select the repo

2. **Set Environment Variables:**
   ```
   REACT_APP_BACKEND_URL=https://your-backend-domain.up.railway.app
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_KEY=sb_anon_your_key
   ```

3. **Deploy:**
   - Vercel auto-deploys on push to main
   - Your frontend is at: `https://your-project.vercel.app`

---

## Step 5: Update CORS Configuration ✅ IMPLEMENTED

### What Changed:
- ✅ Added proper CORS origin validation
- ✅ Environment variable support: `ALLOWED_ORIGINS`
- ✅ Development mode auto-allows localhost

### Production CORS:
Set on your backend (Railway):
```bash
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-custom-domain.com
```

---

## Step 6: Test the Connection

### Health Check Endpoints:

```bash
# Test backend is running
curl https://your-backend-domain.up.railway.app/api/health

# Should return:
# {"status":"online","timestamp":"2026-06-14T..."}
```

### Test Frontend Connection:

1. Open browser DevTools (F12)
2. Open Console tab
3. Look for messages:
   ```
   🔌 Backend URL: https://your-backend-domain.up.railway.app
   📦 BlockStorage initialized with backend: https://...
   ```
4. Try building a block - should appear in console:
   ```
   ✓ Block saved: (0, 0, 0) -> 1
   ```

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
1. Check `ALLOWED_ORIGINS` includes your frontend domain
2. Verify backend is running: `curl /api/health`
3. Check browser console for exact error message

### Issue: Blocks not saving to database

**Solution:**
1. Verify `SUPABASE_URL` is correct (not just `https://supabase.co`)
2. Check Supabase project exists and is active
3. Verify `SUPABASE_ANON_KEY` is correct
4. Check Supabase `blocks` table exists:
   ```sql
   CREATE TABLE IF NOT EXISTS blocks (
     id BIGSERIAL PRIMARY KEY,
     x INTEGER NOT NULL,
     y INTEGER NOT NULL,
     z INTEGER NOT NULL,
     block_type INTEGER,
     user_id TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(x, y, z, user_id)
   );
   ```

### Issue: Backend times out or is slow

**Solution:**
1. Check Railway logs: `railway logs`
2. Verify Supabase is in same region as Railway
3. Increase timeout if needed: `REACT_APP_API_TIMEOUT=20000`

---

## Configuration Checklist

### Supabase:
- [ ] Create Supabase project
- [ ] Copy Project URL
- [ ] Copy Anon Key
- [ ] Create `blocks` table with proper schema
- [ ] Update `.env` with credentials

### Railway:
- [ ] Connect GitHub repository
- [ ] Set environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Deploy backend
- [ ] Note the deployed URL (something.up.railway.app)
- [ ] Set ALLOWED_ORIGINS to include Vercel domain

### Vercel:
- [ ] Connect GitHub repository
- [ ] Set environment variables (REACT_APP_BACKEND_URL pointing to Railway)
- [ ] Deploy frontend
- [ ] Test connection

### Final Testing:
- [ ] Backend health check returns 200
- [ ] Frontend logs show correct backend URL
- [ ] Can place/break blocks
- [ ] Blocks persist after reload
- [ ] No CORS errors in console

---

## Environment Variables Summary

### Frontend (.env or build variables):
```
REACT_APP_BACKEND_URL=https://your-backend.up.railway.app
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=sb_anon_key
REACT_APP_API_TIMEOUT=10000
```

### Backend (Railway environment):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=sb_anon_key
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

## What Was Fixed

✅ **CORS Configuration:** Now validates origins properly  
✅ **Environment Loading:** Dotenv paths fixed for both root and server  
✅ **Dynamic Backend URL:** Frontend auto-detects environment  
✅ **Retry Logic:** Blocks retry on network failure  
✅ **Configuration Module:** Centralized env var handling  

---

## Next Steps

1. **Set up Supabase** (if not already done)
2. **Update `.env`** with your Supabase credentials
3. **Deploy to Railway** with environment variables
4. **Deploy to Vercel** with backend URL
5. **Test the full flow**

**Total Setup Time:** ~20 minutes  
**Difficulty:** Medium  
**Support:** Check HEALTH_CHECK_REPORT.md for detailed issues

