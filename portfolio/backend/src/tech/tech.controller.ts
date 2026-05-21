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
import { TechService } from './tech.service';
import { CreateTechItemDto, UpdateTechItemDto } from './dto/tech.dto';

@Controller('tech')
export class TechController {
  constructor(private readonly service: TechService) {}

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
  create(@Body() dto: CreateTechItemDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTechItemDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
