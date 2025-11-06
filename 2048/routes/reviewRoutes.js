import express from "express";
import Review from "../models/Review.js";
import House from "../models/House.js";
import RentalApplication from "../models/RentalApplication.js";
import { protect, authorize } from "../middleware/auth.js";
import { logReviewEvent } from "../utils/logger.js";

const router = express.Router();

/**
 * POST /api/reviews
 * Create a new review (tenants only)
 */
router.post("/", protect, authorize('tenant'), async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const tenantId = req.user._id;
    
    // Validate input
    if (!propertyId || !rating || !comment) {
      return res.status(400).json({ 
        message: "Property ID, rating, and comment are required" 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }
    
    if (comment.length < 10) {
      return res.status(400).json({ 
        message: "Comment must be at least 10 characters" 
      });
    }
    
    // Check if property exists
    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if tenant has an approved application for this property
    const approvedApplication = await RentalApplication.findOne({
      property: propertyId,
      tenant: tenantId,
      status: 'approved'
    });
    
    if (!approvedApplication) {
      return res.status(403).json({ 
        message: "You can only review properties you have rented (approved application required)" 
      });
    }
    
    // Removed move-in date check - allow reviews immediately after approval
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      property: propertyId,
      tenant: tenantId
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        message: "You have already reviewed this property. Use update instead." 
      });
    }
    
    // Create review
    const review = await Review.create({
      property: propertyId,
      tenant: tenantId,
      rating,
      comment,
      verified: true // Verified because we checked approved application
    });
    
    // Update property rating
    await updatePropertyRating(propertyId);
    
    // Mark property as available again since tenant has completed their review
    await House.findByIdAndUpdate(propertyId, { available: true });
    
    // Populate tenant info
    await review.populate('tenant', 'name email');
    
    // Log review submission
    await logReviewEvent(
      'review_submitted',
      req.user,
      review._id,
      `Review submitted for property (${rating} stars)`,
      { propertyId, rating }
    );
    
    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

/**
 * GET /api/reviews/property/:propertyId
 * Get all reviews for a property
 */
router.get("/property/:propertyId", async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

/**
 * GET /api/reviews/my-reviews
 * Get current tenant's reviews
 */
router.get("/my-reviews", protect, authorize('tenant'), async (req, res) => {
  try {
    const reviews = await Review.find({ tenant: req.user._id })
      .populate('property', 'title location images image')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

/**
 * PUT /api/reviews/:id
 * Update own review
 */
router.put("/:id", protect, authorize('tenant'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Check if user owns this review
    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own reviews" });
    }
    
    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    
    if (comment) {
      if (comment.length < 10) {
        return res.status(400).json({ message: "Comment must be at least 10 characters" });
      }
      review.comment = comment;
    }
    
    await review.save();
    
    // Update property rating
    await updatePropertyRating(review.property);
    
    await review.populate('tenant', 'name email');
    
    // Log review update
    await logReviewEvent(
      'review_updated',
      req.user,
      review._id,
      `Review updated`,
      { rating: review.rating }
    );
    
    res.json({
      success: true,
      message: "Review updated successfully",
      review
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: "Failed to update review" });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete own review
 */
router.delete("/:id", protect, authorize('tenant'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Check if user owns this review
    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }
    
    const propertyId = review.property;
    await review.deleteOne();
    
    // Update property rating
    await updatePropertyRating(propertyId);
    
    res.json({
      success: true,
      message: "Review deleted successfully"
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

/**
 * POST /api/reviews/:id/respond
 * Landlord responds to a review
 */
router.post("/:id/respond", protect, authorize('landlord'), async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment || comment.length < 10) {
      return res.status(400).json({ 
        message: "Response must be at least 10 characters" 
      });
    }
    
    const review = await Review.findById(req.params.id).populate('property');
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Check if landlord owns this property
    if (review.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "You can only respond to reviews of your properties" 
      });
    }
    
    review.response = {
      comment,
      respondedAt: new Date()
    };
    
    await review.save();
    await review.populate('tenant', 'name email');
    
    // Log landlord response
    await logReviewEvent(
      'review_response',
      req.user,
      review._id,
      `Landlord responded to review`,
      { propertyId: review.property._id }
    );
    
    res.json({
      success: true,
      message: "Response added successfully",
      review
    });
    
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({ message: "Failed to respond to review" });
  }
});

/**
 * Helper function to update property rating
 */
async function updatePropertyRating(propertyId) {
  try {
    const reviews = await Review.find({ property: propertyId });
    
    if (reviews.length === 0) {
      // No reviews, set to default 5.0
      await House.findByIdAndUpdate(propertyId, {
        'rating.averageRating': 5.0,
        'rating.totalReviews': 0
      });
    } else {
      // Calculate average
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await House.findByIdAndUpdate(propertyId, {
        'rating.averageRating': Math.round(averageRating * 10) / 10, // Round to 1 decimal
        'rating.totalReviews': reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating property rating:', error);
  }
}

export default router;
