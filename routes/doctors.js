// ============================================================
// routes/doctors.js — Doctor API Routes
// ============================================================
// Public routes: anyone can view doctors (for the website)
// Protected routes: only admin can add/edit/delete doctors
// ============================================================

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const Doctor   = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// -----------------------------------------------
// FILE UPLOAD SETUP (for doctor photos)
// -----------------------------------------------
const storage = multer.diskStorage({
  // Where to save uploaded photos
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  // What to name the file (timestamp + original name)
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


// -----------------------------------------------
// GET /api/doctors
// PUBLIC — Get all active doctors (shown on website)
// -----------------------------------------------
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true });
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// GET /api/doctors/:id
// PUBLIC — Get a single doctor by their ID
// -----------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// POST /api/doctors
// PROTECTED — Add a new doctor (admin only)
// -----------------------------------------------
router.post('/', protect, authorize('admin'), upload.single('photo'), async (req, res) => {
  try {
    const doctorData = { ...req.body };

    // If a photo was uploaded, save its path
    if (req.file) {
      doctorData.photo = '/images/' + req.file.filename;
    }

    const doctor = await Doctor.create(doctorData);
    res.status(201).json({ success: true, data: doctor, message: 'Doctor added successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// PUT /api/doctors/:id
// PROTECTED — Update a doctor's info (admin only)
// -----------------------------------------------
router.put('/:id', protect, authorize('admin'), upload.single('photo'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.photo = '/images/' + req.file.filename;
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // "new: true" returns the updated doc
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor, message: 'Doctor updated!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// DELETE /api/doctors/:id
// PROTECTED — Delete a doctor (admin only)
// -----------------------------------------------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
