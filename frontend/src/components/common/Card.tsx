import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export const Card = ({ className, children, title, actions, ...props }: CardProps) => {
  return (
    <div
      className={cn('bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6', className)}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
