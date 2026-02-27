// models/Review.js — Patient reviews
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', ReviewSchema);
