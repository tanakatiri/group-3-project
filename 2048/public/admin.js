// API Base URL - Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

console.log('🔧 Admin.js loaded - v6.0 - Tenant & Landlord Management');

// Check if logged in
let token = localStorage.getItem('adminToken');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showDashboard();
    loadDashboardData();
  } else {
    showAuth();
  }
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      token = data.token;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      showSuccess('Login successful!');
      showDashboard();
      loadDashboardData();
    } else {
      showError(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Login failed. Please try again.');
  }
}

// Show Auth View
function showAuth() {
  document.getElementById('authView').style.display = 'flex';
  document.getElementById('dashboardView').style.display = 'none';
}

// Show Dashboard
function showDashboard() {
  document.getElementById('authView').style.display = 'none';
  document.getElementById('dashboardView').style.display = 'block';
}

// Logout
function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  token = null;
  showSuccess('Logged out successfully');
  // Redirect to landing page after a short delay
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 500);
}

// Store current data for downloads
let currentOverviewData = {};
let currentPropertiesData = [];
let currentInquiriesData = [];
let currentLandlordsData = [];
let currentTenantsData = [];
let currentPaymentsData = [];
let currentPaymentStatsData = {};
let currentPaymentSummaryData = [];
let currentLandlordPerformanceData = [];

// Load Dashboard Data
async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        return;
      }
      throw new Error('Failed to load dashboard data');
    }

    const data = await response.json();
    
    // Store data for downloads
    currentOverviewData = data.overview;
    currentPropertiesData = data.allHouses;
    currentInquiriesData = data.recentInquiries;
    
    // Update overview stats
    document.getElementById('totalHouses').textContent = data.overview.totalHouses;
    document.getElementById('availableHouses').textContent = data.overview.availableHouses;
    document.getElementById('rentedHouses').textContent = data.overview.rentedHouses;
    document.getElementById('totalInquiries').textContent = data.overview.totalInquiries;

    // Load and display landlords with full user data
    await loadLandlords();
    
    // Display all properties
    displayProperties(data.allHouses);
    
    // Display inquiries
    displayInquiries(data.recentInquiries);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data');
  }
}

// Load Landlords with full user data
async function loadLandlords() {
  try {
    const response = await fetch(`${API_URL}/admin/landlords`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const landlords = await response.json();
      currentLandlordsData = landlords;
      displayLandlords(landlords);
    }
  } catch (error) {
    console.error('Error loading landlords:', error);
  }
}

// Display Landlords
function displayLandlords(landlords) {
  const landlordsList = document.getElementById('landlordsList');
  
  console.log('👥 Displaying landlords:', landlords.length);
  
  if (landlords.length === 0) {
    landlordsList.innerHTML = '<div class="empty-state"><p>No landlords yet</p></div>';
    return;
  }

  landlordsList.innerHTML = landlords.map(landlord => {
    const approvalBadge = landlord.approved 
      ? '<span class="availability-badge badge-available">✅ Approved</span>'
      : '<span class="availability-badge badge-unavailable">⏳ Pending</span>';
    
    const bannedBadge = landlord.banned 
      ? '<span class="availability-badge badge-unavailable">🚫 Banned</span>'
      : '';
    
    return `
      <div class="landlord-card">
        <div class="landlord-header">
          <div>
            <div class="landlord-name">${landlord.name}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">
              📧 ${landlord.email}
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">
              📞 ${landlord.phone}
            </div>
            <div style="margin-top: 0.5rem;">
              ${approvalBadge} ${bannedBadge}
            </div>
          </div>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" onclick="editLandlord('${landlord._id}')" style="flex: 1;">✏️ Edit</button>
          <button class="btn btn-danger" onclick="deleteLandlord('${landlord._id}')" style="flex: 1;">🗑️ Delete</button>
          ${!landlord.banned ? `<button class="btn btn-danger" onclick="banLandlord('${landlord._id}')" style="flex: 1;">🚫 Ban</button>` : `<button class="btn btn-secondary" onclick="unbanLandlord('${landlord._id}')" style="flex: 1;">✅ Unban</button>`}
        </div>
      </div>
    `;
  }).join('');
  
  console.log('✅ Landlords displayed with management buttons');
}

// Display Properties
function displayProperties(houses) {
  const propertiesList = document.getElementById('propertiesList');
  
  console.log('📋 Displaying properties:', houses.length);
  
  if (houses.length === 0) {
    propertiesList.innerHTML = '<div class="empty-state"><p>No properties yet</p></div>';
    return;
  }

  propertiesList.innerHTML = houses.map(house => `
    <div class="listing-item">
      <img src="${house.image}" alt="${house.title}" class="listing-image" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
      <div class="listing-info">
        <h3>${house.title}</h3>
        <div class="listing-meta">
          <span>📍 ${house.location}</span>
          <span>💰 $${house.price.toLocaleString()}/month</span>
          <span>🛏️ ${house.bedrooms} bed</span>
          <span>🚿 ${house.bathrooms} bath</span>
          <span>👤 ${house.landlordName}</span>
          ${house.available 
            ? '<span class="availability-badge badge-available">Available</span>' 
            : '<span class="availability-badge badge-unavailable">Rented</span>'}
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" onclick="editProperty('${house._id}')" style="flex: 1;">✏️ Edit</button>
          <button class="btn btn-danger" onclick="deleteProperty('${house._id}')" style="flex: 1;">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
  
  console.log('✅ Properties displayed with Edit/Delete buttons');
}

// Store current editing property ID
let currentEditingPropertyId = null;

// Edit Property (Admin) - Open Modal
async function editProperty(propertyId) {
  try {
    const response = await fetch(`${API_URL}/admin/properties/${propertyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }

    const property = await response.json();
    currentEditingPropertyId = propertyId;
    
    // Populate form
    document.getElementById('editPropertyTitle').value = property.title;
    document.getElementById('editPropertyLocation').value = property.location;
    document.getElementById('editPropertyPrice').value = property.price;
    document.getElementById('editPropertyArea').value = property.area || '';
    document.getElementById('editPropertyBedrooms').value = property.bedrooms;
    document.getElementById('editPropertyBathrooms').value = property.bathrooms;
    document.getElementById('editPropertyDescription').value = property.description || '';
    document.getElementById('editPropertyLandlordName').value = property.landlordName || '';
    document.getElementById('editPropertyLandlordContact').value = property.landlordContact || '';
    document.getElementById('editPropertyAvailable').checked = property.available;
    
    // Show modal
    document.getElementById('editPropertyModal').style.display = 'flex';
  } catch (error) {
    console.error('Error loading property:', error);
    showError('Failed to load property details');
  }
}

// Submit Property Edit
async function submitPropertyEdit(e) {
  e.preventDefault();
  
  // Validate price
  const price = parseFloat(document.getElementById('editPropertyPrice').value);
  if (!price || isNaN(price) || price < 10 || price > 100000) {
    showError('Price must be between $10 and $100,000. Minimum $10 ensures legitimate listings and covers platform transaction costs.');
    return;
  }
  
  const updateData = {
    title: document.getElementById('editPropertyTitle').value,
    location: document.getElementById('editPropertyLocation').value,
    price: price,
    area: parseInt(document.getElementById('editPropertyArea').value) || undefined,
    bedrooms: parseInt(document.getElementById('editPropertyBedrooms').value),
    bathrooms: parseInt(document.getElementById('editPropertyBathrooms').value),
    description: document.getElementById('editPropertyDescription').value,
    landlordName: document.getElementById('editPropertyLandlordName').value,
    landlordContact: document.getElementById('editPropertyLandlordContact').value,
    available: document.getElementById('editPropertyAvailable').checked
  };
  
  try {
    const response = await fetch(`${API_URL}/admin/properties/${currentEditingPropertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      showSuccess('Property updated successfully!');
      closeEditPropertyModal();
      loadDashboardData();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to update property');
    }
  } catch (error) {
    console.error('Error updating property:', error);
    showError('Failed to update property');
  }
}

// Close Property Edit Modal
function closeEditPropertyModal() {
  document.getElementById('editPropertyModal').style.display = 'none';
  currentEditingPropertyId = null;
}

// Make modal functions globally accessible
window.submitPropertyEdit = submitPropertyEdit;
window.closeEditPropertyModal = closeEditPropertyModal;

// Delete Property (Admin)
async function deleteProperty(propertyId) {
  if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/properties/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      showSuccess('Property deleted successfully!');
      loadDashboardData();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to delete property');
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    showError('Failed to delete property');
  }
}

// Make functions globally accessible
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;

// ============= Landlord Management Functions =============

// Store current editing landlord ID
let currentEditingLandlordId = null;

// Edit Landlord - Open Modal
async function editLandlord(landlordId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${landlordId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch landlord');
    }

    const landlord = await response.json();
    currentEditingLandlordId = landlordId;
    
    // Populate form
    document.getElementById('editLandlordName').value = landlord.name;
    document.getElementById('editLandlordEmail').value = landlord.email;
    document.getElementById('editLandlordPhone').value = landlord.phone;
    document.getElementById('editLandlordRole').value = landlord.role;
    document.getElementById('editLandlordApproved').checked = landlord.approved;
    
    // Show modal
    document.getElementById('editLandlordModal').style.display = 'flex';
  } catch (error) {
    console.error('Error loading landlord:', error);
    showError('Failed to load landlord details');
  }
}

// Submit Landlord Edit
async function submitLandlordEdit(e) {
  e.preventDefault();
  
  const updateData = {
    name: document.getElementById('editLandlordName').value,
    email: document.getElementById('editLandlordEmail').value,
    phone: document.getElementById('editLandlordPhone').value,
    role: document.getElementById('editLandlordRole').value,
    approved: document.getElementById('editLandlordApproved').checked
  };
  
  try {
    const response = await fetch(`${API_URL}/admin/users/${currentEditingLandlordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      showSuccess('Landlord profile updated successfully!');
      closeEditLandlordModal();
      loadLandlords();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to update landlord');
    }
  } catch (error) {
    console.error('Error updating landlord:', error);
    showError('Failed to update landlord');
  }
}

// Close Landlord Edit Modal
function closeEditLandlordModal() {
  document.getElementById('editLandlordModal').style.display = 'none';
  currentEditingLandlordId = null;
}

// Make modal functions globally accessible
window.submitLandlordEdit = submitLandlordEdit;
window.closeEditLandlordModal = closeEditLandlordModal;

// Delete Landlord
async function deleteLandlord(landlordId) {
  if (!confirm('Are you sure you want to delete this landlord? This will also delete all their properties. This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/users/${landlordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      showSuccess('Landlord deleted successfully!');
      loadLandlords();
      loadDashboardData(); // Refresh to update property counts
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to delete landlord');
    }
  } catch (error) {
    console.error('Error deleting landlord:', error);
    showError('Failed to delete landlord');
  }
}

// Approve Landlord
async function approveLandlord(landlordId) {
  try {
    const response = await fetch(`${API_URL}/admin/approve-landlord/${landlordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      showSuccess('Landlord approved successfully!');
      loadLandlords();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to approve landlord');
    }
  } catch (error) {
    console.error('Error approving landlord:', error);
    showError('Failed to approve landlord');
  }
}

// Ban Landlord
async function banLandlord(landlordId) {
  const reason = prompt('Enter reason for banning this landlord:');
  if (reason === null) return; // User cancelled

  try {
    const response = await fetch(`${API_URL}/admin/users/${landlordId}/ban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        banned: true,
        banReason: reason
      })
    });

    if (response.ok) {
      showSuccess('Landlord banned successfully!');
      loadLandlords();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to ban landlord');
    }
  } catch (error) {
    console.error('Error banning landlord:', error);
    showError('Failed to ban landlord');
  }
}

// Unban Landlord
async function unbanLandlord(landlordId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${landlordId}/ban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        banned: false,
        banReason: ''
      })
    });

    if (response.ok) {
      showSuccess('Landlord unbanned successfully!');
      loadLandlords();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to unban landlord');
    }
  } catch (error) {
    console.error('Error unbanning landlord:', error);
    showError('Failed to unban landlord');
  }
}

// Make landlord functions globally accessible
window.editLandlord = editLandlord;
window.deleteLandlord = deleteLandlord;
window.approveLandlord = approveLandlord;
window.banLandlord = banLandlord;
window.unbanLandlord = unbanLandlord;

// ============= Tenant Management Functions =============

// Store current editing tenant ID
let currentEditingTenantId = null;

// Load Tenants
async function loadTenants() {
  try {
    const response = await fetch(`${API_URL}/admin/tenants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const tenants = await response.json();
      currentTenantsData = tenants;
      displayTenants(tenants);
    }
  } catch (error) {
    console.error('Error loading tenants:', error);
  }
}

// Display Tenants
function displayTenants(tenants) {
  const tenantsList = document.getElementById('tenantsList');
  
  console.log('👥 Displaying tenants:', tenants.length);
  
  if (tenants.length === 0) {
    tenantsList.innerHTML = '<div class="empty-state"><p>No tenants yet</p></div>';
    return;
  }

  tenantsList.innerHTML = tenants.map(tenant => {
    const approvalBadge = tenant.approved 
      ? '<span class="availability-badge badge-available">✅ Approved</span>'
      : '<span class="availability-badge badge-unavailable">⏳ Pending</span>';
    
    const bannedBadge = tenant.banned 
      ? '<span class="availability-badge badge-unavailable">🚫 Banned</span>'
      : '';
    
    return `
      <div class="landlord-card">
        <div class="landlord-header">
          <div>
            <div class="landlord-name">${tenant.name}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">
              📧 ${tenant.email}
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">
              📞 ${tenant.phone}
            </div>
            <div style="margin-top: 0.5rem;">
              ${approvalBadge} ${bannedBadge}
            </div>
          </div>
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" onclick="editTenant('${tenant._id}')" style="flex: 1;">✏️ Edit</button>
          <button class="btn btn-danger" onclick="deleteTenant('${tenant._id}')" style="flex: 1;">🗑️ Delete</button>
          ${!tenant.banned ? `<button class="btn btn-danger" onclick="banTenant('${tenant._id}')" style="flex: 1;">🚫 Ban</button>` : `<button class="btn btn-secondary" onclick="unbanTenant('${tenant._id}')" style="flex: 1;">✅ Unban</button>`}
        </div>
      </div>
    `;
  }).join('');
  
  console.log('✅ Tenants displayed with management buttons');
}

// Edit Tenant - Open Modal
async function editTenant(tenantId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${tenantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tenant');
    }

    const tenant = await response.json();
    currentEditingTenantId = tenantId;
    
    // Populate form
    document.getElementById('editTenantName').value = tenant.name;
    document.getElementById('editTenantEmail').value = tenant.email;
    document.getElementById('editTenantPhone').value = tenant.phone;
    document.getElementById('editTenantRole').value = tenant.role;
    document.getElementById('editTenantApproved').checked = tenant.approved;
    
    // Show modal
    document.getElementById('editTenantModal').style.display = 'flex';
  } catch (error) {
    console.error('Error loading tenant:', error);
    showError('Failed to load tenant details');
  }
}

// Submit Tenant Edit
async function submitTenantEdit(e) {
  e.preventDefault();
  
  const updateData = {
    name: document.getElementById('editTenantName').value,
    email: document.getElementById('editTenantEmail').value,
    phone: document.getElementById('editTenantPhone').value,
    role: document.getElementById('editTenantRole').value,
    approved: document.getElementById('editTenantApproved').checked
  };
  
  try {
    const response = await fetch(`${API_URL}/admin/users/${currentEditingTenantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      showSuccess('Tenant profile updated successfully!');
      closeEditTenantModal();
      loadTenants();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to update tenant');
    }
  } catch (error) {
    console.error('Error updating tenant:', error);
    showError('Failed to update tenant');
  }
}

// Close Tenant Edit Modal
function closeEditTenantModal() {
  document.getElementById('editTenantModal').style.display = 'none';
  currentEditingTenantId = null;
}

// Delete Tenant
async function deleteTenant(tenantId) {
  if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/users/${tenantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      showSuccess('Tenant deleted successfully!');
      loadTenants();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to delete tenant');
    }
  } catch (error) {
    console.error('Error deleting tenant:', error);
    showError('Failed to delete tenant');
  }
}

// Approve Tenant
async function approveTenant(tenantId) {
  try {
    const response = await fetch(`${API_URL}/admin/approve-tenant/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      showSuccess('Tenant approved successfully!');
      loadTenants();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to approve tenant');
    }
  } catch (error) {
    console.error('Error approving tenant:', error);
    showError('Failed to approve tenant');
  }
}

// Ban Tenant
async function banTenant(tenantId) {
  const reason = prompt('Enter reason for banning this tenant:');
  if (reason === null) return;

  try {
    const response = await fetch(`${API_URL}/admin/users/${tenantId}/ban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        banned: true,
        banReason: reason
      })
    });

    if (response.ok) {
      showSuccess('Tenant banned successfully!');
      loadTenants();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to ban tenant');
    }
  } catch (error) {
    console.error('Error banning tenant:', error);
    showError('Failed to ban tenant');
  }
}

// Unban Tenant
async function unbanTenant(tenantId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${tenantId}/ban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        banned: false,
        banReason: ''
      })
    });

    if (response.ok) {
      showSuccess('Tenant unbanned successfully!');
      loadTenants();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to unban tenant');
    }
  } catch (error) {
    console.error('Error unbanning tenant:', error);
    showError('Failed to unban tenant');
  }
}

// Make tenant functions globally accessible
window.submitTenantEdit = submitTenantEdit;
window.closeEditTenantModal = closeEditTenantModal;
window.editTenant = editTenant;
window.deleteTenant = deleteTenant;
window.approveTenant = approveTenant;
window.banTenant = banTenant;
window.unbanTenant = unbanTenant;

// Display Inquiries
function displayInquiries(inquiries) {
  const inquiriesList = document.getElementById('inquiriesList');
  
  if (inquiries.length === 0) {
    inquiriesList.innerHTML = '<div class="empty-state"><p>No inquiries yet</p></div>';
    return;
  }

  inquiriesList.innerHTML = inquiries.map(inquiry => {
    const date = new Date(inquiry.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const houseTitle = inquiry.houseId ? inquiry.houseId.title : 'Property Deleted';
    const houseLocation = inquiry.houseId ? inquiry.houseId.location : 'N/A';
    const housePrice = inquiry.houseId ? `$${inquiry.houseId.price.toLocaleString()}` : 'N/A';

    return `
      <div class="inquiry-item">
        <div class="inquiry-header">
          <div>
            <div class="inquiry-property">${houseTitle}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
              📍 ${houseLocation} | 💰 ${housePrice}
            </div>
            <div class="inquiry-tenant">${inquiry.tenantName}</div>
            <div class="inquiry-contact">
              📧 ${inquiry.tenantEmail} | 📞 ${inquiry.tenantPhone}
            </div>
          </div>
        </div>
        ${inquiry.message ? `<div class="inquiry-message">"${inquiry.message}"</div>` : ''}
        <div class="inquiry-date">Received: ${date}</div>
      </div>
    `;
  }).join('');
}

// Toggle Reports Dropdown Menu
function toggleReportsMenu(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('reportsDropdown');
  const isVisible = dropdown.style.display === 'block';
  dropdown.style.display = isVisible ? 'none' : 'block';
}

// Close Reports Menu
function closeReportsMenu() {
  document.getElementById('reportsDropdown').style.display = 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('reportsDropdown');
  if (dropdown && !event.target.closest('.tabs')) {
    closeReportsMenu();
  }
});

// Switch Dashboard Tab
function switchDashTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  document.getElementById(`${tabName}Tab`).classList.add('active');
  
  // Load data for the selected tab
  if (tabName === 'tenants') {
    loadTenants();
  } else if (tabName === 'payments') {
    loadPayments();
  }
}

// Show Error
function showError(message) {
  alert('Error: ' + message);
}

// Show Success
function showSuccess(message) {
  alert(message);
}

// ============= Payment Management =============

async function loadPayments() {
  try {
    const [paymentsRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/payments/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      }),
      fetch(`${API_URL}/payments/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
    ]);
    
    const payments = await paymentsRes.json();
    const stats = await statsRes.json();
    
    currentPaymentsData = payments;
    currentPaymentStatsData = stats;
    
    displayPaymentStats(stats);
    displayPayments(payments);
  } catch (error) {
    console.error('Error loading payments:', error);
    showError('Failed to load payments');
  }
}

function displayPaymentStats(stats) {
  const statsDiv = document.getElementById('paymentStats');
  statsDiv.innerHTML = `
    <div class="stat-box">
      <h3>${stats.total || 0}</h3>
      <p>Total Payments</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #FFA500;">
      <h3>${stats.pending || 0}</h3>
      <p>Pending</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #2196F3;">
      <h3>${stats.held || 0}</h3>
      <p>Held in Escrow</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #4CAF50;">
      <h3>${stats.released || 0}</h3>
      <p>Released</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #f44336;">
      <h3>${stats.rejected || 0}</h3>
      <p>Rejected</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #9C27B0;">
      <h3>${stats.refunded || 0}</h3>
      <p>Refunded</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #667eea;">
      <h3>$${stats.heldAmount || 0}</h3>
      <p>Held Amount</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #4CAF50;">
      <h3>$${stats.releasedAmount || 0}</h3>
      <p>Released Amount</p>
    </div>
    <div class="stat-box" style="border-left: 4px solid #9C27B0;">
      <h3>$${stats.refundedAmount || 0}</h3>
      <p>Refunded Amount</p>
    </div>
  `;
}

function displayPayments(payments) {
  const listDiv = document.getElementById('paymentsList');
  
  if (payments.length === 0) {
    listDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No payments yet</p>';
    return;
  }
  
  const statusColors = {
    pending: '#FFA500',
    held: '#2196F3',
    released: '#4CAF50',
    rejected: '#f44336',
    refunded: '#9C27B0'
  };
  
  const statusLabels = {
    pending: 'Pending Verification',
    held: 'Held in Escrow',
    released: 'Released',
    rejected: 'Rejected',
    refunded: 'Refunded to Tenant'
  };
  
  listDiv.innerHTML = payments.map(payment => `
    <div class="payment-card" style="background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 0.5rem 0;">${payment.property?.title || 'Property'}</h3>
          <p style="margin: 0; color: #666; font-size: 0.9rem;">📍 ${payment.property?.location || 'N/A'}</p>
          <div style="margin-top: 0.5rem; font-size: 0.9rem;">
            <strong>Tenant:</strong> ${payment.tenant?.name || 'N/A'} (${payment.tenant?.email || 'N/A'})<br>
            <strong>Landlord:</strong> ${payment.landlord?.name || 'N/A'} (${payment.landlord?.email || 'N/A'})
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">$${payment.amount}</div>
          <div style="font-size: 0.85rem; color: #666;">${payment.paymentType}</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; padding: 1rem; background: #f8f9fa; border-radius: 4px;">
        <div><strong>Method:</strong> ${payment.paymentMethod}</div>
        <div><strong>Reference:</strong> ${payment.paymentReference || 'N/A'}</div>
        <div><strong>Submitted:</strong> ${new Date(payment.createdAt).toLocaleString()}</div>
      </div>
      
      <div style="padding: 0.75rem; background: ${statusColors[payment.status]}20; border-left: 4px solid ${statusColors[payment.status]}; border-radius: 4px; margin-bottom: 1rem;">
        <strong style="color: ${statusColors[payment.status]};">Status: ${statusLabels[payment.status]}</strong>
        ${payment.verifiedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Verified: ${new Date(payment.verifiedAt).toLocaleString()}</p>` : ''}
        ${payment.releasedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Released: ${new Date(payment.releasedAt).toLocaleString()}</p>` : ''}
        ${payment.refundedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Refunded: ${new Date(payment.refundedAt).toLocaleString()}</p>` : ''}
        ${payment.refundReason ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;"><strong>Refund Reason:</strong> ${payment.refundReason}</p>` : ''}
        ${payment.adminNotes ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;"><strong>Admin Notes:</strong> ${payment.adminNotes}</p>` : ''}
      </div>
      
      ${payment.tenantNotes ? `
        <div style="margin-bottom: 1rem; padding: 0.75rem; background: #e3f2fd; border-radius: 4px; font-size: 0.9rem;">
          <strong>Tenant Notes:</strong> ${payment.tenantNotes}
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        ${payment.paymentProof ? `
          <a href="${payment.paymentProof.url}" target="_blank" class="btn btn-secondary" style="text-decoration: none;">
            📄 View Payment Proof
          </a>
        ` : ''}
        
        ${payment.status === 'pending' ? `
          <button onclick="verifyPayment('${payment._id}')" class="btn btn-primary">
            ✅ Verify & Hold
          </button>
          <button onclick="rejectPayment('${payment._id}')" class="btn btn-danger">
            ❌ Reject
          </button>
          <button onclick="refundPayment('${payment._id}')" class="btn" style="background: #9C27B0; color: white;">
            💸 Refund to Tenant
          </button>
        ` : ''}
        
        ${payment.status === 'held' ? `
          <button onclick="releasePayment('${payment._id}')" class="btn btn-success">
            💰 Release to Landlord
          </button>
          <button onclick="refundPayment('${payment._id}')" class="btn" style="background: #9C27B0; color: white;">
            💸 Refund to Tenant
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function verifyPayment(paymentId) {
  const notes = prompt('Admin notes (optional):');
  if (notes === null) return;
  
  try {
    const response = await fetch(`${API_URL}/payments/${paymentId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ adminNotes: notes || 'Payment verified' })
    });
    
    if (!response.ok) throw new Error('Failed to verify payment');
    
    showSuccess('Payment verified and held in escrow!');
    loadPayments();
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to verify payment');
  }
}

async function releasePayment(paymentId) {
  const notes = prompt('Admin notes (optional):');
  if (notes === null) return;
  
  if (!confirm('Release this payment to the landlord?')) return;
  
  try {
    const response = await fetch(`${API_URL}/payments/${paymentId}/release`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ adminNotes: notes || 'Payment released' })
    });
    
    if (!response.ok) throw new Error('Failed to release payment');
    
    showSuccess('Payment released to landlord!');
    loadPayments();
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to release payment');
  }
}

async function rejectPayment(paymentId) {
  const notes = prompt('Reason for rejection (required):');
  if (!notes) return;
  
  try {
    const response = await fetch(`${API_URL}/payments/${paymentId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ adminNotes: notes })
    });
    
    if (!response.ok) throw new Error('Failed to reject payment');
    
    showSuccess('Payment rejected!');
    loadPayments();
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to reject payment');
  }
}

async function refundPayment(paymentId) {
  const reason = prompt('Reason for refund (required):');
  if (!reason || reason.trim() === '') return;
  
  if (!confirm('Are you sure you want to refund this payment to the tenant? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/payments/${paymentId}/refund`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ refundReason: reason })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to refund payment');
    }
    
    showSuccess('Payment refunded to tenant successfully!');
    loadPayments();
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'Failed to refund payment');
  }
}

// ============= Download Functionality =============

// Helper function to convert array of objects to CSV
function convertToCSV(data, headers) {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'object') value = JSON.stringify(value);
      value = String(value).replace(/"/g, '""');
      return `"${value}"`;
    }).join(',');
  });
  
  return csvHeaders + '\n' + csvRows.join('\n');
}

// Helper function to trigger download
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download Overview Stats
function downloadOverviewStats(format) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const content = JSON.stringify(currentOverviewData, null, 2);
    downloadFile(content, `overview-stats-${timestamp}.json`, 'application/json');
    showSuccess('Overview statistics downloaded as JSON!');
  } else if (format === 'csv') {
    const data = [{
      'Total Properties': currentOverviewData.totalHouses || 0,
      'Available Properties': currentOverviewData.availableHouses || 0,
      'Rented Properties': currentOverviewData.rentedHouses || 0,
      'Total Inquiries': currentOverviewData.totalInquiries || 0
    }];
    const csv = convertToCSV(data, ['Total Properties', 'Available Properties', 'Rented Properties', 'Total Inquiries']);
    downloadFile(csv, `overview-stats-${timestamp}.csv`, 'text/csv');
    showSuccess('Overview statistics downloaded as CSV!');
  }
}

// Download Landlords Data
function downloadLandlordsData(format) {
  if (!currentLandlordsData || currentLandlordsData.length === 0) {
    showError('No landlords data available to download');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const content = JSON.stringify(currentLandlordsData, null, 2);
    downloadFile(content, `landlords-${timestamp}.json`, 'application/json');
    showSuccess(`Downloaded ${currentLandlordsData.length} landlords as JSON!`);
  } else if (format === 'csv') {
    const data = currentLandlordsData.map(landlord => ({
      'Name': landlord.name || '',
      'Email': landlord.email || '',
      'Phone': landlord.phone || '',
      'Approved': landlord.approved ? 'Yes' : 'No',
      'Banned': landlord.banned ? 'Yes' : 'No',
      'Created At': new Date(landlord.createdAt).toLocaleString()
    }));
    const csv = convertToCSV(data, ['Name', 'Email', 'Phone', 'Approved', 'Banned', 'Created At']);
    downloadFile(csv, `landlords-${timestamp}.csv`, 'text/csv');
    showSuccess(`Downloaded ${currentLandlordsData.length} landlords as CSV!`);
  }
}

// Download Tenants Data
function downloadTenantsData(format) {
  if (!currentTenantsData || currentTenantsData.length === 0) {
    showError('No tenants data available to download');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const content = JSON.stringify(currentTenantsData, null, 2);
    downloadFile(content, `tenants-${timestamp}.json`, 'application/json');
    showSuccess(`Downloaded ${currentTenantsData.length} tenants as JSON!`);
  } else if (format === 'csv') {
    const data = currentTenantsData.map(tenant => ({
      'Name': tenant.name || '',
      'Email': tenant.email || '',
      'Phone': tenant.phone || '',
      'Approved': tenant.approved ? 'Yes' : 'No',
      'Banned': tenant.banned ? 'Yes' : 'No',
      'Created At': new Date(tenant.createdAt).toLocaleString()
    }));
    const csv = convertToCSV(data, ['Name', 'Email', 'Phone', 'Approved', 'Banned', 'Created At']);
    downloadFile(csv, `tenants-${timestamp}.csv`, 'text/csv');
    showSuccess(`Downloaded ${currentTenantsData.length} tenants as CSV!`);
  }
}

// Download Properties Data
function downloadPropertiesData(format) {
  if (!currentPropertiesData || currentPropertiesData.length === 0) {
    showError('No properties data available to download');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const content = JSON.stringify(currentPropertiesData, null, 2);
    downloadFile(content, `properties-${timestamp}.json`, 'application/json');
    showSuccess(`Downloaded ${currentPropertiesData.length} properties as JSON!`);
  } else if (format === 'csv') {
    const data = currentPropertiesData.map(property => ({
      'Title': property.title || '',
      'Location': property.location || '',
      'Price': property.price || 0,
      'Bedrooms': property.bedrooms || 0,
      'Bathrooms': property.bathrooms || 0,
      'Area': property.area || '',
      'Available': property.available ? 'Yes' : 'No',
      'Landlord Name': property.landlordName || '',
      'Landlord Contact': property.landlordContact || '',
      'Created At': new Date(property.createdAt).toLocaleString()
    }));
    const csv = convertToCSV(data, ['Title', 'Location', 'Price', 'Bedrooms', 'Bathrooms', 'Area', 'Available', 'Landlord Name', 'Landlord Contact', 'Created At']);
    downloadFile(csv, `properties-${timestamp}.csv`, 'text/csv');
    showSuccess(`Downloaded ${currentPropertiesData.length} properties as CSV!`);
  }
}

// Download Inquiries Data
function downloadInquiriesData(format) {
  if (!currentInquiriesData || currentInquiriesData.length === 0) {
    showError('No inquiries data available to download');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const content = JSON.stringify(currentInquiriesData, null, 2);
    downloadFile(content, `inquiries-${timestamp}.json`, 'application/json');
    showSuccess(`Downloaded ${currentInquiriesData.length} inquiries as JSON!`);
  } else if (format === 'csv') {
    const data = currentInquiriesData.map(inquiry => ({
      'Tenant Name': inquiry.tenantName || '',
      'Tenant Email': inquiry.tenantEmail || '',
      'Tenant Phone': inquiry.tenantPhone || '',
      'Property Title': inquiry.houseId?.title || 'N/A',
      'Property Location': inquiry.houseId?.location || 'N/A',
      'Property Price': inquiry.houseId?.price || 'N/A',
      'Message': inquiry.message || '',
      'Date': new Date(inquiry.createdAt).toLocaleString()
    }));
    const csv = convertToCSV(data, ['Tenant Name', 'Tenant Email', 'Tenant Phone', 'Property Title', 'Property Location', 'Property Price', 'Message', 'Date']);
    downloadFile(csv, `inquiries-${timestamp}.csv`, 'text/csv');
    showSuccess(`Downloaded ${currentInquiriesData.length} inquiries as CSV!`);
  }
}

// ============= RENT PAYMENT SUMMARY REPORT =============

async function loadPaymentSummaryReport() {
  try {
    const response = await fetch(`${API_URL}/payments/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load payment summary');
    
    const payments = await response.json();
    currentPaymentSummaryData = payments;
    
    displayPaymentSummaryReport(payments);
  } catch (error) {
    console.error('Error loading payment summary:', error);
    showError('Failed to load payment summary report');
  }
}

function displayPaymentSummaryReport(payments) {
  const statsList = document.getElementById('paymentSummaryStats');
  const reportList = document.getElementById('paymentSummaryList');
  
  // Calculate summary statistics
  const totalPayments = payments.length;
  const releasedPayments = payments.filter(p => p.status === 'released').length;
  const heldPayments = payments.filter(p => p.status === 'held').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const rejectedPayments = payments.filter(p => p.status === 'rejected').length;
  const refundedPayments = payments.filter(p => p.status === 'refunded').length;
  const totalRevenue = payments
    .filter(p => p.status === 'released')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Display stats
  statsList.innerHTML = `
    <div class="stat-box">
      <h3>${totalPayments}</h3>
      <p>Total Payments</p>
    </div>
    <div class="stat-box">
      <h3 style="color: #10b981;">$${totalRevenue.toLocaleString()}</h3>
      <p>Total Revenue</p>
    </div>
    <div class="stat-box">
      <h3 style="color: #10b981;">${releasedPayments}</h3>
      <p>Released</p>
    </div>
    <div class="stat-box">
      <h3 style="color: #2196F3;">${heldPayments}</h3>
      <p>Held</p>
    </div>
    <div class="stat-box">
      <h3 style="color: #f59e0b;">${pendingPayments}</h3>
      <p>Pending</p>
    </div>
    <div class="stat-box">
      <h3 style="color: #ef4444;">${rejectedPayments}</h3>
      <p>Rejected</p>
    </div>
    <div class="stat-box">
      <h3 style="color: #9C27B0;">${refundedPayments}</h3>
      <p>Refunded</p>
    </div>
  `;
  
  // Display payment list
  if (payments.length === 0) {
    reportList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No payment records found</p>';
    return;
  }
  
  reportList.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 1rem; text-align: left;">Payment ID</th>
          <th style="padding: 1rem; text-align: left;">Tenant</th>
          <th style="padding: 1rem; text-align: left;">Landlord</th>
          <th style="padding: 1rem; text-align: left;">Property</th>
          <th style="padding: 1rem; text-align: right;">Amount</th>
          <th style="padding: 1rem; text-align: center;">Status</th>
          <th style="padding: 1rem; text-align: left;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${payments.map(payment => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 1rem;">#${payment._id.slice(-8)}</td>
            <td style="padding: 1rem;">${payment.tenant?.name || 'N/A'}</td>
            <td style="padding: 1rem;">${payment.landlord?.name || 'N/A'}</td>
            <td style="padding: 1rem;">${payment.property?.title || 'N/A'}</td>
            <td style="padding: 1rem; text-align: right; font-weight: 600;">$${(payment.amount || 0).toLocaleString()}</td>
            <td style="padding: 1rem; text-align: center;">
              <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 500;
                background: ${
                  payment.status === 'released' ? '#d1fae5' : 
                  payment.status === 'held' ? '#cfe2ff' : 
                  payment.status === 'pending' ? '#fef3c7' : 
                  payment.status === 'refunded' ? '#e8d4f8' :
                  '#fee2e2'
                };
                color: ${
                  payment.status === 'released' ? '#065f46' : 
                  payment.status === 'held' ? '#084298' : 
                  payment.status === 'pending' ? '#92400e' : 
                  payment.status === 'refunded' ? '#6a1b9a' :
                  '#991b1b'
                };">
                ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </td>
            <td style="padding: 1rem;">${new Date(payment.createdAt).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function downloadPaymentSummaryReport(format) {
  if (!currentPaymentSummaryData || currentPaymentSummaryData.length === 0) {
    showError('No payment summary data available to download');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const content = JSON.stringify(currentPaymentSummaryData, null, 2);
    downloadFile(content, `payment-summary-report-${timestamp}.json`, 'application/json');
    showSuccess('Payment Summary Report downloaded as JSON!');
  } else if (format === 'csv') {
    const data = currentPaymentSummaryData.map(payment => ({
      'Payment ID': payment._id,
      'Tenant Name': payment.tenant?.name || 'N/A',
      'Tenant Email': payment.tenant?.email || 'N/A',
      'Landlord Name': payment.landlord?.name || 'N/A',
      'Landlord Email': payment.landlord?.email || 'N/A',
      'Property Title': payment.property?.title || 'N/A',
      'Property Location': payment.property?.location || 'N/A',
      'Amount': payment.amount || 0,
      'Status': payment.status,
      'Payment Date': new Date(payment.createdAt).toLocaleString(),
      'Approved/Rejected Date': payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : 'N/A'
    }));
    const csv = convertToCSV(data, ['Payment ID', 'Tenant Name', 'Tenant Email', 'Landlord Name', 'Landlord Email', 'Property Title', 'Property Location', 'Amount', 'Status', 'Payment Date', 'Approved/Rejected Date']);
    downloadFile(csv, `payment-summary-report-${timestamp}.csv`, 'text/csv');
    showSuccess(`Downloaded ${currentPaymentSummaryData.length} payment records as CSV!`);
  }
}

// ============= LANDLORD PERFORMANCE REPORT =============

async function loadLandlordPerformanceReport() {
  try {
    const [landlordsRes, propertiesRes, inquiriesRes, paymentsRes] = await Promise.all([
      fetch(`${API_URL}/admin/landlords`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_URL}/houses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_URL}/inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_URL}/payments/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);
    
    const landlords = await landlordsRes.json();
    const properties = await propertiesRes.json();
    const inquiries = await inquiriesRes.json();
    const payments = await paymentsRes.json();
    
    // Build performance data for each landlord
    const performanceData = landlords.map(landlord => {
      const landlordProperties = properties.filter(p => p.owner === landlord._id || (p.owner?._id === landlord._id) || p.landlordName === landlord.name);
      const totalProperties = landlordProperties.length;
      const availableProperties = landlordProperties.filter(p => p.available !== false).length;
      const rentedProperties = totalProperties - availableProperties;
      
      // Count inquiries for this landlord's properties
      const propertyIds = landlordProperties.map(p => p._id);
      const landlordInquiries = inquiries.filter(inq => 
        propertyIds.includes(inq.houseId) || inq.houseId?._id && propertyIds.includes(inq.houseId._id)
      );
      
      // Count payments for this landlord
      const landlordPayments = payments.filter(p => 
        p.landlord?._id === landlord._id || p.landlord === landlord._id
      );
      const releasedPayments = landlordPayments.filter(p => p.status === 'released');
      const totalRevenue = releasedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      return {
        landlordId: landlord._id,
        name: landlord.name,
        email: landlord.email,
        phone: landlord.phone,
        approved: landlord.approved,
        banned: landlord.banned,
        totalProperties,
        availableProperties,
        rentedProperties,
        totalInquiries: landlordInquiries.length,
        totalPayments: landlordPayments.length,
        releasedPayments: releasedPayments.length,
        totalRevenue,
        joinedDate: new Date(landlord.createdAt).toLocaleString()
      };
    });
    
    currentLandlordPerformanceData = performanceData;
    displayLandlordPerformanceReport(performanceData);
  } catch (error) {
    console.error('Error loading landlord performance:', error);
    showError('Failed to load landlord performance report');
  }
}

function displayLandlordPerformanceReport(performanceData) {
  const reportList = document.getElementById('landlordPerformanceList');
  
  if (performanceData.length === 0) {
    reportList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No landlord data found</p>';
    return;
  }
  
  // Sort by total revenue (descending)
  const sortedData = [...performanceData].sort((a, b) => b.totalRevenue - a.totalRevenue);
  
  reportList.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 1rem; text-align: left;">Landlord</th>
          <th style="padding: 1rem; text-align: center;">Properties</th>
          <th style="padding: 1rem; text-align: center;">Available</th>
          <th style="padding: 1rem; text-align: center;">Rented</th>
          <th style="padding: 1rem; text-align: center;">Inquiries</th>
          <th style="padding: 1rem; text-align: center;">Payments</th>
          <th style="padding: 1rem; text-align: right;">Revenue</th>
          <th style="padding: 1rem; text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${sortedData.map(landlord => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 1rem;">
              <div style="font-weight: 600;">${landlord.name}</div>
              <div style="font-size: 0.875rem; color: #666;">${landlord.email}</div>
            </td>
            <td style="padding: 1rem; text-align: center; font-weight: 600;">${landlord.totalProperties}</td>
            <td style="padding: 1rem; text-align: center; color: #10b981;">${landlord.availableProperties}</td>
            <td style="padding: 1rem; text-align: center; color: #6366f1;">${landlord.rentedProperties}</td>
            <td style="padding: 1rem; text-align: center;">${landlord.totalInquiries}</td>
            <td style="padding: 1rem; text-align: center;">
              <span style="font-weight: 600;">${landlord.releasedPayments}</span>
              <span style="color: #666;">/${landlord.totalPayments}</span>
            </td>
            <td style="padding: 1rem; text-align: right; font-weight: 600; color: #10b981;">$${landlord.totalRevenue.toLocaleString()}</td>
            <td style="padding: 1rem; text-align: center;">
              ${landlord.banned ? 
                '<span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; background: #fee2e2; color: #991b1b;">Banned</span>' :
                landlord.approved ?
                '<span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; background: #d1fae5; color: #065f46;">Active</span>' :
                '<span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; background: #fef3c7; color: #92400e;">Pending</span>'
              }
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function downloadLandlordPerformanceReport(format) {
  if (!currentLandlordPerformanceData || currentLandlordPerformanceData.length === 0) {
    showError('No landlord performance data available to download');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const content = JSON.stringify(currentLandlordPerformanceData, null, 2);
    downloadFile(content, `landlord-performance-report-${timestamp}.json`, 'application/json');
    showSuccess('Landlord Performance Report downloaded as JSON!');
  } else if (format === 'csv') {
    const data = currentLandlordPerformanceData.map(landlord => ({
      'Landlord ID': landlord.landlordId,
      'Name': landlord.name,
      'Email': landlord.email,
      'Phone': landlord.phone,
      'Total Properties': landlord.totalProperties,
      'Available Properties': landlord.availableProperties,
      'Rented Properties': landlord.rentedProperties,
      'Total Inquiries': landlord.totalInquiries,
      'Total Payments': landlord.totalPayments,
      'Released Payments': landlord.releasedPayments,
      'Total Revenue': landlord.totalRevenue,
      'Account Status': landlord.banned ? 'Banned' : landlord.approved ? 'Active' : 'Pending',
      'Joined Date': landlord.joinedDate
    }));
    const csv = convertToCSV(data, ['Landlord ID', 'Name', 'Email', 'Phone', 'Total Properties', 'Available Properties', 'Rented Properties', 'Total Inquiries', 'Total Payments', 'Released Payments', 'Total Revenue', 'Account Status', 'Joined Date']);
    downloadFile(csv, `landlord-performance-report-${timestamp}.csv`, 'text/csv');
    showSuccess(`Downloaded ${currentLandlordPerformanceData.length} landlord performance records as CSV!`);
  }
}

// Make download functions globally accessible
window.downloadOverviewStats = downloadOverviewStats;
window.downloadLandlordsData = downloadLandlordsData;
window.downloadTenantsData = downloadTenantsData;
window.downloadPropertiesData = downloadPropertiesData;
window.downloadInquiriesData = downloadInquiriesData;
window.downloadPaymentSummaryReport = downloadPaymentSummaryReport;
window.downloadLandlordPerformanceReport = downloadLandlordPerformanceReport;

// Store current report type for download
let pendingDownloadReport = null;

// Show Download Options
async function showDownloadOptions(reportType) {
  const reportNames = {
    'overview': 'Platform Overview Stats',
    'landlords': 'Landlords Data',
    'tenants': 'Tenants Data',
    'properties': 'Properties Data',
    'inquiries': 'Inquiries Data',
    'payments': 'Payments Data',
    'paymentSummary': 'Payment Summary Report',
    'landlordPerformance': 'Landlord Performance Report'
  };
  
  const reportName = reportNames[reportType] || 'Report';
  pendingDownloadReport = reportType;
  
  // Show modal
  document.getElementById('downloadReportName').textContent = `Download "${reportName}"`;
  
  // Load data first for reports that need it
  if (reportType === 'paymentSummary' && (!currentPaymentSummaryData || currentPaymentSummaryData.length === 0)) {
    try {
      const response = await fetch(`${API_URL}/payments/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      currentPaymentSummaryData = await response.json();
    } catch (error) {
      showError('Failed to load payment summary data');
      return;
    }
  }
  
  if (reportType === 'landlordPerformance' && (!currentLandlordPerformanceData || currentLandlordPerformanceData.length === 0)) {
    try {
      const [landlordsRes, propertiesRes, inquiriesRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/admin/landlords`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/houses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/inquiries`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/payments/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const landlords = await landlordsRes.json();
      const properties = await propertiesRes.json();
      const inquiries = await inquiriesRes.json();
      const payments = await paymentsRes.json();
      
      // Build performance data
      currentLandlordPerformanceData = landlords.map(landlord => {
        const landlordProperties = properties.filter(p => p.owner === landlord._id || (p.owner?._id === landlord._id) || p.landlordName === landlord.name);
        const totalProperties = landlordProperties.length;
        const availableProperties = landlordProperties.filter(p => p.available !== false).length;
        const rentedProperties = totalProperties - availableProperties;
        
        const propertyIds = landlordProperties.map(p => p._id);
        const landlordInquiries = inquiries.filter(inq => 
          propertyIds.includes(inq.houseId) || inq.houseId?._id && propertyIds.includes(inq.houseId._id)
        );
        
        const landlordPayments = payments.filter(p => 
          p.landlordId?._id === landlord._id || p.landlordId === landlord._id
        );
        const approvedPayments = landlordPayments.filter(p => p.status === 'approved');
        const totalRevenue = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        return {
          landlordId: landlord._id,
          name: landlord.name,
          email: landlord.email,
          phone: landlord.phone,
          approved: landlord.approved,
          banned: landlord.banned,
          totalProperties,
          availableProperties,
          rentedProperties,
          totalInquiries: landlordInquiries.length,
          totalPayments: landlordPayments.length,
          approvedPayments: approvedPayments.length,
          totalRevenue,
          joinedDate: new Date(landlord.createdAt).toLocaleString()
        };
      });
    } catch (error) {
      showError('Failed to load landlord performance data');
      return;
    }
  }
  
  // Show the download format modal
  document.getElementById('downloadFormatModal').style.display = 'flex';
}

// Confirm Download with selected format
function confirmDownload(format) {
  const reportType = pendingDownloadReport;
  
  // Close modal
  closeDownloadModal();
  
  // Call the appropriate download function
  switch(reportType) {
    case 'overview':
      downloadOverviewStats(format);
      break;
    case 'landlords':
      downloadLandlordsData(format);
      break;
    case 'tenants':
      downloadTenantsData(format);
      break;
    case 'properties':
      downloadPropertiesData(format);
      break;
    case 'inquiries':
      downloadInquiriesData(format);
      break;
    case 'paymentSummary':
      downloadPaymentSummaryReport(format);
      break;
    case 'landlordPerformance':
      downloadLandlordPerformanceReport(format);
      break;
    default:
      showError('Unknown report type');
  }
  
  pendingDownloadReport = null;
}

// Close Download Modal
function closeDownloadModal() {
  document.getElementById('downloadFormatModal').style.display = 'none';
  pendingDownloadReport = null;
}

// Make menu functions globally accessible
window.toggleReportsMenu = toggleReportsMenu;
window.closeReportsMenu = closeReportsMenu;
window.showDownloadOptions = showDownloadOptions;
window.confirmDownload = confirmDownload;
window.closeDownloadModal = closeDownloadModal;
