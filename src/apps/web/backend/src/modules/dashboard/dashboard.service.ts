import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private db: DataSource) {}

  async getStats(userId: string) {
    try {
      const conv = await this.db.query(
        'SELECT COUNT(*) as count FROM conversations WHERE user_id = $1', [userId],
      );
      const docs = await this.db.query(
        'SELECT COUNT(*) as count FROM documents WHERE uploaded_by_id = $1', [userId],
      );
      return {
        conversations: parseInt(conv[0]?.count ?? 0),
        documents: parseInt(docs[0]?.count ?? 0),
        quizzesTaken: 0,
      };
    } catch {
      return { conversations: 0, documents: 0, quizzesTaken: 0 };
    }
  }

  async getRecentActivity(userId: string) {
    try {
      return await this.db.query(`
        SELECT 'conversation' as type, id, title, created_at as timestamp FROM conversations WHERE user_id = $1
        UNION ALL
        SELECT 'message' as type, id, content as title, created_at as timestamp FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = $1)
        ORDER BY timestamp DESC LIMIT 10
      `, [userId]);
    } catch {
      return [];
    }
  }
}
