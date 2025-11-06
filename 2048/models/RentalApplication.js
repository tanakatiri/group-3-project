import mongoose from "mongoose";

const rentalApplicationSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  moveInDate: {
    type: Date,
    required: true
  },
  leaseDuration: {
    type: Number, // in months
    required: true,
    min: 1
  },
  message: {
    type: String,
    default: ""
  },
  // Tenant information
  tenantInfo: {
    numberOfOccupants: Number,
    hasPets: Boolean,
    petDetails: String, // Type and number of pets
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    additionalNotes: String
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

// Update the updatedAt timestamp before saving
rentalApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const RentalApplication = mongoose.model("RentalApplication", rentalApplicationSchema);
export default RentalApplication;
