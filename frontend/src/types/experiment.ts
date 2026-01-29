export type ExperimentStatus = 'created' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExperimentConfig {
  model_type: string;
  hyperparameters: {
    batch_size: number;
    learning_rate: number;
    optimizer?: string;
    num_epochs: number;
    weight_decay?: number;
    warmup_steps?: number;
    gradient_clip?: number;
  };
  architecture?: {
    hidden_size?: number;
    num_layers?: number;
    num_heads?: number;
    dropout?: number;
    attention_dropout?: number;
  };
  data_config?: {
    train_split?: number;
    val_split?: number;
    test_split?: number;
    shuffle?: boolean;
    augmentation?: Record<string, any>;
  };
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  dataset_id: string;
  dataset_name?: string;
  status: ExperimentStatus;
  config: ExperimentConfig;
  created_by?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  tags?: string[];
  current_job?: {
    id: string;
    progress: number;
    current_epoch: number;
    latest_metrics?: {
      loss: number;
      accuracy: number;
    };
  };
  dataset?: {
    id: string;
    name: string;
    modality: string;
  };
  training_jobs?: TrainingJob[];
}

export interface ExperimentFilters {
  status?: ExperimentStatus;
  dataset_id?: string;
  tags?: string[];
  search?: string;
}

export interface TrainingJob {
  id: string;
  experiment_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_epoch: number;
  total_epochs: number;
  logs?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  avg_epoch_time?: number;
  estimated_completion?: string;
}
