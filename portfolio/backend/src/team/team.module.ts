import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMember, TeamMemberSchema } from './team-member.schema';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: TeamMember.name, schema: TeamMemberSchema }])],
  providers: [TeamService],
  controllers: [TeamController],
  exports: [TeamService, MongooseModule],
})
export class TeamModule {}
