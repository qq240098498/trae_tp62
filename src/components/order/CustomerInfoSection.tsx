import { useEffect } from 'react';
import { User, Phone, CalendarDays, History, UserCheck } from 'lucide-react';
import { daysLater, formatDate } from '@/utils/helpers';
import { useCustomerStore } from '@/store/customerStore';
import type { CustomerProfile } from '@/types';
import { BODY_MEASUREMENT_KEYS } from '@/types';

interface CustomerInfo {
  customerName: string;
  customerPhone: string;
  pickupDate: string;
}

interface Props {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
  onProfileFound?: (profile: CustomerProfile) => void;
}

export default function CustomerInfoSection({ data, onChange, onProfileFound }: Props) {
  const { getProfileByPhone } = useCustomerStore();
  const existingProfile = getProfileByPhone(data.customerPhone);

  useEffect(() => {
    if (existingProfile && onProfileFound) {
      onProfileFound(existingProfile);
    }
  }, [existingProfile, onProfileFound]);

  const handleChange = (key: keyof CustomerInfo, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const hasMeasurementData = existingProfile &&
    Object.values(existingProfile.bodyMeasurements).some(v => v !== undefined && v > 0);

  const filledMeasurements = existingProfile
    ? BODY_MEASUREMENT_KEYS.filter(k => existingProfile.bodyMeasurements[k.key] !== undefined)
    : [];

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
              className={`input-field pl-10 ${existingProfile ? 'ring-2 ring-green-400 border-green-400' : ''}`}
            />
            {existingProfile && (
              <UserCheck className="w-5 h-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
            )}
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

      {existingProfile && (
        <div className="mt-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg shrink-0">
              <History className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-green-800">
                  老客户档案
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  第 {existingProfile.orderCount + 1} 次下单
                </span>
              </div>
              <p className="text-sm text-green-700 mb-2">
                客户 <strong>{existingProfile.customerName}</strong>，上次测量：{formatDate(existingProfile.lastMeasurementDate)}
              </p>
              {hasMeasurementData && filledMeasurements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filledMeasurements.map(k => (
                    <span
                      key={k.key}
                      className="inline-flex items-center gap-1 text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-md"
                    >
                      <span className="font-medium">{k.label}:</span>
                      <span>{existingProfile.bodyMeasurements[k.key]}{k.unit}</span>
                    </span>
                  ))}
                </div>
              )}
              {!hasMeasurementData && (
                <p className="text-sm text-green-600 italic">暂无历史量体数据</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
