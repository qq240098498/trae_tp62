import type { OrderStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const badgeClass = {
    pending: 'badge-pending',
    in_progress: 'badge-in_progress',
    ready: 'badge-ready',
    completed: 'badge-completed',
  }[status];

  return (
    <span className={`badge ${badgeClass}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
