import { useMemo } from 'react';
import { Shirt, Sparkles, Package, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CLOTHING_CATEGORIES, FABRIC_TYPES } from '@/types';
import { useRemnantStore } from '@/store/remnantStore';

interface ClothingInfo {
  clothingCategory: string;
  fabric: string;
  brand: string;
  color: string;
  requirements: string;
}

interface Props {
  data: ClothingInfo;
  onChange: (data: ClothingInfo) => void;
}

export default function ClothingInfoSection({ data, onChange }: Props) {
  const { findMatchingRemnants } = useRemnantStore();

  const matchingRemnants = useMemo(() => {
    if (!data.fabric && !data.color) return [];
    return findMatchingRemnants(data.fabric, data.color);
  }, [data.fabric, data.color, findMatchingRemnants]);

  const handleChange = (key: keyof ClothingInfo, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="card p-6">
      <h2 className="section-title">
        <Shirt className="w-5 h-5 text-gold-500" />
        衣物信息
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          <label className="input-label">衣物品类</label>
          <select
            value={data.clothingCategory}
            onChange={e => handleChange('clothingCategory', e.target.value)}
            className="input-field"
          >
            <option value="">请选择品类</option>
            {CLOTHING_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">面料材质</label>
          <select
            value={data.fabric}
            onChange={e => handleChange('fabric', e.target.value)}
            className="input-field"
          >
            <option value="">请选择面料</option>
            {FABRIC_TYPES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">品牌</label>
          <input
            type="text"
            value={data.brand}
            onChange={e => handleChange('brand', e.target.value)}
            placeholder="如：Armani"
            className="input-field"
          />
        </div>

        <div>
          <label className="input-label">颜色</label>
          <input
            type="text"
            value={data.color}
            onChange={e => handleChange('color', e.target.value)}
            placeholder="如：深蓝"
            className="input-field"
          />
        </div>
      </div>

      {matchingRemnants.length > 0 && (
        <div className="mt-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-emerald-800">
                  发现 {matchingRemnants.length} 块匹配余料
                </span>
                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  优先使用，节省成本
                </span>
              </div>
              <p className="text-sm text-emerald-700 mb-3">
                以下余料材质{data.fabric ? `「${data.fabric}」` : ''}
                {data.color ? ` 颜色「${data.color}」` : ''}相近，可优先考虑使用：
              </p>
              <div className="space-y-2">
                {matchingRemnants.slice(0, 3).map(remnant => (
                  <div
                    key={remnant.id}
                    className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="text-sm font-medium text-emerald-800">
                          {remnant.fabric} · {remnant.color}
                        </span>
                        <span className="text-xs text-emerald-600 ml-2">
                          {remnant.quantity} {remnant.unit}
                        </span>
                      </div>
                    </div>
                    {remnant.sourceOrderNo && (
                      <span className="text-xs text-emerald-500">
                        来源：{remnant.sourceOrderNo}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {matchingRemnants.length > 3 && (
                <p className="text-xs text-emerald-600 mt-2">
                  还有 {matchingRemnants.length - 3} 块余料...
                </p>
              )}
              <Link
                to="/remnants"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                查看全部余料
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5">
        <label className="input-label">修改需求描述</label>
        <textarea
          value={data.requirements}
          onChange={e => handleChange('requirements', e.target.value)}
          placeholder="详细描述客户的修改需求..."
          rows={3}
          className="input-field resize-none"
        />
      </div>
    </div>
  );
}
