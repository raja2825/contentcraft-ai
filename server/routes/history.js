const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Generation = require("../models/Generation");

// @route   GET /api/history
// @desc    Get all generations for logged in user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const generations = await Generation.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // newest first
      .limit(50); // max 50 records

    res.status(200).json({
      count: generations.length,
      generations,
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a generation
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ message: "Generation not found" });
    }

    // Make sure user owns this generation
    if (generation.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Generation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

module.exports = router;