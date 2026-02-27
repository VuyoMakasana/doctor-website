// models/Doctor.js — Doctor profiles
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialty: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
