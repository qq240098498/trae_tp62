import { useState } from 'react';
import { ArrowRight, Bell, PackageCheck, RotateCcw, Clock, Layers, Plus, X, Check } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { STATUS_LABELS, FABRIC_TYPES, REMNANT_UNITS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { useRemnantStore } from '@/store/remnantStore';

interface Props {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  onNotify: () => void;
  onPickup: () => void;
}

const statusFlow: OrderStatus[] = ['pending', 'in_progress', 'ready', 'completed'];

export default function OrderStatusSection({ order, onStatusChange, onNotify, onPickup }: Props) {
  const { addRemnant, remnants } = useRemnantStore();
  const [showAddRemnant, setShowAddRemnant] = useState(false);
  const [remnantForm, setRemnantForm] = useState({
    fabric: '',
    color: '',
    quantity: 0,
    unit: 'cm²',
    description: '',
  });

  const currentIndex = statusFlow.indexOf(order.status);
  const canAdvance = currentIndex < statusFlow.length - 2;
  const nextStatus = canAdvance ? statusFlow[currentIndex + 1] : null;
  const notifyCount = order.notifyCount || 0;

  const orderRemnants = remnants.filter(r => r.sourceOrderId === order.id);

  const handleAddRemnant = () => {
    setRemnantForm({
      fabric: order.fabric || '',
      color: order.color || '',
      quantity: 0,
      unit: 'cm²',
      description: '',
    });
    setShowAddRemnant(true);
  };

  const handleSaveRemnant = () => {
    if (!remnantForm.fabric || !remnantForm.color || remnantForm.quantity <= 0) {
      alert('请填写完整的面料信息（面料、颜色、数量）');
      return;
    }

    addRemnant({
      fabric: remnantForm.fabric,
      color: remnantForm.color,
      quantity: remnantForm.quantity,
      unit: remnantForm.unit,
      description: remnantForm.description,
      sourceOrderId: order.id,
      sourceOrderNo: order.orderNo,
    });

    setShowAddRemnant(false);
    alert('余料登记成功！');
  };

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

      {order.notified && (
        <div className="mb-5 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">
              已发送 {notifyCount} 次通知
            </span>
            {order.notifiedAt && (
              <span className="text-sm text-green-600 ml-auto">
                最近：{formatDateTime(order.notifiedAt)}
              </span>
            )}
          </div>
        </div>
      )}

      {orderRemnants.length > 0 && (
        <div className="mb-5 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">本订单产生余料</span>
            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
              {orderRemnants.length} 块
            </span>
          </div>
          <div className="space-y-1.5">
            {orderRemnants.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs text-amber-600">
                <span>{r.fabric} · {r.color}</span>
                <span>{r.quantity} {r.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="mt-5 pt-5 border-t border-coffee-100">
        <button
          onClick={handleAddRemnant}
          className="w-full btn-secondary inline-flex items-center justify-center gap-2 text-gold-600 border-gold-200 hover:bg-gold-50"
        >
          <Plus className="w-5 h-5" />
          登记余料入库
        </button>
      </div>

      <div className="mt-5 pt-5 border-t border-coffee-100 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-coffee-400" />
          <span className="text-coffee-500">创建时间：</span>
          <span className="text-coffee-700">{formatDateTime(order.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-coffee-400" />
          <span className="text-coffee-500">预计取件：</span>
          <span className="text-coffee-700">{formatDate(order.pickupDate)}</span>
        </div>
      </div>

      {showAddRemnant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-coffee-800">
                登记余料入库
              </h2>
              <button
                onClick={() => setShowAddRemnant(false)}
                className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-coffee-50 rounded-lg">
                <p className="text-xs text-coffee-500 mb-1">关联订单</p>
                <p className="text-sm font-medium text-coffee-700">{order.orderNo}</p>
              </div>

              <div>
                <label className="input-label">
                  <span className="text-red-500">*</span> 面料材质
                </label>
                <select
                  value={remnantForm.fabric}
                  onChange={e => setRemnantForm(prev => ({ ...prev, fabric: e.target.value }))}
                  className="input-field"
                >
                  <option value="">请选择面料</option>
                  {FABRIC_TYPES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">
                  <span className="text-red-500">*</span> 颜色
                </label>
                <input
                  type="text"
                  value={remnantForm.color}
                  onChange={e => setRemnantForm(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="如：深蓝、酒红"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">
                    <span className="text-red-500">*</span> 数量
                  </label>
                  <input
                    type="number"
                    value={remnantForm.quantity || ''}
                    onChange={e => setRemnantForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">单位</label>
                  <select
                    value={remnantForm.unit}
                    onChange={e => setRemnantForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="input-field"
                  >
                    {REMNANT_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">备注说明（选填）</label>
                <textarea
                  value={remnantForm.description}
                  onChange={e => setRemnantForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述余料的大小、形状、适用场景等..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-coffee-100">
              <button
                onClick={() => setShowAddRemnant(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSaveRemnant}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                登记入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
