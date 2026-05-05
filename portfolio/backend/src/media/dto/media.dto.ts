import { IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() caption?: string;
}

export class UpdateMediaDto {
  @IsOptional() @IsString() caption?: string;
  @IsOptional() @IsString() projectId?: string;
}
