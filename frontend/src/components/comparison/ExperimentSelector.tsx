import { useEffect, useState } from 'react';
import type { UIEvent } from 'react';
import { Experiment } from '../../types/experiment';
import { Card } from '../common/Card';
import { StatusBadge } from '../experiments/StatusBadge';

interface ExperimentSelectorProps {
  experiments: Experiment[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const PAGE_SIZE = 20;

export const ExperimentSelector = ({
  experiments,
  selectedIds,
  onToggle,
}: ExperimentSelectorProps) => {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Reset pagination when experiments list changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [experiments]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const reachedBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 32;

    if (reachedBottom && visibleCount < experiments.length) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, experiments.length));
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">
        Select Experiments to Compare ({selectedIds.length} selected)
      </h3>
      <Card>
        <div className="overflow-x-auto">
          <div
            className="max-h-[320px] overflow-y-auto"
            onScroll={handleScroll}
          >
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="w-10 px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase">
                    {/* checkbox column */}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase">
                    Experiment
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase">
                    Batch Size
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase">
                    Learning Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                {experiments.slice(0, visibleCount).map((experiment) => {
                  const isSelected = selectedIds.includes(experiment.id);
                  return (
                    <tr
                      key={experiment.id}
                      className={`cursor-pointer hover:bg-zinc-800/50 ${
                        isSelected ? 'bg-primary-500/10' : ''
                      }`}
                      onClick={() => onToggle(experiment.id)}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggle(experiment.id);
                          }}
                          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-zinc-600 rounded bg-zinc-800"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-zinc-100">
                        {experiment.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <StatusBadge status={experiment.status} />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-zinc-400">
                        {experiment.config.hyperparameters.batch_size}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-zinc-400">
                        {experiment.config.hyperparameters.learning_rate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
