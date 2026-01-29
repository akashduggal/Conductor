import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { ExperimentTable } from '../components/experiments/ExperimentTable';
import { ExperimentForm, ExperimentFormRef } from '../components/experiments/ExperimentForm';
import { Modal } from '../components/common/Modal';
import { useExperiments, useCreateExperiment, useStartExperiment, useCancelExperiment, useDeleteExperiment } from '../hooks/useExperiments';
import { Experiment } from '../types/experiment';

export const ExperimentsPage = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ status?: string }>({});
  const formRef = useRef<ExperimentFormRef>(null);

  const { data, isLoading, refetch } = useExperiments(filters);
  const createMutation = useCreateExperiment();
  const startMutation = useStartExperiment();
  const cancelMutation = useCancelExperiment();
  const deleteMutation = useDeleteExperiment();

  const handleCreate = async (data: Omit<Experiment, 'id' | 'created_at' | 'status'>) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleStart = async (id: string) => {
    await startMutation.mutateAsync(id);
    refetch();
  };

  const handleCancel = async (id: string) => {
    await cancelMutation.mutateAsync(id);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-100">Experiments</h2>
        <div className="flex items-center gap-4">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ status: e.target.value || undefined })}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="created">Created</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Experiment
          </Button>
        </div>
      </div>

      <ExperimentTable
        experiments={data?.data || []}
        loading={isLoading}
        onExperimentClick={(id) => navigate(`/experiments/${id}`)}
        onStartExperiment={handleStart}
        onCancelExperiment={handleCancel}
        onDeleteExperiment={handleDelete}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Experiment"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                formRef.current?.submit();
              }}
            >
              Create
            </Button>
          </div>
        }
      >
        <ExperimentForm ref={formRef} onSubmit={handleCreate} />
      </Modal>
    </div>
  );
};
