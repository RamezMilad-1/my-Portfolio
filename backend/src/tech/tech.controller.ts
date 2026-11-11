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
import { CreateTechItemDto, UpdateTechItemDto } from './dto/tech.dto';
import { TechService } from './tech.service';

@Controller('tech')
export class TechController {
  constructor(private readonly tech: TechService) {}

  @Public()
  @Get()
  listPublished() {
    return this.tech.listPublished();
  }

  @Get('all')
  listAll() {
    return this.tech.listAll();
  }

  @Get(':id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.tech.getById(id);
  }

  @Post()
  create(@Body() dto: CreateTechItemDto) {
    return this.tech.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateTechItemDto) {
    return this.tech.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.tech.remove(id);
  }
}
