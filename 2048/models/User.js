import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+263[0-9]{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Zimbabwe phone number! Format: +263 followed by 9 digits`
    }
  },
  role: {
    type: String,
    required: true,
    enum: ['landlord', 'tenant', 'admin'],
    default: 'tenant'
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: true // Auto-approve all users on signup
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  banned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: ''
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  bannedAt: {
    type: Date
  },
  // Tenant-specific preferences
  preferences: {
    preferredLocations: [String],
    maxBudget: Number,
    minBedrooms: Number,
    propertyTypes: [String]
  },
  // Landlord-specific fields
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House'
  }],
  // Tenant-specific fields
  inquiries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Favorite'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
