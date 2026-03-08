/**
 * Types et interfaces partagés à travers toute l'application
 */

// === API RESPONSES ===

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// === AUTHENTICATION ===

export interface AuthContext {
  id: string;
  email: string;
  username: string;
}

// === PAGINATION ===

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// === IDENTIFIERS ===

export type UUID = string;

// === TIMESTAMPS ===

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}
