import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { readdir, readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { Project, ProjectDocument } from '../projects/project.schema';

export interface ProposedProject {
  folderName: string;
  folderPath: string;
  name: string;
  tech: string[];
  githubUrl: string;
  readmeExcerpt: string;
  alreadyImported: boolean;
  existingProjectId?: string;
}

const TECH_HINTS: Array<{ key: string; label: string }> = [
  { key: 'next', label: 'Next.js' },
  { key: 'react', label: 'React' },
  { key: 'react-dom', label: 'React' },
  { key: 'vite', label: 'Vite' },
  { key: 'vue', label: 'Vue' },
  { key: 'svelte', label: 'Svelte' },
  { key: 'angular', label: 'Angular' },
  { key: '@nestjs/core', label: 'NestJS' },
  { key: 'express', label: 'Express' },
  { key: 'fastify', label: 'Fastify' },
  { key: 'mongoose', label: 'Mongoose' },
  { key: 'mongodb', label: 'MongoDB' },
  { key: 'pg', label: 'Postgres' },
  { key: 'prisma', label: 'Prisma' },
  { key: 'drizzle-orm', label: 'Drizzle' },
  { key: 'sequelize', label: 'Sequelize' },
  { key: 'tailwindcss', label: 'Tailwind' },
  { key: 'styled-components', label: 'styled-components' },
  { key: 'recharts', label: 'Recharts' },
  { key: 'plotly.js', label: 'Plotly' },
  { key: 'chart.js', label: 'Chart.js' },
  { key: 'cypress', label: 'Cypress' },
  { key: 'playwright', label: 'Playwright' },
  { key: 'jest', label: 'Jest' },
  { key: 'vitest', label: 'Vitest' },
  { key: '@tanstack/react-query', label: 'TanStack Query' },
  { key: 'axios', label: 'Axios' },
  { key: 'jsonwebtoken', label: 'JWT' },
  { key: '@nestjs/jwt', label: 'JWT' },
  { key: 'passport-jwt', label: 'Passport' },
  { key: 'bcrypt', label: 'bcrypt' },
  { key: 'bcryptjs', label: 'bcrypt' },
  { key: 'pdfkit', label: 'PDFKit' },
  { key: 'multer', label: 'Multer' },
  { key: 'socket.io', label: 'Socket.IO' },
  { key: 'typescript', label: 'TypeScript' },
];

@Injectable()
export class ScannerService {
  constructor(
    private readonly cfg: ConfigService,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  private projectsRoot() {
    return resolve(this.cfg.get<string>('PROJECTS_ROOT', '../../projects'));
  }

  async scan(): Promise<ProposedProject[]> {
    const root = this.projectsRoot();
    let entries: string[] = [];
    try {
      entries = await readdir(root);
    } catch {
      return [];
    }

    const folders: string[] = [];
    for (const e of entries) {
      try {
        const s = await stat(join(root, e));
        if (s.isDirectory()) folders.push(e);
      } catch {
        /* skip */
      }
    }

    const existing = await this.projectModel
      .find({ folderPath: { $in: folders.map((f) => `projects/${f}`) } })
      .lean()
      .exec();
    const importedMap = new Map(existing.map((p) => [p.folderPath, p]));

    const out: ProposedProject[] = [];
    for (const folder of folders) {
      const path = join(root, folder);
      const tech = await this.inferTech(path);
      const name = await this.inferName(path, folder);
      const github = await this.inferGithub(path);
      const readmeExcerpt = await this.readReadmeExcerpt(path);
      const folderPath = `projects/${folder}`;
      const existing = importedMap.get(folderPath);
      out.push({
        folderName: folder,
        folderPath,
        name,
        tech,
        githubUrl: github,
        readmeExcerpt,
        alreadyImported: !!existing,
        existingProjectId: existing?._id?.toString(),
      });
    }
    return out;
  }

  private async readPackageJson(path: string): Promise<Record<string, unknown> | null> {
    try {
      const txt = await readFile(path, 'utf8');
      return JSON.parse(txt);
    } catch {
      return null;
    }
  }

  private async inferTech(folder: string): Promise<string[]> {
    const candidates = [
      join(folder, 'package.json'),
      join(folder, 'frontend', 'package.json'),
      join(folder, 'backend', 'package.json'),
      join(folder, 'client', 'package.json'),
      join(folder, 'server', 'package.json'),
    ];
    const found = new Set<string>();

    for (const file of candidates) {
      const pkg = await this.readPackageJson(file);
      if (!pkg) continue;
      const deps: Record<string, string> = {
        ...((pkg.dependencies as Record<string, string>) ?? {}),
        ...((pkg.devDependencies as Record<string, string>) ?? {}),
      };
      for (const hint of TECH_HINTS) {
        if (deps[hint.key]) found.add(hint.label);
      }
    }

    try {
      const items = await readdir(folder);
      if (items.some((f) => f.endsWith('.ipynb'))) found.add('Jupyter');
      if (items.includes('requirements.txt')) found.add('Python');
      if (items.includes('pom.xml')) found.add('Java');
      if (items.some((f) => f.endsWith('.csproj'))) found.add('C#');
    } catch {
      /* ignore */
    }

    return Array.from(found);
  }

  private async inferName(folder: string, fallback: string): Promise<string> {
    try {
      const txt = await readFile(join(folder, 'README.md'), 'utf8');
      const m = txt.match(/^#\s+(.+)$/m);
      if (m) return m[1].trim().replace(/^[\p{Emoji}\s]+/u, '').trim();
    } catch {
      /* ignore */
    }
    return fallback;
  }

  private async inferGithub(folder: string): Promise<string> {
    try {
      const cfg = await readFile(join(folder, '.git', 'config'), 'utf8');
      const m = cfg.match(/url\s*=\s*(\S+)/);
      if (m) return m[1].replace(/\.git$/, '');
    } catch {
      /* ignore */
    }
    return '';
  }

  private async readReadmeExcerpt(folder: string): Promise<string> {
    try {
      const txt = await readFile(join(folder, 'README.md'), 'utf8');
      const lines = txt
        .split('\n')
        .filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('!['));
      return lines.slice(0, 3).join(' ').slice(0, 280);
    } catch {
      return '';
    }
  }

  async importProposal(folderName: string) {
    const root = this.projectsRoot();
    const folder = join(root, folderName);
    const tech = await this.inferTech(folder);
    const name = await this.inferName(folder, folderName);
    const githubUrl = await this.inferGithub(folder);
    const description = await this.readReadmeExcerpt(folder);

    const slug = folderName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return this.projectModel.create({
      slug,
      name,
      tagline: '',
      description,
      tech,
      githubUrl,
      folderPath: `projects/${folderName}`,
      detectedAt: new Date(),
      status: 'draft',
    });
  }
}
