import mongoose from "mongoose";

const houseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  rentPeriod: {
    type: String,
    enum: ['day', 'month'],
    default: 'month' // Default to monthly rent
  },
  // Pricing structure
  pricing: {
    dailyRate: {
      type: Number,
      default: function() { 
        // If rent is per month, divide by 30 to get daily rate
        // If rent is per day, use the price directly
        return this.rentPeriod === 'day' ? this.price : this.price / 30;
      }
    },
    weeklyDiscount: {
      type: Number,
      default: 10, // 10% discount for weekly rentals
      min: 0,
      max: 100
    },
    monthlyDiscount: {
      type: Number,
      default: 20, // 20% discount for monthly rentals
      min: 0,
      max: 100
    },
    cleaningFee: {
      type: Number,
      default: 50
    },
    securityDeposit: {
      type: Number,
      default: function() { return this.price; } // Default to one month rent
    },
    minimumStay: {
      type: Number,
      default: 1, // Minimum 1 day
      min: 1
    },
    maximumStay: {
      type: Number,
      default: 365, // Maximum 1 year
      min: 1
    }
  },
  bedrooms: {
    type: Number,
    default: 1
  },
  bathrooms: {
    type: Number,
    default: 1
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'cottage', 'room', 'studio', 'townhouse', 'flat'],
    default: 'house'
  },
  furnished: {
    type: Boolean,
    default: false
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    filename: String,
    isPrimary: { type: Boolean, default: false }
  }],
  // Legacy support for single image
  image: { 
    type: String,
    required: [true, 'At least one image is required for the property']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: { 
    type: String,
    default: "Beautiful house available for rent"
  },
  landlordName: {
    type: String,
    default: "Property Owner"
  },
  landlordContact: {
    type: String,
    default: "",
    validate: {
      validator: function(v) {
        // Allow empty string for default, but if provided must match format
        return !v || /^\+263[0-9]{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Zimbabwe phone number! Format: +263 followed by 9 digits`
    }
  },
  available: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: true // Auto-approve properties on creation
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  // Reviews and Ratings
  rating: {
    averageRating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const House = mongoose.model("House", houseSchema);
export default House;
