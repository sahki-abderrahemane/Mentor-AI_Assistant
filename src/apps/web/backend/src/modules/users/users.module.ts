import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Session } from './entities/user.entity.js';
import { RefreshToken } from './entities/user.entity.js';
import { ApiKey } from './entities/user.entity.js';
import { UserSettings } from './entities/user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, RefreshToken, ApiKey, UserSettings])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}