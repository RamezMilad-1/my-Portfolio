import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechController } from './tech.controller';
import { TechItem, TechItemSchema } from './tech.schema';
import { TechService } from './tech.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: TechItem.name, schema: TechItemSchema }])],
  controllers: [TechController],
  providers: [TechService],
})
export class TechModule {}
