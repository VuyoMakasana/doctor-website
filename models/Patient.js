// models/Patient.js — Patient records
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Regular'],
      default: 'New',
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
