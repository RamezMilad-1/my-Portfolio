import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './team-member.schema';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';

@Injectable()
export class TeamService {
  constructor(@InjectModel(TeamMember.name) private model: Model<TeamMemberDocument>) {}

  list() {
    return this.model.find().sort({ name: 1 }).lean().exec();
  }

  create(dto: CreateTeamMemberDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Team member not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Team member not found');
    return { ok: true };
  }
}
