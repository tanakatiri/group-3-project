import express from "express";
import RentalApplication from "../models/RentalApplication.js";
import House from "../models/House.js";
import { protect, authorize } from "../middleware/auth.js";
import { logApplicationEvent } from "../utils/logger.js";

const router = express.Router();

// Submit rental application (Tenant only)
router.post("/", protect, authorize('tenant'), async (req, res) => {
  try {
    const { propertyId, moveInDate, leaseDuration, message, tenantInfo } = req.body;
    
    // Get property details
    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (!property.available) {
      return res.status(400).json({ message: "Property is not available for rent" });
    }
    
    // Check if tenant already has pending application for this property
    const existingApplication = await RentalApplication.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: 'pending'
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: "You already have a pending application for this property" });
    }
    
    const application = new RentalApplication({
      property: propertyId,
      tenant: req.user._id,
      landlord: property.owner,
      moveInDate,
      leaseDuration,
      message,
      tenantInfo
    });
    
    await application.save();
    
    const populatedApplication = await RentalApplication.findById(application._id)
      .populate('property', 'title location price image')
      .populate('tenant', 'name email phone')
      .populate('landlord', 'name email phone');
    
    // Log application submission
    await logApplicationEvent(
      'application_submitted',
      req.user,
      application._id,
      `Application submitted for property: ${property.title}`,
      { propertyId, moveInDate, leaseDuration }
    );
    
    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get tenant's applications
router.get("/my-applications", protect, authorize('tenant'), async (req, res) => {
  try {
    const applications = await RentalApplication.find({ tenant: req.user._id })
      .populate('property', 'title location price image images available')
      .populate('landlord', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get landlord's received applications
router.get("/received", protect, authorize('landlord'), async (req, res) => {
  try {
    const applications = await RentalApplication.find({ landlord: req.user._id })
      .populate('property', 'title location price image images available')
      .populate('tenant', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status (Landlord only)
router.put("/:id/status", protect, authorize('landlord'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const application = await RentalApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Check if landlord owns the property
    if (application.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    application.status = status;
    await application.save();
    
    // If approved, mark property as unavailable
    if (status === 'approved') {
      await House.findByIdAndUpdate(application.property, { available: false });
    }
    
    // Log application status change
    const eventType = status === 'approved' ? 'application_approved' : 'application_rejected';
    await logApplicationEvent(
      eventType,
      req.user,
      application._id,
      `Application ${status} by landlord`,
      { status, tenantId: application.tenant }
    );
    
    const updatedApplication = await RentalApplication.findById(application._id)
      .populate('property', 'title location price image')
      .populate('tenant', 'name email phone');
    
    res.json(updatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel application (Tenant only)
router.put("/:id/cancel", protect, authorize('tenant'), async (req, res) => {
  try {
    const application = await RentalApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    if (application.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({ message: "Can only cancel pending applications" });
    }
    
    application.status = 'cancelled';
    await application.save();
    
    // Log application cancellation
    await logApplicationEvent(
      'application_cancelled',
      req.user,
      application._id,
      `Application cancelled by tenant`,
      { propertyId: application.property }
    );
    
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all applications (Admin only)
router.get("/all", protect, authorize('admin'), async (req, res) => {
  try {
    const applications = await RentalApplication.find()
      .populate('property', 'title location price')
      .populate('tenant', 'name email')
      .populate('landlord', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
