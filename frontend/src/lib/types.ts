/** Shapes returned by the API. Every field is always present (the API fills schema defaults). */

export type MediaKind = 'image' | 'video' | 'raw';

export interface Media {
  _id: string;
  /** The project the file was uploaded for, if any. */
  projectId?: string;
  kind: MediaKind;
  url: string;
  storagePath: string;
  caption: string;
  sizeBytes: number;
  originalName: string;
  createdAt: string;
}

/** A media item as embedded in a project. */
export interface ProjectMedia {
  _id: string;
  kind: MediaKind;
  url: string;
  caption: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  githubUrl: string;
  linkedinUrl: string;
}

export type TeamMemberInput = Omit<TeamMember, '_id'>;

export type ProjectStatus = 'draft' | 'published';

export interface Project {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  role: string;
  problem: string;
  description: string;
  architecture: string;
  outcome: string;
  tech: string[];
  features: string[];
  highlights: string[];
  githubUrl: string;
  liveUrl: string;
  liveLabel: string;
  sourceLabel: string;
  coverImageUrl: string;
  media: ProjectMedia[];
  team: { memberId: TeamMember }[];
  isFeatured: boolean;
  status: ProjectStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectInput = Omit<
  Project,
  '_id' | 'media' | 'team' | 'position' | 'createdAt' | 'updatedAt'
> & {
  media: string[];
  team: { memberId: string }[];
  /** New projects are appended to the end when omitted. */
  position?: number;
};

export interface Socials {
  github: string;
  linkedin: string;
  x: string;
  website: string;
}

export interface AboutFocusBlock {
  heading: string;
  body: string;
}

export interface Profile {
  displayName: string;
  logoInitial: string;
  /** One-liner under the hero headline. */
  headline: string;
  /** The first entry is the hero's big role headline. */
  headlines: string[];
  bio: string;
  education: string;
  availability: string;
  email: string;
  avatarUrl: string;
  resumeUrl: string;
  socials: Partial<Socials>;
  aboutKicker: string;
  aboutTitle: string;
  aboutSubtitle: string;
  portfolioKicker: string;
  portfolioTitle: string;
  portfolioSubtitle: string;
  lifelineKicker: string;
  lifelineTitle: string;
  lifelineSubtitle: string;
  contactKicker: string;
  contactTitle: string;
  contactSubtitle: string;
  aboutTagline: string;
  aboutLede: string;
  aboutFactLocation: string;
  aboutFactStack: string;
  aboutFactAvailable: string;
  aboutDividerLabel: string;
  aboutCapabilities: string[];
  aboutFocusBlocks: AboutFocusBlock[];
  contactCTALabel: string;
  responseTime: string;
  updatedAt?: string;
}

export type ProfileInput = Partial<Omit<Profile, 'updatedAt'>>;

export interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  issuedAt: string;
  credentialUrl: string;
  imageUrl: string;
  description: string;
  position: number;
  isPublished: boolean;
}

export type CertificateInput = Omit<Certificate, '_id'>;

export const TIMELINE_TYPES = ['education', 'work', 'achievement', 'personal'] as const;
export type TimelineType = (typeof TIMELINE_TYPES)[number];

export interface TimelineEntry {
  _id: string;
  year: string;
  topic: string;
  body: string;
  type: TimelineType;
  organization: string;
  position: number;
  isPublished: boolean;
}

export type TimelineEntryInput = Omit<TimelineEntry, '_id'>;

export interface TechItem {
  _id: string;
  name: string;
  category: string;
  position: number;
  isPublished: boolean;
}

export type TechItemInput = Omit<TechItem, '_id'>;

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  body: string;
  /** Honeypot — always empty for people. */
  fax: string;
}

export interface AdminUser {
  id: string;
  email: string;
}
