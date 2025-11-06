import express from "express";
import House from "../models/House.js";
import { calculateRentalCost, validateRentalDates } from "../services/rentalCalculationService.js";

const router = express.Router();

/**
 * POST /api/rental-calculations/calculate
 * Calculate rental cost for a property
 */
router.post("/calculate", async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, currency = 'USD' } = req.body;
    
    // Validate input
    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ 
        message: "Property ID, check-in date, and check-out date are required" 
      });
    }
    
    // Get property
    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Validate dates
    const pricing = property.pricing || {};
    const validation = validateRentalDates(
      checkIn, 
      checkOut, 
      pricing.minimumStay || 1,
      pricing.maximumStay || 365
    );
    
    if (!validation.valid) {
      return res.status(400).json({ 
        message: "Invalid rental dates",
        errors: validation.errors 
      });
    }
    
    // Calculate cost
    const calculation = calculateRentalCost(property, checkIn, checkOut, currency);
    
    res.json({
      success: true,
      property: {
        id: property._id,
        title: property.title,
        location: property.location,
        image: property.images?.[0]?.url || property.image
      },
      calculation,
      availableCurrencies: ['USD', 'ZWL', 'ZAR', 'GBP', 'EUR']
    });
    
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(400).json({ 
      message: error.message || "Failed to calculate rental cost" 
    });
  }
});

/**
 * GET /api/rental-calculations/property/:id/pricing
 * Get pricing details for a property
 */
router.get("/property/:id/pricing", async (req, res) => {
  try {
    const property = await House.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    const pricing = property.pricing || {};
    const dailyRate = pricing.dailyRate || property.price / 30;
    
    res.json({
      success: true,
      pricing: {
        dailyRate,
        weeklyDiscount: pricing.weeklyDiscount || 10,
        monthlyDiscount: pricing.monthlyDiscount || 20,
        cleaningFee: pricing.cleaningFee || 50,
        securityDeposit: pricing.securityDeposit || property.price,
        minimumStay: pricing.minimumStay || 1,
        maximumStay: pricing.maximumStay || 365,
        // Calculated rates
        weeklyRate: dailyRate * 7 * (1 - (pricing.weeklyDiscount || 10) / 100),
        monthlyRate: dailyRate * 30 * (1 - (pricing.monthlyDiscount || 20) / 100)
      }
    });
    
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ message: "Failed to fetch pricing details" });
  }
});

/**
 * POST /api/rental-calculations/validate-dates
 * Validate rental dates for a property
 */
router.post("/validate-dates", async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.body;
    
    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ 
        message: "Property ID, check-in date, and check-out date are required" 
      });
    }
    
    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    const pricing = property.pricing || {};
    const validation = validateRentalDates(
      checkIn, 
      checkOut, 
      pricing.minimumStay || 1,
      pricing.maximumStay || 365
    );
    
    res.json({
      success: true,
      validation
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
