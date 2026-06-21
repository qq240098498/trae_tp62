import { Link } from 'react-router-dom';
import { Bell, PackageCheck, Phone, Calendar, Clock, CheckCircle2, Send } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import { useOrderStore } from '@/store/orderStore';
import { formatDate, formatCurrency } from '@/utils/helpers';
import type { Order } from '@/types';

function PickupCard({ order, onNotify, onPickup }: {
  order: Order;
  onNotify: () => void;
  onPickup: () => void;
}) {
  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-serif text-lg font-semibold text-coffee-800">{order.customerName}</h3>
            <span className="badge badge-ready">待取件</span>
            {order.notified && (
              <span className="badge bg-green-100 text-green-700">已通知</span>
            )}
          </div>
          <p className="text-sm text-coffee-500">#{order.orderNo}</p>
        </div>
        <span className="font-serif text-2xl font-bold text-gold-600">
          {formatCurrency(order.totalPrice)}
        </span>
      </div>

      <div className="space-y-2 mb-5 text-sm">
        <div className="flex items-center gap-2 text-coffee-600">
          <Phone className="w-4 h-4 text-coffee-400" />
          <span>{order.customerPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-coffee-600">
          <Calendar className="w-4 h-4 text-coffee-400" />
          <span>预计取件：{formatDate(order.pickupDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-coffee-600">
          <Clock className="w-4 h-4 text-coffee-400" />
          <span>修改项目：{order.alterationItems.map(i => i.name).join('、')}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNotify}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            order.notified
              ? 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
              : 'bg-gold-400 text-espresso hover:bg-gold-500 shadow-md'
          }`}
        >
          <Send className="w-4 h-4" />
          {order.notified ? '重新通知' : '发送取件通知'}
        </button>
        <button
          onClick={onPickup}
          className="flex-1 btn-primary inline-flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          确认取件
        </button>
      </div>
    </div>
  );
}

export default function PickupPage() {
  const { orders, markNotified, confirmPickup, getOrderById } = useOrderStore();

  const readyOrders = orders
    .filter(o => o.status === 'ready')
    .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime());

  const notifiedOrders = readyOrders.filter(o => o.notified).length;

  const handleNotify = (orderId: string) => {
    const order = getOrderById(orderId);
    if (!order) return;
    try {
      markNotified(orderId);
      alert(`已向 ${order.customerName}（${order.customerPhone}）发送取件通知`);
    } catch (e) {
      console.error('发送通知失败:', e);
      alert('发送通知失败，请重试');
    }
  };

  const handlePickup = (orderId: string) => {
    const order = getOrderById(orderId);
    if (!order) return;
    if (confirm(`确认客户 ${order.customerName} 已取件？金额：${formatCurrency(order.totalPrice)}`)) {
      try {
        confirmPickup(orderId);
      } catch (e) {
        console.error('确认取件失败:', e);
        alert('操作失败，请重试');
      }
    }
  };

  return (
    <>
      <PageHeader
        title="取件通知"
        description="管理待取件订单，通知客户并确认交付"
      />
      <PageContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100 border-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">待取件总数</p>
                <p className="text-3xl font-serif font-bold text-green-700">{readyOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                <PackageCheck className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-gold-50 to-gold-100 border-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gold-700 mb-1">已通知客户</p>
                <p className="text-3xl font-serif font-bold text-gold-700">{notifiedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gold-200 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-gold-700" />
              </div>
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 mb-1">待通知</p>
                <p className="text-3xl font-serif font-bold text-amber-700">
                  {readyOrders.length - notifiedOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-amber-700" />
              </div>
            </div>
          </div>
        </div>

        {readyOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {readyOrders.map(order => (
              <PickupCard
                key={order.id}
                order={order}
                onNotify={() => handleNotify(order.id)}
                onPickup={() => handlePickup(order.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageCheck className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-coffee-700 mb-2">暂无待取件订单</h3>
            <p className="text-coffee-500 mb-6">所有订单都在处理中，请耐心等待完工</p>
            <Link to="/" className="btn-secondary inline-flex items-center gap-2">
              返回订单列表
            </Link>
          </div>
        )}
      </PageContent>
    </>
  );
}
