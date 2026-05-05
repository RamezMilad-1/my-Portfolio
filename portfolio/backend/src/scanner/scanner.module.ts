import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';

@Module({
  imports: [ProjectsModule],
  providers: [ScannerService],
  controllers: [ScannerController],
})
export class ScannerModule {}
