import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComparisonData } from '../../types/api';

interface ComparisonChartProps {
  comparison: ComparisonData[];
  metric: string;
  height?: number;
}

const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ComparisonChart = ({
  comparison,
  metric,
  height = 400,
}: ComparisonChartProps) => {
  if (!comparison || !comparison.length) return null;

  const metricData = comparison[0]?.metrics?.[metric];
  if (!metricData || !metricData.data_points || metricData.data_points.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          {metric.charAt(0).toUpperCase() + metric.slice(1)} Comparison
        </h3>
        <div className="text-center py-8 text-zinc-500">
          No data available for {metric}
        </div>
      </div>
    );
  }

  // Get all unique epochs
  const allEpochs = new Set<number>();
  comparison.forEach((comp) => {
    const compMetricData = comp.metrics?.[metric];
    if (compMetricData?.data_points) {
      compMetricData.data_points.forEach((dp) => {
        if (dp.epoch !== undefined && dp.epoch !== null) {
          allEpochs.add(dp.epoch);
        }
      });
    }
  });
  const epochs = Array.from(allEpochs).sort((a, b) => a - b);
  
  if (epochs.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          {metric.charAt(0).toUpperCase() + metric.slice(1)} Comparison
        </h3>
        <div className="text-center py-8 text-zinc-500">
          No epoch data available
        </div>
      </div>
    );
  }

  // Build data array
  const data = epochs.map((epoch) => {
    const point: Record<string, any> = { epoch };
    comparison.forEach((comp, idx) => {
      const dp = comp.metrics[metric]?.data_points.find((p) => p.epoch === epoch);
      const value = dp?.value;
      // Only add the value if it's a valid number
      if (value !== undefined && value !== null && !isNaN(value)) {
        point[comp.name] = value;
      }
    });
    return point;
  });

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    if (metric === 'accuracy') {
      return (value * 100).toFixed(2) + '%';
    }
    return value.toFixed(4);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">
        {metric.charAt(0).toUpperCase() + metric.slice(1)} Comparison
      </h3>
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
            label={{ value: metric, angle: -90, position: 'insideLeft', fill: '#a1a1aa' }}
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
          />
          <Tooltip
            formatter={(value: number | null | undefined) => formatValue(value)}
            labelFormatter={(label) => `Epoch ${label}`}
            contentStyle={{
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#f4f4f5',
            }}
          />
          <Legend />
          {comparison.map((comp, idx) => (
            <Line
              key={comp.experiment_id}
              type="monotone"
              dataKey={comp.name}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
