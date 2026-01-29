export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const EXPERIMENT_STATUSES = [
  'created',
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;

export const MODALITIES = [
  'text',
  'image',
  'audio',
  'video',
  'multimodal',
] as const;

export const STATUS_COLORS: Record<string, string> = {
  created: 'bg-zinc-700 text-zinc-200',
  queued: 'bg-blue-900/50 text-blue-400',
  running: 'bg-green-900/50 text-green-400',
  completed: 'bg-purple-900/50 text-purple-400',
  failed: 'bg-red-900/50 text-red-400',
  cancelled: 'bg-amber-900/50 text-amber-400',
};

export const MODALITY_COLORS: Record<string, string> = {
  text: 'bg-blue-900/50 text-blue-400',
  image: 'bg-purple-900/50 text-purple-400',
  audio: 'bg-green-900/50 text-green-400',
  video: 'bg-red-900/50 text-red-400',
  multimodal: 'bg-orange-900/50 text-orange-400',
};
