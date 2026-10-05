import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { StudyGuidesService } from './study-guides.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('study-guides')
@UseGuards(JwtAuthGuard)
export class StudyGuidesController {
  constructor(private guides: StudyGuidesService) {}

  @Get()
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.guides.findAll({ page, pageSize, subjectId });
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.guides.findById(id);
  }
}