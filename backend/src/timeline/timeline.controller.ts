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
import { TimelineService } from './timeline.service';
import {
  CreateTimelineEntryDto,
  UpdateTimelineEntryDto,
} from './dto/timeline.dto';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly service: TimelineService) {}

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
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTimelineEntryDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTimelineEntryDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
