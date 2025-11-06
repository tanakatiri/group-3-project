# 🔧 Fix MongoDB Buffering Timeout Error

## What This Error Means
MongoDB Atlas can't be reached from your computer. This is usually due to:
1. IP address not whitelisted in MongoDB Atlas
2. Incorrect connection string
3. Network/firewall blocking the connection

---

## 🎯 Quick Fix - Whitelist Your IP

### Step 1: Go to MongoDB Atlas
1. Open: https://cloud.mongodb.com
2. Login to your account
3. Select your project

### Step 2: Update Network Access
1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"** button
3. Click **"Allow Access from Anywhere"**
4. In the IP Address field, it should show: **0.0.0.0/0**
5. Click **"Confirm"**
6. Wait 1-2 minutes for changes to apply

### Step 3: Verify Your Connection String
Your `.env` file should have:
```
MONGO_URI=mongodb+srv://r241190a_db_user:YOUR_PASSWORD@rentease-cluster.3xakxmr.mongodb.net/renthub?retryWrites=true&w=majority&appName=rentease-Cluster
```

Make sure:
- ✅ Password is filled in (not `<db_password>`)
- ✅ No spaces in the connection string
- ✅ Database name is included (renthub)

---

## 🔄 Alternative: Use Local MongoDB (If Atlas Doesn't Work)

If MongoDB Atlas keeps timing out, you can use a local database:

### Option 1: Install MongoDB Locally
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```
4. Update your `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/renthub
   PORT=5000
   ```

### Option 2: Use MongoDB Docker (If you have Docker)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```
Then update `.env`:
```
MONGO_URI=mongodb://localhost:27017/renthub
PORT=5000
```

---

## 🧪 Test Your Connection

After fixing, test with this command:
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected!')).catch(err => console.log('❌ Error:', err.message));"
```

---

## ✅ After Fixing

1. Restart your server:
   ```bash
   node server.js
   ```

2. You should see:
   ```
   Attempting to connect to MongoDB...
   MongoDB URI found, connecting...
   Server running on port 5000
   ✅ MongoDB Connected: rentease-cluster.3xakxmr.mongodb.net
   ```

3. Open: http://localhost:5000/admin

---

## 🆘 Still Not Working?

If you're still getting timeout errors after whitelisting 0.0.0.0/0:

1. **Check if your network/firewall blocks MongoDB Atlas**
   - Try from a different network (mobile hotspot)
   - Check corporate firewall settings

2. **Verify MongoDB Atlas cluster is running**
   - Go to Database → Clusters
   - Make sure cluster is not paused

3. **Use local MongoDB instead** (see Option 1 above)
   - This bypasses all network issues
   - Works offline
