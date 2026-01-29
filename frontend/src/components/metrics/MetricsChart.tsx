import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Metric } from '../../types/metric';

interface MetricsChartProps {
  jobId: string;
  metrics: Metric[];
  metricType: 'loss' | 'accuracy' | 'learning_rate' | 'throughput';
  realTime?: boolean;
  showLegend?: boolean;
  height?: number;
}

export const MetricsChart = ({
  metrics,
  metricType,
  showLegend = true,
  height = 400,
}: MetricsChartProps) => {
  const data = metrics.map((m) => {
    const xValue = m.epoch + m.step / 1000; // Combine epoch and step for x-axis
    return {
      epoch: m.epoch,
      step: m.step,
      x: xValue,
      value: m[metricType] || 0,
      timestamp: m.timestamp,
    };
  });

  const getMetricLabel = () => {
    switch (metricType) {
      case 'loss':
        return 'Loss';
      case 'accuracy':
        return 'Accuracy';
      case 'learning_rate':
        return 'Learning Rate';
      case 'throughput':
        return 'Throughput (samples/sec)';
      default:
        return metricType;
    }
  };

  const formatValue = (value: number) => {
    if (metricType === 'accuracy') {
      return (value * 100).toFixed(2) + '%';
    }
    if (metricType === 'throughput') {
      return value.toFixed(1);
    }
    return value.toFixed(4);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">{getMetricLabel()} Over Time</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#52525b" />
          <XAxis
            dataKey="epoch"
            label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: '#a1a1aa' }}
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
          />
          <YAxis
            label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft', fill: '#a1a1aa' }}
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
          />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            labelFormatter={(label) => `Epoch ${Math.floor(label)}`}
            contentStyle={{
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#f4f4f5',
            }}
          />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
            name={getMetricLabel()}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
