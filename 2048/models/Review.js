import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  verified: {
    type: Boolean,
    default: false
  },
  // Landlord response
  response: {
    comment: String,
    respondedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
reviewSchema.index({ property: 1, tenant: 1 }, { unique: true }); // One review per tenant per property
reviewSchema.index({ property: 1, createdAt: -1 }); // Get property reviews sorted by date
reviewSchema.index({ tenant: 1 }); // Get tenant's reviews

// Update timestamp on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
