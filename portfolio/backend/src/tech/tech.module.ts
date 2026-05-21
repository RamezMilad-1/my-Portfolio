import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechItem, TechItemSchema } from './tech.schema';
import { TechService } from './tech.service';
import { TechController } from './tech.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TechItem.name, schema: TechItemSchema },
    ]),
  ],
  providers: [TechService],
  controllers: [TechController],
  exports: [TechService, MongooseModule],
})
export class TechModule {}
