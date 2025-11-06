# Role-Based Access Control (RBAC) Architecture

## Overview
RentHub implements a comprehensive Role-Based Access Control system with three main user roles:
- **Tenants**: Browse properties, communicate with landlords, manage favorites
- **Landlords**: Upload and manage their own properties, communicate with tenants
- **Admins**: Full CRUD access to all users and properties

---

## User Roles & Permissions

### 1. TENANT Role
**Access Level**: Limited (Read-Only for properties, Read-Write for own data)

#### Permissions:
✅ **CAN DO:**
- Browse all available properties (public access)
- View property details
- Send inquiries to landlords
- Add properties to favorites
- View their own favorites
- Send messages to landlords
- View message history
- Update their own profile
- Register and login

❌ **CANNOT DO:**
- Add/upload properties
- Edit any properties
- Delete any properties
- Access landlord dashboard
- Access admin panel
- View other users' data
- Manage other tenants

#### API Endpoints:
```javascript
GET    /api/houses              // Browse all properties
GET    /api/houses/:id          // View property details
POST   /api/inquiries           // Send inquiry
GET    /api/favorites           // View favorites
POST   /api/favorites           // Add favorite
DELETE /api/favorites/:id       // Remove favorite
GET    /api/messages            // View messages
POST   /api/messages            // Send message
```

---

### 2. LANDLORD Role
**Access Level**: Medium (Full CRUD for own properties, Read-Only for others)

#### Permissions:
✅ **CAN DO:**
- Upload new properties
- View ONLY their own properties
- Edit ONLY their own properties
- Delete ONLY their own properties
- View inquiries for their properties
- Communicate with tenants
- Update their own profile
- Register and login

❌ **CANNOT DO:**
- View other landlords' properties (in management view)
- Edit other landlords' properties
- Delete other landlords' properties
- Access admin panel
- Manage users
- View all system data

#### API Endpoints:
```javascript
GET    /api/houses/my-properties    // View own properties (PROTECTED)
POST   /api/houses                  // Add property (PROTECTED, LANDLORD ONLY)
PUT    /api/houses/:id              // Edit own property (PROTECTED, LANDLORD ONLY)
DELETE /api/houses/:id              // Delete own property (PROTECTED, LANDLORD ONLY)
GET    /api/inquiries               // View inquiries for own properties
GET    /api/messages                // View messages
POST   /api/messages                // Send message
```

---

### 3. ADMIN/SUPERADMIN Role
**Access Level**: Full (Complete CRUD access to everything)

#### Permissions:
✅ **CAN DO:**
- View ALL users (tenants and landlords)
- Create, Read, Update, Delete ANY user
- View ALL properties from ALL landlords
- Create, Read, Update, Delete ANY property
- Approve/reject landlords
- Ban/unban users
- View all inquiries
- View all messages
- Access dashboard statistics
- Manage system settings
- Change user roles

❌ **CANNOT DO:**
- Register through public interface (must be created by superadmin)

#### API Endpoints:
```javascript
// User Management
GET    /api/admin/users              // View all users
GET    /api/admin/users/:id          // View user details
PUT    /api/admin/users/:id          // Update any user
DELETE /api/admin/users/:id          // Delete any user
GET    /api/admin/tenants            // View all tenants
GET    /api/admin/landlords          // View all landlords
PUT    /api/admin/users/:id/ban      // Ban/unban user

// Property Management
GET    /api/admin/properties         // View all properties
GET    /api/admin/properties/:id     // View property details
PUT    /api/admin/properties/:id     // Update any property
DELETE /api/admin/properties/:id     // Delete any property

// Approval System
GET    /api/admin/pending-landlords  // View pending landlords
PUT    /api/admin/approve-landlord/:id  // Approve landlord
GET    /api/admin/pending-properties // View pending properties
PUT    /api/admin/approve-property/:id // Approve property

// Statistics
GET    /api/admin/stats              // Dashboard statistics
GET    /api/admin/dashboard-stats    // Enhanced statistics
```

---

## Backend Implementation

### Middleware Stack

#### 1. Authentication Middleware (`protect`)
```javascript
// middleware/auth.js
export const protect = (req, res, next) => {
  // Verify JWT token
  // Attach user to req.user
  // Continue if authenticated
}
```

#### 2. Authorization Middleware (`authorize`)
```javascript
// middleware/rbac.js
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

#### 3. Ownership Verification
```javascript
// In route handlers
if (resource.owner.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'You can only modify your own resources' });
}
```

### Route Protection Examples

#### Public Routes (No Auth Required)
```javascript
router.get("/", async (req, res) => {
  // Anyone can browse properties
});
```

#### Protected Routes (Auth Required)
```javascript
router.get("/my-properties", protect, authorize('landlord'), async (req, res) => {
  // Only authenticated landlords can access
});
```

#### Admin-Only Routes
```javascript
router.get("/users", verifyToken, async (req, res) => {
  // Only admins can view all users
});
```

---

## Frontend Implementation

### Page Access Control

#### 1. Landing Page (`index.html`)
- **Access**: Public (everyone)
- **Features**: Browse properties, search, filter

#### 2. Portal Page (`portal.html`)
- **Access**: Public for login/register, Protected for features
- **Tenant View**: Browse, favorites, messages
- **Landlord View**: My properties, add property, inquiries, messages

#### 3. Admin Panel (`admin.html`)
- **Access**: Admin only
- **Features**: Manage users, properties, approvals, statistics

### UI Role-Based Rendering

```javascript
// portal.js
function updateNavigation() {
  if (currentUser.role === 'tenant') {
    // Show tenant navigation
  } else if (currentUser.role === 'landlord') {
    // Show landlord navigation
  }
}

function showUserPortal() {
  if (currentUser.role === 'tenant') {
    showSection('tenant-portal');
    loadAllProperties();
  } else if (currentUser.role === 'landlord') {
    showSection('landlord-portal');
    loadLandlordProperties(); // Only their properties
  }
}
```

---

## Security Features

### 1. Token-Based Authentication
- JWT tokens stored in localStorage
- Tokens include user ID and role
- Tokens verified on every protected request

### 2. Server-Side Validation
- All permissions checked on backend
- Frontend restrictions are for UX only
- Backend is the source of truth

### 3. Ownership Verification
- Landlords can only modify their own properties
- Users can only modify their own profiles
- Admins bypass ownership checks

### 4. Role Enforcement
- Roles assigned during registration
- Roles cannot be changed by users
- Only admins can change user roles

---

## Data Flow Examples

### Tenant Browsing Properties
```
1. Tenant visits index.html (public)
2. Frontend fetches GET /api/houses (no auth)
3. Backend returns all properties
4. Tenant views properties
```

### Landlord Adding Property
```
1. Landlord logs in → receives JWT token
2. Landlord clicks "Add Property"
3. Frontend sends POST /api/houses with token
4. Backend verifies token
5. Backend checks role === 'landlord'
6. Backend saves property with owner = landlord._id
7. Property appears in landlord's "My Properties"
```

### Landlord Editing Property
```
1. Landlord clicks "Edit" on their property
2. Frontend sends PUT /api/houses/:id with token
3. Backend verifies token
4. Backend checks role === 'landlord'
5. Backend verifies property.owner === user._id
6. Backend updates property
```

### Admin Managing Users
```
1. Admin logs in → receives JWT token
2. Admin accesses admin.html
3. Frontend verifies admin role
4. Frontend sends GET /api/admin/users with token
5. Backend verifies admin token
6. Backend returns all users
7. Admin can edit/delete any user
```

---

## Access Control Matrix

| Action | Tenant | Landlord | Admin |
|--------|--------|----------|-------|
| **Browse Properties** | ✅ | ✅ | ✅ |
| **View Property Details** | ✅ | ✅ | ✅ |
| **Add Property** | ❌ | ✅ (own) | ✅ (any) |
| **Edit Property** | ❌ | ✅ (own) | ✅ (any) |
| **Delete Property** | ❌ | ✅ (own) | ✅ (any) |
| **View All Properties** | ✅ (public) | ❌ (own only) | ✅ (all) |
| **Send Inquiry** | ✅ | ✅ | ✅ |
| **Add Favorite** | ✅ | ❌ | ❌ |
| **Send Message** | ✅ | ✅ | ✅ |
| **View All Users** | ❌ | ❌ | ✅ |
| **Edit Any User** | ❌ | ❌ | ✅ |
| **Delete Any User** | ❌ | ❌ | ✅ |
| **Ban User** | ❌ | ❌ | ✅ |
| **Approve Landlord** | ❌ | ❌ | ✅ |
| **View Statistics** | ❌ | ❌ | ✅ |
| **Access Admin Panel** | ❌ | ❌ | ✅ |

---

## Error Handling

### 401 Unauthorized
- User not logged in
- Invalid/expired token
- **Action**: Redirect to login

### 403 Forbidden
- User logged in but lacks permission
- Wrong role for action
- Not resource owner
- **Action**: Show error message

### 404 Not Found
- Resource doesn't exist
- **Action**: Show error message

---

## Testing RBAC

### Test as Tenant
1. Register as tenant
2. ✅ Can browse properties
3. ✅ Can add favorites
4. ✅ Can send messages
5. ❌ Cannot add properties
6. ❌ Cannot access admin panel

### Test as Landlord
1. Register as landlord
2. ✅ Can add properties
3. ✅ Can edit own properties
4. ✅ Can delete own properties
5. ❌ Cannot edit other landlords' properties
6. ❌ Cannot access admin panel

### Test as Admin
1. Login as admin
2. ✅ Can view all users
3. ✅ Can edit any user
4. ✅ Can delete any user
5. ✅ Can edit any property
6. ✅ Can delete any property
7. ✅ Can ban users
8. ✅ Can view statistics

---

## Best Practices

1. **Never trust the frontend**: Always validate permissions on backend
2. **Use middleware**: Apply `protect` and `authorize` to all protected routes
3. **Verify ownership**: Check resource ownership before allowing modifications
4. **Clear error messages**: Tell users why access was denied
5. **Consistent role names**: Use exact role strings ('tenant', 'landlord', 'admin')
6. **Token security**: Store tokens securely, validate on every request
7. **Logout properly**: Clear tokens and redirect to public pages

---

## Summary

RentHub's RBAC system ensures:
- **Tenants** can browse and interact with properties
- **Landlords** can manage their own properties only
- **Admins** have full system control
- All permissions enforced on backend
- Clear separation of concerns
- Secure and scalable architecture

This architecture follows industry best practices for multi-role applications and provides a solid foundation for future enhancements.
