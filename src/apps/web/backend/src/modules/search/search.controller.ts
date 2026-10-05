import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Post()
  searchQuery(@Body() body: { query: string; topK?: number; documentIds?: string[] }) {
    return this.searchService.search(body.query, body.topK ?? 5, { document_ids: body.documentIds });
  }
}