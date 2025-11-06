// Frontend Role-Based Access Control Helper

// Check if user has required role
function hasRole(user, ...roles) {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
}

// Check if user is tenant
function isTenant(user) {
  return user && user.role === 'tenant';
}

// Check if user is landlord
function isLandlord(user) {
  return user && user.role === 'landlord';
}

// Check if user is admin
function isAdmin(user) {
  return user && (user.role === 'admin' || user.role === 'superadmin');
}

// Redirect user based on role
function redirectBasedOnRole(user) {
  if (!user) {
    window.location.href = '/portal.html';
    return;
  }

  const currentPath = window.location.pathname;

  // Admin trying to access non-admin pages
  if (isAdmin(user) && !currentPath.includes('admin.html')) {
    window.location.href = '/admin.html';
    return;
  }

  // Non-admin trying to access admin pages
  if (!isAdmin(user) && currentPath.includes('admin.html')) {
    showError('Access denied. Admin privileges required.');
    window.location.href = '/portal.html';
    return;
  }
}

// Show/hide elements based on role
function applyRoleBasedUI(user) {
  if (!user) return;

  // Hide landlord features from tenants
  if (isTenant(user)) {
    const landlordElements = document.querySelectorAll('[data-role="landlord"]');
    landlordElements.forEach(el => el.style.display = 'none');
  }

  // Hide tenant features from landlords
  if (isLandlord(user)) {
    const tenantElements = document.querySelectorAll('[data-role="tenant"]');
    tenantElements.forEach(el => el.style.display = 'none');
  }

  // Show admin-only elements
  if (isAdmin(user)) {
    const adminElements = document.querySelectorAll('[data-role="admin"]');
    adminElements.forEach(el => el.style.display = 'block');
  }
}

// Check if user can perform action on resource
function canModifyResource(user, resourceOwnerId) {
  if (!user) return false;
  
  // Admins can modify everything
  if (isAdmin(user)) return true;
  
  // Users can only modify their own resources
  return user._id === resourceOwnerId || user.id === resourceOwnerId;
}

// Show error message
function showError(message) {
  alert('Error: ' + message);
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
  window.RBAC = {
    hasRole,
    isTenant,
    isLandlord,
    isAdmin,
    redirectBasedOnRole,
    applyRoleBasedUI,
    canModifyResource
  };
}
