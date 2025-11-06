// API Base URL - Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

// State
let houses = [];
let inquiries = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  setupEventListeners();
});

// Validate Zimbabwe Phone Number
function validatePhoneNumber(phone) {
  const phoneRegex = /^\+263[0-9]{9}$/;
  return phoneRegex.test(phone);
}

// Setup Event Listeners
function setupEventListeners() {
  const addHouseForm = document.getElementById('addHouseForm');
  const editHouseForm = document.getElementById('editHouseForm');

  addHouseForm.addEventListener('submit', handleAddHouse);
  editHouseForm.addEventListener('submit', handleEditHouse);
}

// Load Dashboard Data
async function loadDashboardData() {
  await Promise.all([loadHouses(), loadInquiries()]);
  updateStats();
}

// Load Houses
async function loadHouses() {
  try {
    const response = await fetch(`${API_URL}/houses`);
    houses = await response.json();
    displayListings();
  } catch (error) {
    console.error('Error loading houses:', error);
    showError('Failed to load listings.');
  }
}

// Load Inquiries
async function loadInquiries() {
  try {
    const response = await fetch(`${API_URL}/inquiries`);
    inquiries = await response.json();
    displayInquiries();
  } catch (error) {
    console.error('Error loading inquiries:', error);
    showError('Failed to load inquiries.');
  }
}

// Update Stats
function updateStats() {
  const totalListings = houses.length;
  const availableListings = houses.filter(h => h.available).length;
  const totalInquiries = inquiries.length;

  document.getElementById('totalListings').textContent = totalListings;
  document.getElementById('availableListings').textContent = availableListings;
  document.getElementById('totalInquiries').textContent = totalInquiries;
}

// Display Listings
function displayListings() {
  const myListings = document.getElementById('myListings');

  if (houses.length === 0) {
    myListings.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
        <h3>No listings yet</h3>
        <p>Add your first property to get started</p>
      </div>
    `;
    return;
  }

  myListings.innerHTML = houses.map(house => `
    <div class="listing-item">
      <img src="${house.image}" alt="${house.title}" class="listing-image" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
      <div class="listing-info">
        <h3>${house.title}</h3>
        <div class="listing-meta">
          <span>📍 ${house.location}</span>
          <span>💰 $${house.price.toLocaleString()}/month</span>
          <span>🛏️ ${house.bedrooms} bed</span>
          <span>🚿 ${house.bathrooms} bath</span>
          ${house.area ? `<span>📐 ${house.area} sqft</span>` : ''}
          <span>${house.available 
            ? '<span class="availability-badge badge-available">Available</span>' 
            : '<span class="availability-badge badge-unavailable">Rented</span>'}</span>
        </div>
      </div>
      <div class="listing-actions">
        <button class="btn btn-secondary btn-sm" onclick="openEditModal('${house._id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteHouse('${house._id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Display Inquiries
function displayInquiries() {
  const inquiriesList = document.getElementById('inquiriesList');

  if (inquiries.length === 0) {
    inquiriesList.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <h3>No inquiries yet</h3>
        <p>Inquiries from potential tenants will appear here</p>
      </div>
    `;
    return;
  }

  inquiriesList.innerHTML = inquiries.map(inquiry => {
    const date = new Date(inquiry.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="inquiry-item">
        <div class="inquiry-header">
          <div>
            <div class="inquiry-property">${inquiry.houseId ? inquiry.houseId.title : 'Property'}</div>
            <div class="inquiry-tenant">${inquiry.tenantName}</div>
            <div class="inquiry-contact">
              📧 ${inquiry.tenantEmail} | 📞 ${inquiry.tenantPhone}
            </div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="deleteInquiry('${inquiry._id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        ${inquiry.message ? `<div class="inquiry-message">"${inquiry.message}"</div>` : ''}
        <div class="inquiry-date">Received: ${date}</div>
      </div>
    `;
  }).join('');
}

// Handle Add House
async function handleAddHouse(e) {
  e.preventDefault();

  const landlordContact = document.getElementById('landlordContact').value;
  
  // Validate phone number
  if (!validatePhoneNumber(landlordContact)) {
    showError('Invalid number');
    return;
  }

  // Validate price
  const priceInput = document.getElementById('price');
  const priceError = document.getElementById('priceError');
  const price = parseFloat(priceInput.value);
  
  if (!price || isNaN(price) || price < 10 || price > 100000) {
    priceError.textContent = 'Price must be between $10 and $100,000. Minimum $10 ensures legitimate listings and covers platform transaction costs.';
    priceError.style.display = 'block';
    priceInput.focus();
    return;
  }
  priceError.style.display = 'none';

  // Validate image URL
  const imageInput = document.getElementById('image');
  const imageUrl = imageInput.value.trim();
  
  if (!imageUrl) {
    showError('Please provide an image URL for your property');
    imageInput.focus();
    return;
  }

  const houseData = {
    title: document.getElementById('title').value,
    location: document.getElementById('location').value,
    price: price,
    bedrooms: parseInt(document.getElementById('bedrooms').value) || 1,
    bathrooms: parseInt(document.getElementById('bathrooms').value) || 1,
    image: imageUrl,
    description: document.getElementById('description').value,
    landlordName: document.getElementById('landlordName').value,
    landlordContact: landlordContact,
    available: document.getElementById('available').checked
  };

  try {
    const response = await fetch(`${API_URL}/houses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(houseData)
    });

    if (response.ok) {
      showSuccess('Property added successfully!');
      e.target.reset();
      await loadDashboardData();
      switchTab('listings');
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add property');
    }
  } catch (error) {
    console.error('Error adding house:', error);
    showError(error.message || 'Failed to add property. Please try again.');
  }
}

// Open Edit Modal
async function openEditModal(houseId) {
  try {
    const response = await fetch(`${API_URL}/houses/${houseId}`);
    const house = await response.json();

    document.getElementById('editHouseId').value = house._id;
    document.getElementById('editTitle').value = house.title;
    document.getElementById('editLocation').value = house.location;
    document.getElementById('editPrice').value = house.price;
    document.getElementById('editBedrooms').value = house.bedrooms;
    document.getElementById('editBathrooms').value = house.bathrooms;
    document.getElementById('editImage').value = house.image;
    document.getElementById('editDescription').value = house.description;
    document.getElementById('editLandlordName').value = house.landlordName;
    document.getElementById('editLandlordContact').value = house.landlordContact;
    document.getElementById('editAvailable').checked = house.available;

    document.getElementById('editModal').classList.add('active');
  } catch (error) {
    console.error('Error loading house for edit:', error);
    showError('Failed to load property details.');
  }
}

// Close Edit Modal
function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
  document.getElementById('editHouseForm').reset();
}

// Handle Edit House
async function handleEditHouse(e) {
  e.preventDefault();

  const landlordContact = document.getElementById('editLandlordContact').value;
  
  // Validate phone number
  if (!validatePhoneNumber(landlordContact)) {
    showError('Invalid number');
    return;
  }

  // Validate price
  const editPriceInput = document.getElementById('editPrice');
  const editPriceError = document.getElementById('editPriceError');
  const editPrice = parseFloat(editPriceInput.value);
  
  if (!editPrice || isNaN(editPrice) || editPrice < 10 || editPrice > 100000) {
    editPriceError.textContent = 'Price must be between $10 and $100,000. Minimum $10 ensures legitimate listings and covers platform transaction costs.';
    editPriceError.style.display = 'block';
    editPriceInput.focus();
    return;
  }
  editPriceError.style.display = 'none';

  // Validate image URL
  const editImageInput = document.getElementById('editImage');
  const editImageUrl = editImageInput.value.trim();
  
  if (!editImageUrl) {
    showError('Please provide an image URL for your property');
    editImageInput.focus();
    return;
  }

  const houseId = document.getElementById('editHouseId').value;
  const houseData = {
    title: document.getElementById('editTitle').value,
    location: document.getElementById('editLocation').value,
    price: editPrice,
    bedrooms: parseInt(document.getElementById('editBedrooms').value),
    bathrooms: parseInt(document.getElementById('editBathrooms').value),
    image: editImageUrl,
    description: document.getElementById('editDescription').value,
    landlordName: document.getElementById('editLandlordName').value,
    landlordContact: landlordContact,
    available: document.getElementById('editAvailable').checked
  };

  try {
    const response = await fetch(`${API_URL}/houses/${houseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(houseData)
    });

    if (response.ok) {
      showSuccess('Property updated successfully!');
      closeEditModal();
      await loadDashboardData();
    } else {
      throw new Error('Failed to update property');
    }
  } catch (error) {
    console.error('Error updating house:', error);
    showError('Failed to update property. Please try again.');
  }
}

// Delete House
async function deleteHouse(houseId) {
  if (!confirm('Are you sure you want to delete this property?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/houses/${houseId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showSuccess('Property deleted successfully!');
      await loadDashboardData();
    } else {
      throw new Error('Failed to delete property');
    }
  } catch (error) {
    console.error('Error deleting house:', error);
    showError('Failed to delete property. Please try again.');
  }
}

// Delete Inquiry
async function deleteInquiry(inquiryId) {
  if (!confirm('Are you sure you want to delete this inquiry?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/inquiries/${inquiryId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showSuccess('Inquiry deleted successfully!');
      await loadDashboardData();
    } else {
      throw new Error('Failed to delete inquiry');
    }
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    showError('Failed to delete inquiry. Please try again.');
  }
}

// Switch Tab
function switchTab(tabName) {
  // Remove active class from all tabs and content
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Add active class to selected tab and content
  event.target.classList.add('active');
  document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Show Error
function showError(message) {
  alert(message);
}

// Show Success
function showSuccess(message) {
  alert(message);
}

// Close modals on outside click
window.onclick = function(event) {
  const editModal = document.getElementById('editModal');
  
  if (event.target === editModal) {
    closeEditModal();
  }
}
