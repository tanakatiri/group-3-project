import express from "express";
import House from "../models/House.js";
import { upload } from "../config/upload.js";
import { protect } from "../middleware/auth.js";
import { authorize, isLandlord } from "../middleware/rbac.js";
import { logPropertyEvent } from "../utils/logger.js";

const router = express.Router();

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('❌ Multer error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum file size is 10MB per image.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum 5 images allowed.' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected field in file upload.' 
      });
    }
    return res.status(400).json({ 
      message: err.message || 'File upload error' 
    });
  }
  next();
};

// Get properties by owner (for landlords to see their own properties)
// IMPORTANT: This must come BEFORE /:id route to avoid conflicts
// RBAC: Only landlords can access their own properties
router.get("/my-properties", protect, authorize('landlord'), async (req, res) => {
  try {
    console.log('🔍 Fetching properties for user:', req.user._id);
    const myProperties = await House.find({ owner: req.user._id }).sort({ createdAt: -1 });
    console.log('✅ Found', myProperties.length, 'properties for this landlord');
    res.json(myProperties);
  } catch (error) {
    console.error('❌ Error fetching my properties:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all houses with advanced search and filters (public - for tenants browsing)
router.get("/", async (req, res) => {
  try {
    const {
      search,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnished,
      amenities,
      sortBy,
      minRating
    } = req.query;
    
    // Build query
    const query = {};
    
    // Search by title or location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by property type
    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Filter by bedrooms
    if (bedrooms) {
      query.bedrooms = Number(bedrooms);
    }
    
    // Filter by bathrooms
    if (bathrooms) {
      query.bathrooms = Number(bathrooms);
    }
    
    // Filter by furnished status
    if (furnished !== undefined && furnished !== 'all') {
      query.furnished = furnished === 'true';
    }
    
    // Filter by amenities
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $all: amenitiesArray };
    }
    
    // Filter by rating
    if (minRating) {
      query['rating.averageRating'] = { $gte: Number(minRating) };
    }
    
    // Build sort
    let sort = { createdAt: -1 }; // Default: newest first
    
    if (sortBy === 'price-low') {
      sort = { price: 1 };
    } else if (sortBy === 'price-high') {
      sort = { price: -1 };
    } else if (sortBy === 'rating') {
      sort = { 'rating.averageRating': -1, 'rating.totalReviews': -1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    }
    
    const houses = await House.find(query).sort(sort);
    res.json(houses);
  } catch (error) {
    console.error('Error fetching houses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single house by ID
router.get("/:id", async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new house (with image upload)
// RBAC: Only landlords can add properties
router.post("/", protect, authorize('landlord'), (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('📝 POST /api/houses - Add property request received');
    console.log('User:', req.user?.email, 'Role:', req.user?.role);
    console.log('Body:', req.body);
    
    // Validate phone number format if provided
    const { landlordContact } = req.body;
    const phoneRegex = /^\+263[0-9]{9}$/;
    
    if (landlordContact && !phoneRegex.test(landlordContact)) {
      return res.status(400).json({ 
        message: "Invalid phone number format. Please use +263 followed by 9 digits (e.g., +263771234567)" 
      });
    }
    
    // Prepare house data
    const houseData = { ...req.body };
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      houseData.images = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        isPrimary: index === 0 // First image is primary
      }));
      // Set primary image as the main image field
      houseData.image = houseData.images[0].url;
    }
    
    // Validate that at least one image is provided
    if (!houseData.image && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ 
        message: "Please provide at least one image for the property. Either upload an image file or provide an image URL." 
      });
    }
    
    const newHouse = new House(houseData);
    await newHouse.save();
    
    // Log property creation
    await logPropertyEvent(
      'property_created',
      req.user,
      newHouse._id,
      `Property created: ${newHouse.title}`,
      { location: newHouse.location, price: newHouse.price }
    );
    
    res.status(201).json(newHouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a house (with optional image upload)
// RBAC: Only landlords can update their own properties
router.put("/:id", protect, authorize('landlord'), (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('📝 PUT /api/houses/:id - Update property request received');
    console.log('Property ID:', req.params.id);
    console.log('User:', req.user?.email);
    
    // First, find the house to check ownership
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    
    // Check if user is the owner (landlords can only edit their own properties)
    if (house.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }
    
    // Validate phone number format if provided
    const { landlordContact } = req.body;
    const phoneRegex = /^\+263[0-9]{9}$/;
    
    if (landlordContact && !phoneRegex.test(landlordContact)) {
      return res.status(400).json({ 
        message: "Invalid phone number format. Please use +263 followed by 9 digits (e.g., +263771234567)" 
      });
    }
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      console.log('📸 New images uploaded:', req.files.length);
      updateData.images = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        isPrimary: index === 0
      }));
      updateData.image = updateData.images[0].url;
    }
    
    // Validate that image is not being explicitly removed (set to empty string)
    // If updateData.image is undefined, it means we're not updating the image field, which is fine
    if (updateData.image === '' || updateData.image === null) {
      return res.status(400).json({ 
        message: "Cannot remove the property image. Please provide a new image if you want to change it." 
      });
    }
    
    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Log property update
    await logPropertyEvent(
      'property_updated',
      req.user,
      updatedHouse._id,
      `Property updated: ${updatedHouse.title}`,
      { changes: Object.keys(updateData) }
    );
    
    console.log('✅ Property updated successfully');
    res.json(updatedHouse);
  } catch (error) {
    console.error('❌ Error updating property:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a house
// RBAC: Only landlords can delete their own properties
router.delete("/:id", protect, authorize('landlord'), async (req, res) => {
  try {
    // First, find the house to check ownership
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    
    // Check if user is the owner (landlords can only delete their own properties)
    if (house.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own properties" });
    }
    
    const deletedHouse = await House.findByIdAndDelete(req.params.id);
    
    // Log property deletion
    await logPropertyEvent(
      'property_deleted',
      req.user,
      house._id,
      `Property deleted: ${house.title}`,
      { location: house.location }
    );
    
    res.json({ message: "House deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
