import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ChatService } from './chat.service.js';
import { AiProxyService } from '../../shared/ai-proxy/ai-proxy.service.js';

const FALLBACK_MODELS = [
  { id: 'Qwen/Qwen2.5-0.5B-Instruct', name: 'Qwen 2.5 0.5B Instruct', provider: 'huggingface' },
];

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatMetaController {
  constructor(
    private chat: ChatService,
    private aiProxy: AiProxyService,
  ) {}

  @Get('models')
  async models() {
    // Serve the models actually present in the local HF cache; fall back to
    // the framework default when the inference service is unreachable.
    try {
      const installed = await this.aiProxy.listInstalledModels();
      const chat = installed.filter((id) => !id.includes('MiniLM') && !id.includes('bge'));
      if (chat.length === 0) return FALLBACK_MODELS;
      return chat.map((id) => ({
        id,
        name: id.split('/').pop()?.replace(/-/g, ' ') ?? id,
        provider: 'huggingface',
      }));
    } catch {
      return FALLBACK_MODELS;
    }
  }

  @Get('folders')
  folders(@CurrentUser() user: { id: string }) {
    return this.chat.findFolders(user.id);
  }
}
