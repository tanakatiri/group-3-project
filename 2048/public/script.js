// API Base URL - Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

// State
let allHouses = [];
let filteredHouses = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadHouses();
  setupEventListeners();
  setupNameValidation();
});

// Setup Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const propertyType = document.getElementById('propertyType');
  const bedrooms = document.getElementById('bedrooms');
  const bathrooms = document.getElementById('bathrooms');
  const furnished = document.getElementById('furnished');
  const minRating = document.getElementById('minRating');
  const sortBy = document.getElementById('sortBy');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  const inquiryForm = document.getElementById('inquiryForm');

  searchInput.addEventListener('input', filterHouses);
  propertyType.addEventListener('change', filterHouses);
  bedrooms.addEventListener('change', filterHouses);
  bathrooms.addEventListener('change', filterHouses);
  furnished.addEventListener('change', filterHouses);
  minRating.addEventListener('change', filterHouses);
  sortBy.addEventListener('change', filterHouses);
  
  minPrice.addEventListener('input', (e) => {
    document.getElementById('minPriceValue').textContent = e.target.value;
    filterHouses();
  });
  
  maxPrice.addEventListener('input', (e) => {
    document.getElementById('maxPriceValue').textContent = e.target.value;
    filterHouses();
  });

  inquiryForm.addEventListener('submit', handleInquirySubmit);
}

// Clear all filters
function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('propertyType').value = 'all';
  document.getElementById('bedrooms').value = '';
  document.getElementById('bathrooms').value = '';
  document.getElementById('furnished').value = 'all';
  document.getElementById('minRating').value = '';
  document.getElementById('sortBy').value = 'newest';
  document.getElementById('minPrice').value = '0';
  document.getElementById('maxPrice').value = '5000';
  document.getElementById('minPriceValue').textContent = '0';
  document.getElementById('maxPriceValue').textContent = '5000';
  filterHouses();
}

// Load and animate stats
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/houses`);
    const houses = await response.json();
    
    // Count unique landlords (approximate based on unique landlord names)
    const uniqueLandlords = new Set(houses.map(h => h.landlordName)).size;
    
    // Animate counters
    animateValue('statsProperties', 0, houses.length, 2000);
    animateValue('statsLandlords', 0, uniqueLandlords, 2000);
    animateValue('statsTenants', 0, Math.floor(houses.length * 1.5), 2000); // Approximate
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Animate number counting
function animateValue(id, start, end, duration) {
  const element = document.getElementById(id);
  if (!element) return;
  
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      element.textContent = end;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Load Houses
async function loadHouses() {
  try {
    showLoading(true);
    await filterHouses(); // Use filterHouses to load with filters
  } catch (error) {
    console.error('Error loading houses:', error);
    showError('Failed to load properties. Please try again later.');
  } finally {
    showLoading(false);
  }
}

// Filter Houses - now fetches from backend with query parameters
async function filterHouses() {
  try {
    showLoading(true);
    
    // Build query parameters
    const params = new URLSearchParams();
    
    const search = document.getElementById('searchInput').value;
    const propertyType = document.getElementById('propertyType').value;
    const bedrooms = document.getElementById('bedrooms').value;
    const bathrooms = document.getElementById('bathrooms').value;
    const furnished = document.getElementById('furnished').value;
    const minRating = document.getElementById('minRating').value;
    const sortBy = document.getElementById('sortBy').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    if (search) params.append('search', search);
    if (propertyType && propertyType !== 'all') params.append('propertyType', propertyType);
    if (bedrooms) params.append('bedrooms', bedrooms);
    if (bathrooms) params.append('bathrooms', bathrooms);
    if (furnished && furnished !== 'all') params.append('furnished', furnished);
    if (minRating) params.append('minRating', minRating);
    if (sortBy) params.append('sortBy', sortBy);
    if (minPrice && minPrice !== '0') params.append('minPrice', minPrice);
    if (maxPrice && maxPrice !== '10000') params.append('maxPrice', maxPrice);
    
    const url = `${API_URL}/houses${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    filteredHouses = await response.json();
    
    displayHouses();
  } catch (error) {
    console.error('Error filtering houses:', error);
    showError('Failed to filter properties.');
  } finally {
    showLoading(false);
  }
}

// Display Houses
function displayHouses() {
  const houseList = document.getElementById('houseList');
  const noResults = document.getElementById('noResults');

  // Filter out unavailable properties (rented properties)
  const availableHouses = filteredHouses.filter(house => house.available !== false);

  if (availableHouses.length === 0) {
    houseList.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';
  houseList.innerHTML = availableHouses.map(house => createHouseCard(house)).join('');
}

// Generate star rating
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) stars += '⭐';
  if (hasHalfStar) stars += '⭐';
  for (let i = 0; i < emptyStars; i++) stars += '☆';
  
  return stars;
}

// Create House Card
function createHouseCard(house) {
  const rating = house.rating || { averageRating: 5.0, totalReviews: 0 };
  const stars = generateStarRating(rating.averageRating);

  return `
    <div class="house-card" onclick="showHouseDetail('${house._id}')">
      <img src="${house.image}" alt="${house.title}" class="house-image" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
      <div class="house-content">
        <div class="house-header">
          <div>
            <h3 class="house-title">${house.title}</h3>
          </div>
          <div class="house-price">
            $${house.price.toLocaleString()}
            <div class="house-price-label">/month</div>
          </div>
        </div>
        <div class="house-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${house.location}
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0; font-size: 0.9rem;">
          <span style="color: #f59e0b;">${stars}</span>
          <span style="color: #666;">
            ${rating.averageRating.toFixed(1)} (${rating.totalReviews} ${rating.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        <div class="house-features">
          <div class="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            ${house.bedrooms} Bed
          </div>
          <div class="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            ${house.bathrooms} Bath
          </div>
          ${house.area ? `
          <div class="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
            ${house.area} sqft
          </div>
          ` : ''}
        </div>
        <p class="house-description">${house.description}</p>
        <div class="house-footer">
          <button class="btn btn-primary" onclick="event.stopPropagation(); openInquiryModal('${house._id}', '${house.title}')" ${!house.available ? 'disabled' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Contact
          </button>
          <button class="btn btn-secondary" onclick="event.stopPropagation(); showHouseDetail('${house._id}')">
            Details
          </button>
        </div>
      </div>
    </div>
  `;
}

// Show House Detail
async function showHouseDetail(houseId) {
  try {
    const response = await fetch(`${API_URL}/houses/${houseId}`);
    const house = await response.json();
    
    const modal = document.getElementById('detailModal');
    const detailTitle = document.getElementById('detailTitle');
    const detailContent = document.getElementById('detailContent');

    detailTitle.textContent = house.title;
    detailContent.innerHTML = `
      <img src="${house.image}" alt="${house.title}" class="detail-image" onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
      
      <div class="detail-price">
        $${house.price.toLocaleString()}/month
        ${house.available 
          ? '<span class="availability-badge badge-available">Available</span>'
          : '<span class="availability-badge badge-unavailable">Rented</span>'}
      </div>

      <div class="detail-section">
        <h3>Location</h3>
        <div class="house-location">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${house.location}
        </div>
      </div>

      <div class="detail-section">
        <h3>Property Features</h3>
        <div class="detail-features">
          <div class="detail-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <div>
              <strong>${house.bedrooms}</strong> Bedrooms
            </div>
          </div>
          <div class="detail-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            <div>
              <strong>${house.bathrooms}</strong> Bathrooms
            </div>
          </div>
          ${house.area ? `
          <div class="detail-feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
            <div>
              <strong>${house.area}</strong> sqft
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="detail-section">
        <h3>Description</h3>
        <p>${house.description}</p>
      </div>

      <div class="detail-section">
        <h3>Landlord Information</h3>
        <div class="landlord-info">
          <p><strong>Name:</strong> ${house.landlordName}</p>
          ${house.landlordContact ? `<p><strong>Contact:</strong> ${house.landlordContact}</p>` : ''}
        </div>
      </div>

      ${house.available ? `
        <button class="btn btn-primary" onclick="closeDetailModal(); openInquiryModal('${house._id}', '${house.title}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Contact Landlord
        </button>
      ` : '<p style="color: var(--text-secondary); text-align: center;">This property is currently not available.</p>'}
    `;

    modal.classList.add('active');
  } catch (error) {
    console.error('Error loading house details:', error);
    showError('Failed to load property details.');
  }
}

// Close Detail Modal
function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}

// Open Inquiry Modal
function openInquiryModal(houseId, houseTitle) {
  // Check if user is logged in
  const authToken = localStorage.getItem('authToken');
  const currentUser = localStorage.getItem('currentUser');
  
  if (!authToken || !currentUser) {
    // User is not logged in - show signup modal
    showError('Please sign up or login to contact the landlord');
    openSignupModal();
    
    // Pre-select tenant role since they're looking to contact a landlord
    setTimeout(() => {
      const signupRoleSelect = document.getElementById('signupRole');
      if (signupRoleSelect) {
        signupRoleSelect.value = 'tenant';
      }
    }, 100);
    return;
  }
  
  // User is logged in - proceed with inquiry
  document.getElementById('inquiryHouseId').value = houseId;
  document.getElementById('inquiryModal').classList.add('active');
}

// Close Inquiry Modal
function closeInquiryModal() {
  document.getElementById('inquiryModal').classList.remove('active');
  document.getElementById('inquiryForm').reset();
}

// Validate Zimbabwe Phone Number
function validatePhoneNumber(phone) {
  const phoneRegex = /^\+263[0-9]{9}$/;
  return phoneRegex.test(phone);
}

// Handle Inquiry Submit
async function handleInquirySubmit(e) {
  e.preventDefault();

  const tenantPhone = document.getElementById('tenantPhone').value;
  
  // Validate phone number
  if (!validatePhoneNumber(tenantPhone)) {
    showError('Invalid number');
    return;
  }

  const inquiryData = {
    houseId: document.getElementById('inquiryHouseId').value,
    tenantName: document.getElementById('tenantName').value,
    tenantEmail: document.getElementById('tenantEmail').value,
    tenantPhone: tenantPhone,
    message: document.getElementById('inquiryMessage').value
  };

  try {
    const response = await fetch(`${API_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inquiryData)
    });

    if (response.ok) {
      showSuccess('Your inquiry has been sent successfully!');
      closeInquiryModal();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send inquiry');
    }
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    showError(error.message || 'Failed to send inquiry. Please try again.');
  }
}

// Show Loading
function showLoading(show) {
  document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
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
  const inquiryModal = document.getElementById('inquiryModal');
  const detailModal = document.getElementById('detailModal');
  
  if (event.target === inquiryModal) {
    closeInquiryModal();
  }
  if (event.target === detailModal) {
    closeDetailModal();
  }
  
  const signupModal = document.getElementById('signupModal');
  const loginModal = document.getElementById('loginModal');
  if (event.target === signupModal) {
    closeSignupModal();
  }
  if (event.target === loginModal) {
    closeLoginModal();
  }
}

// ============= Authentication Functions =============

// Open Signup Modal
function openSignupModal() {
  document.getElementById('signupModal').style.display = 'flex';
}

// Close Signup Modal
function closeSignupModal() {
  document.getElementById('signupModal').style.display = 'none';
  document.getElementById('signupForm').reset();
}

// Open Login Modal
function openLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

// Close Login Modal
function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('loginForm').reset();
}

// Setup real-time name validation
function setupNameValidation() {
  const fullNameInput = document.getElementById('signupFullName');
  const phoneInput = document.getElementById('signupPhone');
  
  if (fullNameInput) {
    fullNameInput.addEventListener('input', function() {
      const validation = validateName(this.value, 'Full name');
      if (this.value && !validation.valid) {
        this.setCustomValidity(validation.message);
      } else {
        this.setCustomValidity('');
      }
    });
  }
  
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      const validation = validateZimbabwePhone(this.value);
      if (this.value && !validation.valid) {
        this.setCustomValidity(validation.message);
      } else {
        this.setCustomValidity('');
      }
    });
  }
}

// Validate Zimbabwe phone number
function validateZimbabwePhone(phone) {
  const trimmedPhone = phone.trim();
  
  if (!trimmedPhone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Must start with +263
  if (!trimmedPhone.startsWith('+263')) {
    return { valid: false, message: 'Invalid number' };
  }
  
  // Zimbabwe mobile pattern: +263 followed by 71, 73, 77, or 78, then 7 more digits
  const zimbabwePhoneRegex = /^\+2637[1378][0-9]{7}$/;
  
  if (!zimbabwePhoneRegex.test(trimmedPhone)) {
    return { 
      valid: false, 
      message: 'Invalid number'
    };
  }
  
  // Identify the network
  let network = '';
  if (trimmedPhone.startsWith('+26371')) {
    network = 'NetOne';
  } else if (trimmedPhone.startsWith('+26373')) {
    network = 'Telecel';
  } else if (trimmedPhone.startsWith('+26377') || trimmedPhone.startsWith('+26378')) {
    network = 'Econet';
  }
  
  return { valid: true, value: trimmedPhone, network: network };
}

// Capitalize first letter of each word in a name
function capitalizeName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      // Handle hyphenated names (e.g., Anne-Marie)
      if (word.includes('-')) {
        return word.split('-').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join('-');
      }
      // Handle names with apostrophes (e.g., O'Connor)
      if (word.includes("'")) {
        return word.split("'").map((part, index) => {
          if (index === 0) return part.charAt(0).toUpperCase() + part.slice(1);
          // After apostrophe, capitalize if it's a name like O'Connor, but not if it's a possessive
          return part.length > 1 ? part.charAt(0).toUpperCase() + part.slice(1) : part;
        }).join("'");
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Validate name field (letters, spaces, hyphens, apostrophes only)
function validateName(name, fieldName) {
  const nameRegex = /^[A-Za-z\s\-']{2,50}$/;
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  // Require at least 2 names (first name + surname)
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
  if (nameParts.length < 2) {
    return { 
      valid: false, 
      message: `${fieldName} must include at least a first name and surname (e.g., Kahari Kyrie)` 
    };
  }
  
  if (!nameRegex.test(trimmedName)) {
    return { 
      valid: false, 
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes (2-50 characters)` 
    };
  }
  
  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(trimmedName)) {
    return { valid: false, message: `${fieldName} cannot contain multiple consecutive spaces` };
  }
  
  // Capitalize the name properly
  const capitalizedName = capitalizeName(trimmedName);
  
  return { valid: true, value: capitalizedName };
}

// Handle Signup
async function handleSignup(event) {
  event.preventDefault();
  
  const role = document.getElementById('signupRole').value;
  const fullName = document.getElementById('signupFullName').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;
  
  if (!role) {
    alert('Please select a role (Tenant or Landlord)');
    return;
  }
  
  // Validate full name
  const nameValidation = validateName(fullName, 'Full name');
  if (!nameValidation.valid) {
    alert(`❌ ${nameValidation.message}`);
    return;
  }
  
  // Validate phone number
  const phoneValidation = validateZimbabwePhone(phone);
  if (!phoneValidation.valid) {
    alert(`❌ ${phoneValidation.message}`);
    return;
  }
  
  // Use the validated and capitalized full name
  const name = nameValidation.value;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone, password, role })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`✅ Registration successful! Welcome ${name}!`);
      closeSignupModal();
      
      // Auto-login after signup
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      // Redirect based on role
      if (role === 'tenant' || role === 'landlord') {
        window.location.href = '/portal.html';
      }
    } else {
      alert(`❌ Registration failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('❌ Registration failed. Please try again.');
  }
}

// Handle Login
async function handleLogin(event) {
  event.preventDefault();
  
  const role = document.getElementById('loginRole').value;
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!role) {
    alert('Please select your role');
    return;
  }
  
  try {
    let endpoint = '';
    
    if (role === 'admin') {
      endpoint = `${API_URL}/admin/login`;
    } else {
      endpoint = `${API_URL}/auth/login`;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`✅ Login successful! Welcome back!`);
      closeLoginModal();
      
      // Store auth data
      if (role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        window.location.href = '/admin.html';
      } else {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = '/portal.html';
      }
    } else {
      alert(`❌ Login failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('❌ Login failed. Please try again.');
  }
}

// Make functions globally accessible
window.openSignupModal = openSignupModal;
window.closeSignupModal = closeSignupModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
