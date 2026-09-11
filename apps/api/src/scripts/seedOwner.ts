import bcrypt from 'bcryptjs';
import { connectMongo, disconnectMongo } from '../db/connection';
import { AdminUserModel } from '../db/models/AdminUser';
import { env } from '../config/env';

async function main() {
  await connectMongo();

  const isRatnaraj = env.CLIENT_SLUG === 'ratnaraj';
  const email =
    process.env.SEED_OWNER_EMAIL ??
    (isRatnaraj ? 'owner@ratnaraj.jewellers.local' : 'owner@demo.jewellers.local');
  const phone = process.env.SEED_OWNER_PHONE ?? '9999999999';
  const password = process.env.SEED_OWNER_PASSWORD ?? 'ChangeMeOwner1!';
  const name =
    process.env.SEED_OWNER_NAME ?? (isRatnaraj ? 'Ratnaraj Owner' : 'Demo Owner');

  const existing = await AdminUserModel.findOne({
    $or: [{ email }, { phone }],
  });

  if (existing) {
    console.log('[seed:owner] owner already exists:', existing.email ?? existing.phone);
    await disconnectMongo();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const owner = await AdminUserModel.create({
    name,
    email,
    phone,
    passwordHash,
    role: 'owner',
    isActive: true,
  });

  console.log('[seed:owner] created', {
    id: owner._id.toString(),
    email: owner.email,
    phone: owner.phone,
    clientSlug: env.CLIENT_SLUG,
  });
  console.log('[seed:owner] temporary password:', password);

  await disconnectMongo();
}

main().catch(async (err) => {
  console.error('[seed:owner] failed', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
