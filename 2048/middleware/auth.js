import jwt from "jsonwebtoken";

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set in environment variables!');
  console.warn('⚠️  Using default secret for development only.');
  console.warn('⚠️  NEVER use this in production!');
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate JWT token
export const generateToken = (userId, role = 'user') => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token middleware
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    // Keep backward compatibility
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Verify Admin role
export const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Verify Landlord role
export const verifyLandlord = (req, res, next) => {
  if (req.userRole !== 'landlord') {
    return res.status(403).json({ message: 'Access denied. Landlord only.' });
  }
  next();
};

// Verify Tenant role
export const verifyTenant = (req, res, next) => {
  if (req.userRole !== 'tenant') {
    return res.status(403).json({ message: 'Access denied. Tenant only.' });
  }
  next();
};

// Protect route - requires authentication
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Import User model
    const UserModule = await import('../models/User.js');
    const User = UserModule.default || UserModule;
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is banned
    if (user.banned) {
      return res.status(403).json({ message: 'Account has been banned' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    
    next();
  };
};

// Middleware to check if admin is superadmin
export const requireSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const AdminModule = await import('../models/Admin.js');
    const Admin = AdminModule.default || AdminModule;
    
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }
    
    if (admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
    }
    
    if (!admin.active) {
      return res.status(403).json({ message: 'Admin account is inactive' });
    }
    
    req.admin = admin;
    req.adminId = admin._id;
    next();
  } catch (error) {
    console.error('SuperAdmin auth error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Protect route - supports both User and Admin authentication
export const protectAny = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Try User model first
    const UserModule = await import('../models/User.js');
    const User = UserModule.default || UserModule;
    let user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      if (user.banned) {
        return res.status(403).json({ message: 'Account has been banned' });
      }
      req.user = user;
      req.userId = user._id;
      return next();
    }
    
    // Try Admin model if User not found
    const AdminModule = await import('../models/Admin.js');
    const Admin = AdminModule.default || AdminModule;
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (admin) {
      if (admin.active === false) {
        return res.status(403).json({ message: 'Admin account is inactive' });
      }
      
      req.user = {
        _id: admin._id,
        email: admin.email,
        name: admin.username,
        role: admin.role
      };
      req.userId = admin._id;
      req.admin = admin;
      return next();
    }
    
    return res.status(401).json({ message: 'User or Admin not found' });
  } catch (error) {
    console.error('ProtectAny auth error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
