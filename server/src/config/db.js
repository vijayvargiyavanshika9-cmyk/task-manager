import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;

/**
 * Connect to MongoDB with connection pooling and event listeners
 */
export const connectDB = async () => {
  if (isConnected) {
    console.log('ℹ️ Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('✅ MongoDB connected successfully to:', mongoose.connection.host);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected.');
    });

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.NODE_ENV !== 'production', // Build indexes in dev, disable in prod for performance
    });

    return conn;
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    // In production/server startup, allow caller to handle failure or retry
    throw error;
  }
};

/**
 * Gracefully close MongoDB connection
 */
export const disconnectDB = async () => {
  if (!isConnected) return;
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('🔌 MongoDB connection closed gracefully');
  } catch (err) {
    console.error('❌ Error during MongoDB disconnection:', err);
  }
};

export default connectDB;
