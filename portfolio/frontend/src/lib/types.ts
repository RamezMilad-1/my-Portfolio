export interface ProfileStats {
  yearsCoding?: number;
  projectsShipped?: number;
  technologies?: number;
}

export interface Profile {
  _id?: string;
  displayName: string;
  headline: string;
  bio: string;
  education: string;
  availability: string;
  email: string;
  avatarUrl: string;
  resumeUrl: string;
  socials: Record<string, string>;
  headlines?: string[];
  stats?: ProfileStats;
  aboutKicker?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  portfolioKicker?: string;
  portfolioTitle?: string;
  portfolioSubtitle?: string;
  contactKicker?: string;
  contactTitle?: string;
  contactSubtitle?: string;
  lifelineKicker?: string;
  lifelineTitle?: string;
  lifelineSubtitle?: string;
  aboutTagline?: string;
  aboutLede?: string;
  aboutFactLocation?: string;
  aboutFactStack?: string;
  aboutFactAvailable?: string;
  aboutCapabilities?: string[];
  aboutFocusKicker?: string;
  aboutFocusTitle?: string;
  aboutFocusSubtitle?: string;
  aboutFocusBlocks?: { heading?: string; body?: string }[];
}

export interface TeamMember {
  _id: string;
  name: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface Media {
  _id: string;
  projectId?: string;
  kind: 'image' | 'video';
  url: string;
  storagePath: string;
  caption: string;
  position: number;
  sizeBytes?: number;
  originalName?: string;
  createdAt?: string;
}

export interface ProjectTeamLink {
  memberId: TeamMember | string;
}

export interface Project {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  problem: string;
  description: string;
  architecture: string;
  outcome: string;
  tech: string[];
  features: string[];
  githubUrl: string;
  liveUrl: string;
  role: string;
  coverImageUrl?: string;
  team: ProjectTeamLink[];
  media: Media[];
  isFeatured: boolean;
  status: 'draft' | 'published';
  position: number;
  gallery?: string[];
  highlights?: string[];
  liveLabel?: string;
  sourceLabel?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectInput {
  slug?: string;
  name?: string;
  tagline?: string;
  problem?: string;
  description?: string;
  architecture?: string;
  outcome?: string;
  tech?: string[];
  features?: string[];
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
  coverImageUrl?: string;
  team?: { memberId: string }[];
  media?: string[];
  isFeatured?: boolean;
  status?: 'draft' | 'published';
  position?: number;
  gallery?: string[];
  highlights?: string[];
  liveLabel?: string;
  sourceLabel?: string;
  category?: string;
}

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
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificateInput {
  title?: string;
  issuer?: string;
  issuedAt?: string;
  credentialUrl?: string;
  imageUrl?: string;
  description?: string;
  position?: number;
  isPublished?: boolean;
}

export interface TimelineEntry {
  _id: string;
  year: string;
  topic: string;
  body: string;
  position: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineEntryInput {
  year?: string;
  topic?: string;
  body?: string;
  position?: number;
  isPublished?: boolean;
}

export interface TechItem {
  _id: string;
  name: string;
  position: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechItemInput {
  name?: string;
  position?: number;
  isPublished?: boolean;
}
