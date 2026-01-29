import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/experiments/StatusBadge';
import { ConfigEditor } from '../components/experiments/ConfigEditor';
import { RealTimeMetrics } from '../components/metrics/RealTimeMetrics';
import { MetricsGrid } from '../components/metrics/MetricsGrid';
import { useExperiment, useStartExperiment, useCancelExperiment } from '../hooks/useExperiments';
import { useJobMetrics } from '../hooks/useMetrics';
import { formatDate, formatDuration } from '../utils/formatters';

export const ExperimentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: experiment, isLoading } = useExperiment(id!);
  const startMutation = useStartExperiment();
  const cancelMutation = useCancelExperiment();

  const jobId = experiment?.current_job?.id;
  const { data: metricsData } = useJobMetrics(jobId || '', {});

  const handleStart = async () => {
    if (id) {
      await startMutation.mutateAsync(id);
    }
  };

  const handleCancel = async () => {
    if (id) {
      await cancelMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Experiment not found</p>
        <Button variant="secondary" onClick={() => navigate('/experiments')} className="mt-4">
          Back to Experiments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/experiments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-zinc-100">{experiment.name}</h2>
          {experiment.description && (
            <p className="text-zinc-400 mt-1">{experiment.description}</p>
          )}
        </div>
        <StatusBadge status={experiment.status} />
        {experiment.status === 'created' && (
          <Button onClick={handleStart}>
            <Play className="h-4 w-4 mr-2" />
            Start Training
          </Button>
        )}
        {experiment.status === 'running' && (
          <Button variant="danger" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Configuration">
          <ConfigEditor config={experiment.config} readOnly />
        </Card>

        <Card title="Details">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-zinc-400">Dataset:</span>
              <span className="ml-2 text-sm text-zinc-100">{experiment.dataset_name ?? experiment.dataset_id ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-400">Created:</span>
              <span className="ml-2 text-sm text-zinc-100">
                {formatDate(experiment.created_at)}
              </span>
            </div>
            {experiment.started_at && (
              <div>
                <span className="text-sm font-medium text-zinc-400">Started:</span>
                <span className="ml-2 text-sm text-zinc-100">
                  {formatDate(experiment.started_at)}
                </span>
              </div>
            )}
            {experiment.completed_at && (
              <div>
                <span className="text-sm font-medium text-zinc-400">Completed:</span>
                <span className="ml-2 text-sm text-zinc-100">
                  {formatDate(experiment.completed_at)}
                </span>
              </div>
            )}
            {experiment.tags && experiment.tags.length > 0 && (
              <div>
                <span className="text-sm font-medium text-zinc-400">Tags:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {experiment.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {experiment.status === 'running' && experiment.current_job && (
        <>
          <Card title="Training Progress">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-300">
                    Epoch {experiment.current_job.current_epoch} /{' '}
                    {experiment.config.hyperparameters.num_epochs}
                  </span>
                  <span className="text-zinc-500">
                    {experiment.current_job.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all"
                    style={{ width: `${experiment.current_job.progress}%` }}
                  />
                </div>
              </div>
              {experiment.current_job.latest_metrics && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Loss:</span>
                    <span className="ml-2 font-medium">
                      {experiment.current_job.latest_metrics.loss.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Accuracy:</span>
                    <span className="ml-2 font-medium">
                      {(experiment.current_job.latest_metrics.accuracy * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <RealTimeMetrics
            jobId={experiment.current_job.id}
            metrics={['loss', 'accuracy', 'throughput']}
          />
        </>
      )}

      {metricsData && metricsData.metrics.length > 0 && (
        <Card title="Metrics History">
          <MetricsGrid
            jobId={jobId || ''}
            metrics={metricsData.metrics}
            realTime={experiment.status === 'running'}
          />
        </Card>
      )}
    </div>
  );
};
