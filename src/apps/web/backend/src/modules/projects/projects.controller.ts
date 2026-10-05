import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('query') query?: string,
  ) {
    return this.projects.findAll(user.id, { page, pageSize, query });
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() body: { name: string; description?: string; color?: string; icon?: string; tags?: string[] }) {
    return this.projects.create(user.id, body);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.projects.findById(id, user.id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }, @Body() patch: Record<string, unknown>) {
    return this.projects.update(id, user.id, patch);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.projects.remove(id, user.id);
  }
}