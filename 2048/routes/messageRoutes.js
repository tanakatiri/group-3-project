import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth.js";
import { logMessageEvent } from "../utils/logger.js";

const router = express.Router();

// Get all conversations for a user
router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get unique conversation partners
    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }]
    })
    .populate('from', 'name email role')
    .populate('to', 'name email role')
    .populate('property', 'title location price')
    .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.from._id.toString() === userId.toString() 
        ? msg.to._id.toString() 
        : msg.from._id.toString();
      
      if (!conversations[partnerId]) {
        const partner = msg.from._id.toString() === userId.toString() ? msg.to : msg.from;
        conversations[partnerId] = {
          partner,
          lastMessage: msg,
          unreadCount: 0,
          messages: []
        };
      }
      
      conversations[partnerId].messages.push(msg);
      
      // Count unread messages
      if (msg.to._id.toString() === userId.toString() && !msg.isRead) {
        conversations[partnerId].unreadCount++;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages between two users
router.get("/:userId", protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId }
      ]
    })
    .populate('from', 'name email role')
    .populate('to', 'name email role')
    .populate('property', 'title location price image')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { from: otherUserId, to: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post("/", protect, async (req, res) => {
  try {
    const { to, property, subject, message, inquiryType } = req.body;

    const newMessage = new Message({
      from: req.user._id,
      to,
      property,
      subject,
      message,
      inquiryType
    });

    await newMessage.save();
    
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('from', 'name email role')
      .populate('to', 'name email role')
      .populate('property', 'title location price image');

    // Log message sent
    await logMessageEvent(
      'message_sent',
      req.user,
      newMessage._id,
      `Message sent to user`,
      { recipientId: to, propertyId: property }
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark message as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a message
router.delete("/:id", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.from.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread message count
router.get("/unread/count", protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      to: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
