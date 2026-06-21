import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, User, Phone, Ruler, Calendar, FileText, Plus, Heart, Scissors, Clock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import { useCustomerStore } from '@/store/customerStore';
import type { BodyMeasurements, FitPreference, HemPreference, AlterationPreferences } from '@/types';
import { BODY_MEASUREMENT_KEYS, FIT_PREFERENCE_LABELS, HEM_PREFERENCE_LABELS } from '@/types';
import { formatDate, todayStr } from '@/utils/helpers';

const emptyBody: BodyMeasurements = {
  shoulderWidth: undefined,
  chest: undefined,
  waist: undefined,
  hips: undefined,
  clothingLength: undefined,
  sleeveLength: undefined,
};

const emptyPreferences: AlterationPreferences = {
  fitPreference: undefined,
  hemPreference: undefined,
  keepOriginalHem: undefined,
  notes: '',
};

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const storeProfile = useCustomerStore(state =>
    isNew ? null : state.profiles.find(p => p.id === id) || null
  );
  const { createProfile, updateProfile, deleteProfile, getProfileByPhone } = useCustomerStore();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    bodyMeasurements: { ...emptyBody },
    lastMeasurementDate: todayStr(),
    orderCount: 0,
    preferences: { ...emptyPreferences },
  });
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (initialized) return;
    if (isNew) {
      setInitialized(true);
      return;
    }
    if (storeProfile) {
      setFormData({
        customerName: storeProfile.customerName,
        customerPhone: storeProfile.customerPhone,
        bodyMeasurements: { ...emptyBody, ...storeProfile.bodyMeasurements },
        lastMeasurementDate: storeProfile.lastMeasurementDate,
        orderCount: storeProfile.orderCount,
        preferences: { ...emptyPreferences, ...storeProfile.preferences },
      });
      setInitialized(true);
    }
  }, [isNew, storeProfile, initialized]);

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      setPhoneError('请输入联系电话');
      return false;
    }
    const existing = getProfileByPhone(phone);
    if (isNew && existing) {
      setPhoneError('该手机号已存在档案，请直接使用或前往查看');
      return false;
    }
    if (!isNew && existing && existing.id !== id) {
      setPhoneError('该手机号已被其他顾客使用');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleChange = (key: string, value: string | number) => {
    if (key === 'customerPhone') {
      validatePhone(String(value));
    }
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleMeasurementChange = (key: keyof BodyMeasurements, valueStr: string) => {
    const value = valueStr === '' ? undefined : Number(valueStr);
    setFormData(prev => ({
      ...prev,
      bodyMeasurements: { ...prev.bodyMeasurements, [key]: value },
    }));
  };

  const handlePreferenceChange = (key: keyof AlterationPreferences, value: string | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  const handleSave = () => {
    if (!formData.customerName.trim()) {
      alert('请填写客户姓名');
      return;
    }
    if (!validatePhone(formData.customerPhone)) {
      alert(phoneError || '请填写联系电话');
      return;
    }

    const hasAnyMeasurement = Object.values(formData.bodyMeasurements).some(v => v !== undefined);

    if (isNew) {
      const newProfile = createProfile({
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        bodyMeasurements: formData.bodyMeasurements,
        lastMeasurementDate: hasAnyMeasurement ? formData.lastMeasurementDate : '',
        orderCount: 0,
        preferences: formData.preferences,
      });
      setSaved(true);
      setTimeout(() => navigate(`/customers/${newProfile.id}`), 500);
    } else if (storeProfile) {
      updateProfile(storeProfile.id, {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        bodyMeasurements: formData.bodyMeasurements,
        lastMeasurementDate: hasAnyMeasurement ? (formData.lastMeasurementDate || todayStr()) : '',
        preferences: formData.preferences,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const handleDelete = () => {
    if (!storeProfile) return;
    if (confirm(`确定要删除顾客「${storeProfile.customerName}」的档案吗？此操作不可撤销。`)) {
      deleteProfile(storeProfile.id);
      navigate('/customers');
    }
  };

  const handleCreateOrder = () => {
    if (!formData.customerPhone.trim()) return;
    navigate('/orders/new');
  };

  const filledMeasurements = BODY_MEASUREMENT_KEYS.filter(
    k => formData.bodyMeasurements[k.key] !== undefined
  ).length;

  const title = isNew ? '新建顾客档案' : `顾客档案 · ${formData.customerName || '未命名'}`;

  return (
    <>
      <PageHeader
        title={title}
        description={isNew ? '登记顾客基础信息与量体数据' : `档案编号：${id?.slice(0, 8) || ''}`}
        backTo="/customers"
        backLabel="返回顾客列表"
        actions={
          <div className="flex items-center gap-3">
            {!isNew && storeProfile && (
              <>
                <button
                  onClick={handleCreateOrder}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  为此顾客下单
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-secondary inline-flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                  删除档案
                </button>
              </>
            )}
            <Link to="/customers" className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              取消
            </Link>
            <button
              onClick={handleSave}
              className={`btn-primary inline-flex items-center gap-2 ${
                saved ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              <Save className="w-5 h-5" />
              {saved ? '已保存' : '保存档案'}
            </button>
          </div>
        }
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="section-title">
                <User className="w-5 h-5 text-gold-500" />
                基础信息
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">
                    <span className="text-red-500">*</span> 客户姓名
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.customerName}
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
                      value={formData.customerPhone}
                      onChange={e => handleChange('customerPhone', e.target.value)}
                      placeholder="请输入联系电话（作为唯一识别条件）"
                      className={`input-field pl-10 ${phoneError ? 'border-red-400 focus:ring-red-200' : ''}`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  )}
                  {!phoneError && (
                    <p className="text-xs text-coffee-400 mt-1">
                      手机号是唯一识别条件，下单时通过手机号自动匹配档案
                    </p>
                  )}
                </div>

                <div>
                  <label className="input-label">
                    <span className="text-red-500">*</span> 上次测量日期
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={formData.lastMeasurementDate || todayStr()}
                      onChange={e => handleChange('lastMeasurementDate', e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {!isNew && (
                  <div>
                    <label className="input-label">累计下单次数</label>
                    <div className="relative">
                      <FileText className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <div className="input-field pl-10 bg-coffee-50 text-coffee-600">
                        <span className="font-serif text-xl font-bold text-gold-600">
                          {formData.orderCount}
                        </span>
                        <span className="ml-2 text-sm"> 次</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="section-title !mb-0">
                  <Ruler className="w-5 h-5 text-gold-500" />
                  量体数据档案
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-coffee-500">
                    已填写 <strong className="text-gold-600">{filledMeasurements}</strong> / {BODY_MEASUREMENT_KEYS.length} 项
                  </span>
                  <div className="w-32 bg-coffee-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        filledMeasurements >= 5 ? 'bg-green-500' : filledMeasurements >= 3 ? 'bg-gold-500' : 'bg-coffee-400'
                      }`}
                      style={{ width: `${(filledMeasurements / BODY_MEASUREMENT_KEYS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-coffee-500 mb-5">
                填写客户常规尺寸，下单时可一键导入，免去重复测量。单位均为厘米 (cm)。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {BODY_MEASUREMENT_KEYS.map(k => (
                  <div
                    key={k.key}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.bodyMeasurements[k.key] !== undefined
                        ? 'border-gold-200 bg-gold-50/50'
                        : 'border-coffee-100 bg-white hover:border-coffee-200'
                    }`}
                  >
                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                      {k.label}
                      <span className="text-xs text-coffee-400 font-normal ml-1">({k.unit})</span>
                    </label>
                    <div className="relative">
                      <Ruler className="w-4 h-4 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={formData.bodyMeasurements[k.key] ?? ''}
                        onChange={e => handleMeasurementChange(k.key, e.target.value)}
                        placeholder="留空表示未测量"
                        className="input-field pl-9 text-lg font-serif font-semibold"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-coffee-50 rounded-xl">
                <h4 className="text-sm font-semibold text-coffee-700 mb-3">测量部位参考</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-coffee-600">
                  <div className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold">•</span>
                    <span><strong>肩宽：</strong>两肩端点之间的水平距离</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold">•</span>
                    <span><strong>胸围：</strong>胸部最丰满处水平围量一周</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold">•</span>
                    <span><strong>腰围：</strong>腰部最细处水平围量一周</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold">•</span>
                    <span><strong>臀围：</strong>臀部最丰满处水平围量一周</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold">•</span>
                    <span><strong>衣长：</strong>肩颈点至衣摆的垂直距离</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold">•</span>
                    <span><strong>袖长：</strong>肩端点至袖口的距离</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="section-title">
                <Heart className="w-5 h-5 text-gold-500" />
                改衣风格偏好
              </h2>
              <p className="text-sm text-coffee-500 mb-5">
                记录顾客的改衣习惯偏好，下次收件时自动提示，提供个性化服务
              </p>

              <div className="space-y-5">
                <div>
                  <label className="input-label mb-3">版型偏好</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(FIT_PREFERENCE_LABELS) as FitPreference[]).map(key => {
                      const isActive = formData.preferences.fitPreference === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePreferenceChange(
                            'fitPreference',
                            isActive ? undefined : key
                          )}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            isActive
                              ? 'border-gold-400 bg-gold-50 shadow-sm'
                              : 'border-coffee-200 bg-white hover:border-coffee-300'
                          }`}
                        >
                          <div className={`text-base font-semibold mb-1 ${
                            isActive ? 'text-gold-700' : 'text-coffee-700'
                          }`}>
                            {FIT_PREFERENCE_LABELS[key]}
                          </div>
                          <div className={`text-xs ${
                            isActive ? 'text-gold-500' : 'text-coffee-400'
                          }`}>
                            {key === 'slim' ? '贴身利落' : key === 'regular' ? '舒适标准' : '宽松休闲'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="input-label mb-3">裤脚/下摆处理偏好</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(HEM_PREFERENCE_LABELS) as HemPreference[]).map(key => {
                      const isActive = formData.preferences.hemPreference === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePreferenceChange(
                            'hemPreference',
                            isActive ? undefined : key
                          )}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            isActive
                              ? 'border-gold-400 bg-gold-50 shadow-sm'
                              : 'border-coffee-200 bg-white hover:border-coffee-300'
                          }`}
                        >
                          <Scissors className={`w-5 h-5 mx-auto mb-1.5 ${
                            isActive ? 'text-gold-500' : 'text-coffee-400'
                          }`} />
                          <div className={`text-sm font-semibold ${
                            isActive ? 'text-gold-700' : 'text-coffee-700'
                          }`}>
                            {HEM_PREFERENCE_LABELS[key]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-coffee-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="keepOriginalHem"
                    checked={formData.preferences.keepOriginalHem || false}
                    onChange={e => handlePreferenceChange('keepOriginalHem', e.target.checked)}
                    className="w-5 h-5 rounded border-coffee-300 text-gold-500 focus:ring-gold-400"
                  />
                  <div>
                    <label htmlFor="keepOriginalHem" className="text-sm font-medium text-coffee-700 cursor-pointer">
                      优先保留原边
                    </label>
                    <p className="text-xs text-coffee-500 mt-0.5">
                      改短裤脚时尽量保留原厂裤脚边
                    </p>
                  </div>
                </div>

                <div>
                  <label className="input-label">偏好备注</label>
                  <textarea
                    value={formData.preferences.notes || ''}
                    onChange={e => handlePreferenceChange('notes', e.target.value)}
                    placeholder="记录顾客的特殊偏好、注意事项等，例如：对纽扣过敏、喜欢特定线色等"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {!isNew && storeProfile?.lastAlteration && (
              <div className="card p-6">
                <h2 className="section-title">
                  <Clock className="w-5 h-5 text-gold-500" />
                  上次修改记录
                </h2>
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-coffee-800">
                        {storeProfile.lastAlteration.clothingCategory}
                      </div>
                      <div className="text-sm text-coffee-500">
                        订单号：{storeProfile.lastAlteration.orderNo}
                      </div>
                    </div>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      {formatDate(storeProfile.lastAlteration.date)}
                    </span>
                  </div>
                  <div className="text-sm text-coffee-700">
                    <span className="font-medium text-amber-700">修改内容：</span>
                    {storeProfile.lastAlteration.alterationSummary}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-coffee-100">
                <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold text-white">
                    {(formData.customerName || '?').charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-coffee-800">
                    {formData.customerName || '未命名顾客'}
                  </h3>
                  <p className="text-sm text-coffee-500">
                    {formData.customerPhone || '暂无电话'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">档案状态</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    isNew ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isNew ? '新建中' : '已建档'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">量体完整度</span>
                  <span className="font-medium text-coffee-800">
                    {Math.round((filledMeasurements / BODY_MEASUREMENT_KEYS.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">上次测量</span>
                  <span className="text-coffee-800">
                    {formData.lastMeasurementDate ? formatDate(formData.lastMeasurementDate) : '-'}
                  </span>
                </div>
                {!isNew && (
                  <div className="flex justify-between py-2 border-b border-coffee-100">
                    <span className="text-coffee-500">建档时间</span>
                    <span className="text-coffee-800">
                      {storeProfile ? formatDate(storeProfile.createdAt) : '-'}
                    </span>
                  </div>
                )}
              </div>

              {filledMeasurements > 0 && (
                <div className="mt-5 pt-5 border-t-2 border-coffee-200">
                  <h4 className="text-sm font-semibold text-coffee-700 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gold-500" />
                    当前量体数据一览
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {BODY_MEASUREMENT_KEYS.map(k => {
                      const val = formData.bodyMeasurements[k.key];
                      return (
                        <div
                          key={k.key}
                          className={`p-2.5 rounded-lg text-center ${
                            val !== undefined
                              ? 'bg-gold-50 border border-gold-200'
                              : 'bg-coffee-50 text-coffee-400'
                          }`}
                        >
                          <div className="text-xs text-coffee-500">{k.label}</div>
                          <div className={`font-serif font-bold ${
                            val !== undefined ? 'text-gold-700 text-lg' : 'text-coffee-300'
                          }`}>
                            {val !== undefined ? `${val}${k.unit}` : '--'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
