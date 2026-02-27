// ============================================================
// routes/reviews.js — Patient Review Routes
// ============================================================
// POST /api/reviews            → public, submit a review
// GET  /api/reviews            → public, get approved reviews
// GET  /api/reviews/all        → admin, see all reviews
// PUT  /api/reviews/:id/approve → admin, approve a review
// DELETE /api/reviews/:id      → admin, delete a review
// ============================================================

const express  = require('express');
const Review   = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


// -----------------------------------------------
// POST /api/reviews
// PUBLIC — Submit a patient review
// -----------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { patientName, message, rating } = req.body;

    if (!patientName || !message) {
      return res.status(400).json({ success: false, message: 'Name and message are required.' });
    }

    const review = await Review.create({ patientName, message, rating });

    res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will appear after approval.',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// GET /api/reviews
// PUBLIC — Get only approved reviews (for website)
// -----------------------------------------------
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// GET /api/reviews/all
// PROTECTED — Admin sees ALL reviews (approved + pending)
// -----------------------------------------------
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// PUT /api/reviews/:id/approve
// PROTECTED — Approve a review so it shows on site (admin only)
// -----------------------------------------------
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: review, message: 'Review approved!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// DELETE /api/reviews/:id
// PROTECTED — Delete a review (admin only)
// -----------------------------------------------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
