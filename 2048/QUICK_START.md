# 🚀 Quick Start Guide - RentHub Portal System

## What's New?

Your RentHub system has been completely transformed into a **role-based portal system** with separate interfaces for tenants and landlords, plus a built-in messaging system!

---

## 🎯 Key Features Added

### ✅ Separate Portals
- **Tenant Portal**: Browse, search, and favorite properties
- **Landlord Portal**: Add and manage property listings
- **Unified Authentication**: Single login for both roles

### ✅ Communication System
- Direct messaging between tenants and landlords
- Conversation history
- Unread message notifications
- Property-specific inquiries

### ✅ Favorites System
- Tenants can save favorite properties
- Quick access to saved listings
- One-click add/remove

### ✅ Enhanced Security
- JWT authentication with 7-day tokens
- Role-based access control
- Phone number validation (Zimbabwe format)
- Protected API routes

---

## 🏃 How to Start

### 1. Start the Server

```bash
# Make sure MongoDB is running
net start MongoDB

# Start the application
npm start
```

### 2. Access the Portal

Open your browser and go to:
```
http://localhost:5000/portal
```

---

## 👥 Test Users

### Create a Tenant Account
1. Go to http://localhost:5000/portal
2. Click **Register** tab
3. Fill in details:
   - Name: John Tenant
   - Email: tenant@test.com
   - Phone: +263771234567
   - Password: password123
   - Role: **Find a Property (Tenant)**
4. Click **Create Account**

### Create a Landlord Account
1. Click **Logout** (if logged in)
2. Click **Register** tab
3. Fill in details:
   - Name: Jane Landlord
   - Email: landlord@test.com
   - Phone: +263712345678
   - Password: password123
   - Role: **List My Properties (Landlord)**
4. Click **Create Account**

---

## 🎮 Quick Demo Flow

### As a Landlord:

1. **Login** as landlord
2. Click **Add Property** tab
3. Fill in property details:
   - Title: "Modern 2BR Apartment"
   - Location: "Harare CBD"
   - Price: 500
   - Bedrooms: 2
   - Bathrooms: 1
   - Description: "Beautiful apartment in city center"
4. Click **Add Property**
5. View your property in **My Properties** tab

### As a Tenant:

1. **Logout** and login as tenant
2. Browse available properties
3. Click **🤍 Favorite** on properties you like
4. Click **View Details** to see full information
5. Click **Contact Landlord** to start a conversation
6. Send a message about the property
7. Check **Messages** to see your conversations

### Communication:

1. **Landlord** clicks **Messages** in navigation
2. Sees message from tenant
3. Responds to inquiry
4. **Tenant** receives response in real-time

---

## 📱 Phone Number Format

**IMPORTANT**: All phone numbers must follow Zimbabwe format:

✅ **Correct**: `+263771234567`
- Starts with +263
- Followed by exactly 9 digits
- No spaces or dashes

❌ **Wrong**:
- `263771234567` (missing +)
- `+26377123456` (only 8 digits)
- `+263 77 123 4567` (has spaces)

---

## 🗺️ Navigation Guide

### Main Navigation Bar
- **Browse Properties / My Properties**: Main portal (role-dependent)
- **Messages**: Communication center
- **User Name**: Shows logged-in user
- **Logout**: Sign out

### Tenant Portal Tabs
- **All Properties**: Browse all available listings
- **My Favorites**: View saved properties

### Landlord Portal Tabs
- **My Properties**: View and manage your listings
- **Add Property**: Create new property listing
- **Inquiries**: View tenant inquiries (legacy)

---

## 🔑 Key Differences from Old System

| Feature | Old System | New System |
|---------|-----------|------------|
| **Access** | Single public page | Role-based portals |
| **Authentication** | None | JWT with roles |
| **Communication** | Email forms only | In-app messaging |
| **Property Management** | Basic CRUD | Full landlord dashboard |
| **Tenant Features** | Browse only | Browse + Favorites + Messaging |
| **User Experience** | Generic | Personalized by role |

---

## 📂 Important Files

### Frontend (New)
- `public/portal.html` - Main portal page
- `public/portal.js` - Portal functionality
- `public/portal-style.css` - Portal styling

### Backend (New/Updated)
- `models/Message.js` - Messaging system
- `models/Favorite.js` - Favorites system
- `routes/messageRoutes.js` - Message API
- `routes/favoriteRoutes.js` - Favorites API
- `middleware/auth.js` - Updated with protect middleware

### Legacy Files (Still Available)
- `public/index.html` - Original tenant page
- `public/landlord.html` - Original landlord page
- `public/admin.html` - Admin panel

---

## 🌐 Available URLs

### New Portal System
- **Main Portal**: http://localhost:5000/portal
- **Direct Tenant**: http://localhost:5000/tenant (redirects to portal)

### Legacy Pages (Still Work)
- **Original Home**: http://localhost:5000/
- **Original Landlord**: http://localhost:5000/landlord
- **Admin Panel**: http://localhost:5000/admin

---

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Check if MongoDB is running
net start MongoDB

# Check if port 5000 is available
netstat -ano | findstr :5000

# Kill any process using port 5000
taskkill /F /PID <process_id>
```

### Can't Login
- Verify phone number format: +263XXXXXXXXX
- Check MongoDB connection
- Clear browser cache and try again

### Properties Not Showing
- Ensure you're logged in
- Check browser console for errors
- Verify MongoDB has data

### Messages Not Working
- Both users must be registered
- Check authentication token
- Refresh the page

---

## 📊 Database Collections

The system uses these MongoDB collections:

1. **users** - User accounts (tenants & landlords)
2. **houses** - Property listings
3. **messages** - Communication between users
4. **favorites** - Tenant saved properties
5. **inquiries** - Legacy inquiry system

---

## 🎨 Customization

### Change Colors
Edit `public/portal-style.css`:
```css
:root {
    --primary-color: #667eea; /* Change this */
    --success-color: #28a745;
    --danger-color: #dc3545;
}
```

### Add More Filters
Edit `public/portal.js` in the `searchProperties()` function

### Modify Property Fields
Update `models/House.js` to add new fields

---

## 📈 Next Steps

1. **Test the System**: Create test accounts and try all features
2. **Add Real Data**: Create actual property listings
3. **Customize Design**: Adjust colors and layout to your preference
4. **Add Images**: Implement real image upload functionality
5. **Deploy**: Prepare for production deployment

---

## 🎉 Success!

Your RentHub system now has:
- ✅ Role-based authentication
- ✅ Separate tenant and landlord portals
- ✅ In-app messaging system
- ✅ Favorites functionality
- ✅ Enhanced security
- ✅ Modern, responsive UI

**Everything is ready to use!**

Start the server and visit: **http://localhost:5000/portal**

---

## 📞 Need Help?

Refer to:
- `PORTAL_SYSTEM_GUIDE.md` - Complete technical documentation
- `PHONE_VALIDATION.md` - Phone number validation details
- Browser console - For debugging errors
- MongoDB logs - For database issues

Happy renting! 🏠✨
