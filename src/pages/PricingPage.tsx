import { useState } from 'react';
import { Settings, Edit2, Check, X, DollarSign, Tag } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import { useOrderStore } from '@/store/orderStore';
import { formatCurrency } from '@/utils/helpers';

export default function PricingPage() {
  const { pricingConfigs, updatePricing } = useOrderStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  const startEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditValue(currentPrice);
  };

  const saveEdit = (id: string) => {
    if (editValue >= 0) {
      updatePricing(id, editValue);
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <>
      <PageHeader
        title="价格配置"
        description="管理各类修改项目的单价"
      />
      <PageContent>
        <div className="max-w-3xl mx-auto">
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gold-600" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-coffee-800">修改项目单价表</h2>
                <p className="text-sm text-coffee-500">点击价格可以直接编辑修改</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-coffee-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-coffee-50 border-b border-coffee-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-coffee-700 w-16">序号</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-coffee-700">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        修改类型
                      </div>
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-coffee-700 w-56">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-4 h-4" />
                        单价 (元)
                      </div>
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-coffee-700 w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingConfigs.map((config, index) => (
                    <tr
                      key={config.id}
                      className="border-b border-coffee-100 last:border-b-0 hover:bg-coffee-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-coffee-500">{index + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-coffee-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-4 h-4 text-coffee-600" />
                          </div>
                          <span className="font-medium text-coffee-800">{config.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {editingId === config.id ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-coffee-500">¥</span>
                            <input
                              type="number"
                              value={editValue}
                              onChange={e => setEditValue(Number(e.target.value))}
                              autoFocus
                              min="0"
                              className="w-24 px-3 py-1.5 rounded-lg border border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200 text-coffee-800 text-right"
                            />
                          </div>
                        ) : (
                          <span
                            onClick={() => startEdit(config.id, config.price)}
                            className="cursor-pointer inline-flex items-center gap-1 font-serif text-xl font-bold text-gold-700 hover:text-gold-800"
                          >
                            {formatCurrency(config.price)}
                            <Edit2 className="w-4 h-4 opacity-0 hover:opacity-100 transition-opacity" />
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {editingId === config.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => saveEdit(config.id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 bg-coffee-100 text-coffee-600 rounded-lg hover:bg-coffee-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(config.id, config.price)}
                            className="p-2 text-coffee-400 hover:text-coffee-700 hover:bg-coffee-100 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-coffee-50">
                    <td colSpan={2} className="py-4 px-6 font-medium text-coffee-700">
                      平均单价
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-serif text-lg font-bold text-coffee-700">
                        {formatCurrency(
                          Math.round(
                            pricingConfigs.reduce((sum, c) => sum + c.price, 0) / pricingConfigs.length
                          )
                        )}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-coffee-50 to-coffee-100 border-transparent">
            <h3 className="font-serif text-lg font-semibold text-coffee-800 mb-3">使用说明</h3>
            <ul className="space-y-2 text-sm text-coffee-600">
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                点击价格数字可以直接编辑单价
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                修改价格后，新建订单时会自动使用新价格
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                已创建的订单价格不受后续价格调整影响
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 mt-0.5">•</span>
                价格变更会自动保存到本地存储
              </li>
            </ul>
          </div>
        </div>
      </PageContent>
    </>
  );
}
