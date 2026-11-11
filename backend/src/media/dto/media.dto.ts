import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { OptionalText, Trim } from '../../common/validators';
import { MEDIA_KINDS, type MediaKind, UPLOAD_MIME_TYPES } from '../media.constants';

export class CreateUploadTicketDto {
  @IsIn(UPLOAD_MIME_TYPES, { message: 'Unsupported file type' })
  mimeType: string;

  @IsInt()
  @Min(1)
  size: number;
}

/** Registers a file the browser has just uploaded to Cloudinary with an upload ticket. */
export class CreateMediaDto {
  @IsString()
  @MaxLength(255)
  @Matches(/^[\w/.-]+$/, { message: 'Invalid Cloudinary public id' })
  publicId: string;

  @IsIn(MEDIA_KINDS)
  kind: MediaKind;

  @Trim()
  @IsString()
  @MaxLength(255)
  originalName: string;

  @OptionalText(300)
  caption?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;
}

export class UpdateMediaDto {
  @OptionalText(300)
  caption?: string;
}
