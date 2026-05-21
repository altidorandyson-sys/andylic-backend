const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('AndyClic - MongoDB connecte');
  } catch (error) {
    console.error('AndyClic - Erreur MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;