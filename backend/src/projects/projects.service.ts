import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  type FilterQuery,
  type HydratedDocument,
  Model,
  type Query,
  type SortOrder,
  Types,
} from 'mongoose';
import { schemaFields } from '../common/schema-fields';
import type { CreateProjectDto, ReorderProjectsDto, UpdateProjectDto } from './dto/project.dto';
import { Project, ProjectSchema } from './project.schema';

type ProjectDocument = HydratedDocument<Project>;

const PROJECT_FIELDS = schemaFields(ProjectSchema);

/** Only the fields clients need from referenced documents (no storage paths or file names). */
const MEDIA_FIELDS = 'kind url caption';
const TEAM_FIELDS = 'name githubUrl linkedinUrl';

/** Public order: featured projects first, then the admin's manual order. */
const PUBLIC_ORDER: Record<string, SortOrder> = { isFeatured: -1, position: 1, createdAt: -1 };
const ADMIN_ORDER: Record<string, SortOrder> = { position: 1, createdAt: -1 };

interface MediaRef {
  _id: Types.ObjectId;
  kind: string;
  url: string;
  caption: string;
}

interface TeamMemberRef {
  _id: Types.ObjectId;
  name: string;
  githubUrl: string;
  linkedinUrl: string;
}

type PopulatedProject = Omit<Project, 'media' | 'team'> & {
  _id: Types.ObjectId;
  media: (MediaRef | null)[];
  team: { memberId: TeamMemberRef | null }[];
};

/** References to deleted media or team members populate as `null`; never send those to clients. */
const withoutDanglingRefs = (project: PopulatedProject) => ({
  ...project,
  media: project.media.filter((media): media is MediaRef => media !== null),
  team: project.team.filter((link): link is { memberId: TeamMemberRef } => link.memberId !== null),
});

export type ProjectResponse = ReturnType<typeof withoutDanglingRefs>;

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly model: Model<Project>) {}

  listPublished(): Promise<ProjectResponse[]> {
    return this.findMany({ status: 'published' }, PUBLIC_ORDER);
  }

  listAll(): Promise<ProjectResponse[]> {
    return this.findMany({}, ADMIN_ORDER);
  }

  getPublishedBySlug(slug: string): Promise<ProjectResponse> {
    return this.findOne(this.model.findOne({ slug, status: 'published' }));
  }

  getById(id: string): Promise<ProjectResponse> {
    return this.findOne(this.model.findById(id));
  }

  /** New projects go to the end of the manual order unless a position is given. */
  async create(dto: CreateProjectDto): Promise<ProjectResponse> {
    const position = dto.position ?? (await this.model.countDocuments().exec());
    const project = await this.model.create({ ...dto, position });
    return this.getById(project.id as string);
  }

  update(id: string, dto: UpdateProjectDto): Promise<ProjectResponse> {
    return this.findOne(
      this.model.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }),
    );
  }

  async remove(id: string): Promise<void> {
    const { deletedCount } = await this.model.deleteOne({ _id: id }).exec();
    if (deletedCount === 0) throw new NotFoundException('Project not found');
  }

  async reorder({ items }: ReorderProjectsDto): Promise<void> {
    if (items.length === 0) return;
    await this.model.bulkWrite(
      items.map(({ id, position }) => ({
        updateOne: { filter: { _id: new Types.ObjectId(id) }, update: { $set: { position } } },
      })),
    );
  }

  /** Names of projects that show this file (in the gallery or as the cover). */
  async findMediaUsage(mediaId: string, url: string): Promise<string[]> {
    const projects = await this.model
      .find({ $or: [{ media: new Types.ObjectId(mediaId) }, { coverImageUrl: url }] }, { name: 1 })
      .lean()
      .exec();
    return projects.map((project) => `project “${project.name}”`);
  }

  /** Unlinks a deleted team member from every project. */
  async removeTeamMember(memberId: string): Promise<void> {
    const id = new Types.ObjectId(memberId);
    await this.model
      .updateMany({ 'team.memberId': id }, { $pull: { team: { memberId: id } } })
      .exec();
  }

  // Reads hydrate documents (instead of `.lean()`) so schema defaults fill fields that older
  // documents don't have yet, and every response has the complete shape.
  private async findMany(
    filter: FilterQuery<Project>,
    sort: Record<string, SortOrder>,
  ): Promise<ProjectResponse[]> {
    const projects = await this.withRefs(this.model.find(filter).sort(sort)).exec();
    return projects.map((project) => withoutDanglingRefs(project.toObject<PopulatedProject>()));
  }

  private async findOne(
    query: Query<ProjectDocument | null, ProjectDocument>,
  ): Promise<ProjectResponse> {
    const project = await this.withRefs(query).exec();
    if (!project) throw new NotFoundException('Project not found');
    return withoutDanglingRefs(project.toObject<PopulatedProject>());
  }

  private withRefs<Q extends Query<unknown, ProjectDocument>>(query: Q): Q {
    return query
      .select(PROJECT_FIELDS)
      .populate({ path: 'media', select: MEDIA_FIELDS })
      .populate({ path: 'team.memberId', select: TEAM_FIELDS }) as Q;
  }
}
