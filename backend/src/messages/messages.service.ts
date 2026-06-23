import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private model: Model<MessageDocument>,
  ) {}

  create(dto: CreateMessageDto) {
    return this.model.create(dto);
  }

  listAll() {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Message not found');
    return { ok: true };
  }
}
