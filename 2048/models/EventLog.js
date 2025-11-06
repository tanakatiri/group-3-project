import mongoose from "mongoose";

const eventLogSchema = new mongoose.Schema({
  // Event Details
  eventType: {
    type: String,
    required: true,
    enum: [
      // User events
      'user_registered',
      'user_login',
      'user_logout',
      'user_updated',
      'password_changed',
      'login_failed',
      
      // Property events
      'property_created',
      'property_updated',
      'property_deleted',
      'property_approved',
      'property_rejected',
      
      // Application events
      'application_submitted',
      'application_approved',
      'application_rejected',
      'application_cancelled',
      
      // Review events
      'review_submitted',
      'review_updated',
      'review_deleted',
      'review_response',
      
      // Message events
      'message_sent',
      'conversation_started',
      
      // Admin events
      'admin_action',
      'property_moderated',
      
      // System events
      'system_error',
      'suspicious_activity'
    ]
  },
  
  // User who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Some events might not have a user (system events)
  },
  
  userEmail: {
    type: String,
    required: false
  },
  
  userRole: {
    type: String,
    enum: ['tenant', 'landlord', 'admin', 'system'],
    required: false
  },
  
  // Target of the action (if applicable)
  targetType: {
    type: String,
    enum: ['user', 'property', 'application', 'review', 'message', 'system'],
    required: false
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  
  // Event details
  description: {
    type: String,
    required: true
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request information
  ipAddress: {
    type: String,
    required: false
  },
  
  userAgent: {
    type: String,
    required: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient queries
eventLogSchema.index({ eventType: 1, createdAt: -1 });
eventLogSchema.index({ user: 1, createdAt: -1 });
eventLogSchema.index({ status: 1, createdAt: -1 });
eventLogSchema.index({ createdAt: -1 });

// TTL index - automatically delete logs older than 90 days (optional)
// eventLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const EventLog = mongoose.model("EventLog", eventLogSchema);
export default EventLog;
