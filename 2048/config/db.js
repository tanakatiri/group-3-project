import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let mongoServer;

const connectDB = async () => {
  try {
    console.log('🚀 Starting MongoDB connection...');
    
    // Always use in-memory MongoDB for development
    console.log('📦 Creating in-memory MongoDB (no installation required)...');
    
    // Create in-memory MongoDB with increased timeout
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'renthub',
        storageEngine: 'wiredTiger',
      },
    });
    
    const mongoUri = mongoServer.getUri();
    console.log('✅ In-memory MongoDB instance created');
    
    // Connect to MongoDB with increased timeouts
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      family: 4, // Use IPv4
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Set mongoose buffer timeout
    mongoose.set('bufferTimeoutMS', 30000);
    
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue without database connection');
    console.error('⚠️  API endpoints will not work until MongoDB is connected\n');
    
    // Try one more time with basic settings
    try {
      console.log('🔄 Attempting fallback connection...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 60000,
      });
      console.log(`✅ Fallback: In-memory MongoDB Connected`);
    } catch (fallbackError) {
      console.error('❌ Fallback failed:', fallbackError.message);
    }
  }
};

// Cleanup function
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

export default connectDB;
