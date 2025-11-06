# Authentication System Guide

## Overview

Your House Renting System now has a complete authentication system with three user types:
- **Admin** - System administrators
- **Landlord** - Property owners
- **Tenant** - Property seekers

---

## ✅ What Was Fixed/Added

### Backend
1. ✅ Created `User` model for Landlords and Tenants
2. ✅ Created `/api/auth` routes for user registration and login
3. ✅ Updated JWT middleware to support multiple roles
4. ✅ Added role-based access control middleware
5. ✅ Fixed admin token generation to include role

### Frontend
6. ✅ Updated all API URLs to auto-detect environment (localhost vs deployed)
7. ✅ Fixed `admin.js` to work in production
8. ✅ Fixed `script.js` (tenant page)
9. ✅ Fixed `landlord.js` (landlord page)

---

## 🔑 API Endpoints

### Admin Authentication
```
POST /api/admin/register
POST /api/admin/login
GET  /api/admin/stats (protected)
```

### User Authentication (Landlord/Tenant)
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile (protected)
```

---

## 📝 How to Use

### 1. Admin Registration/Login

**Register Admin:**
```javascript
POST /api/admin/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Login Admin:**
```javascript
POST /api/admin/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```javascript
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### 2. Landlord Registration/Login

**Register Landlord:**
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "landlord"
}
```

**Login Landlord:**
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123",
  "role": "landlord"
}
```

---

### 3. Tenant Registration/Login

**Register Tenant:**
```javascript
POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "tenant"
}
```

**Login Tenant:**
```javascript
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "password123",
  "role": "tenant"
}
```

---

## 🧪 Testing the Authentication

### Test Admin Login

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Go to Admin Page:**
   ```
   http://localhost:5000/admin
   ```

3. **Register a new admin:**
   - Click "Register" tab
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `admin123`
   - Click "Register"

4. **Or Login with existing admin:**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Click "Login"

5. **You should see the dashboard with:**
   - Overview stats
   - Landlords list
   - Properties list
   - Inquiries list

---

### Test with API Client (Postman/Thunder Client)

#### 1. Register Admin
```
POST http://localhost:5000/api/admin/register
Content-Type: application/json

{
  "username": "testadmin",
  "email": "test@admin.com",
  "password": "test123"
}
```

#### 2. Login Admin
```
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "test@admin.com",
  "password": "test123"
}
```

#### 3. Get Dashboard Stats (use token from login)
```
GET http://localhost:5000/api/admin/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 4. Register Landlord
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Landlord",
  "email": "landlord@test.com",
  "password": "test123",
  "phone": "+1234567890",
  "role": "landlord"
}
```

#### 5. Register Tenant
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Tenant",
  "email": "tenant@test.com",
  "password": "test123",
  "phone": "+1234567890",
  "role": "tenant"
}
```

---

## 🔒 Role-Based Access Control

### Middleware Functions

**`verifyToken`** - Verifies JWT token (all authenticated users)
```javascript
router.get('/protected', verifyToken, (req, res) => {
  // req.userId and req.userRole available
});
```

**`verifyAdmin`** - Only admins can access
```javascript
router.get('/admin-only', verifyToken, verifyAdmin, (req, res) => {
  // Only admins reach here
});
```

**`verifyLandlord`** - Only landlords can access
```javascript
router.post('/add-house', verifyToken, verifyLandlord, (req, res) => {
  // Only landlords reach here
});
```

**`verifyTenant`** - Only tenants can access
```javascript
router.post('/inquiry', verifyToken, verifyTenant, (req, res) => {
  // Only tenants reach here
});
```

---

## 🚀 Next Steps to Complete Authentication

### 1. Add Login/Register UI for Landlords
Currently landlord page has no auth UI. You need to:
- Add login/register forms to `landlord.html`
- Update `landlord.js` to handle authentication
- Protect landlord routes

### 2. Add Login/Register UI for Tenants
- Add login/register modal to main page
- Update `script.js` to handle authentication
- Link inquiries to logged-in tenants

### 3. Link Data to Users
- Update House model to include `landlordId` (reference to User)
- Update Inquiry model to include `tenantId` (reference to User)
- Filter houses by landlord
- Filter inquiries by tenant

### 4. Protect Routes
- Houses: Only landlord who created can edit/delete
- Inquiries: Only tenant who created can view their own

---

## 📊 Current Status

### ✅ Completed
- Admin authentication (register, login, dashboard)
- User model for Landlords and Tenants
- Auth routes for user registration/login
- JWT token generation with roles
- Role-based middleware
- Dynamic API URLs (works in production)

### ⏳ To Do
- Add login/register UI for landlords
- Add login/register UI for tenants
- Link houses to landlord users
- Link inquiries to tenant users
- Implement role-based data filtering
- Add user profile pages

---

## 🐛 Troubleshooting

### "Invalid credentials" error
- Check email and password are correct
- For user login, ensure `role` is included in request
- Check MongoDB connection is working

### "No token provided" error
- Ensure token is included in Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`

### Token expired
- Tokens expire after 7 days
- User needs to login again

### CORS errors
- Check server is running
- Verify API_URL is correct
- Check CORS is enabled in server.js

---

## 💡 Tips

1. **Store token securely**
   - Use `localStorage` for web apps
   - Never expose tokens in URLs
   - Clear token on logout

2. **Test with browser console**
   ```javascript
   // Check if token exists
   console.log(localStorage.getItem('adminToken'));
   
   // Clear token
   localStorage.removeItem('adminToken');
   ```

3. **Check server logs**
   - Look for authentication errors
   - Verify MongoDB connection
   - Check token generation

---

## 🎯 Quick Test Checklist

- [ ] Server starts without errors
- [ ] Can register new admin
- [ ] Can login as admin
- [ ] Admin dashboard loads
- [ ] Can register landlord via API
- [ ] Can register tenant via API
- [ ] Can login landlord via API
- [ ] Can login tenant via API
- [ ] Protected routes return 401 without token
- [ ] Protected routes work with valid token

---

**Your authentication system is now ready!** 🎉

Next: Add UI for landlord/tenant login and link data to users.
