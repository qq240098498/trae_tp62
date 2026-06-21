import { useEffect, useMemo } from 'react';
import { User, Phone, CalendarDays, History, UserCheck, Zap, Clock, Check, Heart, Scissors, ArrowRight } from 'lucide-react';
import { daysLater, formatDate } from '@/utils/helpers';
import { useCustomerStore } from '@/store/customerStore';
import { useOrderStore } from '@/store/orderStore';
import { Link } from 'react-router-dom';
import type { CustomerProfile } from '@/types';
import { BODY_MEASUREMENT_KEYS, URGENT_LEVEL_CONFIGS, URGENT_REASON_OPTIONS, FIT_PREFERENCE_LABELS, HEM_PREFERENCE_LABELS } from '@/types';

interface CustomerInfo {
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  urgentReason?: string;
}

interface Props {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
  onProfileFound?: (profile: CustomerProfile) => void;
}

export default function CustomerInfoSection({ data, onChange, onProfileFound }: Props) {
  const { getProfileByPhone } = useCustomerStore();
  const { calculateUrgentByDate } = useOrderStore();
  const existingProfile = getProfileByPhone(data.customerPhone);

  useEffect(() => {
    if (existingProfile && onProfileFound) {
      onProfileFound(existingProfile);
    }
  }, [existingProfile, onProfileFound]);

  const handleChange = (key: keyof CustomerInfo, value: string) => {
    const newData: CustomerInfo = {
      customerName: key === 'customerName' ? value : data.customerName,
      customerPhone: key === 'customerPhone' ? value : data.customerPhone,
      pickupDate: key === 'pickupDate' ? value : data.pickupDate,
      urgentReason: key === 'urgentReason' ? value : data.urgentReason,
    };
    onChange(newData);
  };

  const handleUrgentReasonClick = (reason: string) => {
    const newReason = data.urgentReason === reason ? '' : reason;
    onChange({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      pickupDate: data.pickupDate,
      urgentReason: newReason,
    });
  };

  const urgentInfo = useMemo(() => {
    if (!data.pickupDate) return null;
    return calculateUrgentByDate(data.pickupDate, 100);
  }, [data.pickupDate, calculateUrgentByDate]);

  const currentLevelConfig = useMemo(() => {
    if (!urgentInfo) return null;
    return URGENT_LEVEL_CONFIGS.find(c => c.level === urgentInfo.level);
  }, [urgentInfo]);

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

      {urgentInfo && (
        <div className="mt-5 pt-5 border-t border-coffee-100">
          <div className="flex items-center gap-2 mb-4">
            <Zap className={`w-5 h-5 ${urgentInfo.isUrgent ? 'text-red-500' : 'text-coffee-400'}`} />
            <span className="font-semibold text-coffee-700">加急等级</span>
            {urgentInfo.isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                <Clock className="w-3 h-3" />
                {currentLevelConfig?.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {URGENT_LEVEL_CONFIGS.map(config => {
              const isActive = urgentInfo.level === config.level;
              const isUrgent = config.level !== 'normal';
              return (
                <div
                  key={config.level}
                  className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                    isActive
                      ? isUrgent
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-coffee-500 bg-coffee-50 shadow-md'
                      : 'border-coffee-200 bg-white'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                      isUrgent ? 'bg-red-500' : 'bg-coffee-500'
                    }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`text-sm font-semibold mb-1 ${
                    isActive
                      ? isUrgent ? 'text-red-700' : 'text-coffee-700'
                      : 'text-coffee-600'
                  }`}>
                    {config.label}
                  </div>
                  <div className={`text-xs ${
                    isActive
                      ? isUrgent ? 'text-red-600' : 'text-coffee-600'
                      : 'text-coffee-400'
                  }`}>
                    {config.rate > 0 ? `+${Math.round(config.rate * 100)}%` : '无加急费'}
                  </div>
                  <div className={`text-[10px] mt-1 ${
                    isActive
                      ? isUrgent ? 'text-red-500' : 'text-coffee-500'
                      : 'text-coffee-400'
                  }`}>
                    {config.description}
                  </div>
                </div>
              );
            })}
          </div>

          {urgentInfo.isUrgent && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <p className="text-sm text-amber-800">
                <strong>加急说明：</strong>
                取件日期距今天 <span className="font-bold text-amber-900">{urgentInfo.days}</span> 天，
                属于 <span className="font-bold text-amber-900">{currentLevelConfig?.label}</span>，
                将自动加收 <span className="font-bold text-amber-900">+{Math.round(urgentInfo.rate * 100)}%</span> 加急费。
                订单将自动插队优先处理，排工期自动前移。
              </p>
            </div>
          )}

          <div>
            <label className="input-label">
              加急原因（选填）
            </label>
            <div className="flex flex-wrap gap-2">
              {URGENT_REASON_OPTIONS.map(option => {
                const isActive = data.urgentReason === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleUrgentReasonClick(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-coffee-50 text-coffee-600 border border-coffee-200 hover:bg-coffee-100'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-coffee-400 mt-2">
              注：加急原因仅作备注，不影响加急费用。加急费用由取件日期自动计算。
            </p>
          </div>
        </div>
      )}

      {existingProfile && (
        <div className="mt-5 space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
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
                <div className="mt-3 pt-3 border-t border-green-200">
                  <Link
                    to={`/customers/${existingProfile.id}`}
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    查看完整档案
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {(existingProfile.preferences.fitPreference || existingProfile.preferences.hemPreference || existingProfile.preferences.keepOriginalHem || existingProfile.preferences.notes) && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg shrink-0">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-rose-800">
                      改衣风格偏好
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {existingProfile.preferences.fitPreference && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-rose-200 text-rose-700 px-2 py-1 rounded-md">
                        版型：{FIT_PREFERENCE_LABELS[existingProfile.preferences.fitPreference]}
                      </span>
                    )}
                    {existingProfile.preferences.hemPreference && (
                      <span className="inline-flex items-center gap-1 text-xs bg-white border border-rose-200 text-rose-700 px-2 py-1 rounded-md">
                        <Scissors className="w-3 h-3" />
                        {HEM_PREFERENCE_LABELS[existingProfile.preferences.hemPreference]}
                      </span>
                    )}
                    {existingProfile.preferences.keepOriginalHem && (
                      <span className="inline-flex items-center gap-1 text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-md font-medium">
                        保留原边
                      </span>
                    )}
                  </div>
                  {existingProfile.preferences.notes && (
                    <p className="text-xs text-rose-600 bg-rose-50/50 p-2 rounded-lg">
                      💡 {existingProfile.preferences.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {existingProfile.lastAlteration && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-800">
                      上次修改记录
                    </span>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      {formatDate(existingProfile.lastAlteration.date)}
                    </span>
                  </div>
                  <div className="text-sm text-amber-700">
                    <span className="font-medium">{existingProfile.lastAlteration.clothingCategory}</span>
                    <span className="mx-1">·</span>
                    <span>{existingProfile.lastAlteration.alterationSummary}</span>
                  </div>
                  <div className="text-xs text-amber-500 mt-1">
                    订单号：{existingProfile.lastAlteration.orderNo}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
