# Quick Deploy Guide

Choose the fastest deployment method for your needs.

## 🚀 Fastest Options (5-10 minutes)

### Option 1: Render (Easiest - Recommended)

1. **Setup MongoDB Atlas** (2 minutes)
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up and create a free cluster
   - Get your connection string

2. **Deploy to Render** (3 minutes)
   - Push code to GitHub
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Add environment variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Any random secure string
   - Click "Create Web Service"
   - Done! Your app will be live in ~5 minutes

### Option 2: Railway (Also Easy)

1. **Setup MongoDB Atlas** (same as above)

2. **Deploy to Railway** (3 minutes)
   - Go to https://railway.app
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables in the Variables tab
   - Generate a domain in Settings
   - Done!

### Option 3: Vercel (Good for Static + API)

1. **Setup MongoDB Atlas** (same as above)

2. **Deploy to Vercel** (3 minutes)
   ```bash
   npm install -g vercel
   vercel
   ```
   - Follow the prompts
   - Add environment variables in Vercel dashboard
   - Done!

---

## 🐳 Docker (For Self-Hosting)

### Quick Docker Deploy

```bash
# Build
docker build -t house-renting-system .

# Run (replace with your MongoDB URI)
docker run -d -p 5000:5000 \
  -e MONGO_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_secret" \
  house-renting-system
```

Access at http://localhost:5000

### Docker Compose (Includes MongoDB)

```bash
# Create environment file
echo "MONGO_URI=mongodb://mongodb:27017/renthub" > .env.docker
echo "JWT_SECRET=your-secret-key" >> .env.docker

# Start everything
docker-compose --env-file .env.docker up -d
```

Access at http://localhost:5000

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Connection string obtained
- [ ] Code pushed to GitHub (for cloud platforms)
- [ ] Environment variables ready:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `NODE_ENV=production`

---

## 🛠️ Using the Deployment Scripts

### Windows
```bash
deploy.bat
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

The scripts will guide you through the deployment process interactively.

---

## 🔑 Environment Variables

All platforms need these:

```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/renthub
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=production
PORT=5000
```

---

## 🧪 Test Your Deployment

After deploying, verify:

1. Visit your app URL
2. Check main page loads
3. Try accessing `/landlord` dashboard
4. Try accessing `/admin` dashboard
5. Test adding a house (landlord page)
6. Test submitting an inquiry (main page)

---

## ❓ Need Help?

- **Full Documentation**: See `DEPLOYMENT.md`
- **Platform Issues**: Check platform-specific logs
- **Database Issues**: Verify MongoDB Atlas IP whitelist (use 0.0.0.0/0)
- **Environment Variables**: Double-check they're set correctly

---

## 🎯 Recommended Path

**For Beginners**: Render → Easiest setup, free tier, great docs

**For Speed**: Railway → Fastest deployment, simple interface

**For Flexibility**: Docker → Full control, can deploy anywhere

**For Serverless**: Vercel → Great CDN, automatic scaling

---

## 💡 Pro Tips

1. **Always use MongoDB Atlas** for production (not local MongoDB)
2. **Set strong JWT_SECRET** - use a password generator
3. **Enable MongoDB Atlas IP whitelist** with 0.0.0.0/0 for cloud platforms
4. **Check logs** if something doesn't work
5. **Test locally first** with production environment variables

---

## 🚨 Common Issues

**App won't start**
- Check environment variables are set
- Verify MongoDB connection string

**Can't connect to database**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

**404 errors**
- Wait for build to complete
- Check deployment logs
- Verify routes in server.js

---

**Ready to deploy? Pick a platform above and follow the steps!**

For detailed instructions, see `DEPLOYMENT.md`
