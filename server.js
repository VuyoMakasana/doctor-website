// server.js — Doctors Cares Backend v2.0
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const connectDB = require('./db');

// Import routes
const authRoutes        = require('./routes/auth');
const doctorRoutes      = require('./routes/doctors');
const contactRoutes     = require('./routes/contact');
const appointmentRoutes = require('./routes/appointments');
const patientRoutes     = require('./routes/patients');
const blogRoutes        = require('./routes/blog');
const reviewRoutes      = require('./routes/reviews');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: '*', // In production, restrict to your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/images',    express.static(path.join(__dirname, 'public/images')));
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));
app.use('/frontend',  express.static(path.join(__dirname, '../frontend')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/blog',         blogRoutes);
app.use('/api/reviews',      reviewRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    message: 'Doctors Cares API v2.0 is running!',
    endpoints: {
      auth:         '/api/auth/login | /api/auth/signup',
      doctors:      '/api/doctors',
      appointments: '/api/appointments',
      patients:     '/api/patients',
      contact:      '/api/contact',
      blog:         '/api/blog',
      reviews:      '/api/reviews',
    },
  });
});

// Root → serve dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('============================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`API:       http://localhost:${PORT}/api`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`Website:   http://localhost:${PORT}/frontend`);
  console.log('============================================');
  console.log('');
});
