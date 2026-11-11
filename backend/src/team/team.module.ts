import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { TeamMember, TeamMemberSchema } from './team-member.schema';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TeamMember.name, schema: TeamMemberSchema }]),
    ProjectsModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
