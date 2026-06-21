import { Receipt, Plus, X, Calculator } from 'lucide-react';
import type { AlterationItem } from '@/types';
import { generateId, formatCurrency } from '@/utils/helpers';
import { useOrderStore } from '@/store/orderStore';

interface Props {
  items: AlterationItem[];
  onChange: (items: AlterationItem[]) => void;
  totalPrice: number;
  onTotalChange: (total: number) => void;
}

export default function AlterationItemsSection({ items, onChange, totalPrice, onTotalChange }: Props) {
  const { pricingConfigs } = useOrderStore();

  const addItem = (type: string, name: string) => {
    const config = pricingConfigs.find(p => p.type === type);
    const unitPrice = config?.price || 0;
    onChange([
      ...items,
      {
        id: generateId(),
        type,
        name,
        unitPrice,
        quantity: 1,
        subtotal: unitPrice,
      },
    ]);
  };

  const updateItem = (id: string, field: 'unitPrice' | 'quantity', value: number) => {
    const updated = items.map(i => {
      if (i.id !== id) return i;
      const newItem = { ...i, [field]: value };
      newItem.subtotal = newItem.unitPrice * newItem.quantity;
      return newItem;
    });
    onChange(updated);
    onTotalChange(updated.reduce((sum, i) => sum + i.subtotal, 0));
  };

  const removeItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    onChange(updated);
    onTotalChange(updated.reduce((sum, i) => sum + i.subtotal, 0));
  };

  const addedTypes = new Set(items.map(i => i.type));

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-5">
        <h2 className="section-title mb-0">
          <Receipt className="w-5 h-5 text-gold-500" />
          修改项目与定价
        </h2>

        <div className="flex items-center gap-2 px-4 py-2 bg-gold-50 rounded-lg border border-gold-200">
          <Calculator className="w-5 h-5 text-gold-600" />
          <span className="text-sm text-gold-700">合计：</span>
          <span className="font-serif text-2xl font-bold text-gold-700">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm text-coffee-500 mb-2">选择修改类型：</p>
        <div className="flex flex-wrap gap-2">
          {pricingConfigs.map(config => {
            const isAdded = addedTypes.has(config.type);
            return (
              <button
                key={config.id}
                onClick={() => !isAdded && addItem(config.type, config.name)}
                disabled={isAdded}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isAdded
                    ? 'bg-coffee-200 text-coffee-500 cursor-not-allowed'
                    : 'bg-coffee-50 border border-coffee-200 text-coffee-700 hover:bg-gold-50 hover:border-gold-300 hover:text-gold-700'
                }`}
              >
                {!isAdded && <Plus className="w-4 h-4" />}
                {config.name}
                <span className="text-xs opacity-75">({formatCurrency(config.price)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-coffee-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-coffee-600 w-40">修改类型</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-coffee-600">单价 (¥)</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-coffee-600">数量</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-coffee-600 w-40">小计</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-coffee-600 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-coffee-100 hover:bg-coffee-50/50">
                  <td className="py-3 px-4 font-medium text-coffee-800">{item.name}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      className="input-field text-center w-24"
                      min="0"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="input-field text-center w-20"
                      min="1"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-serif text-lg font-semibold text-gold-700">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-coffee-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <Receipt className="w-10 h-10 text-coffee-300 mx-auto mb-3" />
          <p className="text-coffee-500">暂无修改项目，请选择修改类型</p>
        </div>
      )}
    </div>
  );
}
