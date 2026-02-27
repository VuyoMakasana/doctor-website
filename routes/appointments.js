// routes/appointments.js — Appointment Management
const express     = require('express');
const Appointment = require('../models/Appointment');
const Patient     = require('../models/Patient');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/appointments — Book appointment (PUBLIC from website)
router.post('/', async (req, res) => {
  try {
    const { patientName, email, phone, appointmentDate, appointmentTime, reason, doctorName } = req.body;

    if (!patientName || !email || !phone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: name, email, phone, date, and time.',
      });
    }

    const appointment = await Appointment.create({
      patientName, email, phone, appointmentDate, appointmentTime, reason, doctorName,
    });

    res.status(201).json({
      success: true,
      message: ' Appointment booked successfully! We will confirm it shortly.',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/appointments/walkin — Walk-in patient (dashboard, protected)
router.post('/walkin', protect, async (req, res) => {
  try {
    const { patientName, phone, email, reason, appointmentTime, doctorName, date } = req.body;

    if (!patientName || !phone || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Patient name, phone, and time are required.' });
    }

    const appointmentDate = date || new Date();

    const appointment = await Appointment.create({
      patientName, email, phone,
      appointmentDate,
      appointmentTime,
      reason,
      doctorName,
      status: 'confirmed', // walk-ins are auto-confirmed
      isWalkIn: true,
    });

    // Auto-register or update patient record
    let patient = await Patient.findOne({ phone });
    if (patient) {
      patient.totalVisits += 1;
      patient.lastVisit = new Date();
      if (patient.status === 'New') patient.status = 'Regular';
      await patient.save();
    } else {
      await Patient.create({
        name: patientName, email, phone,
        status: 'New', totalVisits: 1, lastVisit: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Walk-in patient registered!',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/appointments — List appointments (protected)
router.get('/', protect, async (req, res) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    let filter = {};

    if (status && status !== 'All') filter.status = status.toLowerCase();
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialty')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/appointments/today — Today's appointments (protected)
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow },
    }).sort({ appointmentTime: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/appointments/stats — Dashboard statistics (protected)
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalToday, waiting, late, cancelled, totalPatients] = await Promise.all([
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow }, status: 'confirmed' }),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow }, status: 'late' }),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow }, status: 'cancelled' }),
      Patient.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { totalToday, waiting, late, cancelled, totalPatients },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/appointments/:id — Single appointment (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctor', 'name specialty');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/appointments/:id/status — Update status (protected)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'arrived', 'waiting', 'late', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    // If completed, update patient visit count
    if (status === 'completed') {
      await Patient.findOneAndUpdate(
        { phone: appointment.phone },
        { $inc: { totalVisits: 1 }, lastVisit: new Date(), $set: { status: 'Regular' } }
      );
    }

    res.status(200).json({ success: true, message: `Status updated to ${status}.`, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/appointments/:id — Update full appointment (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.status(200).json({ success: true, message: 'Appointment updated.', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/appointments/:id — Delete appointment (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.status(200).json({ success: true, message: 'Appointment deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
