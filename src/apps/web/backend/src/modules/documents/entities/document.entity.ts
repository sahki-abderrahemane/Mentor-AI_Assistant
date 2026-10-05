import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

export type FileType = 'pdf' | 'docx' | 'txt' | 'html' | 'markdown' | 'epub' | 'other';
export type DocumentStatus = 'uploading' | 'queued' | 'processing' | 'ready' | 'failed' | 'archived';

@Entity('documents')
@Index(['collectionId'])
@Index(['uploadedById'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_type', type: 'enum', enum: ['pdf', 'docx', 'txt', 'html', 'markdown', 'epub', 'other'] })
  fileType: FileType;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: ['uploading', 'queued', 'processing', 'ready', 'failed', 'archived'], default: 'uploading' })
  status: DocumentStatus;

  @Column({ nullable: true })
  progress: number;

  @Column({ name: 'error_message', type: 'varchar', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  authors: Array<{ name: string; affiliation?: string }>;

  @Column({ type: 'text', nullable: true })
  abstract: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'jsonb' })
  stats: {
    pages?: number;
    words: number;
    characters: number;
    chunks: number;
    citations: number;
    size: number;
    readingTimeMin: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  preview: { text: string; pageCount: number; language?: string };

  @Column({ default: false })
  starred: boolean;

  @Column({ name: 'indexed_at', nullable: true })
  indexedAt: Date;

  @Column({ name: 'collection_id' })
  collectionId: string;

  @ManyToOne('Collection', 'documents')
  @JoinColumn({ name: 'collection_id' })
  collection: any;

  @Column({ name: 'uploaded_by_id' })
  uploadedById: string;

  @ManyToOne('User', 'documents')
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('KnowledgeUnit', 'document')
  knowledgeUnits: KnowledgeUnit[];

  @OneToMany('DocumentProcessingEvent', 'document')
  processingEvents: DocumentProcessingEvent[];
}

@Entity('knowledge_units')
@Index(['documentId'])
export class KnowledgeUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @ManyToOne('Document', 'knowledgeUnits', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: any;

  @Column({ name: 'unit_number' })
  unitNumber: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ nullable: true })
  section: string;

  @Column({ nullable: true })
  subsection: string;

  @Column({ name: 'page_start', nullable: true })
  pageStart: number;

  @Column({ name: 'page_end', nullable: true })
  pageEnd: number;

  @Column({ name: 'word_count' })
  wordCount: number;

  @Column({ default: 0 })
  citations: number;

  @Column('simple-array', { nullable: true })
  tags: string[];
}

@Entity('document_processing_events')
export class DocumentProcessingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @ManyToOne('Document', 'processingEvents', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: any;

  @Column({ type: 'enum', enum: ['ingested', 'metadata_extracted', 'text_extracted', 'cleaned', 'structure_detected', 'chunked', 'completed'] })
  stage: string;

  @Column({ type: 'enum', enum: ['pending', 'running', 'done', 'failed'] })
  status: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'duration_ms', nullable: true })
  durationMs: number;

  @Column({ nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}