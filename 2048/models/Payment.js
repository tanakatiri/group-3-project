import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Who is involved
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  landlord: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // What property/application
  property: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'House', 
    required: true 
  },
  application: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RentalApplication', 
    required: true 
  },
  
  // Payment details
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  paymentType: {
    type: String,
    enum: ['deposit', 'rent', 'other'],
    default: 'deposit'
  },
  paymentMethod: { 
    type: String, 
    enum: ['paynow', 'bank_transfer', 'cash', 'ecocash', 'onemoney'],
    default: 'bank_transfer'
  },
  
  // Payment proof
  paymentReference: {
    type: String,
    required: false
  },
  paymentProof: {
    url: String,
    filename: String
  },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['pending', 'held', 'released', 'rejected', 'refunded'], 
    default: 'pending'
  },
  
  // Notes
  tenantNotes: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  verifiedAt: {
    type: Date
  },
  releasedAt: { 
    type: Date 
  },
  refundedAt: {
    type: Date
  },
  
  // Who verified/released/refunded
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundReason: {
    type: String,
    default: ''
  }
});

// Indexes for efficient queries
paymentSchema.index({ tenant: 1, createdAt: -1 });
paymentSchema.index({ landlord: 1, createdAt: -1 });
paymentSchema.index({ application: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
