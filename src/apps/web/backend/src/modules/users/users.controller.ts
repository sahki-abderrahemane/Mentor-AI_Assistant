import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('query') query?: string,
    @Query('role') role?: string,
  ) {
    return this.users.findAll({ page, pageSize, query, role });
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() patch: { name?: string; email?: string; bio?: string; avatarUrl?: string },
  ) {
    // Only admin or the user themselves can update
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new Error('Forbidden');
    }
    return this.users.update(id, patch);
  }
}