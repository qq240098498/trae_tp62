import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, Zap, Clock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import CustomerInfoSection from '@/components/order/CustomerInfoSection';
import ClothingInfoSection from '@/components/order/ClothingInfoSection';
import MeasurementsSection from '@/components/order/MeasurementsSection';
import AlterationItemsSection from '@/components/order/AlterationItemsSection';
import DefectSection from '@/components/order/DefectSection';
import OrderStatusSection from '@/components/order/OrderStatusSection';
import { useOrderStore } from '@/store/orderStore';
import { useCustomerStore, bodyToMeasurements } from '@/store/customerStore';
import { daysLater } from '@/utils/helpers';
import type { OrderStatus, Measurement, AlterationItem, CustomerProfile, UrgentLevel } from '@/types';
import { URGENT_REASON_LABELS, URGENT_LEVEL_CONFIGS } from '@/types';

interface FormData {
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  clothingCategory: string;
  fabric: string;
  brand: string;
  color: string;
  requirements: string;
  measurements: Measurement[];
  alterationItems: AlterationItem[];
  totalPrice: number;
  basePrice: number;
  isUrgent: boolean;
  urgentLevel: UrgentLevel;
  urgentDays: number;
  urgentFeeRate: number;
  urgentFee: number;
  urgentReason: string;
  defectDescription: string;
  defectConfirmed: boolean;
}

const initialFormData: FormData = {
  customerName: '',
  customerPhone: '',
  pickupDate: daysLater(3),
  clothingCategory: '',
  fabric: '',
  brand: '',
  color: '',
  requirements: '',
  measurements: [],
  alterationItems: [],
  totalPrice: 0,
  basePrice: 0,
  isUrgent: false,
  urgentLevel: 'normal',
  urgentDays: 7,
  urgentFeeRate: 0,
  urgentFee: 0,
  urgentReason: '',
  defectDescription: '',
  defectConfirmed: false,
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const storeOrder = useOrderStore(state =>
    isNew ? null : state.orders.find(o => o.id === id) || null
  );
  const { createOrder, updateOrder, deleteOrder, updateOrderStatus, markNotified, confirmPickup } = useOrderStore();
  const { updateProfileFromMeasurements, getProfileByPhoneAndName, updateLastAlteration } = useCustomerStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    if (initialized) return;
    if (isNew) {
      setInitialized(true);
      return;
    }
    if (storeOrder) {
      setFormData({
        customerName: storeOrder.customerName,
        customerPhone: storeOrder.customerPhone,
        pickupDate: storeOrder.pickupDate,
        clothingCategory: storeOrder.clothingCategory,
        fabric: storeOrder.fabric,
        brand: storeOrder.brand,
        color: storeOrder.color,
        requirements: storeOrder.requirements,
        measurements: storeOrder.measurements,
        alterationItems: storeOrder.alterationItems,
        totalPrice: storeOrder.totalPrice,
        basePrice: storeOrder.basePrice ?? storeOrder.totalPrice,
        isUrgent: storeOrder.isUrgent ?? false,
        urgentLevel: (storeOrder.urgentLevel ?? 'normal') as UrgentLevel,
        urgentDays: storeOrder.urgentDays ?? 7,
        urgentFeeRate: storeOrder.urgentFeeRate ?? 0,
        urgentFee: storeOrder.urgentFee ?? 0,
        urgentReason: storeOrder.urgentReason ?? '',
        defectDescription: storeOrder.defectDescription,
        defectConfirmed: storeOrder.defectConfirmed,
      });
      const profile = getProfileByPhoneAndName(storeOrder.customerPhone, storeOrder.customerName);
      if (profile) {
        setCustomerProfile(profile);
        if (!storeOrder.customerName && profile.customerName) {
          setFormData(prev => ({ ...prev, customerName: profile.customerName }));
        }
      }
      setInitialized(true);
    }
  }, [isNew, storeOrder, initialized, getProfileByPhoneAndName]);

  const currentOrder = useMemo(() => {
    if (isNew) return null;
    return storeOrder;
  }, [isNew, storeOrder]);

  const updateCustomerInfo = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleUrgentLevelChange = (level: UrgentLevel) => {
    const config = URGENT_LEVEL_CONFIGS.find(c => c.level === level);
    if (!config) return;
    let newPickupDate: string;
    if (config.level === 'normal') {
      newPickupDate = daysLater(8);
    } else {
      newPickupDate = daysLater(config.days);
    }
    setFormData(prev => ({ ...prev, pickupDate: newPickupDate }));
  };

  const { calculateUrgentByDate } = useOrderStore();

  useEffect(() => {
    const basePrice = formData.alterationItems.reduce((sum, item) => sum + item.subtotal, 0);
    const { level: urgentLevel, days: urgentDays, rate: urgentFeeRate, fee: urgentFee, isUrgent } =
      calculateUrgentByDate(formData.pickupDate, basePrice);
    const totalPrice = basePrice + urgentFee;

    setFormData(prev => {
      if (prev.basePrice === basePrice &&
          prev.urgentFee === urgentFee &&
          prev.totalPrice === totalPrice &&
          prev.urgentFeeRate === urgentFeeRate &&
          prev.urgentLevel === urgentLevel &&
          prev.urgentDays === urgentDays &&
          prev.isUrgent === isUrgent) {
        return prev;
      }
      return { ...prev, basePrice, urgentLevel, urgentDays, urgentFeeRate, urgentFee, isUrgent, totalPrice };
    });
  }, [formData.alterationItems, formData.pickupDate, calculateUrgentByDate]);

  const handleProfileFound = useCallback((profile: CustomerProfile) => {
    setCustomerProfile(profile);
    if (profile.customerName && !formData.customerName) {
      setFormData(prev => ({ ...prev, customerName: profile.customerName }));
    }
  }, [formData.customerName]);

  const [autoImportedPhone, setAutoImportedPhone] = useState<string>('');

  useEffect(() => {
    const phone = formData.customerPhone.trim();
    const name = formData.customerName.trim();

    if (!phone) {
      setCustomerProfile(null);
      return;
    }

    const profile = getProfileByPhoneAndName(phone, name);
    if (profile) {
      setCustomerProfile(profile);

      if (profile.customerName && !name) {
        setFormData(prev => ({ ...prev, customerName: profile.customerName }));
      }

      const hasMeasurements = formData.measurements.length > 0;
      const hasProfileData = Object.values(profile.bodyMeasurements).some(v => v !== undefined);

      if (!hasMeasurements && hasProfileData && autoImportedPhone !== phone) {
        const imported = bodyToMeasurements(profile.bodyMeasurements);
        if (imported.length > 0) {
          setFormData(prev => ({ ...prev, measurements: imported }));
          setAutoImportedPhone(phone);
        }
      }
    } else {
      setCustomerProfile(null);
    }
  }, [formData.customerPhone, formData.customerName, formData.measurements.length, getProfileByPhoneAndName, bodyToMeasurements, autoImportedPhone]);

  const handleSave = () => {
    if (!formData.customerName || !formData.customerPhone) {
      alert('请填写客户姓名和联系电话');
      return;
    }

    updateProfileFromMeasurements(
      formData.customerName,
      formData.customerPhone,
      formData.measurements
    );

    if (isNew) {
      const newOrder = createOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        pickupDate: formData.pickupDate,
        clothingCategory: formData.clothingCategory,
        fabric: formData.fabric,
        brand: formData.brand,
        color: formData.color,
        requirements: formData.requirements,
        basePrice: formData.basePrice,
        urgentReason: formData.urgentReason,
        totalPrice: formData.totalPrice,
        measurements: formData.measurements,
        alterationItems: formData.alterationItems,
        defectDescription: formData.defectDescription,
        defectConfirmed: formData.defectConfirmed,
      });
      updateLastAlteration(formData.customerPhone, newOrder);
      setSaved(true);
      setTimeout(() => navigate(`/orders/${newOrder.id}`), 500);
    } else if (currentOrder) {
      updateOrder(currentOrder.id, {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        pickupDate: formData.pickupDate,
        clothingCategory: formData.clothingCategory,
        fabric: formData.fabric,
        brand: formData.brand,
        color: formData.color,
        requirements: formData.requirements,
        basePrice: formData.basePrice,
        urgentReason: formData.urgentReason,
        totalPrice: formData.totalPrice,
        measurements: formData.measurements,
        alterationItems: formData.alterationItems,
        defectDescription: formData.defectDescription,
        defectConfirmed: formData.defectConfirmed,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const handleDelete = () => {
    if (!currentOrder) return;
    if (confirm(`确定要删除订单 ${currentOrder.orderNo} 吗？此操作不可撤销。`)) {
      deleteOrder(currentOrder.id);
      navigate('/');
    }
  };

  const handleStatusChange = (status: OrderStatus) => {
    if (!currentOrder) return;
    updateOrderStatus(currentOrder.id, status);
  };

  const handleNotify = () => {
    if (!currentOrder) return;
    try {
      markNotified(currentOrder.id);
      alert(`已向 ${currentOrder.customerName}（${currentOrder.customerPhone}）发送取件通知`);
    } catch (e) {
      console.error('发送通知失败:', e);
      alert('发送通知失败，请重试');
    }
  };

  const handlePickup = () => {
    if (!currentOrder) return;
    if (confirm(`确认客户 ${currentOrder.customerName} 已取件？`)) {
      try {
        confirmPickup(currentOrder.id);
      } catch (e) {
        console.error('确认取件失败:', e);
        alert('操作失败，请重试');
      }
    }
  };

  const title = isNew ? '新建订单' : currentOrder ? `订单 #${currentOrder.orderNo}` : '订单详情';

  return (
    <>
      <PageHeader
        title={title}
        description={isNew ? '登记客户信息与衣物详情' : `客户：${formData.customerName || '未填写'}`}
        backTo="/"
        backLabel="返回订单列表"
        actions={
          <div className="flex items-center gap-3">
            {!isNew && currentOrder && (
              <button
                onClick={handleDelete}
                className="btn-secondary inline-flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
                删除订单
              </button>
            )}
            <Link to="/" className="btn-secondary inline-flex items-center gap-2">
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
              {saved ? '已保存' : '保存订单'}
            </button>
          </div>
        }
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CustomerInfoSection
              data={{
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                pickupDate: formData.pickupDate,
                urgentReason: formData.urgentReason,
              }}
              onChange={updateCustomerInfo}
              onProfileFound={handleProfileFound}
              onUrgentLevelChange={handleUrgentLevelChange}
            />

            <ClothingInfoSection
              data={{
                clothingCategory: formData.clothingCategory,
                fabric: formData.fabric,
                brand: formData.brand,
                color: formData.color,
                requirements: formData.requirements,
              }}
              onChange={updateCustomerInfo}
            />

            <MeasurementsSection
              measurements={formData.measurements}
              onChange={ms => setFormData(prev => ({ ...prev, measurements: ms }))}
              customerProfile={customerProfile}
            />

            <AlterationItemsSection
              items={formData.alterationItems}
              onChange={items => setFormData(prev => ({ ...prev, alterationItems: items }))}
              totalPrice={formData.totalPrice}
              onTotalChange={total => setFormData(prev => ({ ...prev, totalPrice: total }))}
            />

            <DefectSection
              data={{
                defectDescription: formData.defectDescription,
                defectConfirmed: formData.defectConfirmed,
              }}
              onChange={updateCustomerInfo}
            />
          </div>

          <div className="space-y-6">
            {!isNew && currentOrder && (
              <OrderStatusSection
                order={currentOrder}
                onStatusChange={handleStatusChange}
                onNotify={handleNotify}
                onPickup={handlePickup}
              />
            )}

            <div className="card p-6 sticky top-6">
              <h2 className="section-title">订单摘要</h2>

              {formData.isUrgent && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <Zap className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-700 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {URGENT_LEVEL_CONFIGS.find(c => c.level === formData.urgentLevel)?.label}
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      距取件 {formData.urgentDays} 天
                    </div>
                    <div className="text-xs text-red-600">
                      加急费率：+{Math.round(formData.urgentFeeRate * 100)}%
                    </div>
                    {formData.urgentReason && (
                      <div className="text-xs text-red-500 mt-1">
                        原因：{URGENT_REASON_LABELS[formData.urgentReason]}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">客户姓名</span>
                  <span className="text-coffee-800 font-medium">{formData.customerName || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">联系电话</span>
                  <span className="text-coffee-800">{formData.customerPhone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">修改项目</span>
                  <span className="text-coffee-800">{formData.alterationItems.length} 项</span>
                </div>
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">测量部位</span>
                  <span className="text-coffee-800">{formData.measurements.length} 处</span>
                </div>
                <div className="flex justify-between py-2 border-b border-coffee-100">
                  <span className="text-coffee-500">瑕疵确认</span>
                  <span className={formData.defectConfirmed ? 'text-green-600' : 'text-amber-600'}>
                    {formData.defectConfirmed ? '已确认' : '未确认'}
                  </span>
                </div>
                {formData.isUrgent && (
                  <div className="flex justify-between py-2 border-b border-coffee-100">
                    <span className="text-coffee-500">加急等级</span>
                    <span className="text-red-600 font-medium">
                      {URGENT_LEVEL_CONFIGS.find(c => c.level === formData.urgentLevel)?.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-5 border-t-2 border-coffee-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-500">基础费用</span>
                  <span className="text-coffee-700">¥{formData.basePrice}</span>
                </div>
                {formData.isUrgent && formData.urgentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500">
                      加急费（+{Math.round(formData.urgentFeeRate * 100)}%）
                    </span>
                    <span className="text-red-600 font-medium">+¥{formData.urgentFee}</span>
                  </div>
                )}
                <div className="flex items-end justify-between pt-2">
                  <span className="text-coffee-600 font-medium">应收金额</span>
                  <div className="text-right">
                    <span className="font-serif text-4xl font-bold text-gold-600">
                      ¥{formData.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
