# House Renting System

A modern web-based house renting platform that connects landlords and tenants.

## Features

1. **Digitized Rental Process** - Online platform replacing traditional paper-based methods
2. **Accessible Platform** - Browse houses and manage listings from any device
3. **Efficient Data Management** - MongoDB for secure, fast data storage
4. **Simplified Communication** - Easy contact between landlords and tenants
5. **Secure & Scalable** - Built for growth and future feature expansion
6. **Analytics Dashboard** - Track listings and monitor inquiries
7. **User-Friendly Interface** - Modern, responsive design

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Modern CSS with animations

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure MongoDB:
   - For local MongoDB: Keep the default `.env` settings
   - For MongoDB Atlas: Update `MONGO_URI` in `.env` with your connection string

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env               # Environment variables
├── config/
│   └── db.js          # Database connection
├── models/
│   ├── House.js       # House model
│   └── Inquiry.js     # Inquiry model
├── routes/
│   ├── houseRoutes.js # House API routes
│   └── inquiryRoutes.js # Inquiry API routes
└── public/
    ├── index.html     # Main page
    ├── landlord.html  # Landlord dashboard
    ├── style.css      # Styles
    └── script.js      # Frontend logic
```

## API Endpoints

### Houses
- `GET /api/houses` - Get all houses
- `POST /api/houses` - Add a new house
- `PUT /api/houses/:id` - Update a house
- `DELETE /api/houses/:id` - Delete a house

### Inquiries
- `GET /api/inquiries` - Get all inquiries
- `POST /api/inquiries` - Submit an inquiry
- `DELETE /api/inquiries/:id` - Delete an inquiry

## Usage

### For Tenants
1. Browse available houses on the main page
2. Filter by location or price range
3. View detailed information about each property
4. Submit inquiries for properties of interest

### For Landlords
1. Access the landlord dashboard
2. Add new property listings
3. View and manage existing listings
4. Monitor tenant inquiries
5. Track occupancy and analytics

## 🚀 Deployment

This application is **production-ready** and can be deployed to multiple platforms!

### Quick Deploy Options

- **Render** (Recommended for beginners) - [Guide](QUICK_DEPLOY.md)
- **Railway** (Fastest deployment) - [Guide](QUICK_DEPLOY.md)
- **Vercel** (Serverless) - [Guide](QUICK_DEPLOY.md)
- **Docker** (Self-hosted) - [Guide](QUICK_DEPLOY.md)

### Deployment Documentation

- 📖 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide for all platforms
- ⚡ **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Fast-track deployment instructions
- ✅ **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** - Pre-deployment verification
- 📊 **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Overview of deployment options

### Interactive Deployment Scripts

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Environment Variables Required

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your-secure-random-string
NODE_ENV=production
PORT=5000
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## Future Enhancements
- User authentication and authorization
- Payment gateway integration
- Advanced search and filtering
- Image upload functionality
- Email notifications
- Booking system
- Reviews and ratings

## License
MIT
