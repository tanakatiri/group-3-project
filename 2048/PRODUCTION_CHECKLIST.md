# Production Deployment Checklist

Use this checklist before deploying to production.

## 🔐 Security

- [ ] **Change JWT_SECRET** to a strong, random string (min 32 characters)
  - Generate one: https://www.grc.com/passwords.htm
  - Never use the default value in production

- [ ] **MongoDB Atlas Security**
  - [ ] Strong database user password
  - [ ] Network access configured (0.0.0.0/0 for cloud platforms)
  - [ ] Database user has appropriate permissions (readWrite)

- [ ] **Environment Variables**
  - [ ] All sensitive data in environment variables (not hardcoded)
  - [ ] `.env` files added to `.gitignore`
  - [ ] No secrets committed to Git

- [ ] **CORS Configuration**
  - [ ] Configure CORS for specific domains (optional)
  - [ ] Remove wildcard CORS in production (optional)

## 🗄️ Database

- [ ] **MongoDB Atlas Setup**
  - [ ] Cluster created and running
  - [ ] Database user created
  - [ ] Connection string obtained
  - [ ] IP whitelist configured
  - [ ] Test connection successful

- [ ] **Database Backup**
  - [ ] Automated backups enabled in MongoDB Atlas
  - [ ] Backup schedule configured

## 🚀 Application

- [ ] **Dependencies**
  - [ ] All dependencies installed (`npm install`)
  - [ ] No security vulnerabilities (`npm audit`)
  - [ ] Dependencies up to date

- [ ] **Environment Variables Set**
  - [ ] `MONGO_URI` - MongoDB connection string
  - [ ] `JWT_SECRET` - Strong secret key
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` (if required by platform)

- [ ] **Code Quality**
  - [ ] No console.errors in production code (or handled properly)
  - [ ] Error handling implemented
  - [ ] Input validation in place

## 🧪 Testing

- [ ] **Local Testing**
  - [ ] Test with production environment variables locally
  - [ ] All features work as expected
  - [ ] No errors in console

- [ ] **API Endpoints**
  - [ ] GET /api/houses - Returns houses
  - [ ] POST /api/houses - Creates house
  - [ ] PUT /api/houses/:id - Updates house
  - [ ] DELETE /api/houses/:id - Deletes house
  - [ ] GET /api/inquiries - Returns inquiries
  - [ ] POST /api/inquiries - Creates inquiry
  - [ ] DELETE /api/inquiries/:id - Deletes inquiry
  - [ ] POST /api/admin/login - Admin login works

- [ ] **Frontend Pages**
  - [ ] Main page (/) loads correctly
  - [ ] Landlord dashboard (/landlord) loads
  - [ ] Admin dashboard (/admin) loads
  - [ ] All static assets load (CSS, JS, images)

## 📦 Deployment Platform

- [ ] **Platform Selected**
  - [ ] Vercel / Render / Railway / Heroku / Docker
  - [ ] Account created
  - [ ] Billing configured (if needed)

- [ ] **Configuration Files**
  - [ ] Platform-specific config file present
  - [ ] Build commands configured
  - [ ] Start commands configured

- [ ] **Git Repository**
  - [ ] Code pushed to GitHub/GitLab/Bitbucket
  - [ ] Repository is accessible
  - [ ] `.gitignore` properly configured

## 🌐 Domain & SSL

- [ ] **Domain** (Optional)
  - [ ] Custom domain configured
  - [ ] DNS records updated
  - [ ] SSL certificate active (usually automatic)

## 📊 Monitoring

- [ ] **Error Tracking** (Recommended)
  - [ ] Sentry or similar service configured
  - [ ] Error notifications set up

- [ ] **Uptime Monitoring** (Recommended)
  - [ ] UptimeRobot or similar configured
  - [ ] Alert notifications set up

- [ ] **Analytics** (Optional)
  - [ ] Google Analytics or similar added
  - [ ] Privacy policy updated

## 🔄 Post-Deployment

- [ ] **Verify Deployment**
  - [ ] Application is accessible
  - [ ] All pages load correctly
  - [ ] API endpoints work
  - [ ] Database operations work
  - [ ] No console errors

- [ ] **Performance Check**
  - [ ] Page load times acceptable
  - [ ] API response times good
  - [ ] No memory leaks

- [ ] **Documentation**
  - [ ] README updated with live URL
  - [ ] API documentation available
  - [ ] Deployment notes documented

## 🛠️ Maintenance Plan

- [ ] **Regular Tasks**
  - [ ] Monitor application logs
  - [ ] Check database performance
  - [ ] Review error reports
  - [ ] Update dependencies monthly
  - [ ] Backup database regularly

- [ ] **Emergency Contacts**
  - [ ] Team contact information documented
  - [ ] Escalation procedures defined
  - [ ] Rollback plan documented

## 📝 Environment Variables Template

Create a `.env.production` file (DO NOT COMMIT) with:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/renthub?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Node Environment
NODE_ENV=production

# Port (usually set by platform)
PORT=5000
```

## 🚨 Common Issues & Solutions

### Issue: App crashes on startup
**Solution**: Check environment variables are set correctly

### Issue: Database connection fails
**Solution**: 
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check connection string format
- Ensure database user exists and has permissions

### Issue: API returns 500 errors
**Solution**: 
- Check application logs
- Verify database connection
- Check for missing environment variables

### Issue: Static files not loading
**Solution**: 
- Verify build completed successfully
- Check static file paths
- Ensure `public` folder is included in deployment

## ✅ Final Verification

Before going live:

1. **Test all user flows**
   - Tenant: Browse houses, submit inquiry
   - Landlord: Add house, view inquiries
   - Admin: Login, manage users

2. **Load testing** (for high-traffic sites)
   - Use tools like Apache Bench or k6
   - Verify performance under load

3. **Security scan** (recommended)
   - Run OWASP ZAP or similar
   - Fix any vulnerabilities found

4. **Backup verification**
   - Ensure backups are working
   - Test restore procedure

## 🎉 Ready to Deploy!

Once all items are checked:

1. Choose your deployment method from `QUICK_DEPLOY.md`
2. Follow the platform-specific instructions
3. Monitor the deployment
4. Verify everything works
5. Celebrate! 🎊

---

**Need help?** See `DEPLOYMENT.md` for detailed instructions.
