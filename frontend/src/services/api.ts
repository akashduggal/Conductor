import axios from 'axios';
import type { Dataset, PaginatedResponse } from '../types/dataset';
import type { Experiment, TrainingJob } from '../types/experiment';
import type { MetricsResponse, MetricUpdate } from '../types/metric';
import type { StatsOverview, ComparisonResponse, ComparisonRequest } from '../types/api';
import { API_BASE_URL, WS_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Datasets API
export const datasetsApi = {
  getAll: async (params?: {
    modality?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Dataset>> => {
    const response = await api.get('/datasets', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Dataset> => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },

  create: async (data: Omit<Dataset, 'id' | 'created_at'>): Promise<Dataset> => {
    const response = await api.post('/datasets', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/datasets/${id}`);
  },
};

// Experiments API
export const experimentsApi = {
  getAll: async (params?: {
    status?: string;
    dataset_id?: string;
    tags?: string[];
    page?: number;
    page_size?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Experiment>> => {
    const response = await api.get('/experiments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Experiment> => {
    const response = await api.get(`/experiments/${id}`);
    return response.data;
  },

  create: async (data: Omit<Experiment, 'id' | 'created_at' | 'status'>): Promise<Experiment> => {
    const response = await api.post('/experiments', data);
    return response.data;
  },

  start: async (id: string): Promise<{ experiment_id: string; job_id: string; status: string; message: string }> => {
    const response = await api.post(`/experiments/${id}/start`);
    return response.data;
  },

  cancel: async (id: string): Promise<{ experiment_id: string; status: string; message: string }> => {
    const response = await api.post(`/experiments/${id}/cancel`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/experiments/${id}`);
  },
};

// Jobs API
export const jobsApi = {
  getById: async (id: string): Promise<TrainingJob> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  getMetrics: async (
    id: string,
    params?: { start_epoch?: number; end_epoch?: number; step?: number }
  ): Promise<MetricsResponse> => {
    const response = await api.get(`/metrics/jobs/${id}/metrics`, { params });
    return response.data;
  },

  subscribeToMetrics: (
    jobId: string,
    callback: (update: MetricUpdate) => void,
    totalEpochs: number = 100
  ): (() => void) => {
    const ws = new WebSocket(`${WS_BASE_URL}/api/v1/metrics/jobs/${jobId}/metrics/stream`);
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        callback(update);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000);
    
    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  },
};

// Stats API
export const statsApi = {
  getOverview: async (): Promise<StatsOverview> => {
    const response = await api.get('/stats/overview');
    return response.data;
  },
};

// Comparison API
export const comparisonApi = {
  compare: async (request: ComparisonRequest): Promise<ComparisonResponse> => {
    const response = await api.post('/experiments/compare', request);
    return response.data;
  },
};

export default api;
