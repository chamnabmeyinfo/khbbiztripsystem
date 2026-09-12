/**
 * Standard API Response Envelope & Common Types
 * KHB Biz Trip System - Modular Backend
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, any>;
  timestamp?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}
