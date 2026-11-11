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
import { CreateTimelineEntryDto, UpdateTimelineEntryDto } from './dto/timeline.dto';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timeline: TimelineService) {}

  @Public()
  @Get()
  listPublished() {
    return this.timeline.listPublished();
  }

  @Get('all')
  listAll() {
    return this.timeline.listAll();
  }

  @Get(':id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.timeline.getById(id);
  }

  @Post()
  create(@Body() dto: CreateTimelineEntryDto) {
    return this.timeline.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateTimelineEntryDto) {
    return this.timeline.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.timeline.remove(id);
  }
}
