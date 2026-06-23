import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TimelineEntry,
  TimelineEntrySchema,
} from './timeline.schema';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimelineEntry.name, schema: TimelineEntrySchema },
    ]),
  ],
  providers: [TimelineService],
  controllers: [TimelineController],
  exports: [TimelineService, MongooseModule],
})
export class TimelineModule {}
