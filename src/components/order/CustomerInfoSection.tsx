import { useEffect, useMemo } from 'react';
import { User, Phone, CalendarDays, History, UserCheck, Zap, AlertTriangle } from 'lucide-react';
import { daysLater, formatDate } from '@/utils/helpers';
import { useCustomerStore } from '@/store/customerStore';
import type { CustomerProfile, UrgentReason } from '@/types';
import { BODY_MEASUREMENT_KEYS, URGENT_REASON_OPTIONS } from '@/types';

interface CustomerInfo {
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  isUrgent?: boolean;
  urgentReason?: UrgentReason;
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

  const handleChange = (key: keyof CustomerInfo, value: string | boolean) => {
    const newData = { ...data, [key]: value };
    if (key === 'isUrgent' && !value) {
      newData.urgentReason = '';
    }
    if (key === 'urgentReason') {
      newData.isUrgent = !!value;
    }
    onChange(newData);
  };

  const urgentRateInfo = useMemo(() => {
    if (!data.isUrgent || !data.urgentReason) return null;
    return URGENT_REASON_OPTIONS.find(o => o.value === data.urgentReason);
  }, [data.isUrgent, data.urgentReason]);

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

      <div className="mt-5 pt-5 border-t border-coffee-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${data.isUrgent ? 'text-red-500' : 'text-coffee-400'}`} />
            <span className="font-semibold text-coffee-700">急件通道</span>
            {data.isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                <AlertTriangle className="w-3 h-3" />
                已启用加急
              </span>
            )}
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!data.isUrgent}
              onChange={e => handleChange('isUrgent', e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-coffee-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
          </label>
        </div>

        {data.isUrgent && (
          <div className="space-y-4 animate-slide-up">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>加急说明：</strong>启用急件通道后，订单将自动插队优先处理，并根据加急原因加收 30%-50% 的加急费。
              </p>
            </div>

            <div>
              <label className="input-label">
                <span className="text-red-500">*</span> 加急原因
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {URGENT_REASON_OPTIONS.map(option => {
                  const isActive = data.urgentReason === option.value;
                  const btnClass = isActive
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                    : 'border-coffee-200 bg-white text-coffee-600 hover:border-coffee-300 hover:bg-coffee-50';
                  const rateClass = isActive ? 'text-red-600' : 'text-coffee-400';
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange('urgentReason', option.value)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${btnClass}`}
                    >
                      <div className="mb-1">{option.label}</div>
                      <div className={`text-xs ${rateClass}`}>
                        +{Math.round(option.rate * 100)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {urgentRateInfo && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-sm text-red-700">
                  当前加急费率：<strong className="font-semibold">+{Math.round(urgentRateInfo.rate * 100)}%</strong>
                </span>
                <span className="text-xs text-red-600">
                  ({urgentRateInfo.label})
                </span>
              </div>
            )}
          </div>
        )}
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
