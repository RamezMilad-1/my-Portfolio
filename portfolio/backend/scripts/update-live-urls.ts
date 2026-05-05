import 'dotenv/config';
import 'reflect-metadata';
import mongoose from 'mongoose';
import { ProjectSchema } from '../src/projects/project.schema';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/ramez_portfolio';

const URL_MAP: Record<string, string> = {
  'earlyhub-events-ticketing':   'http://localhost:4002',
  'bella-vista-restaurant':      'http://localhost:4004',
  'hr-system-semester-5':        'http://localhost:4006',
  'nyc-collision-studio':        'https://nyc-collision-studio.vercel.app',
};

async function run() {
  console.log(`[update-live-urls] connecting to ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const Project = mongoose.model('Project', ProjectSchema);

  for (const [slug, liveUrl] of Object.entries(URL_MAP)) {
    const res = await Project.updateOne({ slug }, { $set: { liveUrl } });
    if (res.matchedCount === 0) {
      console.log(`[update-live-urls] no project with slug '${slug}' — skipped`);
    } else {
      console.log(`[update-live-urls] '${slug}' liveUrl = ${liveUrl}`);
    }
  }

  await mongoose.disconnect();
  console.log('[update-live-urls] done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
