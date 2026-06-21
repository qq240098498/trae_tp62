import { Shirt } from 'lucide-react';
import { CLOTHING_CATEGORIES, FABRIC_TYPES } from '@/types';

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
