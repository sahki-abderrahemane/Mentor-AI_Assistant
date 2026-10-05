import { Injectable } from '@nestjs/common';
import { AiProxyService } from '../../shared/ai-proxy/ai-proxy.service.js';

@Injectable()
export class SearchService {
  constructor(private aiProxy: AiProxyService) {}

  async search(query: string, topK = 5, filters?: { document_ids?: string[] }) {
    const result = await this.aiProxy.search(query, topK, filters);
    return result.results;
  }
}