import { Link } from 'react-router-dom';
import { Phone, Calendar, Ruler, ChevronRight } from 'lucide-react';
import type { Order } from '@/types';
import StatusBadge from './StatusBadge';
import { formatDate, formatCurrency } from '@/utils/helpers';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const itemsSummary = order.alterationItems.map(i => i.name).join('、') || '暂无修改项目';

  return (
    <Link
      to={`/orders/${order.id}`}
      className="card p-5 block group animate-slide-up"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-serif text-lg font-semibold text-coffee-800 group-hover:text-coffee-700">
              {order.customerName}
            </h3>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-coffee-500">#{order.orderNo}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-coffee-400 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-coffee-600">
          <span className="font-medium text-coffee-700 w-16">衣物：</span>
          <span>{order.brand} {order.color} {order.clothingCategory}（{order.fabric}）</span>
        </div>
        <div className="flex items-center gap-2 text-coffee-600">
          <Ruler className="w-4 h-4 text-coffee-400" />
          <span className="truncate">{itemsSummary}</span>
        </div>
        <div className="flex items-center gap-2 text-coffee-600">
          <Phone className="w-4 h-4 text-coffee-400" />
          <span>{order.customerPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-coffee-600">
          <Calendar className="w-4 h-4 text-coffee-400" />
          <span>取件日期：{formatDate(order.pickupDate)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-coffee-100 flex items-center justify-between">
        <span className="text-sm text-coffee-500">
          {order.measurements.length} 处测量 · {order.alterationItems.length} 项修改
        </span>
        <span className="font-serif text-xl font-bold text-gold-600">
          {formatCurrency(order.totalPrice)}
        </span>
      </div>
    </Link>
  );
}
