import { Controller, Get, Post, Delete, Param, Query, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PERMISSIONS, ROLE_PERMISSIONS, UserRole } from '../../common/constants.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ) {
    return this.admin.getUsers({ page, pageSize, search });
  }

  @Get('stats')
  stats() {
    return this.admin.getStats();
  }

  @Get('roles')
  roles() {
    return {
      roles: Object.values(UserRole).map((role) => ({
        name: role,
        permissions: ROLE_PERMISSIONS[role],
      })),
      permissions: PERMISSIONS,
    };
  }

  @Get('permissions')
  permissions() {
    return PERMISSIONS;
  }

  @Get('queues')
  queues() {
    return [
      { name: 'documents', active: 0, waiting: 0, completed: 0, failed: 0 },
    ];
  }

  @Get('workers')
  workers() {
    return [
      { id: 'documents-worker-1', host: 'backend', queues: ['documents'], status: 'idle', lastHeartbeat: new Date().toISOString() },
    ];
  }

  @Get('logs')
  logs(@Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number) {
    return this.admin.getLogs(limit);
  }

  @Get('ai-services')
  aiServices() {
    return [
      { name: 'ai-inference', url: 'http://ai-inference:8000', healthy: true },
      { name: 'ai-processing', url: 'http://ai-processing:8001', healthy: true },
      { name: 'ai-training', url: 'http://ai-training:8002', healthy: true },
    ];
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      services: {
        postgres: 'up',
        redis: 'up',
        aiInference: 'up',
        aiProcessing: 'up',
        aiTraining: 'up',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('learning-analytics')
  learningAnalytics() {
    return this.admin.getLearningAnalytics();
  }

  @Post('users/:id/suspend')
  suspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.suspendUser(id);
  }

  @Post('users/:id/unsuspend')
  unsuspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.unsuspendUser(id);
  }

  @Delete('users/:id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.deleteUser(id);
  }
}
