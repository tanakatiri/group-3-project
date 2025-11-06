import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House'
  },
  subject: {
    type: String,
    default: 'Property Inquiry'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  inquiryType: {
    type: String,
    enum: ['general', 'viewing', 'negotiation'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ to: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
