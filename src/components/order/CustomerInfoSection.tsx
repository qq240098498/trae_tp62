import { User, Phone, CalendarDays } from 'lucide-react';
import { daysLater } from '@/utils/helpers';

interface CustomerInfo {
  customerName: string;
  customerPhone: string;
  pickupDate: string;
}

interface Props {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
}

export default function CustomerInfoSection({ data, onChange }: Props) {
  const handleChange = (key: keyof CustomerInfo, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="card p-6">
      <h2 className="section-title">
        <User className="w-5 h-5 text-gold-500" />
        客户信息
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="input-label">
            <span className="text-red-500">*</span> 客户姓名
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={data.customerName}
              onChange={e => handleChange('customerName', e.target.value)}
              placeholder="请输入客户姓名"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="input-label">
            <span className="text-red-500">*</span> 联系电话
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={data.customerPhone}
              onChange={e => handleChange('customerPhone', e.target.value)}
              placeholder="请输入联系电话"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="input-label">
            <span className="text-red-500">*</span> 预计取件日期
          </label>
          <div className="relative">
            <CalendarDays className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={data.pickupDate || daysLater(3)}
              onChange={e => handleChange('pickupDate', e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
