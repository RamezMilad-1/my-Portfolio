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
import { minutes, Throttle } from '@nestjs/throttler';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { Public } from '../common/public.decorator';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  /** The public contact form: 5 messages per 10 minutes per visitor. */
  @Public()
  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  create(@Body() dto: CreateMessageDto) {
    return this.messages.create(dto);
  }

  @Get()
  list() {
    return this.messages.list();
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateMessageDto) {
    return this.messages.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.messages.remove(id);
  }
}
