import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('stats')
  stats(@CurrentUser() user: { id: string }) {
    return this.dashboard.getStats(user.id);
  }

  @Get('activity')
  activity(@CurrentUser() user: { id: string }) {
    return this.dashboard.getRecentActivity(user.id);
  }

  @Get('recent-activity')
  recentActivity(@CurrentUser() user: { id: string }) {
    return this.dashboard.getRecentActivity(user.id);
  }

  @Get('gpu')
  gpu() {
    return {
      gpus: [
        { id: 0, name: 'CPU', utilization: 0, memoryUsed: 0, memoryTotal: 0, temperatureC: 0 },
      ],
    };
  }
}
