import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  ReorderProjectsDto,
  UpdateProjectDto,
} from './dto/project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  list() {
    return this.service.listPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  listAll() {
    return this.service.listAll();
  }

  @UseGuards(JwtAuthGuard)
  @Put('reorder')
  reorder(@Body() dto: ReorderProjectsDto) {
    return this.service.reorder(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('id/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
