# 🔐 Admin CRUD Privileges - Complete Guide

## ✅ Admin Has Full Control

The system admin now has **complete CRUD (Create, Read, Update, Delete)** privileges over:
- ✅ All Users (Tenants & Landlords)
- ✅ All Properties
- ✅ Approvals & Rejections
- ✅ Ban/Unban Users
- ✅ Platform Management

---

## 🎯 Admin Capabilities

### User Management (CRUD)

#### 1. **READ - View Users**
```
GET /api/admin/users              - Get all users
GET /api/admin/users/:id          - Get single user
GET /api/admin/tenants            - Get all tenants only
GET /api/admin/landlords          - Get all landlords only
GET /api/admin/pending-landlords  - Get unapproved landlords
```

#### 2. **CREATE - Handled via registration**
Users register themselves, admin approves

#### 3. **UPDATE - Edit Users**
```
PUT /api/admin/users/:id
Body: {
  name: "New Name",
  email: "newemail@example.com",
  phone: "+263771234567",
  role: "tenant" | "landlord",
  approved: true | false
}
```

**Admin can update:**
- ✅ User name
- ✅ User email
- ✅ User phone
- ✅ User role (change tenant to landlord or vice versa)
- ✅ Approval status

#### 4. **DELETE - Remove Users**
```
DELETE /api/admin/users/:id
```
**What happens:**
- ✅ User account deleted
- ✅ If landlord: All their properties deleted
- ✅ All associated data removed

---

### Property Management (CRUD)

#### 1. **READ - View Properties**
```
GET /api/admin/properties              - Get all properties
GET /api/admin/properties/:id          - Get single property
GET /api/admin/pending-properties      - Get unapproved properties
```

#### 2. **CREATE - Add Properties**
Admin can add properties on behalf of landlords (via existing endpoint)

#### 3. **UPDATE - Edit Properties**
```
PUT /api/admin/properties/:id
Body: {
  title: "Updated Title",
  location: "New Location",
  price: 500,
  bedrooms: 3,
  bathrooms: 2,
  description: "Updated description",
  available: true,
  approved: true
}
```

**Admin can update:**
- ✅ Property details (title, location, price, etc.)
- ✅ Availability status
- ✅ Approval status
- ✅ Any property field

#### 4. **DELETE - Remove Properties**
```
DELETE /api/admin/properties/:id
```
**What happens:**
- ✅ Property deleted permanently
- ✅ Associated favorites removed
- ✅ Property removed from all listings

---

### Approval Management

#### Landlord Approval
```
PUT /api/admin/approve-landlord/:id     - Approve landlord
DELETE /api/admin/reject-landlord/:id   - Reject & delete landlord
```

#### Property Approval
```
PUT /api/admin/approve-property/:id     - Approve property
DELETE /api/admin/reject-property/:id   - Reject & delete property
```

---

### Ban/Suspend Users

#### Ban User
```
PUT /api/admin/users/:id/ban
Body: {
  banned: true,
  banReason: "Violation of terms"
}
```

#### Unban User
```
PUT /api/admin/users/:id/ban
Body: {
  banned: false
}
```

**Ban features:**
- ✅ Suspend user account
- ✅ Add ban reason
- ✅ Track who banned (admin ID)
- ✅ Track when banned (timestamp)
- ✅ Reversible (can unban)

---

### Dashboard Statistics

```
GET /api/admin/dashboard-stats
```

**Returns:**
```json
{
  "users": {
    "total": 10,
    "tenants": 7,
    "landlords": 3,
    "pendingLandlords": 1
  },
  "properties": {
    "total": 15,
    "approved": 12,
    "pending": 3,
    "available": 10
  },
  "activity": {
    "messages": 45,
    "favorites": 23,
    "inquiries": 18
  }
}
```

---

## 📋 Complete API Reference

### User Endpoints (11 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get single user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/tenants` | Get all tenants |
| GET | `/api/admin/landlords` | Get all landlords |
| GET | `/api/admin/pending-landlords` | Get unapproved landlords |
| PUT | `/api/admin/approve-landlord/:id` | Approve landlord |
| DELETE | `/api/admin/reject-landlord/:id` | Reject landlord |
| PUT | `/api/admin/users/:id/ban` | Ban/unban user |
| GET | `/api/admin/dashboard-stats` | Get statistics |

### Property Endpoints (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/properties` | Get all properties |
| GET | `/api/admin/properties/:id` | Get single property |
| PUT | `/api/admin/properties/:id` | Update property |
| DELETE | `/api/admin/properties/:id` | Delete property |
| GET | `/api/admin/pending-properties` | Get unapproved properties |
| PUT | `/api/admin/approve-property/:id` | Approve property |
| DELETE | `/api/admin/reject-property/:id` | Reject property |

### Total: 18 Admin Endpoints

---

## 🧪 Testing Admin CRUD

### Test 1: View All Users
```bash
GET http://localhost:5000/api/admin/users
Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Test 2: Update User
```bash
PUT http://localhost:5000/api/admin/users/USER_ID
Headers: 
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Updated Name",
  "approved": true
}
```

### Test 3: Delete User
```bash
DELETE http://localhost:5000/api/admin/users/USER_ID
Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Test 4: View All Properties
```bash
GET http://localhost:5000/api/admin/properties
Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Test 5: Update Property
```bash
PUT http://localhost:5000/api/admin/properties/PROPERTY_ID
Headers: 
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "title": "Updated Property Title",
  "price": 600,
  "approved": true
}
```

### Test 6: Delete Property
```bash
DELETE http://localhost:5000/api/admin/properties/PROPERTY_ID
Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Test 7: Ban User
```bash
PUT http://localhost:5000/api/admin/users/USER_ID/ban
Headers: 
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "banned": true,
  "banReason": "Spam or fraud"
}
```

### Test 8: Get Dashboard Stats
```bash
GET http://localhost:5000/api/admin/dashboard-stats
Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 🔐 Admin Login & Token

### 1. Login as Admin
```bash
POST http://localhost:5000/api/admin/login
Body:
{
  "email": "admin@renthub.com",
  "password": "admin123"
}
```

### 2. Get Token from Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@renthub.com"
  }
}
```

### 3. Use Token in Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Admin Workflow Examples

### Example 1: Manage New Landlord
```
1. Landlord registers
   ↓
2. Admin views pending landlords
   GET /api/admin/pending-landlords
   ↓
3. Admin reviews landlord info
   GET /api/admin/users/:id
   ↓
4. Admin approves or rejects
   PUT /api/admin/approve-landlord/:id
   OR
   DELETE /api/admin/reject-landlord/:id
```

### Example 2: Manage Property
```
1. Landlord adds property
   ↓
2. Admin views pending properties
   GET /api/admin/pending-properties
   ↓
3. Admin reviews property details
   GET /api/admin/properties/:id
   ↓
4. Admin can:
   - Approve: PUT /api/admin/approve-property/:id
   - Edit: PUT /api/admin/properties/:id
   - Delete: DELETE /api/admin/properties/:id
```

### Example 3: Handle Problematic User
```
1. Admin identifies problematic user
   ↓
2. Admin can:
   - Ban temporarily: PUT /api/admin/users/:id/ban
   - Edit details: PUT /api/admin/users/:id
   - Delete permanently: DELETE /api/admin/users/:id
```

---

## 🎯 Admin Privileges Summary

### User Management:
- ✅ View all users (tenants & landlords)
- ✅ View individual user details
- ✅ Update user information
- ✅ Change user roles
- ✅ Approve/reject landlords
- ✅ Ban/unban users
- ✅ Delete users permanently

### Property Management:
- ✅ View all properties
- ✅ View individual property details
- ✅ Update property information
- ✅ Approve/reject properties
- ✅ Delete properties permanently
- ✅ Manage property availability

### Platform Management:
- ✅ View dashboard statistics
- ✅ Monitor platform activity
- ✅ Track messages, favorites, inquiries
- ✅ Full oversight of all operations

---

## 🔒 Security & Validation

### All Admin Endpoints:
- ✅ Protected with JWT authentication
- ✅ Require admin token
- ✅ Validate input data
- ✅ Check permissions
- ✅ Log admin actions

### Validation Rules:
- **Name:** Letters and spaces only
- **Email:** Valid email format
- **Phone:** Zimbabwe format (+263XXXXXXXXX)
- **Role:** Must be 'tenant' or 'landlord'

---

## 📝 Database Changes

### User Model - New Fields:
```javascript
banned: Boolean (default: false)
banReason: String
bannedBy: ObjectId (Admin reference)
bannedAt: Date
```

### Tracking Fields:
- ✅ Who approved (approvedBy)
- ✅ When approved (approvedAt)
- ✅ Who banned (bannedBy)
- ✅ When banned (bannedAt)

---

## 🎨 Admin Capabilities Matrix

| Action | Users | Properties | Approval | Ban |
|--------|-------|------------|----------|-----|
| **View All** | ✅ | ✅ | ✅ | ✅ |
| **View Single** | ✅ | ✅ | ✅ | ✅ |
| **Create** | ➖ | ➖ | ✅ | ✅ |
| **Update** | ✅ | ✅ | ✅ | ✅ |
| **Delete** | ✅ | ✅ | ✅ | ✅ |
| **Approve** | ✅ | ✅ | ✅ | ➖ |
| **Reject** | ✅ | ✅ | ✅ | ➖ |
| **Ban/Unban** | ✅ | ➖ | ➖ | ✅ |

**Legend:**
- ✅ Full capability
- ➖ Not applicable

---

## 🚀 Quick Commands

### View Everything:
```bash
# All users
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/admin/users

# All properties
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/admin/properties

# Dashboard stats
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/admin/dashboard-stats
```

### Manage Users:
```bash
# Update user
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","approved":true}' \
  http://localhost:5000/api/admin/users/USER_ID

# Delete user
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/users/USER_ID
```

### Manage Properties:
```bash
# Update property
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","approved":true}' \
  http://localhost:5000/api/admin/properties/PROPERTY_ID

# Delete property
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/properties/PROPERTY_ID
```

---

## ✅ Admin System Complete!

### Full CRUD Privileges:
- ✅ **Create:** Approve new users and properties
- ✅ **Read:** View all users, properties, and statistics
- ✅ **Update:** Edit any user or property information
- ✅ **Delete:** Remove users and properties permanently

### Additional Powers:
- ✅ Approve/reject landlords
- ✅ Approve/reject properties
- ✅ Ban/unban users
- ✅ Change user roles
- ✅ Full platform oversight

### Total Endpoints: 18 admin endpoints
### Total Capabilities: Complete platform control

**Admin has full privileges over the entire system!** 🎉

---

## 📞 Admin Credentials

```
URL: http://localhost:5000/admin
Email: admin@renthub.com
Password: admin123
```

**Login and start managing your platform!** 🔐
