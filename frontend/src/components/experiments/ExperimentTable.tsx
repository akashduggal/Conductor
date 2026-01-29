import { useState } from 'react';
import { MoreVertical, Play, X, Trash2, Eye } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { Experiment } from '../../types/experiment';
import { StatusBadge } from './StatusBadge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ExperimentTableProps {
  experiments: Experiment[];
  loading: boolean;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  onExperimentClick: (id: string) => void;
  onStartExperiment: (id: string) => void;
  onCancelExperiment: (id: string) => void;
  onDeleteExperiment: (id: string) => void;
}

export const ExperimentTable = ({
  experiments,
  loading,
  onExperimentClick,
  onStartExperiment,
  onCancelExperiment,
  onDeleteExperiment,
}: ExperimentTableProps) => {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Dataset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 rounded bg-zinc-700/80 overflow-hidden w-40">
                        <div className="h-full w-full animate-shimmer" />
                      </div>
                      <div className="h-3 rounded bg-zinc-700/60 overflow-hidden w-56">
                        <div className="h-full w-full animate-shimmer" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 rounded-full bg-zinc-700/80 overflow-hidden w-20">
                      <div className="h-full w-full animate-shimmer" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 rounded bg-zinc-700/80 overflow-hidden w-28">
                      <div className="h-full w-full animate-shimmer" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="h-3 rounded bg-zinc-700/80 overflow-hidden w-16">
                        <div className="h-full w-full animate-shimmer" />
                      </div>
                      <div className="h-2 rounded-full bg-zinc-700/80 overflow-hidden w-full max-w-[120px]">
                        <div className="h-full w-full animate-shimmer" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 rounded bg-zinc-700/80 overflow-hidden w-20">
                      <div className="h-full w-full animate-shimmer" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-8 rounded bg-zinc-700/80 overflow-hidden w-8 ml-auto">
                      <div className="h-full w-full animate-shimmer" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Dataset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-zinc-900 divide-y divide-zinc-800">
            {experiments.map((experiment) => (
              <tr
                key={experiment.id}
                className="hover:bg-zinc-800/50 cursor-pointer"
                onClick={() => onExperimentClick(experiment.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{experiment.name}</div>
                    {experiment.description && (
                      <div className="text-sm text-zinc-500 truncate max-w-md">
                        {experiment.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={experiment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                  {experiment.dataset_name ?? experiment.dataset_id ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {experiment.status === 'running' && experiment.current_job ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between text-sm mb-1 gap-2">
                        <span className="text-zinc-300">
                          {experiment.current_job.current_epoch} / {experiment.config.hyperparameters.num_epochs}
                        </span>
                        <span className="text-zinc-500">({experiment.current_job.progress.toFixed(1)})%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${experiment.current_job.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                  {formatRelativeTime(experiment.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {experiment.status === 'created' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartExperiment(experiment.id);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {experiment.status === 'running' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelExperiment(experiment.id);
                        }}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(
                            actionMenuOpen === experiment.id ? null : experiment.id
                          );
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {actionMenuOpen === experiment.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg z-10 border border-zinc-700">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              onExperimentClick(experiment.id);
                              setActionMenuOpen(null);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete({
                                id: experiment.id,
                                name: experiment.name,
                              });
                              setActionMenuOpen(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {experiments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">No experiments found</p>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete experiment"
        description={
          confirmDelete && (
            <>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-zinc-100">
                {confirmDelete.name}
              </span>
              ? This action cannot be undone.
            </>
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            onDeleteExperiment(confirmDelete.id);
            setConfirmDelete(null);
          }
        }}
      />
    </div>
  );
};
