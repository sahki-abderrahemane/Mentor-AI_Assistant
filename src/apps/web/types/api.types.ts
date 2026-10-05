export interface ApiResponse<T> {
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type AuditFields = {
  createdAt: string;
  updatedAt: string;
};

export type ID = string;
