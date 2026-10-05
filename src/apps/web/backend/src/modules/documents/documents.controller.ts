import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  Query, UseGuards, UploadedFile, UseInterceptors,
  ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, Req,
  NotFoundException, StreamableFile,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { join, resolve } from 'path';
import { existsSync, createReadStream } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { StorageService } from '../storage/storage.service.js';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private documents: DocumentsService,
    private storage: StorageService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('query') query?: string,
    @Query('collectionId') collectionId?: string,
    @Query('status') status?: string,
    @Query('fileType') fileType?: string,
    @Query('starred', new DefaultValuePipe(false)) starred?: boolean,
  ) {
    return this.documents.findAll({ page, pageSize, query, collectionId, status, fileType, starred });
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.documents.findById(id);
  }

  @Get(':id/download')
  async download(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const doc = await this.documents.findById(id);
    if (!doc.path) throw new NotFoundException('No file associated with this document');
    const filePath = resolve(doc.path);
    if (!existsSync(filePath)) throw new NotFoundException('File missing on disk');
    const fileName = doc.fileName ?? doc.title;
    return new StreamableFile(createReadStream(filePath), {
      type: doc.mimeType || 'application/octet-stream',
      disposition: `attachment; filename="${fileName}"`,
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = process.env.UPLOAD_DIR ?? '/app/uploads';
        cb(null, join(dir, 'raw'));
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
  }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
    @Body('collectionId') collectionId: string,
    @Body('projectId') _projectId?: string,
    @Body('title') title?: string,
    @Body('tags') tags?: string,
  ) {
    console.log("uploading file", file, "for user", user.id, "to collection", collectionId);
    if (!file) throw new Error('No file uploaded');
    return this.documents.upload(user.id, collectionId, {
      path: file.path,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }, {
      title,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
    });
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() patch: Record<string, unknown>) {
    return this.documents.update(id, patch);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.documents.remove(id);
  }

  @Post(':id/reindex')
  reindex(@Param('id', ParseUUIDPipe) id: string) {
    return this.documents.reindex(id);
  }
}