import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../services/api';

export const useJobMetrics = (
  jobId: string,
  params?: { start_epoch?: number; end_epoch?: number; step?: number }
) => {
  return useQuery({
    queryKey: ['job-metrics', jobId, params],
    queryFn: () => jobsApi.getMetrics(jobId, params),
    enabled: !!jobId,
    refetchInterval: 5000, // Refetch every 5 seconds for running jobs
  });
};

export const useJob = (jobId: string) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.getById(jobId),
    enabled: !!jobId,
    refetchInterval: 5000,
  });
};
