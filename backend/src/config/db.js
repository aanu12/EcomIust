const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using MONGODB_URI environment variable.
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;

    if (!connStr || connStr.includes('<username>') || connStr.includes('<password>') || connStr.includes('xxx.mongodb.net')) {
      console.warn('⚠️ MONGODB_URI contains placeholder credentials in .env. Database connection skipped for local dev.');
      return false;
    }

    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Atlas Connected: Host ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`⚠️ Database Connection Warning: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
