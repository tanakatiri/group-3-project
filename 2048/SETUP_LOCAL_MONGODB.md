# 🔧 Setup Local MongoDB - Quick Guide

## Step 1: Download MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version:** Latest (7.0 or higher)
   - **Platform:** Windows
   - **Package:** MSI
3. Click **Download**

## Step 2: Install MongoDB

1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **IMPORTANT:** Check "Install MongoDB as a Service"
4. Keep default settings
5. Click **Install**
6. Wait for installation to complete

## Step 3: Verify Installation

Open PowerShell or Command Prompt and run:
```bash
mongod --version
```

You should see version information.

## Step 4: Start MongoDB Service

Run this command:
```bash
net start MongoDB
```

You should see: "The MongoDB service was started successfully."

## Step 5: Update Your `.env` File

Open: `c:\Users\Magic\Desktop\renthub\CascadeProjects\2048\.env`

Change it to:
```
MONGO_URI=mongodb://localhost:27017/renthub
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

**Save the file!**

## Step 6: Start Your Server

Double-click: `start-server.bat`

OR run manually:
```bash
cd c:\Users\Magic\Desktop\renthub\CascadeProjects\2048
node server.js
```

## Step 7: Expected Output

You should see:
```
Attempting to connect to MongoDB...
MongoDB URI found, connecting...
Server running on port 5000
Visit http://localhost:5000 to view the application
✅ MongoDB Connected: localhost
```

## Step 8: Access Your Application

Open browser:
- **Admin Panel:** http://localhost:5000/admin
- **Landlord Dashboard:** http://localhost:5000/landlord
- **Tenant Page:** http://localhost:5000

---

## ✅ Benefits of Local MongoDB

- ✅ Works offline
- ✅ No network issues
- ✅ Faster response times
- ✅ No IP whitelisting needed
- ✅ Free forever

---

## 🔧 Troubleshooting

### "net start MongoDB" fails
Try:
```bash
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

First create the directory:
```bash
mkdir C:\data\db
```

### MongoDB service not found
MongoDB might not be installed as a service. Run manually:
```bash
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod.exe
```

Keep this terminal open while using the app.

---

## 🎯 Quick Test

After setup, test the connection:
```bash
mongosh mongodb://localhost:27017/renthub
```

Type `exit` to quit.

---

**Once MongoDB is running, your application will work perfectly!** 🚀
