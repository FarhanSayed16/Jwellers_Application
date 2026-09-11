import { connectMongo, disconnectMongo } from '../db/connection';
import mongoose from 'mongoose';
import { env } from '../config/env';

async function main() {
  await connectMongo();
  console.log(
    JSON.stringify(
      {
        ok: true,
        database: mongoose.connection.name,
        clientSlug: env.CLIENT_SLUG,
        cloudinaryReady: Boolean(
          env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
        ),
        mediaFolderPrefix: `clients/${env.CLIENT_SLUG}/`,
        fcmProjectId: env.FCM_PROJECT_ID || null,
      },
      null,
      2,
    ),
  );
  await disconnectMongo();
}

main().catch(async (err) => {
  console.error('[check:env] failed', err instanceof Error ? err.message : err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
