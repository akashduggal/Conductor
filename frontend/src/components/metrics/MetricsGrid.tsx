import { MetricsChart } from './MetricsChart';
import { Metric } from '../../types/metric';

interface MetricsGridProps {
  jobId: string;
  metrics: Metric[];
  realTime?: boolean;
}

export const MetricsGrid = ({ jobId, metrics, realTime = false }: MetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MetricsChart
        jobId={jobId}
        metrics={metrics}
        metricType="loss"
        realTime={realTime}
        height={300}
      />
      <MetricsChart
        jobId={jobId}
        metrics={metrics}
        metricType="accuracy"
        realTime={realTime}
        height={300}
      />
      {metrics.some((m) => m.throughput) && (
        <MetricsChart
          jobId={jobId}
          metrics={metrics}
          metricType="throughput"
          realTime={realTime}
          height={300}
        />
      )}
      {metrics.some((m) => m.learning_rate) && (
        <MetricsChart
          jobId={jobId}
          metrics={metrics}
          metricType="learning_rate"
          realTime={realTime}
          height={300}
        />
      )}
    </div>
  );
};
