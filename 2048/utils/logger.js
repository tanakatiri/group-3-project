import EventLog from '../models/EventLog.js';

/**
 * Log an event to the database
 * @param {Object} eventData - Event data to log
 * @returns {Promise<EventLog>}
 */
export const logEvent = async (eventData) => {
  try {
    const log = await EventLog.create({
      eventType: eventData.eventType,
      user: eventData.user || null,
      userEmail: eventData.userEmail || null,
      userRole: eventData.userRole || null,
      targetType: eventData.targetType || null,
      targetId: eventData.targetId || null,
      description: eventData.description,
      metadata: eventData.metadata || {},
      ipAddress: eventData.ipAddress || null,
      userAgent: eventData.userAgent || null,
      status: eventData.status || 'success'
    });
    
    console.log(`📝 Event logged: ${eventData.eventType} - ${eventData.description}`);
    return log;
  } catch (error) {
    console.error('❌ Error logging event:', error);
    // Don't throw error - logging should never break the application
    return null;
  }
};

/**
 * Helper functions for common events
 */

export const logUserEvent = async (eventType, user, description, metadata = {}, req = null) => {
  return logEvent({
    eventType,
    user: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    description,
    metadata,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.headers?.['user-agent']
  });
};

export const logPropertyEvent = async (eventType, user, propertyId, description, metadata = {}) => {
  return logEvent({
    eventType,
    user: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    targetType: 'property',
    targetId: propertyId,
    description,
    metadata
  });
};

export const logApplicationEvent = async (eventType, user, applicationId, description, metadata = {}) => {
  return logEvent({
    eventType,
    user: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    targetType: 'application',
    targetId: applicationId,
    description,
    metadata
  });
};

export const logReviewEvent = async (eventType, user, reviewId, description, metadata = {}) => {
  return logEvent({
    eventType,
    user: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    targetType: 'review',
    targetId: reviewId,
    description,
    metadata
  });
};

export const logMessageEvent = async (eventType, user, messageId, description, metadata = {}) => {
  return logEvent({
    eventType,
    user: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    targetType: 'message',
    targetId: messageId,
    description,
    metadata
  });
};

export const logSystemEvent = async (eventType, description, metadata = {}) => {
  return logEvent({
    eventType,
    userRole: 'system',
    description,
    metadata,
    status: eventType.includes('error') ? 'failure' : 'success'
  });
};

export const logSecurityEvent = async (eventType, description, metadata = {}, req = null) => {
  return logEvent({
    eventType,
    description,
    metadata,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.headers?.['user-agent'],
    status: 'warning'
  });
};
