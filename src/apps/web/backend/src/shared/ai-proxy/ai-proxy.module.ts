import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiProxyService } from './ai-proxy.service.js';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [AiProxyService],
  exports: [AiProxyService],
})
export class AiProxyModule {}