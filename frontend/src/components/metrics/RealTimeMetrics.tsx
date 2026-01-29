import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card } from '../common/Card';
import { MetricUpdate } from '../../types/metric';
import { jobsApi } from '../../services/api';
import { formatPercentage } from '../../utils/formatters';

interface RealTimeMetricsProps {
  jobId: string;
  metrics: string[];
  refreshRate?: number;
}

export const RealTimeMetrics = ({
  jobId,
  metrics: metricNames,
  refreshRate = 2000,
}: RealTimeMetricsProps) => {
  const [currentMetrics, setCurrentMetrics] = useState<Record<string, number>>({});
  const [previousMetrics, setPreviousMetrics] = useState<Record<string, number>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      try {
        // Get initial metrics
        const response = await jobsApi.getMetrics(jobId);
        if (response.metrics.length > 0) {
          const latest = response.metrics[response.metrics.length - 1];
          const initial: Record<string, number> = {};
          metricNames.forEach((name) => {
            initial[name] = (latest as any)[name] || 0;
          });
          setCurrentMetrics(initial);
          setPreviousMetrics(initial);
        }

        // Subscribe to real-time updates
        unsubscribe = jobsApi.subscribeToMetrics(jobId, (update: MetricUpdate) => {
          if (update.type === 'metric_update') {
            const newMetrics: Record<string, number> = {};
            metricNames.forEach((name) => {
              newMetrics[name] = (update.metrics as any)[name] || 0;
            });
            setPreviousMetrics(currentMetrics);
            setCurrentMetrics(newMetrics);
            setLastUpdate(new Date());
            setIsConnected(true);
          } else if (update.type === 'job_complete') {
            setIsConnected(false);
            if (unsubscribe) unsubscribe();
          }
        });
      } catch (error) {
        console.error('Error setting up metrics subscription:', error);
        setIsConnected(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [jobId, metricNames.join(',')]);

  const getTrend = (metricName: string): 'up' | 'down' | 'neutral' => {
    const current = currentMetrics[metricName] || 0;
    const previous = previousMetrics[metricName] || 0;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  const formatMetricValue = (name: string, value: number): string => {
    if (name === 'accuracy') {
      return formatPercentage(value, 2);
    }
    if (name === 'loss') {
      return value.toFixed(4);
    }
    if (name === 'throughput') {
      return value.toFixed(1) + '/s';
    }
    return value.toFixed(4);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">Real-Time Metrics</h3>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'
            }`}
          />
          <span className="text-sm text-zinc-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricNames.map((name) => {
          const value = currentMetrics[name] || 0;
          const trend = getTrend(name);
          return (
            <Card key={name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-400 capitalize">
                  {name.replace('_', ' ')}
                </span>
                {trend !== 'neutral' && (
                  <div>
                    {trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-zinc-100">
                {formatMetricValue(name, value)}
              </div>
            </Card>
          );
        })}
      </div>
      {lastUpdate && (
        <p className="text-xs text-zinc-500 text-right">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
