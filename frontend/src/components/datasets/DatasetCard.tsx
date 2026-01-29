import { Trash2, Database } from 'lucide-react';
import { Card } from '../common/Card';
import { ModalityBadge } from './ModalityBadge';
import { formatBytes } from '../../utils/formatters';
import { Dataset } from '../../types/dataset';
import { Button } from '../common/Button';

interface DatasetCardProps {
  dataset: Dataset;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const DatasetCard = ({ dataset, onClick, onDelete, showActions = true }: DatasetCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(dataset.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-zinc-400" />
            <h3 className="text-lg font-semibold text-zinc-100">{dataset.name}</h3>
            <ModalityBadge modality={dataset.modality} />
          </div>
          {dataset.description && (
            <p className="text-sm text-zinc-400 mb-3">{dataset.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>{formatBytes(dataset.size_bytes)}</span>
            <span>•</span>
            <span>{dataset.file_count.toLocaleString()} files</span>
            {dataset.stats?.experiments_using !== undefined && (
              <>
                <span>•</span>
                <span>{dataset.stats.experiments_using} experiments</span>
              </>
            )}
          </div>
        </div>
        {showActions && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete "${dataset.name}"?`)) {
                onDelete(dataset.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </div>
    </Card>
  );
};
