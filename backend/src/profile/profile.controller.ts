import { Body, Controller, Get, Put } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Public()
  @Get()
  get() {
    return this.profile.get();
  }

  @Put()
  update(@Body() dto: UpdateProfileDto) {
    return this.profile.update(dto);
  }
}
