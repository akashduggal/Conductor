export type Modality = 'text' | 'image' | 'audio' | 'video' | 'multimodal';

export interface Dataset {
  id: string;
  name: string;
  modality: Modality;
  size_bytes: number;
  file_count: number;
  description?: string;
  storage_path?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  stats?: {
    experiments_using?: number;
    last_used?: string;
  };
}

export interface DatasetFilters {
  modality?: Modality;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}
