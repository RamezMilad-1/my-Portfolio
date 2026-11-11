import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublishableCollectionService } from '../common/publishable-collection.service';
import type { CreateTechItemDto, UpdateTechItemDto } from './dto/tech.dto';
import { TechItem } from './tech.schema';

@Injectable()
export class TechService extends PublishableCollectionService<
  TechItem,
  CreateTechItemDto,
  UpdateTechItemDto
> {
  constructor(@InjectModel(TechItem.name) model: Model<TechItem>) {
    super(model, { position: 1, name: 1 }, 'Tech item not found');
  }
}
