import mongoose from 'mongoose';
import { env } from '../config/env';

let isConnected = false;

export function getMongoConnectionState() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };
}

export async function connectMongo(uri = env.MONGODB_URI): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error('[db] MONGODB_URI is not set');
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8_000,
  });

  isConnected = true;
  console.log('[db] connected');
  return mongoose;
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  isConnected = false;
}

export async function pingMongo(): Promise<boolean> {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return false;
  }
  await mongoose.connection.db.admin().command({ ping: 1 });
  return true;
}
