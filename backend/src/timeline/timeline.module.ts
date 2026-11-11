import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimelineController } from './timeline.controller';
import { TimelineEntry, TimelineEntrySchema } from './timeline.schema';
import { TimelineService } from './timeline.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: TimelineEntry.name, schema: TimelineEntrySchema }])],
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}
