import type { Dataset, Modality } from '../types/dataset';
import type { Experiment, TrainingJob } from '../types/experiment';
import type { Metric } from '../types/metric';
import type { StatsOverview } from '../types/api';

// Generate mock datasets
const mockDatasets: Dataset[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'ImageNet Subset 2024',
    modality: 'image',
    size_bytes: 15728640000,
    file_count: 50000,
    description: 'Curated ImageNet subset for quick experimentation',
    storage_path: '/data/images/imagenet-subset',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-15T10:30:00Z',
    metadata: {
      resolution: '224x224',
      format: 'jpeg',
      classes: 1000,
      train_samples: 40000,
      val_samples: 5000,
      test_samples: 5000,
    },
    stats: {
      experiments_using: 12,
      last_used: '2026-01-27T15:22:00Z',
    },
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Audio Samples 2026',
    modality: 'audio',
    size_bytes: 5368709120,
    file_count: 10000,
    description: 'Speech recognition training data',
    storage_path: '/data/audio/speech-2026',
    created_at: '2026-01-10T08:15:00Z',
    metadata: {
      sample_rate: 16000,
      duration_seconds: 36000,
      format: 'wav',
    },
    stats: {
      experiments_using: 5,
      last_used: '2026-01-25T10:30:00Z',
    },
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    name: 'Multimodal Corpus v2',
    modality: 'multimodal',
    size_bytes: 32212254720,
    file_count: 25000,
    description: 'Combined text, image, and audio dataset',
    created_at: '2026-01-20T14:20:00Z',
    metadata: {
      text_samples: 10000,
      image_samples: 10000,
      audio_samples: 5000,
    },
    stats: {
      experiments_using: 8,
      last_used: '2026-01-28T09:15:00Z',
    },
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    name: 'Video Dataset 2025',
    modality: 'video',
    size_bytes: 107374182400,
    file_count: 5000,
    description: 'Video classification dataset',
    created_at: '2026-01-05T11:00:00Z',
    metadata: {
      resolution: '1920x1080',
      fps: 30,
      duration_seconds: 180000,
    },
    stats: {
      experiments_using: 3,
      last_used: '2026-01-22T16:45:00Z',
    },
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440004',
    name: 'Text Corpus Large',
    modality: 'text',
    size_bytes: 2147483648,
    file_count: 100000,
    description: 'Large text corpus for language modeling',
    created_at: '2026-01-12T09:30:00Z',
    metadata: {
      tokens: 50000000,
      languages: ['en', 'es', 'fr'],
    },
    stats: {
      experiments_using: 15,
      last_used: '2026-01-28T12:00:00Z',
    },
  },
];

// Generate mock experiments
const generateMockExperiments = (): Experiment[] => {
  const experiments: Experiment[] = [];
  const statuses: Experiment['status'][] = ['created', 'queued', 'running', 'completed', 'failed', 'cancelled'];
  
  for (let i = 0; i < 25; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const dataset = mockDatasets[Math.floor(Math.random() * mockDatasets.length)];
    const isRunning = status === 'running';
    const isCompleted = status === 'completed';
    
    const experiment: Experiment = {
      id: `exp-${i + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Experiment ${i + 1}: ${dataset.modality} Model v${i + 1}`,
      description: `Training experiment for ${dataset.name}`,
      dataset_id: dataset.id,
      dataset_name: dataset.name,
      status,
      config: {
        model_type: 'multimodal_transformer',
        hyperparameters: {
          batch_size: [16, 32, 64][Math.floor(Math.random() * 3)],
          learning_rate: [0.0001, 0.0005, 0.001, 0.002][Math.floor(Math.random() * 4)],
          optimizer: ['adam', 'adamw', 'sgd'][Math.floor(Math.random() * 3)],
          num_epochs: [50, 100, 150][Math.floor(Math.random() * 3)],
          weight_decay: 0.01,
        },
        architecture: {
          hidden_size: 768,
          num_layers: 12,
          num_heads: 12,
        },
      },
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['vision', 'transformer'],
    };

    if (isRunning || isCompleted) {
      experiment.started_at = new Date(
        new Date(experiment.created_at).getTime() + 5 * 60 * 1000
      ).toISOString();
    }

    if (isCompleted) {
      experiment.completed_at = new Date(
        new Date(experiment.started_at!).getTime() + 8 * 60 * 60 * 1000
      ).toISOString();
    }

    if (isRunning) {
      const progress = Math.random() * 80 + 10; // 10-90%
      experiment.current_job = {
        id: `job-${experiment.id}`,
        progress,
        current_epoch: Math.floor((progress / 100) * experiment.config.hyperparameters.num_epochs),
        latest_metrics: {
          loss: Math.random() * 0.5 + 0.02,
          accuracy: Math.random() * 0.1 + 0.9,
        },
      };
    }

    experiments.push(experiment);
  }

  return experiments;
};

let mockExperiments = generateMockExperiments();

// Generate mock metrics for a job
export const generateMockMetrics = (jobId: string, totalEpochs: number, currentEpoch: number): Metric[] => {
  const metrics: Metric[] = [];
  const stepsPerEpoch = 250;
  
  for (let epoch = 0; epoch <= currentEpoch; epoch++) {
    for (let step = 0; step < stepsPerEpoch; step += 25) {
      const progress = epoch / totalEpochs;
      const loss = 2.5 * Math.exp(-progress * 3) + Math.random() * 0.1;
      const accuracy = Math.min(0.98, 0.1 + progress * 0.85 + Math.random() * 0.05);
      
      metrics.push({
        job_id: jobId,
        epoch,
        step,
        loss,
        accuracy,
        learning_rate: 0.001 * (1 - progress * 0.5),
        throughput: 300 + Math.random() * 50,
        timestamp: new Date(Date.now() - (totalEpochs - epoch) * 600000).toISOString(),
      });
    }
  }
  
  return metrics;
};

// Mock stats
export const mockStats: StatsOverview = {
  experiments: {
    total: 127,
    running: 5,
    completed: 98,
    failed: 12,
    cancelled: 12,
  },
  datasets: {
    total: 45,
    by_modality: {
      text: 12,
      image: 18,
      audio: 8,
      video: 4,
      multimodal: 3,
    },
    total_size_gb: 2048.5,
  },
  jobs: {
    active: 5,
    queued: 2,
    avg_duration_minutes: 245,
  },
};

// Simulate real-time metric updates
let metricUpdateIntervals: Map<string, NodeJS.Timeout> = new Map();

export const startMockMetricUpdates = (
  jobId: string,
  callback: (update: any) => void,
  totalEpochs: number = 100
) => {
  if (metricUpdateIntervals.has(jobId)) {
    return; // Already running
  }

  let currentEpoch = 0;
  let currentStep = 0;
  const stepsPerEpoch = 250;

  const interval = setInterval(() => {
    currentStep += 25;
    if (currentStep >= stepsPerEpoch) {
      currentStep = 0;
      currentEpoch++;
    }

    if (currentEpoch >= totalEpochs) {
      clearInterval(interval);
      metricUpdateIntervals.delete(jobId);
      callback({
        type: 'job_complete',
        job_id: jobId,
        status: 'completed',
        final_metrics: {
          loss: 0.0289,
          accuracy: 0.9623,
        },
        completed_at: new Date().toISOString(),
      });
      return;
    }

    const progress = currentEpoch / totalEpochs;
    const loss = 2.5 * Math.exp(-progress * 3) + Math.random() * 0.05;
    const accuracy = Math.min(0.98, 0.1 + progress * 0.85 + Math.random() * 0.03);

    callback({
      type: 'metric_update',
      job_id: jobId,
      epoch: currentEpoch,
      step: currentStep,
      metrics: {
        loss,
        accuracy,
        learning_rate: 0.001 * (1 - progress * 0.5),
        throughput: 300 + Math.random() * 50,
      },
      timestamp: new Date().toISOString(),
    });
  }, 2000); // Update every 2 seconds

  metricUpdateIntervals.set(jobId, interval);
};

export const stopMockMetricUpdates = (jobId: string) => {
  const interval = metricUpdateIntervals.get(jobId);
  if (interval) {
    clearInterval(interval);
    metricUpdateIntervals.delete(jobId);
  }
};

export { mockDatasets, mockExperiments, generateMockExperiments };
