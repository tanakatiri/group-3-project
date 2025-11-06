// Role-Based Access Control Middleware

// Check if user has required role
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔒 RBAC middleware - Checking role authorization...');
    console.log('Required roles:', roles);
    console.log('User role:', req.user?.role);
    
    if (!req.user) {
      console.log('❌ No user object found');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Role not authorized');
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    console.log('✅ Role authorized');
    next();
  };
};

// Check if user is admin or superadmin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }

  next();
};

// Check if user is landlord
export const isLandlord = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'landlord') {
    return res.status(403).json({ 
      message: 'Access denied. Landlord privileges required.' 
    });
  }

  next();
};

// Check if user is tenant
export const isTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'tenant') {
    return res.status(403).json({ 
      message: 'Access denied. Tenant privileges required.' 
    });
  }

  next();
};

// Check if user owns the resource or is admin
export const isOwnerOrAdmin = async (Model, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Admins can access everything
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        return next();
      }

      // Check if user owns the resource
      const resourceId = req.params[resourceIdParam];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Check ownership (assuming resource has 'owner' field)
      if (resource.owner && resource.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: 'Access denied. You can only modify your own resources.' 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
