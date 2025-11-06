import express from "express";
import EventLog from "../models/EventLog.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/event-logs
 * Get all event logs (admin only)
 */
router.get("/", protect, authorize('admin'), async (req, res) => {
  try {
    const {
      eventType,
      status,
      userRole,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;
    
    // Build query
    const query = {};
    
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;
    if (userRole) query.userRole = userRole;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get logs with pagination
    const logs = await EventLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await EventLog.countDocuments(query);
    
    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching event logs:', error);
    res.status(500).json({ message: "Failed to fetch event logs" });
  }
});

/**
 * GET /api/event-logs/stats
 * Get event log statistics (admin only)
 */
router.get("/stats", protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get statistics
    const totalEvents = await EventLog.countDocuments(query);
    
    const eventsByType = await EventLog.aggregate([
      { $match: query },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const eventsByStatus = await EventLog.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const eventsByRole = await EventLog.aggregate([
      { $match: query },
      { $group: { _id: '$userRole', count: { $sum: 1 } } }
    ]);
    
    const recentEvents = await EventLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      stats: {
        totalEvents,
        eventsByType,
        eventsByStatus,
        eventsByRole,
        recentEvents
      }
    });
    
  } catch (error) {
    console.error('Error fetching event log stats:', error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

/**
 * GET /api/event-logs/my-activity
 * Get current user's activity logs
 */
router.get("/my-activity", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const logs = await EventLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await EventLog.countDocuments({ user: req.user._id });
    
    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

/**
 * DELETE /api/event-logs/old
 * Delete old event logs (admin only)
 */
router.delete("/old", protect, authorize('admin'), async (req, res) => {
  try {
    const { days = 90 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await EventLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old event logs`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error deleting old logs:', error);
    res.status(500).json({ message: "Failed to delete old logs" });
  }
});

export default router;
