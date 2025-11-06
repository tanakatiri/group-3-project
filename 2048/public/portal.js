// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

// State Management
let currentUser = null;
let authToken = null;
let allProperties = [];
let favorites = [];
let conversations = [];
let currentConversation = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Check if user should see register tab (coming from landing page signup)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'register' || window.location.hash === '#register') {
    // Switch to register tab
    setTimeout(() => {
      const registerBtn = document.querySelector('.tab-btn:not(.active)');
      if (registerBtn) {
        registerBtn.click();
      }
    }, 100);
  }
});

// ============= DYNAMIC MENU SYSTEM =============

function renderDynamicMenu(user) {
  const menuContainer = document.getElementById('dynamicMenuContainer');
  const staticNavbar = document.getElementById('staticNavbar');
  
  if (!user || !menuContainer) return;
  
  // Hide static navbar when logged in
  if (staticNavbar) {
    staticNavbar.style.display = 'none';
  }
  
  // Menu items configuration based on role
  const menuConfig = {
    tenant: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { id: 'browse', label: 'Browse Properties', icon: '🔍' },
      { id: 'applications', label: 'My Applications', icon: '📝' },
      { id: 'payments', label: 'My Payments', icon: '💳' },
      { id: 'favorites', label: 'Favorites', icon: '❤️' },
      { id: 'messages', label: 'Messages', icon: '✉️' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ],
    landlord: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { id: 'properties', label: 'My Properties', icon: '🏢' },
      { id: 'add-property', label: 'Add Property', icon: '➕' },
      { id: 'applications', label: 'Applications', icon: '📋' },
      { id: 'payments', label: 'Payments', icon: '💰' },
      { id: 'messages', label: 'Messages', icon: '✉️' },
      { id: 'reviews', label: 'Reviews', icon: '⭐' },
      { id: 'profile', label: 'Profile', icon: '👤' },
    ]
  };
  
  const menuItems = menuConfig[user.role] || [];
  
  // Create menu HTML
  const menuHTML = `
    <nav class="dynamic-menu" style="
      background: linear-gradient(90deg, 
        rgba(37, 99, 235, 0.95) 0%, 
        rgba(30, 64, 175, 0.95) 100%);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0;
      backdrop-filter: blur(10px);
    ">
      <div class="menu-container" style="
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 2rem;
        flex-wrap: wrap;
      ">
        <!-- Logo -->
        <div class="menu-logo" style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h1 style="margin: 0; font-size: 1.8rem; font-weight: bold; color: white;">RentHub</h1>
        </div>

        <!-- User Profile & Logout -->
        <div class="menu-user" style="
          display: flex;
          align-items: center;
          gap: 1rem;
        ">
          <div class="user-info" style="
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            color: white;
          ">
            <span class="user-name" style="font-weight: 600; font-size: 0.95rem;">${user.name || 'User'}</span>
            <span class="user-role" style="
              font-size: 0.75rem;
              opacity: 0.9;
              text-transform: capitalize;
              background: rgba(255, 255, 255, 0.2);
              padding: 0.2rem 0.6rem;
              border-radius: 12px;
            ">${user.role || 'Guest'}</span>
          </div>
          <button onclick="handleLogout()" class="logout-btn" style="
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          ">🚪 Logout</button>
        </div>
      </div>
    </nav>
  `;
  
  menuContainer.innerHTML = menuHTML;
  
  // Add hover effect for logout button
  addLogoutHoverEffect();
}

function addLogoutHoverEffect() {
  const logoutBtn = document.querySelector('.logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'white';
      e.currentTarget.style.color = '#2563eb';
      e.currentTarget.style.transform = 'translateY(-2px)';
    });
    logoutBtn.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
      e.currentTarget.style.color = 'white';
      e.currentTarget.style.transform = 'translateY(0)';
    });
  }
}

function hideDynamicMenu() {
  const menuContainer = document.getElementById('dynamicMenuContainer');
  const staticNavbar = document.getElementById('staticNavbar');
  
  if (menuContainer) {
    menuContainer.innerHTML = '';
  }
  
  if (staticNavbar) {
    staticNavbar.style.display = 'block';
  }
}

// ============= Authentication =============

async function checkAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  
  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
    
    // Verify token is still valid by checking with server
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token invalid or user not found - clear and show login
        console.log('⚠️ Token invalid or user not found in database. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        authToken = null;
        currentUser = null;
        showSection('auth');
        showError('Your session has expired. Please login again.');
        return;
      }
      
      // Token valid, update user data
      const userData = await response.json();
      currentUser = userData;
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      updateNavigation();
      showUserPortal();
    } catch (error) {
      console.error('Error verifying token:', error);
      // On error, clear session and show login
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      authToken = null;
      currentUser = null;
      showSection('auth');
      showError('Session verification failed. Please login again.');
    }
  } else {
    showSection('auth');
  }
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  if (tab === 'login') {
    document.getElementById('loginTab').classList.add('active');
    event.target.classList.add('active');
  } else {
    document.getElementById('registerTab').classList.add('active');
    event.target.classList.add('active');
  }
}

// Set role for registration
function setRole(role) {
  document.getElementById('regRole').value = role;
}

// Validate name (letters, spaces, hyphens and apostrophes only)
function validateName(name) {
  const nameRegex = /^[A-Za-z\s\-']{2,50}$/;
  const trimmedName = name.trim();
  
  if (!trimmedName) return false;
  if (!nameRegex.test(trimmedName)) return false;
  
  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(trimmedName)) return false;
  
  // Require at least 2 names (first name + last name)
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
  if (nameParts.length < 2) return false;
  
  return true;
}

// Validate email
function validateEmail(email) {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return emailRegex.test(email);
}

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const selectedRole = document.getElementById('loginRole').value;
  
  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Verify the user role matches what they selected
      if (data.user.role !== selectedRole) {
        showError(`This account is registered as a ${data.user.role.toUpperCase()}, not ${selectedRole.toUpperCase()}. Please select the correct role.`);
        return;
      }
      
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      showSuccess(`Welcome back, ${currentUser.name}!`);
      
      // Small delay for better UX
      setTimeout(() => {
        updateNavigation();
        showUserPortal();
      }, 500);
    } else {
      showError(data.message || 'Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Login failed. Please check your connection and try again.');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  
  const fullName = document.getElementById('regFullName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  
  // Validate role is selected
  if (!role) {
    showError('Please select an account type (Tenant or Landlord)');
    return;
  }
  
  // Validate name
  if (!validateName(fullName)) {
    showError('Full name must include at least a first name and surname (e.g., Kahari Kyrie). Only letters, spaces, hyphens and apostrophes allowed');
    return;
  }
  
  const name = fullName;
  
  // Validate email
  if (!validateEmail(email)) {
    showError('Invalid email address. Please enter a valid email (e.g., user@example.com)');
    return;
  }
  
  // Validate phone
  const phoneRegex = /^\+263[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    showError('Invalid number');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fullName, email, phone, password, role })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      showSuccess('Registration successful!');
      updateNavigation();
      showUserPortal();
    } else {
      showError(data.message || 'Registration failed');
    }
  } catch (error) {
    showError('Registration failed. Please try again.');
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  authToken = null;
  currentUser = null;
  showSuccess('Logged out successfully');
  // Redirect to landing page after a short delay
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 500);
}

function updateNavigation() {
  // No longer needed - dynamic menu handles all navigation when logged in
  // Static navbar only shows logo when not logged in
}

function handleLogout() {
  logout();
}

function showUserPortal() {
  console.log('Showing portal for:', currentUser.role);
  
  // Render the dynamic menu with logout button
  renderDynamicMenu(currentUser);
  
  if (currentUser.role === 'tenant') {
    showSection('tenant-portal');
    // Set welcome message
    const welcomeMsg = document.querySelector('#tenant-portal h1');
    if (welcomeMsg) {
      welcomeMsg.textContent = `Welcome, ${currentUser.name}!`;
    }
    loadProperties();
    loadFavorites();
  } else if (currentUser.role === 'landlord') {
    showSection('landlord-portal');
    // Set welcome message
    const welcomeMsg = document.querySelector('#landlord-portal h1');
    if (welcomeMsg) {
      welcomeMsg.textContent = `Welcome, ${currentUser.name}!`;
    }
    loadLandlordProperties();
    loadLandlordInquiries();
  }
}

// ============= Section Management =============

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// ============= Tenant Portal =============

function switchTenantTab(tab, event) {
  document.querySelectorAll('#tenant-portal .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#tenant-portal .tab-content').forEach(t => t.classList.remove('active'));
  
  // Only try to add active class to button if event is provided
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    // If no event, find and activate the correct tab button
    const tabButtons = {
      'all': document.querySelector('[onclick*="switchTenantTab(\'all\')"]'),
      'favorites': document.querySelector('[onclick*="switchTenantTab(\'favorites\')"]'),
      'messages': document.querySelector('[onclick*="switchTenantTab(\'messages\')"]')
    };
    if (tabButtons[tab]) {
      tabButtons[tab].classList.add('active');
    }
  }
  
  if (tab === 'all') {
    document.getElementById('allPropertiesTab').classList.add('active');
  } else if (tab === 'favorites') {
    document.getElementById('favoritesTab').classList.add('active');
    displayFavorites();
  } else if (tab === 'applications') {
    document.getElementById('tenantApplicationsTab').classList.add('active');
    loadTenantApplications();
    // Clear applications badge when viewing
    clearBadgeForSection('tenantApplicationsNotificationBadge', 'tenant', 'applications');
  } else if (tab === 'payments') {
    document.getElementById('tenantPaymentsTab').classList.add('active');
    loadTenantPayments();
    // Clear payments badge when viewing
    clearBadgeForSection('tenantPaymentsNotificationBadge', 'tenant', 'payments');
  } else if (tab === 'messages') {
    document.getElementById('tenantMessagesTab').classList.add('active');
    loadConversations('tenant');
    // Clear messages badge when viewing
    clearBadgeForSection('tenantMessagesNotificationBadge', 'tenant', 'messages');
  }
}

async function loadProperties() {
  try {
    const response = await fetch(`${API_URL}/houses`);
    allProperties = await response.json();
    displayProperties(allProperties);
  } catch (error) {
    showError('Failed to load properties');
  }
}

function displayProperties(properties) {
  const grid = document.getElementById('propertiesGrid');
  
  // Filter out unavailable properties (rented properties)
  const availableProperties = properties.filter(property => property.available !== false);
  
  if (availableProperties.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No properties available</p></div>';
    return;
  }
  
  grid.innerHTML = availableProperties.map(property => createPropertyCard(property)).join('');
}

function createPropertyCard(property) {
  const isFavorite = favorites.some(f => f.house._id === property._id);
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0].url 
    : property.image;
  
  const rating = property.rating || { averageRating: 5.0, totalReviews: 0 };
  const stars = generateStarRating(rating.averageRating);
  
  return `
    <div class="property-card">
      <img src="${imageUrl}" alt="${property.title}" class="property-image" 
           onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
      <div class="property-info">
        <h3 class="property-title">${property.title}</h3>
        <div class="property-location">
          📍 ${property.location}
        </div>
        <div class="property-price">$${property.price}/month</div>
        <div class="property-features">
          <span>🛏️ ${property.bedrooms} bed</span>
          <span>🚿 ${property.bathrooms} bath</span>
          ${property.propertyType ? `<span>🏠 ${property.propertyType}</span>` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
          <div class="star-rating">${stars}</div>
          <span style="font-size: 0.9rem; color: #666;">
            ${rating.averageRating.toFixed(1)} (${rating.totalReviews} ${rating.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        <div class="property-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${currentUser && currentUser.role === 'tenant' ? `
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                    onclick="toggleFavorite('${property._id}')" 
                    style="flex: 1; min-width: 100px;">
              ${isFavorite ? '❤️' : '🤍'} Favorite
            </button>
            <button class="btn btn-success" 
                    onclick="contactLandlord('${property.owner}', '${property._id}')" 
                    style="flex: 1; min-width: 120px;">
              💬 Contact
            </button>
          ` : ''}
          <button class="btn btn-primary" 
                  onclick="viewPropertyDetails('${property._id}')" 
                  style="flex: 1; min-width: 100px;">
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
}

async function searchProperties() {
  const location = document.getElementById('searchLocation').value.toLowerCase();
  const maxPrice = document.getElementById('searchMaxPrice').value;
  const bedrooms = document.getElementById('searchBedrooms').value;
  
  let filtered = allProperties.filter(p => {
    const matchLocation = !location || p.location.toLowerCase().includes(location) || p.title.toLowerCase().includes(location);
    const matchPrice = !maxPrice || p.price <= parseInt(maxPrice);
    const matchBedrooms = !bedrooms || p.bedrooms >= parseInt(bedrooms);
    const isAvailable = p.available !== false; // Only show available properties
    return matchLocation && matchPrice && matchBedrooms && isAvailable;
  });
  
  displayProperties(filtered);
}

async function loadFavorites() {
  if (!currentUser || currentUser.role !== 'tenant') return;
  
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    favorites = await response.json();
  } catch (error) {
    console.error('Failed to load favorites:', error);
  }
}

function displayFavorites() {
  const grid = document.getElementById('favoritesGrid');
  
  if (favorites.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No favorites yet</p></div>';
    return;
  }
  
  const favoriteProperties = favorites.map(f => f.house);
  grid.innerHTML = favoriteProperties.map(property => createPropertyCard(property)).join('');
}

async function toggleFavorite(propertyId) {
  if (!currentUser) {
    showError('Please login to add favorites');
    return;
  }
  
  const isFavorite = favorites.some(f => f.house._id === propertyId);
  
  try {
    if (isFavorite) {
      await fetch(`${API_URL}/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      showSuccess('Removed from favorites');
    } else {
      await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ houseId: propertyId })
      });
      showSuccess('Added to favorites');
    }
    
    await loadFavorites();
    await loadProperties();
  } catch (error) {
    showError('Failed to update favorites');
  }
}

async function viewPropertyDetails(propertyId) {
  try {
    const response = await fetch(`${API_URL}/houses/${propertyId}`);
    const property = await response.json();
    
    const imageUrl = property.images && property.images.length > 0 
      ? property.images[0].url 
      : property.image;
    
    // Get owner ID - could be from owner field or fallback to landlordContact matching
    const ownerId = property.owner?._id || property.owner;
    
    document.getElementById('modalTitle').textContent = property.title;
    document.getElementById('modalContent').innerHTML = `
      <img src="${imageUrl}" alt="${property.title}" 
           style="width: 100%; border-radius: 10px; margin-bottom: 1rem;"
           onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
      <div class="property-price">$${property.price}/month</div>
      <div class="property-location" style="margin: 1rem 0;">📍 ${property.location}</div>
      <div class="property-features" style="margin: 1rem 0;">
        <span>🛏️ ${property.bedrooms} bedrooms</span>
        <span>🚿 ${property.bathrooms} bathrooms</span>
        ${property.propertyType ? `<span>🏠 ${property.propertyType}</span>` : ''}
        ${property.furnished ? `<span>✨ Furnished</span>` : ''}
      </div>
      
      ${currentUser && currentUser.role === 'tenant' ? `
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
          <h3 style="margin-top: 0;">💰 Calculate Rental Cost</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Check-in Date</label>
              <input type="date" id="checkInDate" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" 
                     onchange="calculateRentalPrice('${property._id}')">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Check-out Date</label>
              <input type="date" id="checkOutDate" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                     onchange="calculateRentalPrice('${property._id}')">
            </div>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Currency</label>
            <select id="currencySelect" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                    onchange="calculateRentalPrice('${property._id}')">
              <option value="USD">🇺🇸 USD - US Dollar</option>
              <option value="ZWL">🇿🇼 ZWL - Zimbabwean Dollar</option>
              <option value="ZAR">🇿🇦 ZAR - South African Rand</option>
              <option value="GBP">🇬🇧 GBP - British Pound</option>
              <option value="EUR">🇪🇺 EUR - Euro</option>
            </select>
          </div>
          
          <div id="priceCalculation" style="display: none; background: white; padding: 1rem; border-radius: 8px; border: 2px solid #2563eb;"></div>
        </div>
      ` : ''}
      
      <h3>Description</h3>
      <p>${property.description}</p>
      
      ${property.amenities && property.amenities.length > 0 ? `
        <h3 style="margin-top: 1rem;">Amenities</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${property.amenities.map(amenity => `<span style="background: #e9ecef; padding: 0.5rem 1rem; border-radius: 20px;">✓ ${amenity}</span>`).join('')}
        </div>
      ` : ''}
      
      <h3 style="margin-top: 1rem;">Landlord Information</h3>
      <p><strong>Name:</strong> ${property.landlordName}</p>
      <p><strong>Contact:</strong> ${property.landlordContact}</p>
      
      ${currentUser && currentUser.role === 'tenant' && property.available && ownerId ? `
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-primary" onclick="contactLandlord('${ownerId}', '${property._id}'); closeModal();">
            💬 Contact Landlord
          </button>
          <button class="btn btn-success" onclick="showApplicationForm('${property._id}');">
            📋 Apply to Rent
          </button>
        </div>
      ` : ''}
      ${!ownerId && currentUser && currentUser.role === 'tenant' ? `
        <p style="color: #f44336; margin-top: 1rem;">⚠️ Unable to contact landlord. Property owner information is missing.</p>
      ` : ''}
      
      <div id="reviewsSection" style="margin-top: 2rem; border-top: 2px solid #eee; padding-top: 2rem;">
        <h3>⭐ Reviews & Ratings</h3>
        <div id="reviewsContent">Loading reviews...</div>
      </div>
    `;
    
    // Set default dates (today + 30 days)
    if (currentUser && currentUser.role === 'tenant') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date(today);
      nextMonth.setDate(nextMonth.getDate() + 31);
      
      document.getElementById('checkInDate').value = tomorrow.toISOString().split('T')[0];
      document.getElementById('checkInDate').min = tomorrow.toISOString().split('T')[0];
      document.getElementById('checkOutDate').value = nextMonth.toISOString().split('T')[0];
      document.getElementById('checkOutDate').min = tomorrow.toISOString().split('T')[0];
    }
    
    document.getElementById('propertyModal').classList.add('active');
    
    // Load reviews
    loadAndDisplayReviews(propertyId);
  } catch (error) {
    showError('Failed to load property details');
  }
}

// ============= Landlord Portal =============

function switchLandlordTab(tab, event) {
  document.querySelectorAll('#landlord-portal .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#landlord-portal .tab-content').forEach(t => t.classList.remove('active'));
  
  // Only try to add active class to button if event is provided
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    // If no event, find and activate the correct tab button
    const tabButtons = {
      'properties': document.querySelector('[onclick*="switchLandlordTab(\'properties\')"]'),
      'add': document.querySelector('[onclick*="switchLandlordTab(\'add\')"]'),
      'inquiries': document.querySelector('[onclick*="switchLandlordTab(\'inquiries\')"]'),
      'messages': document.querySelector('[onclick*="switchLandlordTab(\'messages\')"]')
    };
    if (tabButtons[tab]) {
      tabButtons[tab].classList.add('active');
    }
  }
  
  if (tab === 'properties') {
    document.getElementById('propertiesTab').classList.add('active');
  } else if (tab === 'add') {
    document.getElementById('addPropertyTab').classList.add('active');
  } else if (tab === 'applications') {
    document.getElementById('applicationsTab').classList.add('active');
    loadLandlordApplications();
    // Clear applications badge when viewing
    clearBadgeForSection('applicationsNotificationBadge', 'landlord', 'applications');
  } else if (tab === 'payments') {
    document.getElementById('landlordPaymentsTab').classList.add('active');
    loadLandlordPayments();
    // Clear payments badge when viewing
    clearBadgeForSection('paymentsNotificationBadge', 'landlord', 'payments');
  } else if (tab === 'inquiries') {
    document.getElementById('inquiriesTab').classList.add('active');
    // Clear inquiries badge when viewing
    clearBadgeForSection('inquiriesNotificationBadge', 'landlord', 'inquiries');
  } else if (tab === 'messages') {
    document.getElementById('landlordMessagesTab').classList.add('active');
    loadConversations('landlord');
    // Clear messages badge when viewing
    clearBadgeForSection('messagesNotificationBadge', 'landlord', 'messages');
  }
}

async function loadLandlordProperties() {
  try {
    console.log('🔍 Loading landlord properties...');
    console.log('Current user:', currentUser);
    console.log('Auth token:', authToken ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_URL}/houses/my-properties`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to fetch properties:', errorData);
      throw new Error('Failed to fetch properties');
    }
    
    const myProperties = await response.json();
    console.log('✅ Loaded', myProperties.length, 'properties for this landlord');
    displayLandlordProperties(myProperties);
  } catch (error) {
    console.error('Error loading properties:', error);
    showError('Failed to load properties');
  }
}

function displayLandlordProperties(properties) {
  const grid = document.getElementById('landlordPropertiesGrid');
  
  if (properties.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No properties yet. Add your first property!</p></div>';
    return;
  }
  
  grid.innerHTML = properties.map(property => {
    const imageUrl = property.images && property.images.length > 0 
      ? property.images[0].url 
      : property.image;
    
    const rating = property.rating || { averageRating: 5.0, totalReviews: 0 };
    const stars = generateStarRating(rating.averageRating);
    
    return `
      <div class="property-card">
        <img src="${imageUrl}" alt="${property.title}" class="property-image"
             onerror="this.src='https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'">
        <div class="property-info">
          <h3 class="property-title">${property.title}</h3>
          <div class="property-location">📍 ${property.location}</div>
          <div class="property-price">$${property.price}/month</div>
          ${property.propertyType ? `<div style="font-size: 0.85rem; color: #666; margin: 0.25rem 0;">🏠 ${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</div>` : ''}
          <div style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
            <div class="star-rating">${stars}</div>
            <span style="font-size: 0.9rem; color: #666;">
              ${rating.averageRating.toFixed(1)} (${rating.totalReviews} ${rating.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          ${property.available 
            ? '<span class="badge badge-success">Available</span>' 
            : '<span class="badge badge-danger">Rented</span>'}
          ${property.furnished ? '<span class="badge" style="background: #4CAF50; margin-left: 0.5rem;">Furnished</span>' : ''}
          <div class="property-actions" style="margin-top: 1rem;">
            <button class="btn btn-primary" onclick="viewPropertyDetails('${property._id}')" style="width: 100%; margin-bottom: 0.5rem;">View Details</button>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary" onclick="editProperty('${property._id}')" style="flex: 1;">Edit</button>
              <button class="btn btn-danger" onclick="deleteProperty('${property._id}')" style="flex: 1;">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function handleAddProperty(event) {
  event.preventDefault();
  
  // Validate price
  const priceInput = document.getElementById('propPrice');
  const priceError = document.getElementById('propPriceError');
  const price = parseFloat(priceInput.value);
  
  if (!price || isNaN(price) || price < 10 || price > 100000) {
    priceError.textContent = 'Price must be between $10 and $100,000. Minimum $10 ensures legitimate listings and covers platform transaction costs.';
    priceError.style.display = 'block';
    priceInput.focus();
    return;
  }
  priceError.style.display = 'none';
  
  // Validate images
  const imageFiles = document.getElementById('propImages').files;
  if (imageFiles.length === 0) {
    showError('Please select at least one image for your property');
    document.getElementById('propImages').focus();
    return;
  }
  
  // Validate file size (max 10MB per image)
  for (let i = 0; i < imageFiles.length; i++) {
    if (imageFiles[i].size > 10 * 1024 * 1024) {
      showError(`Image "${imageFiles[i].name}" is too large. Maximum file size is 10MB per image.`);
      return;
    }
  }
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('title', document.getElementById('propTitle').value);
  formData.append('location', document.getElementById('propLocation').value);
  formData.append('price', price);
  formData.append('propertyType', document.getElementById('propType').value);
  formData.append('bedrooms', parseInt(document.getElementById('propBedrooms').value) || 1);
  formData.append('bathrooms', parseInt(document.getElementById('propBathrooms').value) || 1);
  formData.append('description', document.getElementById('propDescription').value);
  formData.append('landlordName', currentUser.name);
  formData.append('landlordContact', currentUser.phone);
  formData.append('available', document.getElementById('propAvailable').checked);
  formData.append('owner', currentUser._id || currentUser.id);
  
  // Handle image upload - append actual files
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('images', imageFiles[i]);
  }
  
  try {
    // Check if we have auth token
    if (!authToken) {
      showError('You must be logged in to add properties');
      return;
    }
    
    console.log('Sending request to:', `${API_URL}/houses`);
    console.log('Auth token present:', !!authToken);
    
    const response = await fetch(`${API_URL}/houses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    console.log('Response content-type:', response.headers.get('content-type'));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      showError('Server error: Received HTML instead of JSON. Please check if you are logged in correctly.');
      return;
    }
    
    const data = await response.json();
    
    if (response.ok) {
      showSuccess('Property added successfully!');
      document.getElementById('addPropertyForm').reset();
      switchLandlordTab('properties');
      loadLandlordProperties();
    } else {
      console.error('Server error:', data);
      showError(data.message || 'Failed to add property');
    }
  } catch (error) {
    console.error('Network error:', error);
    showError('Failed to add property: ' + error.message);
  }
}

async function editProperty(propertyId) {
  try {
    // Fetch property details
    const response = await fetch(`${API_URL}/houses/${propertyId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch property:', errorData);
      showError(errorData.message || 'Failed to load property details');
      return;
    }
    
    const property = await response.json();
    console.log('Property loaded for editing:', property);
    
    // Switch to add property tab and populate form
    switchLandlordTab('add');
    
    // Populate form fields
    document.getElementById('propTitle').value = property.title;
    document.getElementById('propLocation').value = property.location;
    document.getElementById('propPrice').value = property.price;
    document.getElementById('propBedrooms').value = property.bedrooms;
    document.getElementById('propBathrooms').value = property.bathrooms;
    document.getElementById('propDescription').value = property.description;
    document.getElementById('propAvailable').checked = property.available;
    
    // Show current images
    const imageInput = document.getElementById('propImages');
    const imageLabel = imageInput.previousElementSibling;
    if (property.images && property.images.length > 0) {
      const currentImagesDiv = document.createElement('div');
      currentImagesDiv.id = 'currentImages';
      currentImagesDiv.style.marginTop = '10px';
      currentImagesDiv.innerHTML = `
        <p style="color: #666; font-size: 0.9rem;">Current images (${property.images.length}). Upload new images to replace them.</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${property.images.map(img => `
            <img src="${img.url}" alt="Property" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; border: 2px solid #ddd;">
          `).join('')}
        </div>
      `;
      // Remove old current images div if exists
      const oldDiv = document.getElementById('currentImages');
      if (oldDiv) oldDiv.remove();
      // Insert after the file input
      imageInput.parentNode.insertBefore(currentImagesDiv, imageInput.nextSibling);
    }
    
    // Change form submission to update instead of create
    const form = document.getElementById('addPropertyForm');
    form.onsubmit = async (e) => {
      e.preventDefault();
      await updateProperty(propertyId);
    };
    
    // Change button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Property';
    submitBtn.classList.add('btn-success');
    
    // Add cancel button
    if (!document.getElementById('cancelEditBtn')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id = 'cancelEditBtn';
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.textContent = 'Cancel Edit';
      cancelBtn.style.marginLeft = '10px';
      cancelBtn.onclick = cancelEdit;
      submitBtn.parentNode.appendChild(cancelBtn);
    }
    
  } catch (error) {
    console.error('Error in editProperty:', error);
    showError('Failed to load property details: ' + error.message);
  }
}

// Make function globally accessible
window.editProperty = editProperty;

async function updateProperty(propertyId) {
  // Validate price
  const priceInput = document.getElementById('propPrice');
  const priceError = document.getElementById('propPriceError');
  const price = parseFloat(priceInput.value);
  
  if (!price || isNaN(price) || price < 10 || price > 100000) {
    priceError.textContent = 'Price must be between $10 and $100,000. Minimum $10 ensures legitimate listings and covers platform transaction costs.';
    priceError.style.display = 'block';
    priceInput.focus();
    return;
  }
  priceError.style.display = 'none';
  
  // Create FormData for file upload (same as add property)
  const formData = new FormData();
  formData.append('title', document.getElementById('propTitle').value);
  formData.append('location', document.getElementById('propLocation').value);
  formData.append('price', price);
  formData.append('bedrooms', parseInt(document.getElementById('propBedrooms').value) || 1);
  formData.append('bathrooms', parseInt(document.getElementById('propBathrooms').value) || 1);
  formData.append('description', document.getElementById('propDescription').value);
  formData.append('landlordName', currentUser.name);
  formData.append('landlordContact', currentUser.phone);
  formData.append('available', document.getElementById('propAvailable').checked);
  formData.append('owner', currentUser._id || currentUser.id);
  
  // Handle image upload - append actual files if new images selected
  const imageFiles = document.getElementById('propImages').files;
  if (imageFiles.length > 0) {
    console.log('📸 New images selected for update:', imageFiles.length);
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }
  }
  
  try {
    console.log('Updating property:', propertyId);
    const response = await fetch(`${API_URL}/houses/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    });
    
    if (response.ok) {
      showSuccess('Property updated successfully!');
      cancelEdit();
      switchLandlordTab('properties');
      loadLandlordProperties();
    } else {
      const data = await response.json();
      console.error('Update failed:', data);
      showError(data.message || 'Failed to update property');
    }
  } catch (error) {
    console.error('Update error:', error);
    showError('Failed to update property: ' + error.message);
  }
}

function cancelEdit() {
  // Reset form
  document.getElementById('addPropertyForm').reset();
  
  // Reset form submission
  const form = document.getElementById('addPropertyForm');
  form.onsubmit = handleAddProperty;
  
  // Reset button
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Add Property';
  submitBtn.classList.remove('btn-success');
  
  // Remove cancel button
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) {
    cancelBtn.remove();
  }
}

async function deleteProperty(propertyId) {
  if (!confirm('Are you sure you want to delete this property?')) return;
  
  try {
    const response = await fetch(`${API_URL}/houses/${propertyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      showSuccess('Property deleted successfully');
      loadLandlordProperties();
    } else {
      showError('Failed to delete property');
    }
  } catch (error) {
    showError('Failed to delete property');
  }
}

// Make function globally accessible
window.deleteProperty = deleteProperty;

async function loadLandlordInquiries() {
  try {
    const response = await fetch(`${API_URL}/inquiries`);
    const allInquiries = await response.json();
    // Filter inquiries for landlord's properties
    const myInquiries = allInquiries.filter(inq => 
      inq.houseId && inq.houseId.landlordContact === currentUser.phone
    );
    displayLandlordInquiries(myInquiries);
  } catch (error) {
    console.error('Failed to load inquiries:', error);
  }
}

function displayLandlordInquiries(inquiries) {
  const container = document.getElementById('landlordInquiriesGrid');
  
  if (inquiries.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No inquiries yet</p></div>';
    return;
  }
  
  container.innerHTML = inquiries.map(inq => `
    <div class="property-card" style="cursor: default;">
      <div class="property-info">
        <h3>${inq.houseId ? inq.houseId.title : 'Property'}</h3>
        <p><strong>From:</strong> ${inq.tenantName}</p>
        <p><strong>Email:</strong> ${inq.tenantEmail}</p>
        <p><strong>Phone:</strong> ${inq.tenantPhone}</p>
        <p><strong>Message:</strong> ${inq.message || 'No message'}</p>
        <p><small>${new Date(inq.createdAt).toLocaleDateString()}</small></p>
      </div>
    </div>
  `).join('');
}

// ============= Messaging System =============

let currentConversationPartnerId = null;
let currentConversationUserType = null;

async function loadConversations(userType) {
  console.log('💬 Loading conversations for:', userType);
  const contentId = userType === 'tenant' ? 'tenantConversationsContent' : 'landlordConversationsContent';
  const contentDiv = document.getElementById(contentId);
  
  if (!contentDiv) {
    console.error('Conversations content div not found');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load conversations');
    }
    
    const conversations = await response.json();
    console.log('✅ Loaded conversations:', conversations.length);
    console.log('📋 Conversation data:', conversations);
    
    if (conversations.length === 0) {
      contentDiv.innerHTML = '<p style="color: #999; padding: 1rem; text-align: center;">No conversations yet. Contact a landlord about a property to start messaging.</p>';
    } else {
      const html = conversations.map(conv => {
        console.log('🔍 Processing conversation:', conv);
        return `
          <div class="conversation-item" onclick="openConversation('${conv.partner._id}', '${userType}')" 
               style="cursor: pointer; padding: 1rem; margin-bottom: 0.5rem; background: white; border-radius: 8px; border: 1px solid #ddd; display: block !important; visibility: visible !important;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: #333;">${conv.partner.name}</h4>
            <p style="margin: 0.25rem 0; font-size: 0.85rem; color: #666;">${conv.partner.role}</p>
            <p style="margin: 0.25rem 0; color: #333; font-size: 0.9rem;">${conv.lastMessage.message.substring(0, 50)}${conv.lastMessage.message.length > 50 ? '...' : ''}</p>
            <small style="color: #999; font-size: 0.8rem;">${new Date(conv.lastMessage.createdAt).toLocaleDateString()}</small>
            ${conv.unreadCount > 0 ? `<span style="background: #dc3545; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.75rem; margin-left: 0.5rem; display: inline-block;">${conv.unreadCount}</span>` : ''}
          </div>
        `;
      }).join('');
      
      console.log('📝 Generated HTML length:', html.length);
      console.log('📝 First 200 chars of HTML:', html.substring(0, 200));
      contentDiv.innerHTML = html;
      contentDiv.style.display = 'block';
      contentDiv.style.visibility = 'visible';
      console.log('✅ HTML inserted into:', contentId);
      console.log('✅ ContentDiv display:', contentDiv.style.display);
      console.log('✅ ContentDiv innerHTML length:', contentDiv.innerHTML.length);
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    contentDiv.innerHTML = '<p style="color: #dc3545; padding: 1rem;">Failed to load conversations</p>';
  }
}

async function openConversation(partnerId, userType) {
  console.log('Opening conversation with:', partnerId);
  currentConversationPartnerId = partnerId;
  currentConversationUserType = userType;
  
  const headerDiv = document.getElementById(userType + 'MessageHeader');
  const contentDiv = document.getElementById(userType + 'MessageContent');
  const inputDiv = document.getElementById(userType + 'MessageInput');
  
  try {
    // Load messages
    const response = await fetch(`${API_URL}/messages/${partnerId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load messages');
    }
    
    const messages = await response.json();
    console.log('✅ Loaded messages:', messages.length);
    
    // Get partner info from first message or fetch user info
    let partner;
    if (messages.length > 0) {
      partner = messages[0].from._id === currentUser._id ? messages[0].to : messages[0].from;
    } else {
      // Fetch user info if no messages yet
      try {
        const userResponse = await fetch(`${API_URL}/auth/user/${partnerId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (userResponse.ok) {
          partner = await userResponse.json();
        } else {
          partner = { name: 'User', role: 'unknown' };
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        partner = { name: 'User', role: 'unknown' };
      }
    }
    
    // Update header
    headerDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0;">${partner.name}</h3>
          <p style="margin: 0; font-size: 0.85rem; color: #666;">${partner.role}</p>
        </div>
        <button onclick="loadConversations('${userType}')" class="btn btn-secondary" style="padding: 0.5rem 1rem;">Back</button>
      </div>
    `;
    
    // Display messages
    if (messages.length === 0) {
      contentDiv.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No messages yet. Start the conversation!</p>';
    } else {
      contentDiv.innerHTML = messages.map(msg => {
        const isOwn = msg.from._id === currentUser._id;
        return `
          <div style="margin-bottom: 1rem; display: flex; justify-content: ${isOwn ? 'flex-end' : 'flex-start'};">
            <div style="max-width: 70%; padding: 0.75rem; border-radius: 10px; background: ${isOwn ? '#2563eb' : '#f1f3f5'}; color: ${isOwn ? 'white' : '#333'};">
              <p style="margin: 0; word-wrap: break-word;">${msg.message}</p>
              <small style="font-size: 0.75rem; opacity: 0.8;">${new Date(msg.createdAt).toLocaleString()}</small>
            </div>
          </div>
        `;
      }).join('');
      
      // Scroll to bottom
      contentDiv.scrollTop = contentDiv.scrollHeight;
    }
    
    // Show input
    if (inputDiv) {
      inputDiv.style.display = 'block';
      console.log('✅ Message input shown');
      
      // Focus on textarea
      const textarea = document.getElementById(userType + 'MessageText');
      if (textarea) {
        setTimeout(() => textarea.focus(), 100);
      }
    } else {
      console.error('❌ Input div not found:', userType + 'MessageInput');
    }
    
  } catch (error) {
    console.error('Error opening conversation:', error);
    showError('Failed to load conversation');
  }
}

async function handleSendMessage(event, userType) {
  event.preventDefault();
  console.log('Sending message from:', userType);
  
  const textareaId = userType + 'MessageText';
  const textarea = document.getElementById(textareaId);
  const message = textarea.value.trim();
  
  if (!message) {
    showError('Please enter a message');
    return;
  }
  
  if (!currentConversationPartnerId) {
    showError('No conversation selected');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        to: currentConversationPartnerId,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    const newMessage = await response.json();
    console.log('✅ Message sent:', newMessage);
    
    // Clear textarea
    textarea.value = '';
    
    // Reload conversation to show new message
    await openConversation(currentConversationPartnerId, userType);
    
    // Update notification badges
    if (currentUser?.role === 'landlord') {
      updateLandlordNotifications();
    } else if (currentUser?.role === 'tenant') {
      updateTenantNotifications();
    }
    
  } catch (error) {
    console.error('Error sending message:', error);
    showError('Failed to send message');
  }
}

async function contactLandlord(landlordId, propertyId) {
  console.log('Contacting landlord:', landlordId, 'about property:', propertyId);
  
  if (!currentUser || currentUser.role !== 'tenant') {
    showError('Only tenants can contact landlords');
    return;
  }
  
  // Switch to messages tab
  switchTenantTab('messages');
  
  // Wait a bit for tab to load
  setTimeout(() => {
    // Open conversation with landlord
    openConversation(landlordId, 'tenant');
  }, 300);
}

// Make functions globally accessible
window.loadConversations = loadConversations;
window.openConversation = openConversation;
window.handleSendMessage = handleSendMessage;
window.contactLandlord = contactLandlord;

// ============= Rental Applications =============

async function loadTenantApplications() {
  try {
    const response = await fetch(`${API_URL}/rental-applications/my-applications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load applications');
    }
    
    const applications = await response.json();
    
    // Load tenant's payments to check which applications already have payments
    const paymentsResponse = await fetch(`${API_URL}/payments/my-payments`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    let payments = [];
    if (paymentsResponse.ok) {
      payments = await paymentsResponse.json();
    }
    
    displayTenantApplications(applications, payments);
  } catch (error) {
    console.error('Error loading applications:', error);
    document.getElementById('tenantApplicationsGrid').innerHTML = 
      '<p style="color: #dc3545; padding: 2rem; text-align: center;">Failed to load applications</p>';
  }
}

function displayTenantApplications(applications, payments = []) {
  const grid = document.getElementById('tenantApplicationsGrid');
  
  if (applications.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <h3>No Applications Yet</h3>
        <p style="color: #666;">You haven't submitted any rental applications yet.</p>
        <p style="color: #666;">Browse properties and click "Apply to Rent" to get started!</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = applications.map(app => {
    // Skip applications with missing property data
    if (!app.property) {
      return '';
    }
    
    // Check if payment exists for this application
    const existingPayment = payments.find(p => {
      const paymentAppId = p.application?._id || p.application;
      return paymentAppId === app._id;
    });
    
    const statusColors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545',
      cancelled: '#6c757d'
    };
    
    const statusColor = statusColors[app.status] || '#6c757d';
    
    return `
      <div class="application-card" style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0;">${app.property.title}</h3>
            <p style="margin: 0; color: #666;">📍 ${app.property.location}</p>
            <p style="margin: 0.5rem 0; font-size: 1.2rem; font-weight: 600; color: #2563eb;">$${app.property.price}/month</p>
          </div>
          <span style="background: ${statusColor}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 0.85rem;">
            ${app.status}
          </span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
          <div>
            <strong>Move-in Date:</strong><br>
            ${new Date(app.moveInDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Lease Duration:</strong><br>
            ${app.leaseDuration} months
          </div>
          <div>
            <strong>Landlord:</strong><br>
            ${app.landlord.name}
          </div>
          <div>
            <strong>Applied:</strong><br>
            ${new Date(app.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        ${app.message ? `<p style="margin: 1rem 0; padding: 1rem; background: #e9ecef; border-radius: 8px;"><strong>Your Message:</strong><br>${app.message}</p>` : ''}
        
        ${existingPayment ? `
          <div style="margin: 1rem 0; padding: 1rem; background: ${existingPayment.status === 'released' ? '#d4edda' : existingPayment.status === 'held' ? '#fff3cd' : existingPayment.status === 'pending' ? '#cce5ff' : '#f8d7da'}; border-radius: 8px; border-left: 4px solid ${existingPayment.status === 'released' ? '#28a745' : existingPayment.status === 'held' ? '#ffc107' : existingPayment.status === 'pending' ? '#17a2b8' : '#dc3545'};">
            <strong>💰 Payment Status:</strong> 
            <span style="text-transform: uppercase; font-weight: 600; color: ${existingPayment.status === 'released' ? '#155724' : existingPayment.status === 'held' ? '#856404' : existingPayment.status === 'pending' ? '#004085' : '#721c24'};">
              ${existingPayment.status}
            </span>
            ${existingPayment.status === 'pending' ? '<br><small>Your payment is being verified by admin</small>' : ''}
            ${existingPayment.status === 'held' ? '<br><small>Payment verified and held securely</small>' : ''}
            ${existingPayment.status === 'released' ? '<br><small>Payment released to landlord</small>' : ''}
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
          <button onclick="contactLandlord('${app.landlord._id}', '${app.property._id}')" class="btn btn-primary">
            💬 Message Landlord
          </button>
          ${app.status === 'approved' && !existingPayment ? `
            <button onclick="showPaymentModal('${app._id}', '${app.property._id}', '${app.landlord._id}', ${app.property.price})" class="btn btn-success">
              💰 Make Payment
            </button>
          ` : ''}
          ${app.status === 'approved' && existingPayment ? `
            <button onclick="showReviewModal('${app.property._id}')" class="btn" style="background: #f59e0b; color: white;">
              ⭐ Rate Property
            </button>
          ` : ''}
          ${app.status === 'pending' ? `
            <button onclick="cancelApplication('${app._id}')" class="btn btn-danger">
              Cancel Application
            </button>
          ` : ''}
          <button onclick="viewPropertyDetails('${app.property._id}')" class="btn btn-secondary">
            👁️ View Property
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function loadLandlordApplications() {
  try {
    const response = await fetch(`${API_URL}/rental-applications/received`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load applications');
    }
    
    const applications = await response.json();
    displayLandlordApplications(applications);
  } catch (error) {
    console.error('Error loading applications:', error);
    document.getElementById('landlordApplicationsGrid').innerHTML = 
      '<p style="color: #dc3545; padding: 2rem; text-align: center;">Failed to load applications</p>';
  }
}

function displayLandlordApplications(applications) {
  const grid = document.getElementById('landlordApplicationsGrid');
  
  if (applications.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <h3>No Applications Yet</h3>
        <p style="color: #666;">You haven't received any rental applications yet.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = applications.map(app => {
    // Skip applications with missing property data
    if (!app.property) {
      return '';
    }
    
    const statusColors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545',
      cancelled: '#6c757d'
    };
    
    const statusColor = statusColors[app.status] || '#6c757d';
    
    return `
      <div class="application-card" style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0;">Application for: ${app.property.title}</h3>
            <p style="margin: 0; color: #666;">From: ${app.tenant.name}</p>
            <p style="margin: 0.25rem 0; color: #666;">📧 ${app.tenant.email} | 📞 ${app.tenant.phone}</p>
          </div>
          <span style="background: ${statusColor}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 0.85rem;">
            ${app.status}
          </span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
          <div>
            <strong>Move-in Date:</strong><br>
            ${new Date(app.moveInDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Lease Duration:</strong><br>
            ${app.leaseDuration} months
          </div>
          ${app.tenantInfo ? `
            <div>
              <strong>Occupants:</strong><br>
              ${app.tenantInfo.numberOfOccupants || 'Not provided'}
            </div>
            <div>
              <strong>Pets:</strong><br>
              ${app.tenantInfo.hasPets ? `Yes - ${app.tenantInfo.petDetails || 'Details not provided'}` : 'No'}
            </div>
            ${app.tenantInfo.emergencyContact ? `
              <div style="grid-column: 1 / -1;">
                <strong>Emergency Contact:</strong><br>
                ${app.tenantInfo.emergencyContact.name} (${app.tenantInfo.emergencyContact.relationship})<br>
                📞 ${app.tenantInfo.emergencyContact.phone}
              </div>
            ` : ''}
          ` : ''}
          <div>
            <strong>Applied:</strong><br>
            ${new Date(app.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        ${app.message ? `<p style="margin: 1rem 0; padding: 1rem; background: #e9ecef; border-radius: 8px;"><strong>Tenant's Message:</strong><br>${app.message}</p>` : ''}
        
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          ${app.status === 'pending' ? `
            <button onclick="approveApplication('${app._id}')" class="btn btn-success">
              ✅ Approve
            </button>
            <button onclick="rejectApplication('${app._id}')" class="btn btn-danger">
              ❌ Reject
            </button>
          ` : ''}
          <button onclick="messageTenantFromApp('${app.tenant._id}')" class="btn btn-primary">
            💬 Message Tenant
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function messageTenantFromApp(tenantId) {
  // Switch to messages tab
  switchLandlordTab('messages');
  
  // Wait for tab to load, then open conversation
  setTimeout(() => {
    openConversation(tenantId, 'landlord');
  }, 300);
}

async function approveApplication(applicationId) {
  if (!confirm('Are you sure you want to approve this application? The property will be marked as rented.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/rental-applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve application');
    }
    
    showSuccess('Application approved! Property marked as rented.');
    loadLandlordApplications();
    loadLandlordProperties(); // Refresh properties to show updated status
    resetViewedStatus('landlord', 'applications'); // Reset to show new activity
    updateLandlordNotifications(); // Update notification badges
  } catch (error) {
    console.error('Error approving application:', error);
    showError('Failed to approve application');
  }
}

async function rejectApplication(applicationId) {
  if (!confirm('Are you sure you want to reject this application?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/rental-applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: 'rejected' })
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject application');
    }
    
    showSuccess('Application rejected.');
    loadLandlordApplications();
    resetViewedStatus('landlord', 'applications'); // Reset to show new activity
    updateLandlordNotifications(); // Update notification badges
  } catch (error) {
    console.error('Error rejecting application:', error);
    showError('Failed to reject application');
  }
}

async function cancelApplication(applicationId) {
  if (!confirm('Are you sure you want to cancel this application?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/rental-applications/${applicationId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel application');
    }
    
    showSuccess('Application cancelled.');
    loadTenantApplications();
    updateTenantNotifications(); // Update notification badges immediately
  } catch (error) {
    console.error('Error cancelling application:', error);
    showError('Failed to cancel application');
  }
}

// Make functions globally accessible
window.loadTenantApplications = loadTenantApplications;
window.loadLandlordApplications = loadLandlordApplications;
window.messageTenantFromApp = messageTenantFromApp;
window.approveApplication = approveApplication;
window.rejectApplication = rejectApplication;
window.cancelApplication = cancelApplication;

// ============= Price Calculator =============

async function calculateRentalPrice(propertyId) {
  const checkIn = document.getElementById('checkInDate').value;
  const checkOut = document.getElementById('checkOutDate').value;
  const currency = document.getElementById('currencySelect').value;
  const resultDiv = document.getElementById('priceCalculation');
  
  if (!checkIn || !checkOut) {
    resultDiv.style.display = 'none';
    return;
  }
  
  if (new Date(checkOut) <= new Date(checkIn)) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p style="color: #dc3545;">❌ Check-out date must be after check-in date</p>';
    return;
  }
  
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<p>⏳ Calculating...</p>';
  
  try {
    const response = await fetch(`${API_URL}/rental-calculations/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propertyId,
        checkIn,
        checkOut,
        currency
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Calculation failed');
    }
    
    const calc = data.calculation;
    const symbol = calc.currencySymbol;
    
    resultDiv.innerHTML = `
      <h4 style="margin-top: 0; color: #2563eb;">💰 Price Breakdown</h4>
      <div style="margin-bottom: 1rem;">
        <strong>Duration:</strong> ${calc.duration.days} days 
        ${calc.duration.months > 0 ? `(${calc.duration.months} month${calc.duration.months > 1 ? 's' : ''})` : ''}
      </div>
      
      ${calc.breakdown.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <div>
            <strong ${item.isTotal || item.isFinalTotal ? 'style="color: #2563eb; font-size: 1.1rem;"' : ''}>${item.label}</strong>
            <br><small style="color: #666;">${item.description}</small>
          </div>
          <div style="text-align: right;">
            <strong ${item.isTotal || item.isFinalTotal ? 'style="color: #2563eb; font-size: 1.1rem;"' : ''}>
              ${item.amount < 0 ? '-' : ''}${symbol}${Math.abs(item.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </strong>
            ${item.isDeposit ? '<br><small style="color: #28a745;">Refundable</small>' : ''}
          </div>
        </div>
      `).join('')}
      
      ${calc.pricing.discount.amount > 0 ? `
        <div style="background: #d4edda; color: #155724; padding: 0.75rem; border-radius: 4px; margin-top: 1rem;">
          🎉 You save ${symbol}${calc.pricing.discount.amount.toLocaleString('en-US', {minimumFractionDigits: 2})} 
          with ${calc.pricing.discount.type} discount (${calc.pricing.discount.percentage}% off)!
        </div>
      ` : ''}
      
      ${currency !== 'USD' ? `
        <div style="margin-top: 1rem; padding: 0.5rem; background: #e9ecef; border-radius: 4px; font-size: 0.9rem;">
          💱 Exchange rate: 1 USD = ${calc.exchangeRate.toLocaleString()} ${currency}
        </div>
      ` : ''}
    `;
    
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: #dc3545;">❌ ${error.message}</p>`;
  }
}

async function showApplicationForm(propertyId) {
  // Get property details first
  try {
    const response = await fetch(`${API_URL}/houses/${propertyId}`);
    const property = await response.json();
    
    // Set property ID in form
    document.getElementById('appPropertyId').value = propertyId;
    
    // Set default move-in date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('appMoveInDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('appMoveInDate').min = tomorrow.toISOString().split('T')[0];
    
    // Reset form
    document.getElementById('rentalApplicationForm').reset();
    document.getElementById('appPropertyId').value = propertyId;
    document.getElementById('appMoveInDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('appLeaseDuration').value = 12;
    document.getElementById('appOccupants').value = 1;
    document.getElementById('appHasPets').value = 'false';
    document.getElementById('petDetailsGroup').style.display = 'none';
    
    // Close property modal and open application modal
    closeModal();
    document.getElementById('applicationModal').classList.add('active');
  } catch (error) {
    showError('Failed to load application form');
  }
}

function togglePetDetails() {
  const hasPets = document.getElementById('appHasPets').value === 'true';
  document.getElementById('petDetailsGroup').style.display = hasPets ? 'block' : 'none';
  if (!hasPets) {
    document.getElementById('appPetDetails').value = '';
  }
}

async function submitRentalApplication(event) {
  event.preventDefault();
  
  const propertyId = document.getElementById('appPropertyId').value;
  const moveInDate = document.getElementById('appMoveInDate').value;
  const leaseDuration = parseInt(document.getElementById('appLeaseDuration').value);
  const numberOfOccupants = parseInt(document.getElementById('appOccupants').value);
  const hasPets = document.getElementById('appHasPets').value === 'true';
  const petDetails = document.getElementById('appPetDetails').value;
  const emergencyName = document.getElementById('appEmergencyName').value;
  const emergencyPhone = document.getElementById('appEmergencyPhone').value;
  const emergencyRelationship = document.getElementById('appEmergencyRelationship').value;
  const message = document.getElementById('appMessage').value;
  
  try {
    const response = await fetch(`${API_URL}/rental-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        propertyId,
        moveInDate,
        leaseDuration,
        message,
        tenantInfo: {
          numberOfOccupants,
          hasPets,
          petDetails: hasPets ? petDetails : '',
          emergencyContact: {
            name: emergencyName,
            phone: emergencyPhone,
            relationship: emergencyRelationship
          }
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit application');
    }
    
    showSuccess('Application submitted successfully! The landlord will review it.');
    closeApplicationModal();
    
    // Refresh applications if on applications tab
    if (currentUser && currentUser.role === 'tenant') {
      loadTenantApplications();
      updateTenantNotifications(); // Update notification badges immediately
    }
  } catch (error) {
    showError(error.message);
  }
}

function closeApplicationModal() {
  document.getElementById('applicationModal').classList.remove('active');
}

// Make functions globally accessible
window.calculateRentalPrice = calculateRentalPrice;
window.showApplicationForm = showApplicationForm;
window.togglePetDetails = togglePetDetails;
window.submitRentalApplication = submitRentalApplication;
window.closeApplicationModal = closeApplicationModal;

// ============= Reviews & Ratings =============

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

async function loadPropertyReviews(propertyId) {
  try {
    const response = await fetch(`${API_URL}/reviews/property/${propertyId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    return data.reviews || [];
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
}

async function loadAndDisplayReviews(propertyId) {
  const reviewsContent = document.getElementById('reviewsContent');
  
  try {
    const reviews = await loadPropertyReviews(propertyId);
    
    // Check if current user can review (tenant with approved application)
    let canReview = false;
    if (currentUser && currentUser.role === 'tenant' && authToken) {
      try {
        const appResponse = await fetch(`${API_URL}/rental-applications/my-applications`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const appData = await appResponse.json();
        const hasApprovedApp = appData.some(app => 
          (app.property._id === propertyId || app.property === propertyId) && 
          app.status === 'approved'
          // Removed move-in date check for immediate reviews after approval
        );
        const userId = currentUser._id || currentUser.id;
        const hasReviewed = reviews.some(r => {
          const reviewTenantId = r.tenant._id || r.tenant;
          return reviewTenantId === userId;
        });
        canReview = hasApprovedApp && !hasReviewed;
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      }
    }
    
    reviewsContent.innerHTML = `
      ${canReview ? `
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h4 style="margin-top: 0;">Write a Review</h4>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Rating *</label>
            <select id="reviewRating" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
              <option value="">Select rating</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐☆ Good</option>
              <option value="3">⭐⭐⭐☆☆ Average</option>
              <option value="2">⭐⭐☆☆☆ Poor</option>
              <option value="1">⭐☆☆☆☆ Terrible</option>
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Your Review *</label>
            <textarea id="reviewComment" rows="4" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" 
                      placeholder="Share your experience with this property... (minimum 10 characters)"></textarea>
          </div>
          <button class="btn btn-primary" onclick="submitReview('${propertyId}')">
            ⭐ Submit Review
          </button>
        </div>
      ` : ''}
      
      ${reviews.length === 0 ? `
        <p style="color: #666; text-align: center; padding: 2rem;">
          No reviews yet. Be the first to review this property!
        </p>
      ` : `
        <div style="margin-top: 1rem;">
          ${reviews.map(review => `
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <div>
                  <strong>${review.tenant.name}</strong>
                  ${review.verified ? '<span style="color: #28a745; font-size: 0.9rem;"> ✓ Verified Tenant</span>' : ''}
                </div>
                <div style="text-align: right;">
                  <div class="star-rating">${generateStarRating(review.rating)}</div>
                  <small style="color: #666;">${new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
              <p style="margin: 0.5rem 0; color: #333;">${review.comment}</p>
              ${review.response ? `
                <div style="background: white; padding: 1rem; border-left: 3px solid #2563eb; margin-top: 1rem;">
                  <strong style="color: #2563eb;">Landlord Response:</strong>
                  <p style="margin: 0.5rem 0 0 0;">${review.response.comment}</p>
                  <small style="color: #666;">${new Date(review.response.respondedAt).toLocaleDateString()}</small>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    `;
    
  } catch (error) {
    reviewsContent.innerHTML = '<p style="color: #dc3545;">Failed to load reviews</p>';
  }
}

async function submitReview(propertyId) {
  const rating = document.getElementById('reviewRating').value;
  const comment = document.getElementById('reviewComment').value;
  
  if (!rating || !comment) {
    showError('Please provide both rating and comment');
    return;
  }
  
  if (comment.length < 10) {
    showError('Comment must be at least 10 characters');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        propertyId,
        rating: parseInt(rating),
        comment
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    // Close the review modal
    closeModal();
    
    // Show thank you message
    showSuccess('Thank you for choosing RentHub! 🏠');
    
    // Reload reviews
    loadAndDisplayReviews(propertyId);
    
    // Reload properties to show updated rating
    if (currentUser && currentUser.role === 'tenant') {
      loadProperties();
      updateTenantNotifications(); // Update notification badges immediately
    } else if (currentUser && currentUser.role === 'landlord') {
      loadLandlordProperties();
      updateLandlordNotifications(); // Update notification badges immediately
    }
    
  } catch (error) {
    showError(error.message);
  }
}

// Show review modal for a property
async function showReviewModal(propertyId) {
  try {
    // Fetch property details
    const response = await fetch(`${API_URL}/houses/${propertyId}`);
    const property = await response.json();
    
    // Check if already reviewed
    const reviewsResponse = await fetch(`${API_URL}/reviews/property/${propertyId}`);
    const reviewsData = await reviewsResponse.json();
    const reviews = reviewsData.reviews || [];
    
    const userId = currentUser._id || currentUser.id;
    const hasReviewed = reviews.some(r => {
      const reviewTenantId = r.tenant._id || r.tenant;
      return reviewTenantId === userId;
    });
    
    if (hasReviewed) {
      showError('You have already reviewed this property.');
      return;
    }
    
    // Show modal with review form
    document.getElementById('modalTitle').textContent = `Rate: ${property.title}`;
    document.getElementById('modalContent').innerHTML = `
      <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
        <h3 style="margin-top: 0;">⭐ Share Your Experience</h3>
        <p style="color: #666; margin-bottom: 1.5rem;">Help other tenants by sharing your honest review of this property.</p>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Rating *</label>
          <select id="reviewRating" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            <option value="">Select your rating</option>
            <option value="5">⭐⭐⭐⭐⭐ Excellent (5 stars)</option>
            <option value="4">⭐⭐⭐⭐☆ Good (4 stars)</option>
            <option value="3">⭐⭐⭐☆☆ Average (3 stars)</option>
            <option value="2">⭐⭐☆☆☆ Poor (2 stars)</option>
            <option value="1">⭐☆☆☆☆ Terrible (1 star)</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Your Review *</label>
          <textarea id="reviewComment" rows="6" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; resize: vertical;" 
                    placeholder="Share details about your experience living here... (minimum 10 characters)"></textarea>
          <small style="color: #666;">Tell others about the property condition, landlord responsiveness, neighborhood, etc.</small>
        </div>
        
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary" onclick="submitReview('${propertyId}')">
            ⭐ Submit Review
          </button>
          <button class="btn btn-secondary" onclick="closeModal()">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('propertyModal').classList.add('active');
    
  } catch (error) {
    console.error('Error showing review modal:', error);
    showError('Failed to load review form. Please try again.');
  }
}

// Make functions globally accessible
window.generateStarRating = generateStarRating;
window.submitReview = submitReview;
window.showReviewModal = showReviewModal;

// ============= Utilities =============

function closeModal() {
  document.getElementById('propertyModal').classList.remove('active');
}

function showSuccess(message) {
  alert('✅ ' + message);
}

function showError(message) {
  alert('❌ ' + message);
}

// ============= Payment Functions =============

async function loadTenantPayments() {
  try {
    const response = await fetch(`${API_URL}/payments/my-payments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to load payments');
    
    const payments = await response.json();
    displayTenantPayments(payments);
  } catch (error) {
    console.error('Error loading payments:', error);
    document.getElementById('tenantPaymentsGrid').innerHTML = '<p>Error loading payments</p>';
  }
}

function displayTenantPayments(payments) {
  const grid = document.getElementById('tenantPaymentsGrid');
  
  if (payments.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No payments yet</p>';
    return;
  }
  
  grid.innerHTML = payments.map(payment => {
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
      released: 'Released to Landlord',
      rejected: 'Rejected',
      refunded: 'Refunded to You'
    };
    
    return `
      <div class="payment-card" style="background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0;">${payment.property?.title || 'Property'}</h3>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">📍 ${payment.property?.location || 'N/A'}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">$${payment.amount}</div>
            <div style="font-size: 0.85rem; color: #666;">${payment.paymentType}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem;">
          <div><strong>Method:</strong> ${payment.paymentMethod}</div>
          <div><strong>Reference:</strong> ${payment.paymentReference || 'N/A'}</div>
          <div><strong>Submitted:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</div>
          <div><strong>Landlord:</strong> ${payment.landlord?.name || 'N/A'}</div>
        </div>
        
        <div style="padding: 0.75rem; background: ${statusColors[payment.status] || '#e0e0e0'}20; border-left: 4px solid ${statusColors[payment.status] || '#e0e0e0'}; border-radius: 4px; margin-bottom: 1rem;">
          <strong style="color: ${statusColors[payment.status] || '#666'};">${statusLabels[payment.status] || 'Status: ' + payment.status}</strong>
          ${payment.verifiedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Verified: ${new Date(payment.verifiedAt).toLocaleDateString()}</p>` : ''}
          ${payment.releasedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Released: ${new Date(payment.releasedAt).toLocaleDateString()}</p>` : ''}
          ${payment.refundedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Refunded: ${new Date(payment.refundedAt).toLocaleDateString()}</p>` : ''}
          ${payment.refundReason ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;"><strong>Refund Reason:</strong> ${payment.refundReason}</p>` : ''}
          ${payment.adminNotes ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;"><strong>Admin Notes:</strong> ${payment.adminNotes}</p>` : ''}
        </div>
        
        ${payment.tenantNotes ? `
          <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 4px; font-size: 0.9rem;">
            <strong>Tenant Notes:</strong> ${payment.tenantNotes}
          </div>
        ` : ''}
        
        ${payment.paymentProof ? `
          <div style="margin-top: 1rem;">
            <a href="${payment.paymentProof.url}" target="_blank" class="btn btn-secondary" style="display: inline-block; padding: 0.5rem 1rem; text-decoration: none;">
              📄 View Payment Proof
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function showPaymentModal(applicationId, propertyId, landlordId, amount) {
  const modal = `
    <div id="paymentModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0;">💰 Make Payment</h2>
        <form id="paymentForm" onsubmit="submitPayment(event, '${applicationId}', '${propertyId}', '${landlordId}')">
          <div class="form-group">
            <label>Amount ($) *</label>
            <input type="number" id="paymentAmount" value="${amount}" required min="1" step="0.01">
          </div>
          
          <div class="form-group">
            <label>Payment Type *</label>
            <select id="paymentType" required>
              <option value="deposit">Security Deposit</option>
              <option value="rent">Rent Payment</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Payment Method *</label>
            <select id="paymentMethod" required onchange="togglePaymentProofField()">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paynow">PayNow</option>
              <option value="ecocash">EcoCash</option>
              <option value="onemoney">OneMoney</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          
          <div class="form-group" id="paymentReferenceGroup">
            <label>Payment Reference</label>
            <input type="text" id="paymentReference" placeholder="e.g., TXN123456">
            <small>Transaction ID or reference number</small>
          </div>
          
          <div class="form-group" id="paymentProofGroup">
            <label>Payment Proof (Receipt/Screenshot) *</label>
            <input type="file" id="paymentProof" accept="image/*,.pdf">
            <small>Upload receipt or payment confirmation</small>
          </div>
          
          <div class="form-group">
            <label>Notes</label>
            <textarea id="paymentNotes" rows="3" placeholder="Any additional information..."></textarea>
          </div>
          
          <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-success" style="flex: 1;">Submit Payment</button>
            <button type="button" onclick="closePaymentModal()" class="btn btn-secondary" style="flex: 1;">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modal);
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) modal.remove();
}

// Toggle payment proof field based on payment method
function togglePaymentProofField() {
  const paymentMethod = document.getElementById('paymentMethod').value;
  const proofGroup = document.getElementById('paymentProofGroup');
  const proofInput = document.getElementById('paymentProof');
  const referenceGroup = document.getElementById('paymentReferenceGroup');
  
  if (paymentMethod === 'cash') {
    // Hide proof field for cash payments
    proofGroup.style.display = 'none';
    proofInput.removeAttribute('required');
    // Also hide reference for cash
    referenceGroup.style.display = 'none';
  } else {
    // Show proof field for other payment methods
    proofGroup.style.display = 'block';
    proofInput.setAttribute('required', 'required');
    referenceGroup.style.display = 'block';
  }
}

async function submitPayment(event, applicationId, propertyId, landlordId) {
  event.preventDefault();
  
  try {
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    // Validate payment proof for non-cash payments
    if (paymentMethod !== 'cash') {
      const proofFile = document.getElementById('paymentProof').files[0];
      if (!proofFile) {
        showError('Please upload proof of payment (receipt or screenshot)');
        document.getElementById('paymentProof').focus();
        return;
      }
      
      // Validate file size (max 10MB)
      if (proofFile.size > 10 * 1024 * 1024) {
        showError('Payment proof file is too large. Maximum file size is 10MB.');
        return;
      }
      
      // Validate file type (only images and PDFs)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(proofFile.type)) {
        showError('Invalid file type. Please upload an image (JPG, PNG, GIF, WEBP) or PDF file.');
        return;
      }
    }
    
    const formData = new FormData();
    formData.append('applicationId', applicationId);
    formData.append('amount', document.getElementById('paymentAmount').value);
    formData.append('paymentType', document.getElementById('paymentType').value);
    formData.append('paymentMethod', paymentMethod);
    formData.append('paymentReference', document.getElementById('paymentReference').value);
    formData.append('tenantNotes', document.getElementById('paymentNotes').value);
    
    // Append proof file if not cash payment
    if (paymentMethod !== 'cash') {
      const proofFile = document.getElementById('paymentProof').files[0];
      formData.append('paymentProof', proofFile);
    }
    
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit payment');
    }
    
    const result = await response.json();
    alert('✅ Check-in confirmed successfully!\n\nThe admin will now release the payment to the landlord.\n\nYou can rate and checkout when ready.');
    
    // Reload applications to show updated status
    loadTenantApplications();
    resetViewedStatus('tenant', 'payments'); // Reset to show new activity
    updateTenantNotifications(); // Update notification badges
    
  } catch (error) {
    console.error('Error submitting payment:', error);
    alert('Error submitting payment:', error);
    showError(error.message || 'Failed to submit payment');
  }
}

async function loadLandlordPayments() {
  try {
    const response = await fetch(`${API_URL}/payments/landlord-payments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to load payments');
    
    const payments = await response.json();
    displayLandlordPayments(payments);
  } catch (error) {
    console.error('Error loading payments:', error);
    document.getElementById('landlordPaymentsGrid').innerHTML = '<p>Error loading payments</p>';
  }
}

function displayLandlordPayments(payments) {
  const grid = document.getElementById('landlordPaymentsGrid');
  
  if (payments.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No payments received yet</p>';
    return;
  }
  
  grid.innerHTML = payments.map(payment => {
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
      released: 'Released to You',
      rejected: 'Rejected',
      refunded: 'Refunded to Tenant'
    };
    
    return `
      <div class="payment-card" style="background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0;">${payment.property?.title || 'Property'}</h3>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">📍 ${payment.property?.location || 'N/A'}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">$${payment.amount}</div>
            <div style="font-size: 0.85rem; color: #666;">${payment.paymentType}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem;">
          <div><strong>Method:</strong> ${payment.paymentMethod}</div>
          <div><strong>Reference:</strong> ${payment.paymentReference || 'N/A'}</div>
          <div><strong>Submitted:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</div>
          <div><strong>Tenant:</strong> ${payment.tenant?.name || 'N/A'}</div>
        </div>
        
        <div style="padding: 0.75rem; background: ${statusColors[payment.status] || '#e0e0e0'}20; border-left: 4px solid ${statusColors[payment.status] || '#e0e0e0'}; border-radius: 4px; margin-bottom: 1rem;">
          <strong style="color: ${statusColors[payment.status] || '#666'};">Status: ${statusLabels[payment.status] || payment.status}</strong>
          ${payment.verifiedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Verified: ${new Date(payment.verifiedAt).toLocaleDateString()}</p>` : ''}
          ${payment.releasedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Released: ${new Date(payment.releasedAt).toLocaleDateString()}</p>` : ''}
          ${payment.refundedAt ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Refunded: ${new Date(payment.refundedAt).toLocaleDateString()}</p>` : ''}
          ${payment.refundReason ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;"><strong>Refund Reason:</strong> ${payment.refundReason}</p>` : ''}
          ${payment.adminNotes ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;"><strong>Admin Notes:</strong> ${payment.adminNotes}</p>` : ''}
        </div>
        
        ${payment.tenantNotes ? `
          <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 4px; font-size: 0.9rem;">
            <strong>Tenant Notes:</strong> ${payment.tenantNotes}
          </div>
        ` : ''}
        
        ${payment.paymentProof ? `
          <div style="margin-top: 1rem;">
            <a href="${payment.paymentProof.url}" target="_blank" class="btn btn-secondary" style="display: inline-block; padding: 0.5rem 1rem; text-decoration: none;">
              📄 View Payment Proof
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Close modal on outside click
window.onclick = function(event) {
  const modal = document.getElementById('propertyModal');
  if (event.target === modal) {
    closeModal();
  }
}

// ===== NOTIFICATION BADGES =====

// Track which sections have been viewed (to prevent re-showing badges)
const viewedSections = {
  landlord: {
    applications: false,
    payments: false,
    inquiries: false,
    messages: false
  },
  tenant: {
    applications: false,
    payments: false,
    messages: false
  }
};

// Update notification badge
function updateNotificationBadge(badgeId, count) {
  const badge = document.getElementById(badgeId);
  if (!badge) {
    console.warn(`Badge not found: ${badgeId}`);
    return;
  }
  
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// Clear badge and mark section as viewed
function clearBadgeForSection(badgeId, userRole, section) {
  updateNotificationBadge(badgeId, 0);
  if (viewedSections[userRole]) {
    viewedSections[userRole][section] = true;
  }
}

// Reset viewed status (when new activity happens)
function resetViewedStatus(userRole, section) {
  if (viewedSections[userRole]) {
    viewedSections[userRole][section] = false;
  }
}

// Load and update all notification counts for landlord
async function updateLandlordNotifications() {
  if (!authToken || currentUser?.role !== 'landlord') return;
  
  try {
    // Count pending applications
    const appsResponse = await fetch(`${API_URL}/rental-applications/received`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (appsResponse.ok) {
      const apps = await appsResponse.json();
      const pendingApps = apps.filter(app => app.status === 'pending').length;
      // Only update if section hasn't been viewed
      if (!viewedSections.landlord.applications) {
        updateNotificationBadge('applicationsNotificationBadge', pendingApps);
      }
    }
    
    // Count pending/held payments
    const paymentsResponse = await fetch(`${API_URL}/payments/landlord-payments`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (paymentsResponse.ok) {
      const payments = await paymentsResponse.json();
      const pendingPayments = payments.filter(p => ['pending', 'held'].includes(p.status)).length;
      // Only update if section hasn't been viewed
      if (!viewedSections.landlord.payments) {
        updateNotificationBadge('paymentsNotificationBadge', pendingPayments);
      }
    }
    
    // Count unread inquiries (all inquiries for now)
    const inquiriesResponse = await fetch(`${API_URL}/inquiries`);
    if (inquiriesResponse.ok) {
      const allInquiries = await inquiriesResponse.json();
      const myInquiries = allInquiries.filter(inq => 
        inq.property?.owner?._id === currentUser._id || 
        inq.property?.owner === currentUser._id
      );
      // Only update if section hasn't been viewed
      if (!viewedSections.landlord.inquiries) {
        updateNotificationBadge('inquiriesNotificationBadge', myInquiries.length);
      }
    }
    
    // Count unread messages
    const messagesResponse = await fetch(`${API_URL}/messages/conversations`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (messagesResponse.ok) {
      const conversations = await messagesResponse.json();
      const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      // Only update if section hasn't been viewed
      if (!viewedSections.landlord.messages) {
        updateNotificationBadge('messagesNotificationBadge', unreadCount);
      }
    }
    
  } catch (error) {
    console.error('Error updating notifications:', error);
  }
}

// Load and update all notification counts for tenant
async function updateTenantNotifications() {
  if (!authToken || currentUser?.role !== 'tenant') return;
  
  try {
    // Count pending/approved applications
    const appsResponse = await fetch(`${API_URL}/rental-applications/my-applications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (appsResponse.ok) {
      const apps = await appsResponse.json();
      const actionableApps = apps.filter(app => ['approved'].includes(app.status)).length;
      // Only update if section hasn't been viewed
      if (!viewedSections.tenant.applications) {
        updateNotificationBadge('tenantApplicationsNotificationBadge', actionableApps);
      }
    }
    
    // Count pending/held payments (awaiting admin action)
    const paymentsResponse = await fetch(`${API_URL}/payments/my-payments`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (paymentsResponse.ok) {
      const payments = await paymentsResponse.json();
      const actionablePayments = payments.filter(p => ['pending', 'held'].includes(p.status)).length;
      // Only update if section hasn't been viewed
      if (!viewedSections.tenant.payments) {
        updateNotificationBadge('tenantPaymentsNotificationBadge', actionablePayments);
      }
    }
    
    // Count unread messages
    const messagesResponse = await fetch(`${API_URL}/messages/conversations`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (messagesResponse.ok) {
      const conversations = await messagesResponse.json();
      const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      // Only update if section hasn't been viewed
      if (!viewedSections.tenant.messages) {
        updateNotificationBadge('tenantMessagesNotificationBadge', unreadCount);
      }
    }
    
  } catch (error) {
    console.error('Error updating tenant notifications:', error);
  }
}

// Auto-refresh notifications every 2 seconds for instant updates
setInterval(() => {
  if (currentUser?.role === 'landlord') {
    updateLandlordNotifications();
  } else if (currentUser?.role === 'tenant') {
    updateTenantNotifications();
  }
}, 2000); // Check every 2 seconds

// Make notification functions globally accessible
window.updateLandlordNotifications = updateLandlordNotifications;
window.updateTenantNotifications = updateTenantNotifications;
window.updateNotificationBadge = updateNotificationBadge;

// Make payment functions globally accessible
window.togglePaymentProofField = togglePaymentProofField;

// Initial load
if (currentUser?.role === 'landlord') {
  updateLandlordNotifications();
} else if (currentUser?.role === 'tenant') {
  updateTenantNotifications();
}
