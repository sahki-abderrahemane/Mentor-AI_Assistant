export interface ApiResponse<T> {
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export function Ok<T>(data: T, meta?: object): ApiResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function Paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  return {
    items,
    total,
    page,
    pageSize,
    hasNext: page * pageSize < total,
    hasPrev: page > 1,
  };
}