// ============================================================
// db.js — MongoDB Connection
// ============================================================
// This file connects your app to MongoDB.
// It is called once when the server starts.
// ============================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  // use either modern or legacy variable name
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Mongo connection string not provided. Please set MONGO_URI in your .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);

    // If we failed using an Atlas/remote string, attempt a local fallback
    if (uri.startsWith('mongodb+srv') || uri.includes('mongodb.net')) {
      console.warn('Attempting to connect to local MongoDB://localhost:27017/doctors-cares');
      try {
        const conn = await mongoose.connect('mongodb://localhost:27017/doctors-cares');
        console.log(` Local MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(` Local MongoDB Connection Error: ${localErr.message}`);
      }
    }

    // Stop the server if no connection could be established
    process.exit(1);
  }
};

module.exports = connectDB;
