import { useState, useMemo } from 'react';
import { Plus, Search, Scissors, Palette, Package, Trash2, Edit2, X, Check, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import { useRemnantStore } from '@/store/remnantStore';
import type { FabricRemnant, RemnantStatus } from '@/types';
import { FABRIC_TYPES, REMNANT_STATUS_LABELS, REMNANT_UNITS } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function RemnantList() {
  const { remnants, searchRemnants, addRemnant, updateRemnant, deleteRemnant } = useRemnantStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<RemnantStatus | 'all'>('all');
  const [filterFabric, setFilterFabric] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRemnant, setEditingRemnant] = useState<FabricRemnant | null>(null);
  const [formData, setFormData] = useState({
    fabric: '',
    color: '',
    quantity: 0,
    unit: 'cm²',
    description: '',
    sourceOrderNo: '',
  });

  const filteredRemnants = useMemo(() => {
    let result = searchKeyword ? searchRemnants(searchKeyword) : remnants;
    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }
    if (filterFabric) {
      result = result.filter(r => r.fabric === filterFabric);
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [remnants, searchKeyword, filterStatus, filterFabric, searchRemnants]);

  const availableCount = useMemo(() => remnants.filter(r => r.status === 'available').length, [remnants]);
  const usedUpCount = useMemo(() => remnants.filter(r => r.status === 'used_up').length, [remnants]);
  const reservedCount = useMemo(() => remnants.filter(r => r.status === 'reserved').length, [remnants]);

  const handleAdd = () => {
    setEditingRemnant(null);
    setFormData({
      fabric: '',
      color: '',
      quantity: 0,
      unit: 'cm²',
      description: '',
      sourceOrderNo: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (remnant: FabricRemnant) => {
    setEditingRemnant(remnant);
    setFormData({
      fabric: remnant.fabric,
      color: remnant.color,
      quantity: remnant.quantity,
      unit: remnant.unit,
      description: remnant.description || '',
      sourceOrderNo: remnant.sourceOrderNo || '',
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.fabric || !formData.color || formData.quantity <= 0) {
      alert('请填写完整的面料信息（面料、颜色、数量）');
      return;
    }

    if (editingRemnant) {
      updateRemnant(editingRemnant.id, {
        fabric: formData.fabric,
        color: formData.color,
        quantity: formData.quantity,
        unit: formData.unit,
        description: formData.description,
        sourceOrderNo: formData.sourceOrderNo || undefined,
      });
    } else {
      addRemnant({
        fabric: formData.fabric,
        color: formData.color,
        quantity: formData.quantity,
        unit: formData.unit,
        description: formData.description,
        sourceOrderNo: formData.sourceOrderNo || undefined,
      });
    }

    setShowAddModal(false);
  };

  const handleDelete = (remnant: FabricRemnant) => {
    if (confirm(`确定要删除这条「${remnant.fabric} - ${remnant.color}」的余料记录吗？此操作不可撤销。`)) {
      deleteRemnant(remnant.id);
    }
  };

  const getStatusBadgeClass = (status: RemnantStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'reserved':
        return 'bg-amber-100 text-amber-700';
      case 'used_up':
        return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <>
      <PageHeader
        title="面料余料管理"
        description="改衣裁剪剩余面料记录入库，同材质同色系优先使用，节省成本"
        actions={
          <button
            onClick={handleAdd}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            登记余料
          </button>
        }
      />

      <PageContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">余料总数</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">{remnants.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">可用余料</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">{availableCount}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">已预留</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">{reservedCount}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">已用完</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">{usedUpCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索面料、颜色、订单号..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as RemnantStatus | 'all')}
                className="input-field w-32"
              >
                <option value="all">全部状态</option>
                <option value="available">可用</option>
                <option value="reserved">已预留</option>
                <option value="used_up">已用完</option>
              </select>
              <select
                value={filterFabric}
                onChange={e => setFilterFabric(e.target.value)}
                className="input-field w-32"
              >
                <option value="">全部面料</option>
                {FABRIC_TYPES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredRemnants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRemnants.map(remnant => (
              <div
                key={remnant.id}
                className="card p-5 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-500 rounded-xl flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-coffee-800">
                        {remnant.fabric}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-coffee-500 mt-0.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span>{remnant.color}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(remnant.status)}`}>
                    {REMNANT_STATUS_LABELS[remnant.status]}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-coffee-500 flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      剩余数量
                    </span>
                    <span className="text-lg font-semibold text-coffee-700 font-serif">
                      {remnant.quantity} {remnant.unit}
                    </span>
                  </div>

                  <div className="w-full bg-coffee-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        remnant.status === 'used_up'
                          ? 'bg-gray-400'
                          : remnant.quantity > 500
                            ? 'bg-green-500'
                            : remnant.quantity > 200
                              ? 'bg-amber-500'
                              : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(100, (remnant.quantity / 1500) * 100)}%` }}
                    ></div>
                  </div>

                  {remnant.description && (
                    <p className="text-sm text-coffee-600 mt-2 line-clamp-2">
                      {remnant.description}
                    </p>
                  )}

                  {remnant.sourceOrderNo && (
                    <div className="text-xs text-coffee-400 mt-2">
                      来源订单：{remnant.sourceOrderNo}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-coffee-100">
                  <span className="text-xs text-coffee-400">
                    更新于 {formatDate(remnant.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(remnant)}
                      className="p-2 text-coffee-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-all"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(remnant)}
                      className="p-2 text-coffee-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-8 h-8 text-coffee-400" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-coffee-700 mb-2">暂无余料记录</h3>
            <p className="text-coffee-500 mb-6">
              {searchKeyword || filterStatus !== 'all' || filterFabric
                ? '未找到匹配的余料记录，请尝试其他筛选条件'
                : '点击上方按钮登记第一条面料余料'}
            </p>
            {!searchKeyword && filterStatus === 'all' && !filterFabric && (
              <button
                onClick={handleAdd}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                登记余料
              </button>
            )}
          </div>
        )}
      </PageContent>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-coffee-800">
                {editingRemnant ? '编辑余料' : '登记面料余料'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">
                    <span className="text-red-500">*</span> 面料材质
                  </label>
                  <select
                    value={formData.fabric}
                    onChange={e => setFormData(prev => ({ ...prev, fabric: e.target.value }))}
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
                    value={formData.color}
                    onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="如：深蓝、酒红"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">
                    <span className="text-red-500">*</span> 数量
                  </label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">计量单位</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="input-field"
                  >
                    {REMNANT_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">来源订单号（选填）</label>
                <input
                  type="text"
                  value={formData.sourceOrderNo}
                  onChange={e => setFormData(prev => ({ ...prev, sourceOrderNo: e.target.value }))}
                  placeholder="如：TF20260618001"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">备注说明（选填）</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述余料的大小、形状、适用场景等..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-coffee-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {editingRemnant ? '保存修改' : '登记入库'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
