// Export all types
export * from './database';

// Additional utility types
export type ID = string;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  tags?: string[];
  genre?: string;
  minRating?: number;
  maxRating?: number;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Modal types
export interface ModalContent {
  title: string;
  message: string;
}
