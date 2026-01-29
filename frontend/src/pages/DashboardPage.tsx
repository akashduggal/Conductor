import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FlaskConical, Database, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { ExperimentTable } from '../components/experiments/ExperimentTable';
import { statsApi, experimentsApi } from '../services/api';
import { useExperiments } from '../hooks/useExperiments';
import { formatDuration } from '../utils/formatters';
import type { Experiment } from '../types/experiment';

/** Minimum time to show table shimmer (mock loading for demo). */
const TABLE_LOADING_DELAY_MS = 2500;

/** Demo: one mock "Running" experiment for Dashboard. */
const DEMO_RUNNING_EXPERIMENT: Experiment = {
  id: 'demo-running-experiment',
  name: 'Demo Training Run',
  description: 'Mock running experiment for dashboard demo',
  dataset_id: '550e8400-e29b-41d4-a716-446655440000',
  dataset_name: 'ImageNet Subset 2024',
  status: 'running',
  config: {
    model_type: 'multimodal_transformer',
    hyperparameters: {
      batch_size: 32,
      learning_rate: 0.001,
      optimizer: 'adamw',
      num_epochs: 100,
      weight_decay: 0.01,
    },
    architecture: { hidden_size: 768, num_layers: 12, num_heads: 12 },
  },
  created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  current_job: {
    id: 'demo-job-1',
    progress: 42.5,
    current_epoch: 42,
  },
};

export const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsApi.getOverview(),
  });

  const { data: experimentsData, isLoading: experimentsLoading } = useExperiments({
    page: 1,
    page_size: 5,
  });

  const [tableMinDelayElapsed, setTableMinDelayElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTableMinDelayElapsed(true), TABLE_LOADING_DELAY_MS);
    return () => clearTimeout(t);
  }, []);
  const tableLoading = experimentsLoading || !tableMinDelayElapsed;

  const experimentsWithDemoRunning = useMemo(() => {
    const list = experimentsData?.data ?? [];
    const hasDemo = list.some((e) => e.id === DEMO_RUNNING_EXPERIMENT.id);
    if (hasDemo) return list;
    return [DEMO_RUNNING_EXPERIMENT, ...list].slice(0, 6);
  }, [experimentsData?.data]);

  const statsWithDemoRunning = useMemo(() => {
    if (!stats) return stats;
    return {
      ...stats,
      experiments: {
        ...stats.experiments,
        running: Math.max(stats.experiments.running, 1),
      },
      jobs: {
        ...stats.jobs,
        active: Math.max(stats.jobs.active, 1),
      },
    };
  }, [stats]);

  const handleExperimentClick = (id: string) => {
    if (id === DEMO_RUNNING_EXPERIMENT.id) return;
    window.location.href = `/experiments/${id}`;
  };

  const handleStartExperiment = async (id: string) => {
    if (id === DEMO_RUNNING_EXPERIMENT.id) return;
    await experimentsApi.start(id);
  };

  const handleCancelExperiment = async (id: string) => {
    if (id === DEMO_RUNNING_EXPERIMENT.id) return;
    await experimentsApi.cancel(id);
  };

  const handleDeleteExperiment = async (id: string) => {
    if (id === DEMO_RUNNING_EXPERIMENT.id) return;
    await experimentsApi.delete(id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100">Dashboard</h2>

      {!statsLoading && statsWithDemoRunning ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">Total Experiments</p>
                <p className="text-3xl font-bold text-zinc-100 mt-2">{statsWithDemoRunning.experiments.total}</p>
              </div>
              <FlaskConical className="h-12 w-12 text-primary-400" />
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-green-600">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                {statsWithDemoRunning.experiments.completed}
              </span>
              <span className="text-red-600">
                <XCircle className="h-4 w-4 inline mr-1" />
                {statsWithDemoRunning.experiments.failed}
              </span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">Active Jobs</p>
                <p className="text-3xl font-bold text-zinc-100 mt-2">{statsWithDemoRunning.jobs.active}</p>
              </div>
              <Activity className="h-12 w-12 text-green-400" />
            </div>
            <div className="mt-4 text-sm text-zinc-500">
              {statsWithDemoRunning.jobs.queued} queued • Avg: {formatDuration(statsWithDemoRunning.jobs.avg_duration_minutes)}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">Total Datasets</p>
                <p className="text-3xl font-bold text-zinc-100 mt-2">{statsWithDemoRunning.datasets.total}</p>
              </div>
              <Database className="h-12 w-12 text-purple-400" />
            </div>
            <div className="mt-4 text-sm text-zinc-500">
              {(statsWithDemoRunning.datasets.total_size_gb / 1024).toFixed(1)} TB total
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">Running Experiments</p>
                <p className="text-3xl font-bold text-zinc-100 mt-2">{statsWithDemoRunning.experiments.running}</p>
              </div>
              <Activity className="h-12 w-12 text-primary-400 animate-pulse" />
            </div>
            <div className="mt-4 text-sm text-zinc-500">Currently training</div>
          </Card>
        </div>
      ) : null}

      <Card title="Recent Experiments">
        <ExperimentTable
          experiments={experimentsWithDemoRunning}
          loading={tableLoading}
          onExperimentClick={handleExperimentClick}
          onStartExperiment={handleStartExperiment}
          onCancelExperiment={handleCancelExperiment}
          onDeleteExperiment={handleDeleteExperiment}
        />
        {!tableLoading && (
          <div className="mt-4 text-center">
            <Link
              to="/experiments"
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              View all experiments →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
