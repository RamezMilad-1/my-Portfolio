import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';

/** Rejects route ids that aren't 24-character hex ObjectIds with a 400 instead of a database error. */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isMongoId(value)) throw new BadRequestException('Invalid id');
    return value;
  }
}
