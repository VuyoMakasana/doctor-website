// routes/patients.js — Patient Management
const express = require('express');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/patients — List all patients (protected)
router.get('/', protect, async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/patients/:id — Get single patient (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients — Create patient (protected)
router.post('/', protect, async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, message: 'Patient registered successfully!', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/patients/:id — Update patient (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    res.status(200).json({ success: true, message: 'Patient updated.', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/patients/:id — Delete patient (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    res.status(200).json({ success: true, message: 'Patient deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
