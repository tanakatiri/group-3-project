import express from "express";
import Favorite from "../models/Favorite.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get all favorites for current user
router.get("/", protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('house')
      .sort({ createdAt: -1 });

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a favorite
router.post("/", protect, async (req, res) => {
  try {
    const { houseId } = req.body;

    // Check if already favorited
    const existing = await Favorite.findOne({
      user: req.user._id,
      house: houseId
    });

    if (existing) {
      return res.status(400).json({ message: "Property already in favorites" });
    }

    const favorite = new Favorite({
      user: req.user._id,
      house: houseId
    });

    await favorite.save();
    const populatedFavorite = await Favorite.findById(favorite._id).populate('house');

    res.status(201).json(populatedFavorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a favorite
router.delete("/:houseId", protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      house: req.params.houseId
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if property is favorited
router.get("/check/:houseId", protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      house: req.params.houseId
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
