import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private collections: CollectionsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('query') query?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.collections.findAll(user.id, { page, pageSize, query, projectId });
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() body: { projectId: string; name: string; description?: string; icon?: string; tags?: string[] }) {
    return this.collections.create(user.id, body);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.collections.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() patch: Record<string, unknown>) {
    return this.collections.update(id, patch);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.collections.remove(id);
  }
}