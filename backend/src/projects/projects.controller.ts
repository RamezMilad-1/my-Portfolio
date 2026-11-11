import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { Public } from '../common/public.decorator';
import { CreateProjectDto, ReorderProjectsDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Public()
  @Get()
  listPublished() {
    return this.projects.listPublished();
  }

  /** Admin list, drafts included. Declared before `:slug` so it isn't read as a slug. */
  @Get('all')
  listAll() {
    return this.projects.listAll();
  }

  @Put('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderProjectsDto) {
    return this.projects.reorder(dto);
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.projects.getById(id);
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.projects.getPublishedBySlug(slug);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.projects.remove(id);
  }
}
