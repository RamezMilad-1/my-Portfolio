import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScannerService } from './scanner.service';

class ImportDto {
  @IsString() folderName: string;
}

@UseGuards(JwtAuthGuard)
@Controller('scanner')
export class ScannerController {
  constructor(private readonly service: ScannerService) {}

  @Post('run')
  run() {
    return this.service.scan();
  }

  @Post('import')
  importOne(@Body() body: ImportDto) {
    return this.service.importProposal(body.folderName);
  }
}
