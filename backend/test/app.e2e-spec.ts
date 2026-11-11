import type { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent';

const ADMIN = { email: 'admin@example.com', password: 'correct horse battery staple' };
const API = '/api/v1';

const cloudinary = {
  createUploadTicket: jest.fn(() => ({
    uploadUrl: 'https://api.cloudinary.com/v1_1/demo/image/upload',
    fields: { folder: 'portfolio', public_id: 'abc', timestamp: '1', api_key: 'k', signature: 's' },
  })),
  getAsset: jest.fn((publicId: string) =>
    Promise.resolve({
      url: `https://res.cloudinary.com/demo/image/upload/${publicId}.png`,
      bytes: 1234,
    }),
  ),
  destroy: jest.fn(() => Promise.resolve()),
};

let ipCounter = 0;
/** Each call gets its own client IP, so the per-visitor rate limits don't interfere across tests. */
const freshIp = () => `10.0.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;

describe('Portfolio API', () => {
  let mongo: MongoMemoryServer;
  let app: INestApplication;
  let connection: Connection;
  let admin: TestAgent;

  const anon = () => request(app.getHttpServer());
  const asAdmin = () => admin;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    Object.assign(process.env, {
      NODE_ENV: 'test',
      MONGO_URI: mongo.getUri('portfolio-e2e'),
      JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long',
      CLIENT_IP_HEADER: 'cf-connecting-ip',
    });

    // Imported after the environment is set: the config module validates it on import.
    const { AppModule } = await import('../src/app.module');
    const { configureApp } = await import('../src/app.setup');
    const { CloudinaryService } = await import('../src/media/cloudinary.service');
    const { AdminsService } = await import('../src/admins/admins.service');

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CloudinaryService)
      .useValue(cloudinary)
      .compile();
    const nest = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false });
    configureApp(nest);
    await nest.init();
    app = nest;
    connection = moduleRef.get<Connection>(getConnectionToken());

    const admins = moduleRef.get(AdminsService);
    await admins.upsertAdmin(ADMIN.email, await bcrypt.hash(ADMIN.password, 4));

    admin = request.agent(app.getHttpServer());
    await admin
      .post(`${API}/auth/login`)
      .set('cf-connecting-ip', freshIp())
      .send(ADMIN)
      .expect(200);
  });

  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  describe('auth', () => {
    it('signs in with an httpOnly session cookie', async () => {
      const res = await anon()
        .post(`${API}/auth/login`)
        .set('cf-connecting-ip', freshIp())
        .send({ email: ` ${ADMIN.email.toUpperCase()} `, password: ADMIN.password })
        .expect(200);
      expect(res.body.admin.email).toBe(ADMIN.email);
      const cookie = String(res.headers['set-cookie']);
      expect(cookie).toMatch(/ramez_session=/);
      expect(cookie).toMatch(/HttpOnly/i);
    });

    it('gives the same answer for a wrong password and an unknown email', async () => {
      const wrongPassword = await anon()
        .post(`${API}/auth/login`)
        .set('cf-connecting-ip', freshIp())
        .send({ email: ADMIN.email, password: 'nope' })
        .expect(401);
      const unknownEmail = await anon()
        .post(`${API}/auth/login`)
        .set('cf-connecting-ip', freshIp())
        .send({ email: 'nobody@example.com', password: 'nope' })
        .expect(401);
      expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
    });

    it('rate-limits sign-in attempts per visitor', async () => {
      const ip = freshIp();
      for (let i = 0; i < 5; i++) {
        await anon()
          .post(`${API}/auth/login`)
          .set('cf-connecting-ip', ip)
          .send({ email: ADMIN.email, password: 'nope' })
          .expect(401);
      }
      await anon()
        .post(`${API}/auth/login`)
        .set('cf-connecting-ip', ip)
        .send({ email: ADMIN.email, password: 'nope' })
        .expect(429);
      // A different visitor is unaffected.
      await anon()
        .post(`${API}/auth/login`)
        .set('cf-connecting-ip', freshIp())
        .send({ email: ADMIN.email, password: 'nope' })
        .expect(401);
    });

    it('returns the signed-in admin and protects admin routes', async () => {
      const me = await asAdmin()
        .get(`${API}/auth/me`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(me.body.admin.email).toBe(ADMIN.email);
      for (const path of ['/auth/me', '/projects/all', '/team', '/media', '/messages']) {
        await anon().get(`${API}${path}`).set('cf-connecting-ip', freshIp()).expect(401);
      }
      await anon()
        .post(`${API}/projects`)
        .set('cf-connecting-ip', freshIp())
        .send({ slug: 'x', name: 'X' })
        .expect(401);
    });

    it('no longer exposes public registration', async () => {
      await anon()
        .post(`${API}/auth/register`)
        .set('cf-connecting-ip', freshIp())
        .send({ email: 'new@example.com', password: 'whatever-password' })
        .expect(404);
    });

    it('clears the cookie on logout', async () => {
      const res = await anon()
        .post(`${API}/auth/logout`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(String(res.headers['set-cookie'])).toMatch(/ramez_session=;/);
    });
  });

  describe('projects', () => {
    let draftId: string;

    it('validates input before touching the database', async () => {
      const post = (body: object) =>
        asAdmin().post(`${API}/projects`).set('cf-connecting-ip', freshIp()).send(body);
      await post({ slug: 'Bad Slug', name: 'X' }).expect(400);
      await post({ slug: 'all', name: 'X' }).expect(400);
      await post({ slug: 'ok', name: 'X', liveUrl: 'javascript:alert(1)' }).expect(400);
      await post({ slug: 'ok', name: 'X', media: ['not-an-id'] }).expect(400);
      await post({ slug: 'ok', name: 'X', unknownField: true }).expect(400);
      await asAdmin()
        .get(`${API}/projects/id/not-an-id`)
        .set('cf-connecting-ip', freshIp())
        .expect(400);
    });

    it('keeps drafts private and lists featured projects first', async () => {
      const create = (body: object) =>
        asAdmin().post(`${API}/projects`).set('cf-connecting-ip', freshIp()).send(body).expect(201);
      await create({ slug: 'regular', name: 'Regular', position: 0 });
      await create({ slug: 'featured', name: 'Featured', position: 1, isFeatured: true });
      const draft = await create({
        slug: 'secret-draft',
        name: 'Draft',
        status: 'draft',
        liveUrl: '',
      });
      draftId = draft.body._id;

      const list = await anon()
        .get(`${API}/projects`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect((list.body as { slug: string }[]).map((p) => p.slug)).toEqual(['featured', 'regular']);
      await anon()
        .get(`${API}/projects/secret-draft`)
        .set('cf-connecting-ip', freshIp())
        .expect(404);
      await anon().get(`${API}/projects/regular`).set('cf-connecting-ip', freshIp()).expect(200);

      const all = await asAdmin()
        .get(`${API}/projects/all`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(all.body).toHaveLength(3);
    });

    it('answers 409 for a duplicate slug', async () => {
      await asAdmin()
        .post(`${API}/projects`)
        .set('cf-connecting-ip', freshIp())
        .send({ slug: 'regular', name: 'Again' })
        .expect(409);
    });

    it('reorders and deletes', async () => {
      await asAdmin()
        .put(`${API}/projects/reorder`)
        .set('cf-connecting-ip', freshIp())
        .send({ items: [{ id: draftId, position: 7 }] })
        .expect(204);
      const draft = await asAdmin()
        .get(`${API}/projects/id/${draftId}`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(draft.body.position).toBe(7);
      await asAdmin()
        .delete(`${API}/projects/${draftId}`)
        .set('cf-connecting-ip', freshIp())
        .expect(204);
      await asAdmin()
        .delete(`${API}/projects/${draftId}`)
        .set('cf-connecting-ip', freshIp())
        .expect(404);
    });
  });

  describe('team', () => {
    it('unlinks a deleted member from every project', async () => {
      const member = await asAdmin()
        .post(`${API}/team`)
        .set('cf-connecting-ip', freshIp())
        .send({ name: 'Ada', githubUrl: 'https://github.com/ada' })
        .expect(201);
      const project = await asAdmin()
        .post(`${API}/projects`)
        .set('cf-connecting-ip', freshIp())
        .send({ slug: 'team-project', name: 'Team project', team: [{ memberId: member.body._id }] })
        .expect(201);
      expect(project.body.team[0].memberId.name).toBe('Ada');

      await asAdmin()
        .delete(`${API}/team/${member.body._id}`)
        .set('cf-connecting-ip', freshIp())
        .expect(204);
      const after = await asAdmin()
        .get(`${API}/projects/id/${project.body._id}`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(after.body.team).toEqual([]);
    });
  });

  describe('media', () => {
    it('issues upload tickets only for supported, reasonably sized files', async () => {
      const ticket = (body: object) =>
        asAdmin().post(`${API}/media/upload-ticket`).set('cf-connecting-ip', freshIp()).send(body);
      await ticket({ mimeType: 'image/png', size: 1000 }).expect(200);
      await ticket({ mimeType: 'image/svg+xml', size: 1000 }).expect(400);
      await ticket({ mimeType: 'image/png', size: 50 * 1024 * 1024 }).expect(400);
    });

    it('refuses to delete a file that is still in use', async () => {
      const media = await asAdmin()
        .post(`${API}/media`)
        .set('cf-connecting-ip', freshIp())
        .send({
          publicId: 'portfolio/cover-1',
          kind: 'image',
          originalName: 'cover.png',
          caption: 'Cover',
        })
        .expect(201);
      expect(media.body.url).toBe(
        'https://res.cloudinary.com/demo/image/upload/portfolio/cover-1.png',
      );

      const project = await asAdmin()
        .post(`${API}/projects`)
        .set('cf-connecting-ip', freshIp())
        .send({ slug: 'with-media', name: 'With media', media: [media.body._id] })
        .expect(201);
      expect(project.body.media[0]).toMatchObject({ url: media.body.url, caption: 'Cover' });
      expect(project.body.media[0].storagePath).toBeUndefined();

      const conflict = await asAdmin()
        .delete(`${API}/media/${media.body._id}`)
        .set('cf-connecting-ip', freshIp())
        .expect(409);
      expect(conflict.body.message).toContain('With media');

      await asAdmin()
        .put(`${API}/projects/${project.body._id}`)
        .set('cf-connecting-ip', freshIp())
        .send({ media: [] })
        .expect(200);
      await asAdmin()
        .delete(`${API}/media/${media.body._id}`)
        .set('cf-connecting-ip', freshIp())
        .expect(204);
      expect(cloudinary.destroy).toHaveBeenCalledWith('portfolio/cover-1', 'image');
    });
  });

  describe('profile', () => {
    it('fills missing fields with defaults and hides removed ones', async () => {
      const profiles = connection.collection<{ _id: string; [field: string]: unknown }>('profiles');
      await profiles.insertOne({
        _id: 'singleton',
        displayName: 'Legacy',
        heroSeeking: 'a field that no longer exists',
      });
      const res = await anon().get(`${API}/profile`).set('cf-connecting-ip', freshIp()).expect(200);
      expect(res.body.displayName).toBe('Legacy');
      expect(res.body.aboutCapabilities).toEqual([]);
      expect(res.body.heroSeeking).toBeUndefined();
      await profiles.deleteMany({});
    });

    it('reads defaults without creating anything, then saves', async () => {
      const empty = await anon()
        .get(`${API}/profile`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(empty.body.displayName).toBe('');

      await asAdmin()
        .put(`${API}/profile`)
        .set('cf-connecting-ip', freshIp())
        .send({ displayName: '  Ramez  ', socials: { github: 'https://github.com/x', x: '' } })
        .expect(200);
      const saved = await anon()
        .get(`${API}/profile`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(saved.body.displayName).toBe('Ramez');
      expect(saved.body.socials.github).toBe('https://github.com/x');
    });

    it('rejects removed fields and invalid links', async () => {
      const put = (body: object) =>
        asAdmin().put(`${API}/profile`).set('cf-connecting-ip', freshIp()).send(body);
      await put({ heroSeeking: 'anything' }).expect(400);
      await put({ avatarUrl: 'not a url' }).expect(400);
      await put({ socials: { github: 'javascript:alert(1)' } }).expect(400);
      await put({ email: 'not-an-email' }).expect(400);
    });
  });

  describe('timeline', () => {
    it('only accepts the known entry types', async () => {
      await asAdmin()
        .post(`${API}/timeline`)
        .set('cf-connecting-ip', freshIp())
        .send({ year: '2026', body: 'Shipped', type: 'party' })
        .expect(400);
      await asAdmin()
        .post(`${API}/timeline`)
        .set('cf-connecting-ip', freshIp())
        .send({ year: '2026', body: 'Shipped', type: 'work' })
        .expect(201);
    });
  });

  describe('messages', () => {
    it('stores real messages, silently drops honeypot ones, and supports read status', async () => {
      const ip = freshIp();
      await anon()
        .post(`${API}/messages`)
        .set('cf-connecting-ip', ip)
        .send({ name: 'Bot', email: 'bot@example.com', body: 'spam', fax: 'filled' })
        .expect(204);
      await anon()
        .post(`${API}/messages`)
        .set('cf-connecting-ip', ip)
        .send({ name: ' Jane ', email: 'jane@example.com', body: 'Hello!' })
        .expect(204);

      const list = await asAdmin()
        .get(`${API}/messages`)
        .set('cf-connecting-ip', freshIp())
        .expect(200);
      expect(list.body).toHaveLength(1);
      expect(list.body[0]).toMatchObject({ name: 'Jane', read: false });

      const updated = await asAdmin()
        .patch(`${API}/messages/${list.body[0]._id}`)
        .set('cf-connecting-ip', freshIp())
        .send({ read: true })
        .expect(200);
      expect(updated.body.read).toBe(true);
    });
  });

  it('answers the health check without a session', async () => {
    await anon().get(`${API}/health`).expect(200, { ok: true });
  });
});
