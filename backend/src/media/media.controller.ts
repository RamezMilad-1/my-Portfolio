import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { CreateMediaDto, CreateUploadTicketDto, UpdateMediaDto } from './dto/media.dto';
import { MediaService } from './media.service';

/** Admin-only media library. Upload flow: get a ticket → upload to Cloudinary → register it. */
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list() {
    return this.media.list();
  }

  @Post('upload-ticket')
  @HttpCode(HttpStatus.OK)
  createUploadTicket(@Body() dto: CreateUploadTicketDto) {
    return this.media.createUploadTicket(dto);
  }

  @Post()
  create(@Body() dto: CreateMediaDto) {
    return this.media.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateMediaDto) {
    return this.media.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.media.remove(id);
  }
}
