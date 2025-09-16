# 🚨 Render Deployment Troubleshooting Guide

## Current Issue: Bad Gateway Error

### Error Details:
- **Error**: Bad Gateway (502)
- **Request ID**: 97fe10cf1f6079a3-DEN
- **Status**: Service unavailable

### Possible Causes:

#### 1. **Server Not Starting**
- Server process crashes on startup
- Missing dependencies
- Port binding issues
- Environment variable problems

#### 2. **Render Configuration Issues**
- Incorrect service name
- Wrong build/start commands
- Health check path mismatch
- Environment variables not set

#### 3. **Application Issues**
- OAuth configuration errors
- Database connection failures
- Memory/CPU limits exceeded
- Code syntax errors

## 🔧 Troubleshooting Steps:

### Step 1: Check Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your service: `pacmac-marketplace`
3. Check **Deploy** tab for build logs
4. Check **Logs** tab for runtime errors
5. Verify **Environment** tab has correct variables

### Step 2: Verify Service URL
Your service might be at a different URL:
- `https://pacmac-marketplace.onrender.com`
- `https://pacmac-web.onrender.com`
- `https://new-pacmac.onrender.com`
- Check Render dashboard for exact URL

### Step 3: Test Different Server Versions
We've created multiple server versions:

```bash
# Minimal server (current)
npm start  # Uses server-minimal.js

# Simple server
npm run start-simple  # Uses server-simple.js

# Full server with OAuth
npm run start-full  # Uses server.js
```

### Step 4: Check Environment Variables
Required in Render dashboard:
```
NODE_ENV=production
PORT=3000
```

Optional (for full features):
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-session-secret
```

### Step 5: Manual Deployment Test
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Monitor build logs for errors

## 🧪 Testing Commands:

### Local Testing:
```bash
# Test minimal server
npm run dev-minimal
curl http://localhost:3000/health

# Test simple server
npm run dev-simple
curl http://localhost:3000/health

# Test full server
npm run dev
curl http://localhost:3000/health
```

### Production Testing:
```bash
# Test health endpoint
curl https://your-render-url.onrender.com/health

# Test root endpoint
curl https://your-render-url.onrender.com/

# Test with verbose output
curl -v https://your-render-url.onrender.com/health
```

## 🔍 Common Issues & Solutions:

### Issue: "Cannot find module"
**Solution**: Check package.json dependencies are installed
```bash
npm install
```

### Issue: "Port already in use"
**Solution**: Use PORT environment variable
```bash
PORT=3000 node server-minimal.js
```

### Issue: "OAuth configuration error"
**Solution**: Use minimal server without OAuth
```bash
npm start  # Uses server-minimal.js
```

### Issue: "Health check failing"
**Solution**: Verify health check path in render.yaml
```yaml
healthCheckPath: /health
```

## 📊 Current Server Versions:

### 1. server-minimal.js (Current)
- **Purpose**: Basic server for deployment testing
- **Features**: Health check, static files, basic endpoints
- **Dependencies**: Express only
- **Use Case**: Initial deployment verification

### 2. server-simple.js
- **Purpose**: Simple server with basic API
- **Features**: Health check, marketplace API, demo data
- **Dependencies**: Express, CORS
- **Use Case**: Testing without OAuth

### 3. server.js (Full)
- **Purpose**: Complete marketplace server
- **Features**: OAuth, Stripe, full API, verification
- **Dependencies**: Express, Passport, Stripe, SendGrid
- **Use Case**: Production with all features

## 🚀 Deployment Strategy:

### Phase 1: Minimal Deployment ✅
- Deploy server-minimal.js
- Verify health endpoint works
- Confirm basic functionality

### Phase 2: Simple Deployment
- Switch to server-simple.js
- Test marketplace API
- Verify static file serving

### Phase 3: Full Deployment
- Switch to server.js
- Configure OAuth
- Test complete functionality

## 📞 Next Steps:

1. **Check Render Dashboard** for deployment logs
2. **Verify Service URL** in Render dashboard
3. **Test Health Endpoint** once deployed
4. **Check Environment Variables** are set correctly
5. **Review Build Logs** for any errors

## 🔗 Useful Links:

- [Render Dashboard](https://dashboard.render.com/)
- [Render Documentation](https://render.com/docs)
- [Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [Troubleshooting Guide](https://render.com/docs/troubleshooting)

---

**Last Updated**: January 2025
**Status**: Troubleshooting Bad Gateway Error
