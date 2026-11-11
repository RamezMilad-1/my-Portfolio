import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { Public } from '../common/public.decorator';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Public()
  @Get()
  listPublished() {
    return this.certificates.listPublished();
  }

  @Get('all')
  listAll() {
    return this.certificates.listAll();
  }

  @Get(':id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.certificates.getById(id);
  }

  @Post()
  create(@Body() dto: CreateCertificateDto) {
    return this.certificates.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateCertificateDto) {
    return this.certificates.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.certificates.remove(id);
  }
}
