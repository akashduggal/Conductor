import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { DatasetCard } from './DatasetCard';
import { DatasetFilters } from './DatasetFilters';
import { DatasetModal } from './DatasetModal';
import { Dataset } from '../../types/dataset';
import { useCreateDataset, useDeleteDataset } from '../../hooks/useDatasets';

interface DatasetListProps {
  datasets: Dataset[];
  loading: boolean;
  onRefresh: () => void;
}

export const DatasetList = ({ datasets, loading, onRefresh }: DatasetListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ modality?: string; search?: string }>({});
  const createMutation = useCreateDataset();
  const deleteMutation = useDeleteDataset();

  const handleCreate = async (data: Omit<Dataset, 'id' | 'created_at'>) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    onRefresh();
  };

  const filteredDatasets = datasets.filter((dataset) => {
    if (filters.modality && dataset.modality !== filters.modality) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        dataset.name.toLowerCase().includes(searchLower) ||
        dataset.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Datasets</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Dataset
        </Button>
      </div>

      <DatasetFilters onFilterChange={setFilters} />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
          <p className="text-zinc-500">No datasets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <DatasetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};
