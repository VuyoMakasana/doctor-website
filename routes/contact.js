// ============================================================
// routes/contact.js — Contact Form Routes
// ============================================================
// POST /api/contact → anyone can submit the contact form
// GET  /api/contact → admin only, view all messages
// ============================================================

const express = require('express');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


// -----------------------------------------------
// POST /api/contact
// PUBLIC — Submit the contact form
// -----------------------------------------------
router.post('/', async (req, res) => {
  try {
    // accept either name or fullName for backwards compatibility with frontend
    const { fullName, name, email, phone, message } = req.body;
    const senderName = fullName || name;

    // Make sure required fields are filled in
    if (!senderName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in your name, email, and message.',
      });
    }

    // Save the message to MongoDB
    const newMessage = await Contact.create({ fullName: senderName, email, phone, message });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received.',
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// GET /api/contact
// PROTECTED — Admin views all messages
// -----------------------------------------------
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Sort by newest first (-1 means descending)
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// PUT /api/contact/:id/read
// PROTECTED — Admin only: mark a message as read
// -----------------------------------------------
router.put('/:id/read', protect, authorize('admin'), async (req, res) => {
  try {
    const msg = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// DELETE /api/contact/:id
// PROTECTED — Admin only: delete a message
// -----------------------------------------------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
