import { useState } from 'react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ExperimentSelector } from './ExperimentSelector';
import { ComparisonChart } from './ComparisonChart';
import { Card } from '../common/Card';
import { Experiment } from '../../types/experiment';
import { ComparisonData } from '../../types/api';
import { comparisonApi } from '../../services/api';

interface ComparisonViewProps {
  experiments: Experiment[];
  loading: boolean;
}

export const ComparisonView = ({ experiments, loading }: ComparisonViewProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonData[] | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['loss', 'accuracy']);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 experiments to compare');
      return;
    }

    setIsComparing(true);
    try {
      const result = await comparisonApi.compare({
        experiment_ids: selectedIds,
        metrics: selectedMetrics,
      });
      setComparison(result.comparison);
    } catch (error) {
      console.error('Error comparing experiments:', error);
      alert('Failed to compare experiments');
    } finally {
      setIsComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-100">Experiment Comparison</h2>
        {selectedIds.length >= 2 && (
          <Button onClick={handleCompare} disabled={isComparing}>
            {isComparing ? 'Comparing...' : 'Compare Selected'}
          </Button>
        )}
      </div>

      {experiments.length === 0 && !loading && (
        <p className="text-sm text-zinc-500">
          No experiments with run data to compare. Only experiments that have run (running, completed, failed, or cancelled) appear here.
        </p>
      )}
      <ExperimentSelector
        experiments={experiments}
        selectedIds={selectedIds}
        onToggle={handleToggle}
      />

      {comparison && (
        <div className="space-y-6 mt-8">
          <Card title="Configuration Comparison">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Experiment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Batch Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Learning Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {comparison.map((comp) => (
                    <tr key={comp.experiment_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-100">
                        {comp.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {comp.config.batch_size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {comp.config.learning_rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {selectedMetrics.map((metric) => {
            // Check if at least one experiment has data for this metric
            const hasData = comparison.some((comp) => comp.metrics?.[metric]?.data_points?.length > 0);
            if (!hasData) return null;
            return (
              <Card key={metric}>
                <ComparisonChart comparison={comparison} metric={metric} />
              </Card>
            );
          })}

          <Card title="Summary Statistics">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Experiment
                    </th>
                    {selectedMetrics.map((metric) => (
                      <th
                        key={metric}
                        colSpan={2}
                        className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase"
                      >
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th></th>
                    {selectedMetrics.map((metric) => (
                      <>
                        <th className="px-6 py-2 text-xs font-medium text-zinc-500">Best</th>
                        <th className="px-6 py-2 text-xs font-medium text-zinc-500">Final</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {comparison.map((comp) => (
                    <tr key={comp.experiment_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-100">
                        {comp.name}
                      </td>
                      {selectedMetrics.map((metric) => {
                        const metricData = comp.metrics?.[metric];
                        if (!metricData || 
                            metricData.min === undefined || 
                            metricData.min === null ||
                            metricData.final === undefined || 
                            metricData.final === null) {
                          return (
                            <td key={`${metric}-empty`} colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                              No data
                            </td>
                          );
                        }
                        return (
                          <>
                            <td key={`${metric}-best`} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                              {metric === 'accuracy'
                                ? (metricData.min * 100).toFixed(2) + '%'
                                : metricData.min.toFixed(4)}
                            </td>
                            <td key={`${metric}-final`} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                              {metric === 'accuracy'
                                ? (metricData.final * 100).toFixed(2) + '%'
                                : metricData.final.toFixed(4)}
                            </td>
                          </>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
