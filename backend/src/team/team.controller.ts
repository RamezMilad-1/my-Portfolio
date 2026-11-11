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
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { TeamService } from './team.service';

/** Admin-only roster. The public site gets collaborators through each project. */
@Controller('team')
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  list() {
    return this.team.list();
  }

  @Post()
  create(@Body() dto: CreateTeamMemberDto) {
    return this.team.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.team.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.team.remove(id);
  }
}
