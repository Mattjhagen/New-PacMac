# 🚀 Deployment Checklist for admin.pacmacmobile.com

## ✅ Pre-Deployment Checklist

### 1. Code Repository
- [x] Code pushed to GitHub: `https://github.com/Mattjhagen/pacmacmobile-admin`
- [x] All files committed and pushed
- [x] No sensitive data in repository (use environment variables)

### 2. Local Testing
- [ ] Test import functionality with sample data
- [ ] Test image fetching
- [ ] Test specifications fetching
- [ ] Verify all API endpoints work
- [ ] Test responsive design on mobile/tablet

## 🌐 Vercel Deployment Steps

### 1. Create Vercel Project
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub account
- [ ] Click "New Project"
- [ ] Import repository: `Mattjhagen/pacmacmobile-admin`
- [ ] Configure project settings:
  - [ ] Project Name: `admin-pacmacmobile`
  - [ ] Framework: Next.js
  - [ ] Root Directory: `./`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`

### 2. Environment Variables
Set these in Vercel dashboard (Settings > Environment Variables):

#### Required:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - `https://admin.pacmacmobile.com`
- [ ] `NEXTAUTH_SECRET` - Generate secure random string

#### Optional (for enhanced features):
- [ ] `GOOGLE_SEARCH_API_KEY` - For better image search
- [ ] `GOOGLE_SEARCH_ENGINE_ID` - For better image search
- [ ] `UNSPLASH_ACCESS_KEY` - For stock photos
- [ ] `PEXELS_API_KEY` - For stock photos

### 3. Database Setup
- [ ] Create Vercel Postgres database
- [ ] Copy connection string to `DATABASE_URL`
- [ ] Update Prisma schema for PostgreSQL (use `schema.production.prisma`)
- [ ] Run database migration: `npx prisma db push`

### 4. Custom Domain Configuration
- [ ] Add domain in Vercel: `admin.pacmacmobile.com`
- [ ] Configure DNS records:
  - [ ] CNAME: `admin.pacmacmobile.com` → `cname.vercel-dns.com`
  - [ ] Or use Vercel's domain configuration
- [ ] Wait for SSL certificate (automatic)

## 🔧 Post-Deployment Configuration

### 1. Database Migration
```bash
# In Vercel dashboard, run in Functions tab or via CLI
npx prisma db push
```

### 2. Test Deployment
- [ ] Visit `https://admin.pacmacmobile.com`
- [ ] Test product creation
- [ ] Test import functionality
- [ ] Test image fetching
- [ ] Test specifications fetching
- [ ] Verify all features work

### 3. Security Setup
- [ ] Verify HTTPS is working
- [ ] Check CORS headers
- [ ] Test API endpoints
- [ ] Verify environment variables are secure

## 📊 Monitoring Setup

### 1. Analytics
- [ ] Set up Vercel Analytics
- [ ] Configure Google Analytics (optional)
- [ ] Set up error tracking (Sentry - optional)

### 2. Performance
- [ ] Test page load speeds
- [ ] Monitor API response times
- [ ] Check image loading performance
- [ ] Test on different devices/browsers

## 🔄 Continuous Deployment

### 1. Automatic Deployments
- [x] Vercel will auto-deploy from main branch
- [ ] Test deployment process with a small change
- [ ] Verify rollback capability

### 2. Environment Management
- [ ] Set up staging environment (optional)
- [ ] Configure different environment variables for staging
- [ ] Test staging before production deployment

## 🚨 Troubleshooting

### Common Issues:
1. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies
   - Check for TypeScript errors

2. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check database accessibility
   - Ensure proper permissions

3. **Domain Issues**
   - Check DNS propagation
   - Verify SSL certificate
   - Test domain configuration

4. **Import Functionality**
   - Check file size limits
   - Verify API timeout settings
   - Test with sample data

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **Domain Configuration**: https://vercel.com/docs/concepts/projects/domains

## 🎯 Success Criteria

Deployment is successful when:
- [ ] Site loads at `https://admin.pacmacmobile.com`
- [ ] All features work correctly
- [ ] Import functionality works with sample data
- [ ] Images and specs are fetched automatically
- [ ] Database operations work properly
- [ ] Site is responsive on all devices
- [ ] SSL certificate is valid
- [ ] Performance is acceptable

## 🔄 Maintenance Schedule

### Weekly:
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Test import functionality

### Monthly:
- [ ] Update dependencies
- [ ] Review security updates
- [ ] Backup database
- [ ] Check domain renewal

### Quarterly:
- [ ] Review and update documentation
- [ ] Performance optimization
- [ ] Security audit
- [ ] Feature updates
