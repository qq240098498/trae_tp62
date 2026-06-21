import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Zap } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import StatsCards from '@/components/StatsCards';
import OrderCard from '@/components/OrderCard';
import { useOrderStore } from '@/store/orderStore';
import type { OrderStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

const filterTabs: { key: 'all' | 'urgent' | OrderStatus; label: string }[] = [
  { key: 'all', label: '全部订单' },
  { key: 'urgent', label: '🔥 急件通道' },
  { key: 'pending', label: STATUS_LABELS.pending },
  { key: 'in_progress', label: STATUS_LABELS.in_progress },
  { key: 'ready', label: STATUS_LABELS.ready },
  { key: 'completed', label: STATUS_LABELS.completed },
];

export default function OrderList() {
  const { orders, searchOrders, sortOrdersByPriority } = useOrderStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | OrderStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredOrders = useMemo(() => {
    let result = searchKeyword ? searchOrders(searchKeyword) : orders;
    if (activeFilter === 'urgent') {
      result = result.filter(o => o.isUrgent);
    } else if (activeFilter !== 'all') {
      result = result.filter(o => o.status === activeFilter);
    }
    return sortOrdersByPriority(result);
  }, [orders, activeFilter, searchKeyword, searchOrders, sortOrdersByPriority]);

  const urgentCount = useMemo(() => orders.filter(o => o.isUrgent && o.status !== 'completed').length, [orders]);

  return (
    <>
      <PageHeader
        title="订单管理"
        description="管理所有改衣订单，从收件登记到完工取件"
        actions={
          <Link to="/orders/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新建订单
          </Link>
        }
      />
      <PageContent>
        <StatsCards />

        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === tab.key
                      ? 'bg-coffee-700 text-white shadow-md'
                      : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
                  } ${tab.key === 'urgent' ? 'flex items-center gap-1.5' : ''}`}
                >
                  {tab.key === 'urgent' && <Zap className="w-4 h-4" />}
                  {tab.label}
                  {tab.key === 'urgent' && urgentCount > 0 && (
                    <span className={`ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                      activeFilter === tab.key
                        ? 'bg-white text-red-600'
                        : 'bg-red-500 text-white'
                    }`}>
                      {urgentCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 md:max-w-xs md:ml-auto">
              <div className="relative">
                <Search className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索客户姓名/电话/订单号..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-coffee-400" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-coffee-700 mb-2">
              {activeFilter === 'urgent' ? '暂无急件订单' : '暂无订单'}
            </h3>
            <p className="text-coffee-500 mb-6">
              {searchKeyword
                ? '未找到匹配的订单，请尝试其他关键词'
                : activeFilter === 'urgent'
                ? '目前没有加急处理的订单'
                : '点击上方按钮创建您的第一个订单'}
            </p>
            {!searchKeyword && activeFilter !== 'urgent' && (
              <Link to="/orders/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                新建订单
              </Link>
            )}
          </div>
        )}
      </PageContent>
    </>
  );
}
