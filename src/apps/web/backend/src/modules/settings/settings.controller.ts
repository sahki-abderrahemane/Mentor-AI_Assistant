import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  get(@CurrentUser() user: { id: string }) {
    return this.settings.get(user.id);
  }

  @Patch()
  update(@CurrentUser() user: { id: string }, @Body() patch: Record<string, unknown>) {
    return this.settings.update(user.id, patch as never);
  }

  @Get('api-keys')
  apiKeys(@CurrentUser() user: { id: string }) {
    return this.settings.listApiKeys(user.id);
  }

  @Post('api-keys')
  createApiKey(@CurrentUser() user: { id: string }, @Body() body: { name: string; scopes?: string[] }) {
    return this.settings.createApiKey(user.id, body.name, body.scopes ?? []);
  }

  @Delete('api-keys/:id')
  deleteApiKey(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
    return this.settings.deleteApiKey(id, user.id);
  }

  @Get('integrations')
  integrations(@CurrentUser() user: { id: string }) {
    return this.settings.listIntegrations(user.id);
  }

  @Post('integrations/:id/toggle')
  toggleIntegration(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.settings.toggleIntegration(user.id, id);
  }
}
