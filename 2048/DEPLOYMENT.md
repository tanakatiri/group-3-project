# Deployment Guide - House Renting System

This guide covers multiple deployment options for the House Renting System.

## Prerequisites

Before deploying, ensure you have:
1. MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
2. Your MongoDB connection string ready
3. Git repository (GitHub, GitLab, or Bitbucket)

## Quick Start - Choose Your Platform

### Option 1: Vercel (Recommended for Quick Deploy)
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Fast global CDN

### Option 2: Render
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy deployment
- ✅ Good for full-stack apps

### Option 3: Railway
- ✅ Free tier available
- ✅ Simple deployment
- ✅ Good MongoDB integration

### Option 4: Heroku
- ✅ Popular platform
- ✅ Many add-ons available
- ⚠️ No free tier (paid plans only)

### Option 5: Docker (Self-Hosted)
- ✅ Full control
- ✅ Can run anywhere
- ⚠️ Requires server management

---

## 1. MongoDB Atlas Setup (Required for All Deployments)

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a new cluster (free M0 tier is sufficient)
4. Wait for cluster to be created (2-3 minutes)

### Step 2: Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Create a user with username and password
4. Set privileges to "Read and write to any database"
5. Click **Add User**

### Step 3: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 4: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `renthub`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/renthub?retryWrites=true&w=majority
```

---

## 2. Vercel Deployment

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/house-renting-system.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Other
     - Build Command: `npm install`
     - Output Directory: `public`
     - Install Command: `npm install`

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the following:
     ```
     MONGO_URI=your_mongodb_atlas_connection_string
     PORT=5000
     JWT_SECRET=your-secure-random-string-here
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Note for Vercel
Vercel is primarily designed for serverless functions. For this Express app, you may need to use `vercel.json` configuration (already included).

---

## 3. Render Deployment

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

### Steps

1. **Push code to GitHub** (if not already done)

2. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: house-renting-system
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

3. **Add Environment Variables**
   - In the Environment section, add:
     ```
     MONGO_URI=your_mongodb_atlas_connection_string
     PORT=5000
     JWT_SECRET=your-secure-random-string-here
     NODE_ENV=production
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be live at `https://your-app.onrender.com`

---

## 4. Railway Deployment

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Steps

1. **Push code to GitHub** (if not already done)

2. **Deploy to Railway**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js

3. **Add Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     MONGO_URI=your_mongodb_atlas_connection_string
     PORT=5000
     JWT_SECRET=your-secure-random-string-here
     NODE_ENV=production
     ```

4. **Generate Domain**
   - Go to "Settings" tab
   - Click "Generate Domain"
   - Your app will be live at the generated URL

---

## 5. Heroku Deployment

### Prerequisites
- Heroku account (sign up at https://heroku.com)
- Heroku CLI installed

### Steps

1. **Install Heroku CLI**
   ```bash
   # Windows (using npm)
   npm install -g heroku
   
   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create house-renting-system
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI="your_mongodb_atlas_connection_string"
   heroku config:set JWT_SECRET="your-secure-random-string-here"
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

---

## 6. Docker Deployment (Self-Hosted)

### Prerequisites
- Docker installed
- Docker Compose installed (optional but recommended)

### Steps

1. **Build Docker Image**
   ```bash
   docker build -t house-renting-system .
   ```

2. **Run with Docker**
   ```bash
   docker run -d \
     -p 5000:5000 \
     -e MONGO_URI="your_mongodb_atlas_connection_string" \
     -e JWT_SECRET="your-secure-random-string-here" \
     --name house-renting-system \
     house-renting-system
   ```

3. **Or use Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access Application**
   - Open http://localhost:5000

### Deploy to Cloud with Docker

You can deploy the Docker image to:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Any VPS with Docker**

---

## 7. Environment Variables Reference

All deployments require these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/renthub` |
| `PORT` | Server port (optional, defaults to 5000) | `5000` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-change-in-production` |
| `NODE_ENV` | Environment mode | `production` |

---

## 8. Post-Deployment Checklist

After deploying, verify:

- [ ] Application loads successfully
- [ ] Can view houses on main page
- [ ] Can access landlord dashboard
- [ ] Can access admin dashboard
- [ ] Can add new houses (landlord)
- [ ] Can submit inquiries (tenant)
- [ ] Can view inquiries (landlord)
- [ ] Database connection is working
- [ ] All API endpoints respond correctly

---

## 9. Troubleshooting

### Application won't start
- Check environment variables are set correctly
- Verify MongoDB connection string is correct
- Check logs for specific errors

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database user credentials
- Ensure connection string includes database name

### 404 errors on routes
- Verify build completed successfully
- Check that static files are being served
- Ensure all routes are defined in server.js

### Performance issues
- Consider upgrading MongoDB Atlas tier
- Enable caching
- Optimize database queries
- Use CDN for static assets

---

## 10. Monitoring & Maintenance

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Plausible
- **Database Monitoring**: MongoDB Atlas built-in monitoring

### Regular Maintenance
1. Monitor application logs
2. Check database performance
3. Update dependencies regularly
4. Backup database periodically
5. Review and rotate JWT secrets

---

## 11. Scaling Considerations

As your application grows:

1. **Database**: Upgrade MongoDB Atlas tier
2. **Caching**: Implement Redis for sessions
3. **CDN**: Use Cloudflare or similar
4. **Load Balancing**: Use platform's built-in load balancing
5. **Microservices**: Consider splitting into separate services

---

## Need Help?

- Check platform-specific documentation
- Review application logs
- Test locally first with production environment variables
- Ensure MongoDB Atlas is properly configured

---

## Quick Deploy Commands

### Vercel
```bash
npm i -g vercel
vercel
```

### Render
Push to GitHub and use Render dashboard

### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Heroku
```bash
heroku create
git push heroku main
```

### Docker
```bash
docker-compose up -d
```

---

**Recommended for Beginners**: Start with Render or Railway for the easiest deployment experience.

**Recommended for Production**: Use Vercel or Render with MongoDB Atlas for best performance and reliability.
