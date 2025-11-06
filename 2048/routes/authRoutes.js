import express from "express";
import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";
import { logUserEvent, logSecurityEvent } from "../utils/logger.js";

const router = express.Router();

// Register User (Landlord or Tenant)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate role
    if (!['landlord', 'tenant'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'landlord' or 'tenant'" });
    }

    // Validate name (letters and spaces only)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name || !nameRegex.test(name.trim())) {
      return res.status(400).json({ 
        message: "Invalid name. Please use only letters and spaces" 
      });
    }

    // Validate email format
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        message: "Invalid email address. Please enter a valid email" 
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+263[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        message: "Invalid phone number format. Please use +263 followed by 9 digits (e.g., +263771234567)" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new user
    const user = new User({ name, email, password, phone, role });
    await user.save();

    // Log registration event
    await logUserEvent('user_registered', user, `New ${role} registered: ${email}`, { role }, req);

    const token = generateToken(user._id);
    // Check if landlord needs approval
    const needsApproval = role === 'landlord' && !user.approved;

    res.status(201).json({
      message: needsApproval 
        ? "Registration successful! Your account is pending admin approval." 
        : "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        approved: user.approved
      },
      needsApproval
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email only
    const user = await User.findOne({ email });
    if (!user) {
      // Log failed login attempt
      await logSecurityEvent('login_failed', `Failed login attempt for email: ${email}`, { email }, req);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Log failed login attempt
      await logSecurityEvent('login_failed', `Failed login attempt for user: ${email}`, { email, userId: user._id }, req);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is approved (for landlords) - but allow login anyway for development
    if (user.role === 'landlord' && !user.approved) {
      console.log('⚠️ Landlord not approved, but allowing login for development');
      // In production, uncomment this:
      // return res.status(403).json({ 
      //   message: "Your account is pending admin approval. Please wait for approval before logging in." 
      // });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Log successful login
    await logUserEvent('user_login', user, `User logged in: ${email}`, { role: user.role }, req);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Current User Profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Validate JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get user by ID (for messaging)
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role phone');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
