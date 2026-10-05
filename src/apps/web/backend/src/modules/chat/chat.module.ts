import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message, ConversationFolder } from './entities/chat.entity.js';
import { ChatController } from './chat.controller.js';
import { ChatMetaController } from './chat-meta.controller.js';
import { ChatService } from './chat.service.js';
import { ChatGateway } from './chat.gateway.js';
import { AiProxyModule } from '../../shared/ai-proxy/ai-proxy.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, ConversationFolder]),
    AiProxyModule,
  ],
  controllers: [ChatController, ChatMetaController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}