import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { TrainingService } from './training.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private training: TrainingService) {}

  @Post('jobs')
  create(
    @CurrentUser() user: { id: string },
    @Body() body: { baseModelId: string; datasetSource?: string; hyperparameters?: Record<string, unknown> },
  ) {
    return this.training.createJob(user.id, body);
  }

  @Get('jobs')
  list(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('status') status?: string,
  ) {
    return this.training.getJobs(user.id, { page, pageSize, status: status as never });
  }

  @Get('jobs/:id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.training.getJob(id);
  }

  @Post('jobs/:id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.training.cancelJob(id, user.id);
  }

  @Post('jobs/:id/start')
  start(@Param('id', ParseUUIDPipe) id: string) {
    return this.training.startTraining(id);
  }

  @Get('models')
  models(@CurrentUser() user: { id: string }) {
    return this.training.getModels(user.id);
  }

  @Get('adapters')
  adapters(@CurrentUser() user: { id: string }) {
    return this.training.getAdapters(user.id);
  }

  @Delete('models/:id')
  deleteModel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.training.deleteModel(id, user.id);
  }
}