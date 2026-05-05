export interface SkillItem {
  name: string;
  level?: string;
}
export interface SkillCategory {
  category: string;
  items: SkillItem[];
}
export interface TimelineEntry {
  year: string;
  title: string;
  body?: string;
}
export interface Profile {
  _id?: string;
  displayName: string;
  headline: string;
  bio: string;
  email: string;
  avatarUrl: string;
  resumeUrl: string;
  socials: Record<string, string>;
  skills: SkillCategory[];
  timeline: TimelineEntry[];
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  githubUrl: string;
  linkedinUrl: string;
  avatarUrl: string;
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
  roleInProject: string;
}

export interface Project {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  architecture: string;
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
  folderPath?: string;
  detectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
