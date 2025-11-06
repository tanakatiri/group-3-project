import express from "express";
import Admin from "../models/Admin.js";
import House from "../models/House.js";
import Inquiry from "../models/Inquiry.js";
import { generateToken, verifyToken, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Register Admin
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create new admin
    const admin = new Admin({ username, email, password });
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if admin account is active
    if (admin.active === false) {
      return res.status(401).json({ message: "Admin account is inactive" });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Dashboard Stats (Protected)
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const totalHouses = await House.countDocuments();
    const availableHouses = await House.countDocuments({ available: true });
    const rentedHouses = await House.countDocuments({ available: false });
    const totalInquiries = await Inquiry.countDocuments();
    
    // Get recent inquiries
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('houseId', 'title location price');

    // Get all houses with landlord info
    const houses = await House.find().sort({ createdAt: -1 });

    // Group houses by landlord
    const landlordStats = {};
    houses.forEach(house => {
      const landlord = house.landlordName;
      if (!landlordStats[landlord]) {
        landlordStats[landlord] = {
          name: landlord,
          contact: house.landlordContact,
          totalProperties: 0,
          availableProperties: 0,
          rentedProperties: 0
        };
      }
      landlordStats[landlord].totalProperties++;
      if (house.available) {
        landlordStats[landlord].availableProperties++;
      } else {
        landlordStats[landlord].rentedProperties++;
      }
    });

    res.json({
      overview: {
        totalHouses,
        availableHouses,
        rentedHouses,
        totalInquiries
      },
      landlords: Object.values(landlordStats),
      recentInquiries,
      allHouses: houses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Admins (Protected - SuperAdmin only)
router.get("/admins", requireSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').populate('createdBy', 'username email');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create New Admin (SuperAdmin only)
router.post("/admins", requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email or username already exists" });
    }

    // Only superadmin can create other superadmins
    if (role === 'superadmin' && req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: "Only super admins can create other super admins" });
    }

    // Set permissions based on role
    const permissions = {
      manageUsers: true,
      manageProperties: true,
      manageAdmins: role === 'superadmin',
      viewLogs: true,
      systemSettings: role === 'superadmin'
    };

    const newAdmin = new Admin({
      username,
      email,
      password,
      role: role || 'admin',
      permissions,
      createdBy: req.adminId
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Admin (SuperAdmin only)
router.put("/admins/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, role, active, permissions } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent superadmin from demoting themselves
    if (admin._id.toString() === req.adminId.toString() && role === 'admin') {
      return res.status(400).json({ message: "Cannot demote yourself from super admin" });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof active !== 'undefined') updateData.active = active;
    if (permissions) updateData.permissions = permissions;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Admin (SuperAdmin only)
router.delete("/admins/:id", requireSuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent superadmin from deleting themselves
    if (admin._id.toString() === req.adminId.toString()) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Admin (SuperAdmin only)
router.get("/admins/:id", requireSuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'username email');
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Pending Landlords (Protected)
router.get("/pending-landlords", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const pendingLandlords = await User.find({ 
      role: 'landlord', 
      approved: false 
    }).select('-password');
    res.json(pendingLandlords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Landlord (Protected)
router.put("/approve-landlord/:id", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const landlord = await User.findById(req.params.id);
    
    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }
    
    if (landlord.role !== 'landlord') {
      return res.status(400).json({ message: "User is not a landlord" });
    }
    
    landlord.approved = true;
    landlord.approvedBy = req.adminId;
    landlord.approvedAt = new Date();
    await landlord.save();
    
    res.json({ message: "Landlord approved successfully", landlord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Landlord (Protected)
router.delete("/reject-landlord/:id", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const landlord = await User.findByIdAndDelete(req.params.id);
    
    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }
    
    res.json({ message: "Landlord rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Pending Properties (Protected)
router.get("/pending-properties", verifyToken, async (req, res) => {
  try {
    const pendingProperties = await House.find({ approved: false })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(pendingProperties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Property (Protected)
router.put("/approve-property/:id", verifyToken, async (req, res) => {
  try {
    const property = await House.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    property.approved = true;
    property.approvedBy = req.adminId;
    property.approvedAt = new Date();
    await property.save();
    
    res.json({ message: "Property approved successfully", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Property (Protected)
router.delete("/reject-property/:id", verifyToken, async (req, res) => {
  try {
    const property = await House.findByIdAndDelete(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json({ message: "Property rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Users (Protected)
router.get("/users", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single User (Protected)
router.get("/users/:id", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User (Protected)
router.put("/users/:id", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { name, email, phone, role, approved } = req.body;
    
    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^\+263[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          message: "Invalid phone number format. Use +263 followed by 9 digits" 
        });
      }
    }
    
    // Validate name if provided
    if (name) {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(name.trim())) {
        return res.status(400).json({ 
          message: "Invalid name. Please use only letters and spaces" 
        });
      }
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          message: "Invalid email address" 
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (typeof approved !== 'undefined') {
      updateData.approved = approved;
      if (approved) {
        updateData.approvedBy = req.adminId;
        updateData.approvedAt = new Date();
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete User (Protected)
router.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Also delete user's properties if landlord
    if (user.role === 'landlord') {
      await House.deleteMany({ owner: req.params.id });
    }
    
    res.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Properties (Protected)
router.get("/properties", verifyToken, async (req, res) => {
  try {
    const properties = await House.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Property (Protected)
router.get("/properties/:id", verifyToken, async (req, res) => {
  try {
    const property = await House.findById(req.params.id)
      .populate('owner', 'name email phone');
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Property (Protected)
router.put("/properties/:id", verifyToken, async (req, res) => {
  try {
    const property = await House.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json({ message: "Property updated successfully", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Property (Protected)
router.delete("/properties/:id", verifyToken, async (req, res) => {
  try {
    const property = await House.findByIdAndDelete(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Tenants Only (Protected)
router.get("/tenants", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const tenants = await User.find({ role: 'tenant' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Landlords Only (Protected)
router.get("/landlords", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const landlords = await User.find({ role: 'landlord' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(landlords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ban/Suspend User (Protected)
router.put("/users/:id/ban", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { banned, banReason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        banned: banned || false,
        banReason: banReason || '',
        bannedBy: banned ? req.adminId : null,
        bannedAt: banned ? new Date() : null
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: banned ? "User banned successfully" : "User unbanned successfully", 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Dashboard Statistics (Enhanced)
router.get("/dashboard-stats", verifyToken, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { default: Message } = await import('../models/Message.js');
    const { default: Favorite } = await import('../models/Favorite.js');
    
    const totalUsers = await User.countDocuments();
    const totalTenants = await User.countDocuments({ role: 'tenant' });
    const totalLandlords = await User.countDocuments({ role: 'landlord' });
    const pendingLandlords = await User.countDocuments({ role: 'landlord', approved: false });
    
    const totalProperties = await House.countDocuments();
    const approvedProperties = await House.countDocuments({ approved: true });
    const pendingProperties = await House.countDocuments({ approved: false });
    const availableProperties = await House.countDocuments({ available: true, approved: true });
    
    const totalMessages = await Message.countDocuments();
    const totalFavorites = await Favorite.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    
    res.json({
      users: {
        total: totalUsers,
        tenants: totalTenants,
        landlords: totalLandlords,
        pendingLandlords
      },
      properties: {
        total: totalProperties,
        approved: approvedProperties,
        pending: pendingProperties,
        available: availableProperties
      },
      activity: {
        messages: totalMessages,
        favorites: totalFavorites,
        inquiries: totalInquiries
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
