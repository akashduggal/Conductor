export interface Metric {
  id?: string;
  job_id: string;
  epoch: number;
  step: number;
  loss: number;
  accuracy?: number;
  learning_rate?: number;
  throughput?: number;
  gpu_utilization?: number;
  memory_used_gb?: number;
  custom_metrics?: Record<string, any>;
  timestamp: string;
}

export interface MetricSummary {
  total_points: number;
  returned_points: number;
  best_loss: number;
  best_accuracy: number;
  current_loss: number;
  current_accuracy: number;
}

export interface MetricsResponse {
  job_id: string;
  metrics: Metric[];
  summary: MetricSummary;
}

export interface MetricUpdate {
  type: 'metric_update' | 'job_complete';
  job_id: string;
  epoch: number;
  step: number;
  metrics: {
    loss: number;
    accuracy?: number;
    learning_rate?: number;
    throughput?: number;
  };
  timestamp: string;
  status?: string;
  final_metrics?: {
    loss: number;
    accuracy: number;
  };
  completed_at?: string;
}
