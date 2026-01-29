import { useMemo } from 'react';
import { useExperiments } from '../hooks/useExperiments';
import { ComparisonView } from '../components/comparison/ComparisonView';
import type { ExperimentStatus } from '../types/experiment';

/** Only experiments that have run (and thus have metrics) are comparable. */
const COMPARABLE_STATUSES: ExperimentStatus[] = ['running', 'completed', 'failed', 'cancelled'];

export const ComparisonPage = () => {
  const { data, isLoading } = useExperiments({ page_size: 100 });

  const comparableExperiments = useMemo(() => {
    const all = data?.data || [];
    return all.filter((exp) => COMPARABLE_STATUSES.includes(exp.status));
  }, [data?.data]);

  return (
    <ComparisonView
      experiments={comparableExperiments}
      loading={isLoading}
    />
  );
};
