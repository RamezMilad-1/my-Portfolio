import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './project.schema';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  /** Used by Media (to refuse deleting files still in use) and Team (to unlink members). */
  exports: [ProjectsService],
})
export class ProjectsModule {}
