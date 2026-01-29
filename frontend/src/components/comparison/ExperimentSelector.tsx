import { Experiment } from '../../types/experiment';
import { Card } from '../common/Card';
import { StatusBadge } from '../experiments/StatusBadge';

interface ExperimentSelectorProps {
  experiments: Experiment[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const ExperimentSelector = ({
  experiments,
  selectedIds,
  onToggle,
}: ExperimentSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">
        Select Experiments to Compare ({selectedIds.length} selected)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((experiment) => {
          const isSelected = selectedIds.includes(experiment.id);
          return (
            <Card
              key={experiment.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary-500 bg-primary-500/10' : 'hover:shadow-md'
              }`}
              onClick={() => onToggle(experiment.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-zinc-600 rounded bg-zinc-800"
                    />
                    <h4 className="font-medium text-zinc-100">{experiment.name}</h4>
                  </div>
                  <StatusBadge status={experiment.status} />
                  <div className="mt-2 text-sm text-zinc-400">
                    <div>
                      Batch Size: {experiment.config.hyperparameters.batch_size}
                    </div>
                    <div>
                      LR: {experiment.config.hyperparameters.learning_rate}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
