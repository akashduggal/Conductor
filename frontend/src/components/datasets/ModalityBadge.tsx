import { Badge } from '../common/Badge';
import { MODALITY_COLORS } from '../../utils/constants';
import { Modality } from '../../types/dataset';
import { cn } from '../../utils/cn';

interface ModalityBadgeProps {
  modality: Modality;
}

export const ModalityBadge = ({ modality }: ModalityBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        MODALITY_COLORS[modality] || MODALITY_COLORS.text
      )}
    >
      {modality}
    </span>
  );
};
