import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { datasetsApi } from '../services/api';
import { Dataset } from '../types/dataset';

export const useDatasets = (filters?: {
  modality?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: ['datasets', filters],
    queryFn: () => datasetsApi.getAll(filters),
  });
};

export const useDataset = (id: string) => {
  return useQuery({
    queryKey: ['dataset', id],
    queryFn: () => datasetsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Dataset, 'id' | 'created_at'>) => datasetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success('Dataset created successfully');
    },
    onError: () => {
      toast.error('Failed to create dataset');
    },
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => datasetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success('Dataset deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete dataset');
    },
  });
};
