# 🏠 RentHub Portal System - Complete Guide

## Overview

The RentHub Portal System is a comprehensive role-based property rental platform with separate portals for tenants and landlords, featuring real-time messaging and favorites management.

---

## 🎯 Key Features

### 1. **Role-Based Access Control**
- **Tenant Portal**: Browse properties, save favorites, contact landlords
- **Landlord Portal**: Add/manage properties, view inquiries
- **Secure Authentication**: JWT-based with role verification

### 2. **Tenant Features**
- ✅ Property search with filters (location, price, bedrooms)
- ✅ Favorites system (save/remove properties)
- ✅ Property details view
- ✅ Direct messaging with landlords
- ✅ View all available properties

### 3. **Landlord Features**
- ✅ Add new properties with multiple images
- ✅ Manage existing properties (edit/delete)
- ✅ View property inquiries
- ✅ Respond to tenant messages
- ✅ Property availability toggle

### 4. **Communication System**
- ✅ In-app messaging between tenants and landlords
- ✅ Conversation history
- ✅ Unread message notifications
- ✅ Property-specific conversations

---

## 🚀 Getting Started

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start MongoDB**
```bash
net start MongoDB
```

3. **Start the Server**
```bash
npm start
```

4. **Access the Portal**
```
http://localhost:5000/portal
```

---

## 📋 User Flows

### For Tenants

1. **Register/Login**
   - Go to http://localhost:5000/portal
   - Click "Register" tab
   - Select "Find a Property (Tenant)"
   - Fill in details with Zimbabwe phone format (+263XXXXXXXXX)
   - Submit

2. **Browse Properties**
   - View all available properties
   - Use search filters (location, max price, bedrooms)
   - Click on property cards to view details

3. **Save Favorites**
   - Click the "🤍 Favorite" button on any property
   - Access favorites from "My Favorites" tab
   - Remove by clicking "❤️ Favorite" again

4. **Contact Landlord**
   - View property details
   - Click "Contact Landlord" button
   - Send message through messaging system

5. **Messaging**
   - Click "Messages" in navigation
   - View all conversations
   - Send/receive messages in real-time

### For Landlords

1. **Register/Login**
   - Go to http://localhost:5000/portal
   - Click "Register" tab
   - Select "List My Properties (Landlord)"
   - Fill in details with Zimbabwe phone format
   - Submit

2. **Add Property**
   - Click "Add Property" tab
   - Fill in property details:
     - Title, Location, Price
     - Bedrooms, Bathrooms, Area
     - Description
     - Upload images (optional)
   - Toggle "Available for rent"
   - Submit

3. **Manage Properties**
   - View all your properties in "My Properties" tab
   - Edit property details
   - Delete properties
   - Toggle availability

4. **View Inquiries**
   - Click "Inquiries" tab
   - See all tenant inquiries
   - View contact information

5. **Respond to Messages**
   - Click "Messages" in navigation
   - View conversations with tenants
   - Respond to inquiries

---

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String (+263XXXXXXXXX),
  role: 'tenant' | 'landlord' | 'admin',
  isProfileComplete: Boolean,
  preferences: {
    preferredLocations: [String],
    maxBudget: Number,
    minBedrooms: Number,
    propertyTypes: [String]
  },
  properties: [ObjectId],
  favorites: [ObjectId]
}
```

### House Model
```javascript
{
  title: String,
  location: String,
  price: Number,
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  images: [{
    url: String,
    filename: String,
    isPrimary: Boolean
  }],
  image: String (legacy),
  owner: ObjectId,
  description: String,
  landlordName: String,
  landlordContact: String (+263XXXXXXXXX),
  available: Boolean
}
```

### Message Model
```javascript
{
  from: ObjectId (User),
  to: ObjectId (User),
  property: ObjectId (House),
  subject: String,
  message: String,
  isRead: Boolean,
  inquiryType: 'general' | 'viewing' | 'negotiation',
  createdAt: Date
}
```

### Favorite Model
```javascript
{
  user: ObjectId (User),
  house: ObjectId (House),
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Houses
- `GET /api/houses` - Get all houses
- `GET /api/houses/:id` - Get single house
- `POST /api/houses` - Add new house (landlord only)
- `PUT /api/houses/:id` - Update house (landlord only)
- `DELETE /api/houses/:id` - Delete house (landlord only)

### Favorites
- `GET /api/favorites` - Get user's favorites (protected)
- `POST /api/favorites` - Add to favorites (protected)
- `DELETE /api/favorites/:houseId` - Remove from favorites (protected)
- `GET /api/favorites/check/:houseId` - Check if favorited (protected)

### Messages
- `GET /api/messages/conversations` - Get all conversations (protected)
- `GET /api/messages/:userId` - Get messages with specific user (protected)
- `POST /api/messages` - Send message (protected)
- `PUT /api/messages/:id/read` - Mark as read (protected)
- `DELETE /api/messages/:id` - Delete message (protected)
- `GET /api/messages/unread/count` - Get unread count (protected)

### Inquiries (Legacy)
- `GET /api/inquiries` - Get all inquiries
- `POST /api/inquiries` - Submit inquiry
- `DELETE /api/inquiries/:id` - Delete inquiry

---

## 🔐 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: 7-day token expiration
3. **Phone Validation**: Zimbabwe format (+263 + 9 digits)
4. **Protected Routes**: Middleware authentication
5. **Role-Based Access**: Separate tenant/landlord permissions

---

## 📱 Phone Number Validation

**Format Required**: `+263` followed by exactly 9 digits

**Valid Examples**:
- ✅ +263771234567
- ✅ +263712345678

**Invalid Examples**:
- ❌ 263771234567 (missing +)
- ❌ +26377123456 (only 8 digits)
- ❌ +263 77 123 4567 (contains spaces)

---

## 🎨 UI Components

### Navigation Bar
- Logo and branding
- Role-specific links
- User name display
- Logout button

### Tenant Portal
- Search bar with filters
- Property grid layout
- Favorite button on each card
- Property detail modal

### Landlord Portal
- Tabbed interface (Properties, Add, Inquiries)
- Property management cards
- Add property form
- Inquiry list view

### Messaging System
- Two-column layout
- Conversation list (left)
- Message thread (right)
- Message input form
- Unread indicators

---

## 🔧 Configuration

### Environment Variables (.env)
```
MONGO_URI=mongodb://localhost:27017/renthub
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### File Upload Settings
- **Location**: `public/uploads/`
- **Max Size**: 5MB per image
- **Allowed Types**: jpeg, jpg, png, gif, webp
- **Naming**: `property-{timestamp}-{random}.{ext}`

---

## 🧪 Testing the System

### Test Scenario 1: Tenant Flow
1. Register as tenant with phone +263771234567
2. Browse properties
3. Add 2 properties to favorites
4. View property details
5. Contact landlord via messaging
6. Check messages for response

### Test Scenario 2: Landlord Flow
1. Register as landlord with phone +263712345678
2. Add new property with all details
3. View property in "My Properties"
4. Check inquiries tab
5. Respond to tenant messages
6. Edit property availability

### Test Scenario 3: Communication
1. Tenant sends message about property
2. Landlord receives notification
3. Landlord responds
4. Tenant sees response
5. Conversation continues

---

## 📂 File Structure

```
CascadeProjects/2048/
├── models/
│   ├── User.js (updated with preferences)
│   ├── House.js (updated with images array)
│   ├── Message.js (new)
│   ├── Favorite.js (new)
│   └── Inquiry.js
├── routes/
│   ├── authRoutes.js
│   ├── houseRoutes.js
│   ├── messageRoutes.js (new)
│   ├── favoriteRoutes.js (new)
│   └── inquiryRoutes.js
├── middleware/
│   └── auth.js (updated with protect middleware)
├── config/
│   ├── db.js
│   └── upload.js (new)
├── public/
│   ├── portal.html (new)
│   ├── portal.js (new)
│   ├── portal-style.css (new)
│   ├── uploads/ (new directory)
│   └── [legacy files...]
└── server.js (updated with new routes)
```

---

## 🐛 Troubleshooting

### Issue: Cannot login
- **Solution**: Check phone number format (+263XXXXXXXXX)
- Verify MongoDB is running
- Check console for error messages

### Issue: Properties not loading
- **Solution**: Ensure MongoDB connection is active
- Check API_URL in portal.js
- Verify server is running on port 5000

### Issue: Messages not sending
- **Solution**: Verify authentication token is valid
- Check if both users exist
- Ensure protect middleware is working

### Issue: Favorites not working
- **Solution**: Must be logged in as tenant
- Check authentication token
- Verify favorite routes are registered

---

## 🚀 Future Enhancements

1. **Image Upload**: Implement actual file upload with multer
2. **Email Notifications**: Send emails for new messages
3. **Advanced Search**: Add more filters (property type, amenities)
4. **Reviews & Ratings**: Allow tenants to rate properties
5. **Payment Integration**: Add rent payment system
6. **Virtual Tours**: 360° property views
7. **Booking System**: Schedule property viewings
8. **Analytics Dashboard**: For landlords to track views/inquiries

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review console logs for errors
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Check phone number format validation

---

## ✅ System Status

- ✅ Authentication System
- ✅ Role-Based Access Control
- ✅ Tenant Portal
- ✅ Landlord Portal
- ✅ Messaging System
- ✅ Favorites System
- ✅ Phone Validation
- ✅ Property Management
- ✅ Responsive Design

**System is fully operational and ready for use!** 🎉
