// config/db.js — MongoDB Connection Setup

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise, so we await it
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and exit the process
    // process.exit(1) means exit with failure
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
