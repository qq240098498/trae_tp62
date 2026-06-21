import { ArrowRight, Bell, PackageCheck, RotateCcw } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatDateTime } from '@/utils/helpers';

interface Props {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  onNotify: () => void;
  onPickup: () => void;
}

const statusFlow: OrderStatus[] = ['pending', 'in_progress', 'ready', 'completed'];

export default function OrderStatusSection({ order, onStatusChange, onNotify, onPickup }: Props) {
  const currentIndex = statusFlow.indexOf(order.status);
  const canAdvance = currentIndex < statusFlow.length - 2;
  const nextStatus = canAdvance ? statusFlow[currentIndex + 1] : null;

  return (
    <div className="card p-6">
      <h2 className="section-title">订单状态</h2>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-coffee-500">当前状态：</span>
          <StatusBadge status={order.status} />
        </div>
        {order.pickedUp && order.pickedUpAt && (
          <div className="text-sm text-coffee-500">
            取件时间：{formatDateTime(order.pickedUpAt)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6">
        {statusFlow.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={status} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium transition-all ${
                isCurrent
                  ? 'bg-coffee-700 text-white shadow-md'
                  : isActive
                  ? 'bg-gold-100 text-gold-700'
                  : 'bg-coffee-50 text-coffee-400'
              }`}>
                {STATUS_LABELS[status]}
              </div>
              {index < statusFlow.length - 1 && (
                <ArrowRight className={`w-4 h-4 ${isActive ? 'text-gold-500' : 'text-coffee-300'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        {nextStatus && (
          <button onClick={() => onStatusChange(nextStatus)} className="btn-primary inline-flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            标记为「{STATUS_LABELS[nextStatus]}」
          </button>
        )}

        {order.status === 'ready' && !order.notified && (
          <button onClick={onNotify} className="btn-gold inline-flex items-center gap-2">
            <Bell className="w-5 h-5" />
            发送取件通知
          </button>
        )}

        {order.status === 'ready' && order.notified && (
          <button onClick={onNotify} className="btn-secondary inline-flex items-center gap-2">
            <Bell className="w-5 h-5" />
            重新发送通知
          </button>
        )}

        {order.status === 'ready' && (
          <button onClick={onPickup} className="btn-gold inline-flex items-center gap-2">
            <PackageCheck className="w-5 h-5" />
            确认取件
          </button>
        )}

        {currentIndex > 0 && order.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(statusFlow[currentIndex - 1])}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            回退状态
          </button>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-coffee-100 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-coffee-500">创建时间：</span>
          <span className="text-coffee-700">{formatDateTime(order.createdAt)}</span>
        </div>
        <div>
          <span className="text-coffee-500">预计取件：</span>
          <span className="text-coffee-700">{formatDate(order.pickupDate)}</span>
        </div>
      </div>
    </div>
  );
}
