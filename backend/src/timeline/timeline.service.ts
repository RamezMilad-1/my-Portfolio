import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublishableCollectionService } from '../common/publishable-collection.service';
import type { CreateTimelineEntryDto, UpdateTimelineEntryDto } from './dto/timeline.dto';
import { TimelineEntry } from './timeline.schema';

@Injectable()
export class TimelineService extends PublishableCollectionService<
  TimelineEntry,
  CreateTimelineEntryDto,
  UpdateTimelineEntryDto
> {
  constructor(@InjectModel(TimelineEntry.name) model: Model<TimelineEntry>) {
    // Oldest first, matching the public timeline that ends with the latest milestone.
    super(model, { position: 1, createdAt: 1 }, 'Timeline entry not found');
  }
}
