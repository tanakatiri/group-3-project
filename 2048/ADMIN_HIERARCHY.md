# 🔐 Admin Hierarchy System - Complete Guide

## ✅ Two-Level Admin System Implemented

Your RentHub system now has a **hierarchical admin structure**:
- 🔴 **Super Admin** (Developer/Owner) - Full system control
- 🟡 **Regular Admin** (Staff) - Limited management access

---

## 👥 Admin Roles

### 🔴 Super Admin (Developer Access)

**Credentials:**
```
Email: superadmin@renthub.com
Password: superadmin123
Role: superadmin
```

**Full Permissions:**
- ✅ Manage all users (tenants & landlords)
- ✅ Manage all properties
- ✅ **Manage other admins** (create, edit, delete)
- ✅ View system logs
- ✅ Access system settings
- ✅ Complete platform control

**Exclusive Powers:**
- ✅ Create new admins
- ✅ Create other super admins
- ✅ Edit admin accounts
- ✅ Delete admin accounts
- ✅ Activate/deactivate admins
- ✅ Change admin permissions

---

### 🟡 Regular Admin (Staff Access)

**Credentials:**
```
Email: admin@renthub.com
Password: admin123
Role: admin
```

**Limited Permissions:**
- ✅ Manage users (tenants & landlords)
- ✅ Manage properties
- ❌ **Cannot manage other admins**
- ✅ View system logs
- ❌ No system settings access

**What Regular Admin Can Do:**
- ✅ Approve/reject landlords
- ✅ Approve/reject properties
- ✅ Edit user accounts
- ✅ Delete user accounts
- ✅ Ban/unban users
- ✅ Manage all properties
- ❌ Cannot create/edit/delete admins

---

## 📊 Permission Comparison

| Permission | Super Admin | Regular Admin |
|------------|-------------|---------------|
| **Manage Users** | ✅ | ✅ |
| **Manage Properties** | ✅ | ✅ |
| **Manage Admins** | ✅ | ❌ |
| **View Logs** | ✅ | ✅ |
| **System Settings** | ✅ | ❌ |
| **Create Admins** | ✅ | ❌ |
| **Delete Admins** | ✅ | ❌ |
| **Edit Admins** | ✅ | ❌ |

---

## 🔑 Super Admin Exclusive Endpoints

### Admin Management (5 endpoints)

```
GET    /api/admin/admins           - View all admins
GET    /api/admin/admins/:id       - View single admin
POST   /api/admin/admins           - Create new admin
PUT    /api/admin/admins/:id       - Update admin
DELETE /api/admin/admins/:id       - Delete admin
```

**All require Super Admin token!**

---

## 🧪 Testing Super Admin Features

### 1. Login as Super Admin
```bash
POST http://localhost:5000/api/admin/login
Body:
{
  "email": "superadmin@renthub.com",
  "password": "superadmin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "superadmin",
    "email": "superadmin@renthub.com",
    "role": "superadmin"
  }
}
```

### 2. View All Admins
```bash
GET http://localhost:5000/api/admin/admins
Headers: Authorization: Bearer SUPERADMIN_TOKEN
```

### 3. Create New Admin
```bash
POST http://localhost:5000/api/admin/admins
Headers: 
  Authorization: Bearer SUPERADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "username": "admin2",
  "email": "admin2@renthub.com",
  "password": "admin123",
  "role": "admin"
}
```

### 4. Create Another Super Admin
```bash
POST http://localhost:5000/api/admin/admins
Headers: 
  Authorization: Bearer SUPERADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "username": "superadmin2",
  "email": "superadmin2@renthub.com",
  "password": "superadmin123",
  "role": "superadmin"
}
```

### 5. Update Admin
```bash
PUT http://localhost:5000/api/admin/admins/ADMIN_ID
Headers: 
  Authorization: Bearer SUPERADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "username": "updated_admin",
  "active": true,
  "role": "admin"
}
```

### 6. Deactivate Admin
```bash
PUT http://localhost:5000/api/admin/admins/ADMIN_ID
Headers: 
  Authorization: Bearer SUPERADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "active": false
}
```

### 7. Delete Admin
```bash
DELETE http://localhost:5000/api/admin/admins/ADMIN_ID
Headers: Authorization: Bearer SUPERADMIN_TOKEN
```

---

## 🛡️ Security Features

### Protection Mechanisms:

1. **Self-Protection:**
   - ✅ Super admin cannot demote themselves
   - ✅ Super admin cannot delete themselves
   - ✅ Prevents accidental lockout

2. **Role-Based Access:**
   - ✅ Regular admins blocked from admin management
   - ✅ Returns 403 Forbidden if unauthorized
   - ✅ JWT token verification required

3. **Permission Validation:**
   - ✅ Checks admin role before allowing actions
   - ✅ Validates active status
   - ✅ Tracks who created each admin

4. **Audit Trail:**
   - ✅ Tracks who created each admin (createdBy)
   - ✅ Tracks last login time
   - ✅ Tracks creation date

---

## 📋 Admin Model Fields

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'superadmin',
  permissions: {
    manageUsers: Boolean,
    manageProperties: Boolean,
    manageAdmins: Boolean,      // Only superadmin
    viewLogs: Boolean,
    systemSettings: Boolean      // Only superadmin
  },
  createdBy: ObjectId (Admin reference),
  active: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

---

## 🎯 Use Cases

### Use Case 1: Hire New Staff Admin
```
1. Super admin logs in
2. Creates new admin account
3. Sets role as "admin" (limited access)
4. New admin can manage users/properties
5. New admin cannot manage other admins
```

### Use Case 2: Promote Admin to Super Admin
```
1. Super admin logs in
2. Updates admin account
3. Changes role from "admin" to "superadmin"
4. Updates permissions automatically
5. Admin now has full access
```

### Use Case 3: Suspend Admin Account
```
1. Super admin logs in
2. Updates admin account
3. Sets active = false
4. Admin can no longer login
5. Can be reactivated later
```

### Use Case 4: Remove Admin
```
1. Super admin logs in
2. Deletes admin account
3. Admin permanently removed
4. Cannot delete own account (protected)
```

---

## 🔄 Admin Workflow

### Creating Admin Hierarchy:
```
Super Admin (Developer)
    ↓
Creates Regular Admins (Staff)
    ↓
Regular Admins manage:
  - Tenants
  - Landlords
  - Properties
  - Approvals
    ↓
Super Admin oversees everything
```

---

## 📊 Complete Endpoint Summary

### Super Admin Only (5 endpoints):
```
GET    /api/admin/admins           ✅ View all admins
GET    /api/admin/admins/:id       ✅ View single admin
POST   /api/admin/admins           ✅ Create admin
PUT    /api/admin/admins/:id       ✅ Update admin
DELETE /api/admin/admins/:id       ✅ Delete admin
```

### Both Admin Types (18 endpoints):
```
User Management:
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
GET    /api/admin/tenants
GET    /api/admin/landlords
GET    /api/admin/pending-landlords
PUT    /api/admin/approve-landlord/:id
DELETE /api/admin/reject-landlord/:id
PUT    /api/admin/users/:id/ban

Property Management:
GET    /api/admin/properties
GET    /api/admin/properties/:id
PUT    /api/admin/properties/:id
DELETE /api/admin/properties/:id
GET    /api/admin/pending-properties
PUT    /api/admin/approve-property/:id
DELETE /api/admin/reject-property/:id

Statistics:
GET    /api/admin/dashboard-stats
```

### Total: 23 Admin Endpoints

---

## 🎨 Admin Types Summary

### 🔴 Super Admin (Developer)
- **Purpose:** System owner/developer access
- **Count:** Usually 1-2 accounts
- **Access:** Complete control
- **Can manage:** Everything including admins
- **Use for:** System configuration, admin management

### 🟡 Regular Admin (Staff)
- **Purpose:** Day-to-day platform management
- **Count:** Multiple staff members
- **Access:** User & property management
- **Cannot manage:** Other admins
- **Use for:** Content moderation, user support

---

## 🔒 Best Practices

### For Super Admin:
1. ✅ Keep credentials secure
2. ✅ Use strong passwords
3. ✅ Limit number of super admins
4. ✅ Regularly audit admin accounts
5. ✅ Monitor admin activity

### For Regular Admin:
1. ✅ Create separate accounts for each staff member
2. ✅ Deactivate when staff leaves
3. ✅ Don't share credentials
4. ✅ Regular password changes
5. ✅ Monitor their actions

### Security:
1. ✅ Change default passwords immediately
2. ✅ Use environment variables in production
3. ✅ Enable 2FA (future enhancement)
4. ✅ Log all admin actions
5. ✅ Regular security audits

---

## 📝 Files Modified

### Backend (3 files):
1. ✅ `models/Admin.js` - Added role hierarchy & permissions
2. ✅ `middleware/auth.js` - Added requireSuperAdmin middleware
3. ✅ `routes/adminRoutes.js` - Added admin management endpoints

### Scripts (1 file):
1. ✅ `create-superadmin.js` - Super admin creation script

---

## ✅ System Status

| Feature | Status |
|---------|--------|
| Super Admin Account | ✅ Created |
| Regular Admin Account | ✅ Created |
| Admin Hierarchy | ✅ Implemented |
| Permission System | ✅ Complete |
| Admin CRUD | ✅ Working |
| Security | ✅ Protected |

---

## 🎉 Complete Admin System

### You Now Have:
1. ✅ **Super Admin** - Developer access with full control
2. ✅ **Regular Admin** - Staff access for management
3. ✅ **Hierarchical permissions** - Role-based access
4. ✅ **Admin management** - Create, edit, delete admins
5. ✅ **Security** - Protected endpoints & self-protection
6. ✅ **Audit trail** - Track admin actions

### Total Admin Capabilities:
- **Super Admin:** 23 endpoints (all)
- **Regular Admin:** 18 endpoints (user/property management)
- **Difference:** 5 admin management endpoints

---

## 🔑 Quick Reference

### Super Admin Login:
```
Email: superadmin@renthub.com
Password: superadmin123
```

### Regular Admin Login:
```
Email: admin@renthub.com
Password: admin123
```

### Login URL:
```
http://localhost:5000/admin
```

---

**Your hierarchical admin system is complete!** 🎊

**Super Admin has full control. Regular admins manage day-to-day operations.** 🔐
