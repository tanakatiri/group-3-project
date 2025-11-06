# ✅ Pre-Launch Checklist

## Before Starting the Server

### 1. ✅ Check `.env` File Exists
- [ ] File exists at: `c:\Users\Magic\Desktop\renthub\CascadeProjects\2048\.env`
- [ ] Contains `MONGO_URI=...`
- [ ] Contains `PORT=5000`
- [ ] MongoDB password is filled in (not `<db_password>`)

### 2. ✅ Verify MongoDB Atlas
- [ ] Logged into https://cloud.mongodb.com
- [ ] Network Access allows 0.0.0.0/0
- [ ] Database user exists with correct password
- [ ] Cluster is running (not paused)

### 3. ✅ Dependencies Installed
- [ ] `node_modules` folder exists
- [ ] If not, run: `npm install`

### 4. ✅ No Port Conflicts
- [ ] No other app using port 5000
- [ ] Run: `taskkill /F /IM node.exe` to clear old processes

---

## Starting the Server

### Option 1: Double-click `start-server.bat`
This will automatically:
- Check Node.js installation
- Kill old processes
- Start the server
- Show you any errors

### Option 2: Manual Start
```bash
cd c:\Users\Magic\Desktop\renthub\CascadeProjects\2048
node server.js
```

---

## Expected Output

When server starts successfully, you should see:

```
Attempting to connect to MongoDB...
MongoDB URI found, connecting...
Server running on port 5000
Visit http://localhost:5000 to view the application
✅ MongoDB Connected: rentease-cluster.3xakxmr.mongodb.net
```

---

## If You See Errors

### "MONGO_URI is not defined"
→ Your `.env` file is missing or empty
→ Create it with your MongoDB connection string

### "MongoServerError: bad auth"
→ Wrong password in `.env` file
→ Get correct password from MongoDB Atlas

### "EADDRINUSE: address already in use"
→ Port 5000 is busy
→ Run: `taskkill /F /IM node.exe`

### "Failed to fetch" in browser
→ Server is not running
→ Start the server first

---

## After Server Starts

1. Open browser to: http://localhost:5000/admin
2. Register your admin account
3. Start using the system!

---

## Quick Test

Run this to test if server is accessible:
```bash
curl http://localhost:5000
```

Should return HTML content (not an error).
