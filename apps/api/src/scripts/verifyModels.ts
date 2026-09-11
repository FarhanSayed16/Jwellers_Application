/**
 * Verifies all models + indexes.
 * Uses MONGODB_URI when reachable; otherwise spins mongodb-memory-server
 * so Phase 05 can complete without Atlas yet.
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { connectMongo, disconnectMongo, pingMongo } from '../db/connection';
import { ensureAllModelsLoaded, AdminUserModel, ShopConfigModel } from '../db/models';
import { env } from '../config/env';

async function tryRealMongo(): Promise<boolean> {
  if (!env.MONGODB_URI) return false;
  try {
    await connectMongo(env.MONGODB_URI);
    const ok = await pingMongo();
    if (!ok) {
      await disconnectMongo();
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[verify:db] real Mongo unavailable:', (err as Error).message);
    await disconnectMongo().catch(() => undefined);
    return false;
  }
}

async function main() {
  let memory: MongoMemoryServer | null = null;
  let mode: 'real' | 'memory' = 'real';

  const realOk = await tryRealMongo();
  if (!realOk) {
    mode = 'memory';
    memory = await MongoMemoryServer.create();
    await connectMongo(memory.getUri());
    console.log('[verify:db] using mongodb-memory-server');
  } else {
    console.log('[verify:db] using MONGODB_URI');
  }

  await ensureAllModelsLoaded();

  const modelNames = mongoose.modelNames().sort();
  console.log('[verify:db] models:', modelNames.join(', '));

  for (const name of modelNames) {
    await mongoose.model(name).syncIndexes();
  }

  const collections = await mongoose.connection.db!.listCollections().toArray();
  console.log(
    '[verify:db] collections:',
    collections.map((c) => c.name).sort().join(', ') || '(empty until first write)',
  );

  // Seed owner + shop on memory / empty real DB for gate proof
  const ownerEmail = 'verify-owner@demo.local';
  let owner = await AdminUserModel.findOne({ email: ownerEmail });
  if (!owner) {
    owner = await AdminUserModel.create({
      name: 'Verify Owner',
      email: ownerEmail,
      phone: '9000000001',
      passwordHash: await bcrypt.hash('VerifyOwner1!', 10),
      role: 'owner',
    });
    console.log('[verify:db] seed owner created', owner._id.toString());
  } else {
    console.log('[verify:db] seed owner exists', owner._id.toString());
  }

  let shop = await ShopConfigModel.findOne({ isActive: true });
  if (!shop) {
    shop = await ShopConfigModel.create({
      shopName: 'Demo Jewellers',
      contactPhone: '9000000000',
      themeLight: {
        primary: '#1F4B3F',
        secondary: '#3D7A6A',
        accent: '#C9A227',
        background: '#F7F5F0',
        surface: '#FFFFFF',
        textPrimary: '#14201C',
        textSecondary: '#5A6B65',
        border: '#D9D3C7',
        success: '#2E7D32',
        warning: '#ED6C02',
        error: '#C62828',
      },
      themeDark: {
        primary: '#5EBFAB',
        secondary: '#3D7A6A',
        accent: '#E0C35A',
        background: '#0E1513',
        surface: '#1A2420',
        textPrimary: '#F3F6F5',
        textSecondary: '#A8B5B0',
        border: '#2A3531',
        success: '#81C784',
        warning: '#FFB74D',
        error: '#EF9A9A',
      },
      makingChargeDefault: { type: 'percent', value: 12 },
      gstPercentDefault: 3,
      isActive: true,
    });
    console.log('[verify:db] seed shop created', shop._id.toString());
  }

  // Sample index listing for AdminUser + Item
  const adminIndexes = await AdminUserModel.collection.indexes();
  console.log(
    '[verify:db] admin_users indexes:',
    adminIndexes.map((i) => i.name).join(', '),
  );

  const ping = await pingMongo();
  console.log('[verify:db] ping:', ping, 'mode:', mode);
  console.log('[verify:db] OK — Phase 05 model gate passed');

  await disconnectMongo();
  if (memory) await memory.stop();
}

main().catch(async (err) => {
  console.error('[verify:db] failed', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
