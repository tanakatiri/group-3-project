# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/Email (it's FREE)

### Step 2: Create a Free Cluster
1. Choose **FREE** M0 cluster
2. Select a cloud provider (AWS recommended)
3. Choose a region close to you
4. Click **Create Cluster**

### Step 3: Create Database User
1. Click **Database Access** in left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `renthub`
5. Password: Create a strong password (save it!)
6. User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 4: Whitelist Your IP
1. Click **Network Access** in left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 5: Get Connection String
1. Click **Database** in left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://renthub:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

### Step 6: Update .env File
Open your `.env` file and update:
```
MONGO_URI=mongodb+srv://renthub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/renthub?retryWrites=true&w=majority
PORT=5000
```

### Step 7: Restart Server
```bash
npm start
```

## Alternative: Local MongoDB

If you prefer local installation:

### Windows
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start service: `net start MongoDB`
4. Your `.env` should have:
   ```
   MONGO_URI=mongodb://localhost:27017/renthub
   PORT=5000
   ```

---

**Need help?** The error `ECONNREFUSED` means MongoDB isn't running or the connection string is wrong.
