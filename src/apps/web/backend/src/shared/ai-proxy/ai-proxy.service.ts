import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, Observer } from 'rxjs';

export interface InferenceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SearchResult {
  id: string;
  documentId: string;
  documentTitle: string;
  collectionId?: string;
  collectionName?: string;
  pageStart?: number;
  pageEnd?: number;
  section?: string;
  subsection?: string;
  snippet: string;
  text?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AiProxyService {
  private inferenceUrl: string;
  private processingUrl: string;
  private trainingUrl: string;

  constructor(
    config: ConfigService,
    private http: HttpService,
  ) {
    this.inferenceUrl = config.get<string>('AI_INFERENCE_URL')!;
    this.processingUrl = config.get<string>('AI_PROCESSING_URL')!;
    this.trainingUrl = config.get<string>('AI_TRAINING_URL')!;
  }

  // ── Inference ──────────────────────────────────────────────────────────────

  /**
   * Streams an OpenAI-compatible /v1/chat/completions response and emits
   * parsed delta chunks: { content: string; finishReason: string | null; done: boolean }.
   * The resulting Observable can be piped to a NestJS @Sse() handler.
   */
  streamChatCompletion(
    messages: InferenceMessage[],
    model: string,
  ): Observable<{ content: string; finishReason: string | null; done: boolean }> {
    return new Observable((observer: Observer<{ content: string; finishReason: string | null; done: boolean }>) => {
      let cancelled = false;
      let completed = false;
      const streamPromise = this.http.axiosRef.post(
        `${this.inferenceUrl}/v1/chat/completions`,
        { model, messages, stream: true },
        { responseType: 'stream' },
      );

      streamPromise
        .then((response) => {
          const stream = response.data as NodeJS.ReadableStream;
          let buffer = '';

          stream.on('data', (chunk: Buffer | string) => {
            if (cancelled || completed) return;
            buffer += chunk.toString();
            let idx: number;
            while ((idx = buffer.indexOf('\n')) !== -1) {
              const rawLine = buffer.slice(0, idx).trim();
              buffer = buffer.slice(idx + 1);
              if (!rawLine || !rawLine.startsWith('data:')) continue;
              const payload = rawLine.slice(5).trim();
              if (payload === '[DONE]') {
                completed = true;
                observer.next({ content: '', finishReason: null, done: true });
                observer.complete();
                return;
              }
              try {
                const json = JSON.parse(payload) as {
                  choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
                };
                const choice = json.choices?.[0];
                const content = choice?.delta?.content ?? '';
                const finishReason = choice?.finish_reason ?? null;
                const done = finishReason === 'stop';
                if (content || done) {
                  observer.next({ content, finishReason, done });
                }
                if (done) {
                  completed = true;
                  observer.complete();
                  return;
                }
              } catch {
                // partial JSON — wait for more data
              }
            }
          });

          stream.on('error', (err: unknown) => {
            if (!cancelled) observer.error(err);
          });

          stream.on('end', () => {
            if (cancelled || completed) return;
            completed = true;
            observer.next({ content: '', finishReason: null, done: true });
            observer.complete();
          });
        })
        .catch((err: unknown) => {
          if (!cancelled) observer.error(err);
        });

      return () => {
        cancelled = true;
      };
    });
  }

  async chatCompletion(
    messages: InferenceMessage[],
    model: string,
  ): Promise<{ content: string; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const result = await this.http.axiosRef.post(
      `${this.inferenceUrl}/v1/chat/completions`,
      { model, messages, stream: false },
    );
    const choice = result.data.choices[0];
    return {
      content: choice.message.content,
      usage: result.data.usage,
    };
  }

  async generateEmbedding(texts: string[]): Promise<number[][]> {
    const result = await this.http.axiosRef.post(`${this.processingUrl}/batch-embed`, { texts });
    return result.data.embeddings;
  }

  // ── Processing ──────────────────────────────────────────────────────────────

  async processPdf(pdfPath: string, documentId?: string, documentTitle?: string): Promise<{
    knowledgeUnits: Array<Record<string, unknown>>;
    metadata: Record<string, unknown>;
  }> {
    const result = await this.http.axiosRef.post(`${this.processingUrl}/process-pdf`, {
      pdf_path: pdfPath,
      document_id: documentId,
      document_title: documentTitle,
    });
    return result.data;
  }

  async indexChunks(chunks: Array<Record<string, unknown>>, embeddings: number[][]): Promise<void> {
    await this.http.axiosRef.post(`${this.processingUrl}/index-chunks`, { knowledge_units: chunks, embeddings });
  }

  async removeDocument(documentId: string): Promise<void> {
    await this.http.axiosRef.post(`${this.processingUrl}/remove-document`, { document_id: documentId });
  }

  async search(query: string, topK: number, filters?: { document_ids?: string[] }): Promise<{
    results: SearchResult[];
  }> {
    const result = await this.http.axiosRef.post(`${this.processingUrl}/search`, {
      query,
      top_k: topK,
      filters,
    });
    return result.data;
  }

  async listSections(documentIds: string[]): Promise<{
    documents: Array<{ documentId: string; documentTitle: string; titles: string[] }>;
  }> {
    const result = await this.http.axiosRef.post(`${this.processingUrl}/sections`, {
      document_ids: documentIds,
    });
    return result.data;
  }

  // ── Training ───────────────────────────────────────────────────────────────

  async createTrainingJob(payload: Record<string, unknown>): Promise<string> {
    const result = await this.http.axiosRef.post(`${this.trainingUrl}/jobs`, payload);
    return result.data.job_id;
  }

  async startTrainingJob(jobId: string, config: Record<string, unknown>): Promise<void> {
    await this.http.axiosRef.post(`${this.trainingUrl}/jobs/${jobId}/start`, config);
  }

  async cancelTrainingJob(jobId: string): Promise<void> {
    await this.http.axiosRef.post(`${this.trainingUrl}/jobs/${jobId}/cancel`);
  }

  async getTrainingJobStatus(jobId: string): Promise<Record<string, unknown>> {
    const result = await this.http.axiosRef.get(`${this.trainingUrl}/jobs/${jobId}`);
    return result.data;
  }

  // ── Health checks ──────────────────────────────────────────────────────────

  async checkInference(): Promise<void> {
    await this.http.axiosRef.get(`${this.inferenceUrl}/health`, { timeout: 3000 });
  }

  async checkProcessing(): Promise<void> {
    await this.http.axiosRef.get(`${this.processingUrl}/health`, { timeout: 3000 });
  }

  async checkTraining(): Promise<void> {
    await this.http.axiosRef.get(`${this.trainingUrl}/health`, { timeout: 3000 });
  }

  // ── Model management (via the framework's inference/processing services) ──

  async listInstalledModels(): Promise<string[]> {
    const result = await this.http.axiosRef.get(`${this.inferenceUrl}/models/installed`);
    return result.data.models as string[];
  }

  async installModel(repoId: string): Promise<{ jobId: string }> {
    const result = await this.http.axiosRef.post(`${this.inferenceUrl}/models/install`, { repo_id: repoId });
    return { jobId: result.data.job_id };
  }

  async getInstallStatus(jobId: string): Promise<Record<string, unknown>> {
    const result = await this.http.axiosRef.get(`${this.inferenceUrl}/models/install/${jobId}`);
    return result.data;
  }

  async cancelInstall(jobId: string): Promise<void> {
    await this.http.axiosRef.post(`${this.inferenceUrl}/models/install/${jobId}/cancel`);
  }

  async uninstallModel(repoId: string): Promise<boolean> {
    const result = await this.http.axiosRef.delete(`${this.inferenceUrl}/models`, { data: { repo_id: repoId } });
    return Boolean(result.data.removed);
  }
}