const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using MONGODB_URI environment variable.
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;

    if (!connStr || connStr.includes('<username>') || connStr.includes('<password>')) {
      console.warn('⚠️ MONGODB_URI is not configured with valid credentials in .env. Skipping DB connection.');
      return false;
    }

    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Atlas Connected: Host ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
