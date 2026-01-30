-- Run this in Supabase Dashboard → SQL Editor to create tables for the ML Dashboard.
-- Tables: datasets, experiments, training_jobs, metrics

-- Enable UUID extension (optional; we use TEXT ids)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Datasets
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  modality VARCHAR(50) NOT NULL,
  size_bytes BIGINT NOT NULL,
  file_count INTEGER NOT NULL,
  description TEXT,
  storage_path VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Experiments (references datasets)
CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dataset_id TEXT REFERENCES datasets(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'created',
  config JSONB NOT NULL,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tags JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_experiments_dataset_id ON experiments(dataset_id);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_created_at ON experiments(created_at);

-- Training jobs (references experiments)
CREATE TABLE IF NOT EXISTS training_jobs (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  progress NUMERIC(5,2) DEFAULT 0,
  current_epoch INTEGER DEFAULT 0,
  total_epochs INTEGER NOT NULL,
  logs TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  avg_epoch_time NUMERIC(10,2),
  estimated_completion TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_training_jobs_experiment_id ON training_jobs(experiment_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);

-- Metrics (references training_jobs)
CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES training_jobs(id) ON DELETE CASCADE,
  epoch INTEGER NOT NULL,
  step INTEGER NOT NULL,
  loss NUMERIC(15,8) NOT NULL,
  accuracy NUMERIC(8,6),
  learning_rate NUMERIC(12,10),
  throughput NUMERIC(10,2),
  gpu_utilization NUMERIC(5,2),
  memory_used_gb NUMERIC(10,2),
  custom_metrics JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metrics_job_id ON metrics(job_id);
CREATE INDEX IF NOT EXISTS idx_metrics_epoch ON metrics(epoch);
CREATE INDEX IF NOT EXISTS idx_metrics_job_epoch_step ON metrics(job_id, epoch, step);

-- Row Level Security (RLS): allow service role full access; enable if you use anon key
-- ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
-- Create policies as needed for your auth model.
