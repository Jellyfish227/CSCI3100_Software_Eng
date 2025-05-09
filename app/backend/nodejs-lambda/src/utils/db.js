/**
 * MongoDB Database Connection
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get connection parameters from environment variables or use defaults
const MONGODB_USER = process.env.MONGODB_USER || 'mefbayar';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'ZlTTw0S77HEU829H';
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER || 'kaiju.nwdjnfi.mongodb.net';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || '';
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS || 'retryWrites=true&w=majority&appName=Kaiju';

// Build the connection URI from components
const MONGODB_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}/${MONGODB_DATABASE}?${MONGODB_OPTIONS}`;

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Increase connection timeout for cloud-hosted MongoDB
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let connection = null;

/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const connectToDatabase = async () => {
  if (connection) {
    return connection;
  }

  try {
    // Connect to MongoDB
    const db = await mongoose.connect(MONGODB_URI, options);
    connection = db.connection;
    
    console.log(`Connected to MongoDB: ${connection.name}`);
    console.log(`MongoDB host: ${connection.host}`);
    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

module.exports = { connectToDatabase }; 