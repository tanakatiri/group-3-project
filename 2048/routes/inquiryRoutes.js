import express from "express";
import Inquiry from "../models/Inquiry.js";

const router = express.Router();

// Get all inquiries
router.get("/", async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("houseId")
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inquiries for a specific house
router.get("/house/:houseId", async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ houseId: req.params.houseId })
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a new inquiry
router.post("/", async (req, res) => {
  try {
    // Validate phone number format
    const { tenantPhone } = req.body;
    const phoneRegex = /^\+263[0-9]{9}$/;
    
    if (!phoneRegex.test(tenantPhone)) {
      return res.status(400).json({ 
        message: "Invalid phone number format. Please use +263 followed by 9 digits (e.g., +263771234567)" 
      });
    }
    
    const newInquiry = new Inquiry(req.body);
    await newInquiry.save();
    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an inquiry
router.delete("/:id", async (req, res) => {
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!deletedInquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
