import { Badge } from '../common/Badge';
import { STATUS_COLORS } from '../../utils/constants';
import { ExperimentStatus } from '../../types/experiment';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: ExperimentStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.created;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        colorClass
      )}
    >
      {status}
    </span>
  );
};
