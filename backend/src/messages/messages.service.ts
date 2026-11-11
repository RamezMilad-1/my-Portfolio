import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { Message } from './message.schema';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private readonly model: Model<Message>) {}

  async create({ fax, ...message }: CreateMessageDto): Promise<void> {
    if (fax) return; // Filled honeypot: almost certainly a bot.
    await this.model.create(message);
  }

  list() {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }

  async update(id: string, dto: UpdateMessageDto) {
    const message = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean()
      .exec();
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async remove(id: string): Promise<void> {
    const { deletedCount } = await this.model.deleteOne({ _id: id }).exec();
    if (deletedCount === 0) throw new NotFoundException('Message not found');
  }
}
