import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enterprise_saas';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to local/external MongoDB (${err.message}).`);
    console.log(`[Database] Initializing isolated in-memory MongoDB fallback for instant zero-dependency evaluation...`);
    
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!mongodInstance) {
        mongodInstance = await MongoMemoryServer.create({
          binary: {
            version: '7.0.14',
          },
        });
      }
      const memUri = mongodInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Successfully connected to In-Memory MongoDB (7.0.14) at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory fallback:', memErr.message);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
