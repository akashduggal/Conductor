export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

export interface StatsOverview {
  experiments: {
    total: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  datasets: {
    total: number;
    by_modality: {
      text: number;
      image: number;
      audio: number;
      video: number;
      multimodal: number;
    };
    total_size_gb: number;
  };
  jobs: {
    active: number;
    queued: number;
    avg_duration_minutes: number;
  };
}

export interface ComparisonRequest {
  experiment_ids: string[];
  metrics: string[];
}

export interface ComparisonData {
  experiment_id: string;
  name: string;
  config: {
    batch_size: number;
    learning_rate: number;
  };
  metrics: {
    [key: string]: {
      min: number;
      max: number;
      final: number;
      data_points: Array<{
        epoch: number;
        value: number;
      }>;
    };
  };
}

export interface ComparisonResponse {
  comparison: ComparisonData[];
}
