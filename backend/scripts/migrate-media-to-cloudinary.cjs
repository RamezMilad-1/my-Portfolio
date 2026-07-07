/* One-time migration: move every image referenced in the database from
 * backend/uploads/ to Cloudinary, then rewrite all DB references
 * (media docs, project covers, certificate images, profile avatar/resume).
 *
 * Idempotent — anything already pointing at res.cloudinary.com is skipped.
 *
 * Run from the backend folder:  node scripts/migrate-media-to-cloudinary.cjs
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { v2: cloudinary } = require('cloudinary');

const BACKEND = path.resolve(__dirname, '..');
const FOLDER = 'portfolio';

// Minimal .env parser so the script needs no extra dependencies.
const env = {};
for (const line of fs.readFileSync(path.join(BACKEND, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const isLocal = (u) => typeof u === 'string' && u.startsWith('/uploads/');
const cache = new Map(); // local url -> { secure_url, public_id }

async function migrateFile(localUrl) {
  if (cache.has(localUrl)) return cache.get(localUrl);
  const rel = localUrl.replace(/^\//, ''); // uploads/images/x.png
  const abs = path.join(BACKEND, rel);
  if (!fs.existsSync(abs)) {
    console.warn('  !! missing on disk, skipped:', localUrl);
    cache.set(localUrl, null);
    return null;
  }
  const stem = path.basename(rel, path.extname(rel));
  const res = await cloudinary.uploader.upload(abs, {
    folder: FOLDER,
    public_id: stem,
    resource_type: 'image',
    overwrite: true,
  });
  const out = { secure_url: res.secure_url, public_id: res.public_id };
  cache.set(localUrl, out);
  console.log('  ->', path.basename(rel), '=>', res.secure_url);
  return out;
}

(async () => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials missing from backend/.env');
  }
  const client = new MongoClient(env.MONGO_URI);
  await client.connect();
  const db = client.db();
  console.log('connected to', db.databaseName);

  // 1. media docs
  const mediaDocs = await db.collection('media').find({ url: { $regex: '^/uploads/' } }).toArray();
  console.log(`media docs to migrate: ${mediaDocs.length}`);
  for (const m of mediaDocs) {
    const up = await migrateFile(m.url);
    if (!up) continue;
    await db.collection('media').updateOne(
      { _id: m._id },
      { $set: { url: up.secure_url, storagePath: up.public_id, updatedAt: new Date() } },
    );
  }

  // 2. project covers
  for (const p of await db.collection('projects').find({ coverImageUrl: { $regex: '^/uploads/' } }).toArray()) {
    const up = await migrateFile(p.coverImageUrl);
    if (!up) continue;
    await db.collection('projects').updateOne(
      { _id: p._id },
      { $set: { coverImageUrl: up.secure_url, updatedAt: new Date() } },
    );
    console.log('cover updated:', p.slug);
  }

  // 3. certificates
  for (const c of await db.collection('certificates').find({ imageUrl: { $regex: '^/uploads/' } }).toArray()) {
    const up = await migrateFile(c.imageUrl);
    if (!up) continue;
    await db.collection('certificates').updateOne(
      { _id: c._id },
      { $set: { imageUrl: up.secure_url, updatedAt: new Date() } },
    );
    console.log('certificate updated:', c.title);
  }

  // 4. profile avatar + resume
  const profile = await db.collection('profiles').findOne({ _id: 'singleton' });
  if (profile) {
    const set = {};
    for (const field of ['avatarUrl', 'resumeUrl']) {
      if (isLocal(profile[field])) {
        const up = await migrateFile(profile[field]);
        if (up) set[field] = up.secure_url;
      }
    }
    if (Object.keys(set).length) {
      set.updatedAt = new Date();
      await db.collection('profiles').updateOne({ _id: 'singleton' }, { $set: set });
      console.log('profile updated:', Object.keys(set).join(', '));
    }
  }

  // 5. final check — nothing should point at /uploads/ anymore
  const leftovers = {
    media: await db.collection('media').countDocuments({ url: { $regex: '^/uploads/' } }),
    covers: await db.collection('projects').countDocuments({ coverImageUrl: { $regex: '^/uploads/' } }),
    certificates: await db.collection('certificates').countDocuments({ imageUrl: { $regex: '^/uploads/' } }),
  };
  console.log('leftover local references:', JSON.stringify(leftovers));
  await client.close();
  console.log('MIGRATION COMPLETE');
})().catch((e) => { console.error('MIGRATION FAILED:', e.message); process.exit(1); });
