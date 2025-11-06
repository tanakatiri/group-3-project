# 🧪 TEST THE CHANGES

## ⚠️ **SERVER NOT STARTING - LET'S DEBUG**

The server failed to start. Here's what to do:

### **Step 1: Check for Errors**

Open a new terminal and run:
```bash
cd c:\Users\Magic\Desktop\renthub\CascadeProjects\2048
npm start
```

**Look for error messages and share them with me.**

---

## 🔍 **WHAT I CHANGED**

### **1. Multi-Currency Support**
- Added to: `services/rentalCalculationService.js`
- Supports: USD, ZWL, ZAR, GBP, EUR
- API accepts `currency` parameter

### **2. Removed Salary Fields**
- Updated: `models/RentalApplication.js`
- Removed: occupation, monthlyIncome
- Kept: numberOfOccupants, pets, emergencyContact

### **3. Property Pricing**
- Updated: `models/House.js`
- Removed: area (sqm)
- Added: propertyType, furnished, amenities

### **4. Added Missing Middleware**
- Updated: `middleware/auth.js`
- Added: `authorize` function

---

## 🐛 **POSSIBLE ISSUES**

### **Issue 1: MongoDB Connection**
If you see: "Failed to connect to MongoDB"
- Check if MongoDB is running
- Check connection string in `.env.local`

### **Issue 2: Missing Dependencies**
If you see: "Cannot find module"
- Run: `npm install`

### **Issue 3: Port Already in Use**
If you see: "Port 5000 is already in use"
- Kill the process: `Stop-Process -Name "node" -Force`
- Try again: `npm start`

---

## ✅ **ONCE SERVER STARTS**

### **Test 1: Check Applications Load**
```
1. Login as tenant
2. Go to "📋 My Applications" tab
3. Should see applications (or "No applications yet")
```

### **Test 2: Check Multi-Currency API**
```bash
# Open Postman or use curl
POST http://localhost:5000/api/rental-calculations/calculate
Content-Type: application/json

{
  "propertyId": "your_property_id",
  "checkIn": "2025-01-15",
  "checkOut": "2025-02-14",
  "currency": "ZWL"
}
```

### **Test 3: Check Application Form**
```
1. Login as tenant
2. Try to submit application
3. Should NOT ask for salary/occupation
4. Should only ask for:
   - Number of occupants
   - Pets (Yes/No + details)
   - Emergency contact
```

---

## 📋 **SHARE WITH ME**

Please share:
1. **Error message** when starting server
2. **Screenshot** of terminal output
3. **Console logs** from browser (F12)

Then I can fix the specific issue!

---

## 🔧 **QUICK FIX IF NEEDED**

If server won't start, try:
```bash
# 1. Stop all node processes
Stop-Process -Name "node" -Force

# 2. Clear node cache
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Start server
npm start
```

**Share the output with me!** 🔍
