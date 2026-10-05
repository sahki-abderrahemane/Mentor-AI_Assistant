export interface AdminSystemHealth {
  status: string;
  services: Record<string, string>;
  timestamp: string;
}

export interface AdminQueue {
  name: string;
  active: number;
  waiting: number;
  completed: number;
  failed: number;
}

export interface AdminAIService {
  name: string;
  url: string;
  healthy: boolean;
}

export interface AdminLogsResponse {
  items: Array<Record<string, unknown>>;
  note?: string;
}

export interface AdminLearningAnalytics {
  totalUsers: number;
  totalSessions: number;
  totalDocuments: number;
  totalConversations: number;
  averageMastery: number;
}
