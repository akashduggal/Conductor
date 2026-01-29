import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { experimentsApi } from '../services/api';
import { Experiment } from '../types/experiment';

export const useExperiments = (filters?: {
  status?: string;
  dataset_id?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: ['experiments', filters],
    queryFn: () => experimentsApi.getAll(filters),
  });
};

export const useExperiment = (id: string) => {
  return useQuery({
    queryKey: ['experiment', id],
    queryFn: () => experimentsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateExperiment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Experiment, 'id' | 'created_at' | 'status'>) =>
      experimentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      toast.success('Experiment created successfully');
    },
    onError: () => {
      toast.error('Failed to create experiment');
    },
  });
};

export const useStartExperiment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experimentsApi.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['experiment', id] });
      toast.success('Training started successfully');
    },
    onError: () => {
      toast.error('Failed to start training');
    },
  });
};

export const useCancelExperiment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experimentsApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      queryClient.invalidateQueries({ queryKey: ['experiment', id] });
      toast.success('Experiment cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel experiment');
    },
  });
};

export const useDeleteExperiment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experimentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      toast.success('Experiment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete experiment');
    },
  });
};
