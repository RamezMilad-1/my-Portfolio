import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import type { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { TeamMember } from './team-member.schema';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(TeamMember.name) private readonly model: Model<TeamMember>,
    private readonly projects: ProjectsService,
  ) {}

  list() {
    return this.model.find().sort({ name: 1 }).lean().exec();
  }

  async create(dto: CreateTeamMemberDto) {
    return (await this.model.create(dto)).toObject();
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    const member = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean()
      .exec();
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  /** Also removes the member from every project they were linked to. */
  async remove(id: string): Promise<void> {
    const { deletedCount } = await this.model.deleteOne({ _id: id }).exec();
    if (deletedCount === 0) throw new NotFoundException('Team member not found');
    await this.projects.removeTeamMember(id);
  }
}
