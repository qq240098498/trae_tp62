import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import CustomerInfoSection from '@/components/order/CustomerInfoSection';
import ClothingInfoSection from '@/components/order/ClothingInfoSection';
import MeasurementsSection from '@/components/order/MeasurementsSection';
import AlterationItemsSection from '@/components/order/AlterationItemsSection';
import DefectSection from '@/components/order/DefectSection';
import OrderStatusSection from '@/components/order/OrderStatusSection';
import { useOrderStore } from '@/store/orderStore';
import { daysLater } from '@/utils/helpers';
import type { OrderStatus, Measurement, AlterationItem } from '@/types';

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

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
        defectDescription: storeOrder.defectDescription,
        defectConfirmed: storeOrder.defectConfirmed,
      });
      setInitialized(true);
    }
  }, [isNew, storeOrder, initialized]);

  const currentOrder = useMemo(() => {
    if (isNew) return null;
    return storeOrder;
  }, [isNew, storeOrder]);

  const updateCustomerInfo = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.customerPhone) {
      alert('请填写客户姓名和联系电话');
      return;
    }

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
        totalPrice: formData.totalPrice,
        measurements: formData.measurements,
        alterationItems: formData.alterationItems,
        defectDescription: formData.defectDescription,
        defectConfirmed: formData.defectConfirmed,
      });
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
              }}
              onChange={updateCustomerInfo}
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
              </div>

              <div className="mt-5 pt-5 border-t-2 border-coffee-200">
                <div className="flex items-end justify-between">
                  <span className="text-coffee-600">应收金额</span>
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
