import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifs: NotificationsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('unreadOnly', new DefaultValuePipe(false)) unreadOnly: boolean,
  ) {
    return this.notifs.findAll(user.id, { page, pageSize, unreadOnly });
  }

  @Get('unread-count')
  count(@CurrentUser() user: { id: string }) {
    return this.notifs.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.notifs.markAsRead(id, user.id);
  }

  @Post(':id/read')
  markReadPost(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.notifs.markAsRead(id, user.id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.notifs.markAllAsRead(user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.notifs.delete(id, user.id);
  }
}