# 🚀 Quick Start Guide - RentHub System

## Current Status
Your application is **100% built** but needs proper configuration to run.

## ⚠️ Main Issue
**MongoDB connection is not configured properly in your `.env` file**

---

## 🔧 Step-by-Step Fix

### Step 1: Check Your `.env` File

Open the file: `c:\Users\Magic\Desktop\renthub\CascadeProjects\2048\.env`

It should look like this:
```
MONGO_URI=mongodb+srv://r241190a_db_user:YOUR_ACTUAL_PASSWORD@rentease-cluster.3xakxmr.mongodb.net/renthub?retryWrites=true&w=majority&appName=rentease-Cluster
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

**IMPORTANT:** Replace `YOUR_ACTUAL_PASSWORD` with your real MongoDB Atlas password!

### Step 2: Verify MongoDB Atlas Setup

1. Go to: https://cloud.mongodb.com
2. Login to your account
3. Click **Network Access** (left sidebar)
4. Make sure you have: **0.0.0.0/0** (Allow access from anywhere)
5. If not, click **Add IP Address** → **Allow Access from Anywhere** → **Confirm**

### Step 3: Start the Server

Open a **NEW terminal** in VS Code (Terminal → New Terminal) and run:

```bash
cd c:\Users\Magic\Desktop\renthub\CascadeProjects\2048
node server.js
```

### Step 4: Expected Output

You should see:
```
Attempting to connect to MongoDB...
MongoDB URI found, connecting...
Server running on port 5000
Visit http://localhost:5000 to view the application
✅ MongoDB Connected: rentease-cluster.3xakxmr.mongodb.net
```

### Step 5: Access the Application

Once server is running:
- **Admin Panel:** http://localhost:5000/admin
- **Landlord Dashboard:** http://localhost:5000/landlord
- **Tenant Page:** http://localhost:5000

---

## 🐛 Common Errors & Solutions

### Error: "EADDRINUSE: address already in use"
**Solution:** Kill existing Node processes
```bash
taskkill /F /IM node.exe
```
Then start server again.

### Error: "MONGO_URI is not defined"
**Solution:** Your `.env` file is missing or incorrect. Create it with the content from Step 1.

### Error: "MongoServerError: bad auth"
**Solution:** Wrong password in `.env` file. Get the correct password from MongoDB Atlas.

### Error: "Failed to fetch" in browser
**Solution:** Server is not running. Follow Step 3 to start it.

---

## 📋 What You Have Built

### Backend (Complete ✅)
- Express server with REST API
- MongoDB database integration
- Admin authentication system (JWT)
- House management routes
- Inquiry management routes
- Admin monitoring routes

### Frontend (Complete ✅)
- Tenant browsing page with search/filters
- Landlord dashboard for property management
- Admin panel with authentication
- Modern responsive design
- Real-time data updates

### Features (Complete ✅)
- Property listings (CRUD operations)
- Tenant inquiries
- Admin monitoring of landlords and tenants
- Secure authentication
- Statistics dashboard

---

## 🎯 Next Steps After Server Starts

1. **Register Admin Account**
   - Go to: http://localhost:5000/admin
   - Click "Register"
   - Create your admin credentials

2. **Add Properties as Landlord**
   - Go to: http://localhost:5000/landlord
   - Click "Add New Property"
   - Fill in property details

3. **Browse as Tenant**
   - Go to: http://localhost:5000
   - Browse properties
   - Submit inquiries

4. **Monitor as Admin**
   - Go to: http://localhost:5000/admin
   - View all landlords, properties, and inquiries

---

## 📞 Need Help?

If you're still having issues:

1. **Check the terminal output** when you run `node server.js`
2. **Share the exact error message** you see
3. **Verify your `.env` file** has the correct MongoDB password

The most common issue is the MongoDB password not being set correctly in the `.env` file!
