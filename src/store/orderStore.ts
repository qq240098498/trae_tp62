import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, PricingConfig, Measurement, AlterationItem, UrgentReason } from '@/types';
import { mockOrders, mockPricingConfigs } from '@/data/mockData';
import { generateId, generateOrderNo, todayStr } from '@/utils/helpers';
import { URGENT_REASON_OPTIONS } from '@/types';

interface OrderStore {
  orders: Order[];
  pricingConfigs: PricingConfig[];
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  searchOrders: (keyword: string) => Order[];
  createOrder: (data: Partial<Order>) => Order;
  updateOrder: (id: string, data: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  markNotified: (id: string) => void;
  confirmPickup: (id: string) => void;
  getPriceByType: (type: string) => number;
  updatePricing: (id: string, price: number) => void;
  recalculateTotal: (items: AlterationItem[]) => number;
  calculateUrgentFee: (basePrice: number, urgentReason: UrgentReason) => { fee: number; rate: number };
  getUrgentRateByReason: (reason: UrgentReason) => number;
  sortOrdersByPriority: (orders: Order[]) => Order[];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: mockOrders,
      pricingConfigs: mockPricingConfigs,

      getOrderById: (id: string) => get().orders.find(o => o.id === id),

      getOrdersByStatus: (status: OrderStatus) =>
        get().orders.filter(o => o.status === status),

      searchOrders: (keyword: string) => {
        const kw = keyword.toLowerCase().trim();
        if (!kw) return get().orders;
        return get().orders.filter(o =>
          o.customerName.toLowerCase().includes(kw) ||
          o.customerPhone.includes(kw) ||
          o.orderNo.toLowerCase().includes(kw)
        );
      },

      getUrgentRateByReason: (reason: UrgentReason) => {
        if (!reason) return 0;
        const option = URGENT_REASON_OPTIONS.find(o => o.value === reason);
        return option?.rate || 0;
      },

      calculateUrgentFee: (basePrice: number, urgentReason: UrgentReason) => {
        const rate = get().getUrgentRateByReason(urgentReason);
        const fee = Math.round(basePrice * rate);
        return { fee, rate };
      },

      sortOrdersByPriority: (orders: Order[]) => {
        return [...orders].sort((a, b) => {
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          if (a.isUrgent && b.isUrgent) {
            if (a.urgentFeeRate !== b.urgentFeeRate) {
              return b.urgentFeeRate - a.urgentFeeRate;
            }
          }
          return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime();
        });
      },

      createOrder: (data: Partial<Order>) => {
        const now = new Date().toISOString();
        const isUrgent = !!data.isUrgent && !!data.urgentReason;
        const basePrice = data.basePrice ?? data.totalPrice ?? 0;
        const urgentReason = (data.urgentReason || '') as UrgentReason;
        const { fee: urgentFee, rate: urgentFeeRate } = isUrgent
          ? get().calculateUrgentFee(basePrice, urgentReason)
          : { fee: 0, rate: 0 };
        const totalPrice = basePrice + urgentFee;

        const newOrder: Order = {
          id: generateId(),
          orderNo: generateOrderNo(),
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          pickupDate: data.pickupDate || todayStr(),
          clothingCategory: data.clothingCategory || '',
          fabric: data.fabric || '',
          brand: data.brand || '',
          color: data.color || '',
          requirements: data.requirements || '',
          status: 'pending',
          basePrice,
          isUrgent,
          urgentReason,
          urgentFeeRate,
          urgentFee,
          totalPrice,
          measurements: data.measurements || [],
          alterationItems: data.alterationItems || [],
          defectDescription: data.defectDescription || '',
          defectConfirmed: data.defectConfirmed || false,
          notified: false,
          notifyCount: 0,
          pickedUp: false,
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ orders: get().sortOrdersByPriority([newOrder, ...state.orders])
        }));
        return newOrder;
      },

      updateOrder: (id: string, data: Partial<Order>) => {
        const now = new Date().toISOString();
        set(state => {
          const updatedOrders = state.orders.map(o => {
            if (o.id !== id) return o;
            const isUrgent = !!(data.isUrgent ?? o.isUrgent) && !!((data.urgentReason || o.urgentReason));
            const basePrice = data.basePrice ?? o.basePrice ?? data.totalPrice ?? o.totalPrice ?? 0;
            const urgentReason = (data.urgentReason || o.urgentReason || '') as UrgentReason;
            const { fee: urgentFee, rate: urgentFeeRate } = isUrgent
              ? get().calculateUrgentFee(basePrice, urgentReason)
              : { fee: 0, rate: 0 };
            const totalPrice = basePrice + urgentFee;
            return {
              ...o,
              ...data,
              basePrice,
              isUrgent,
              urgentReason,
              urgentFeeRate,
              urgentFee,
              totalPrice,
              updatedAt: now,
            };
          });
          return { orders: get().sortOrdersByPriority(updatedOrders) };
        });
      },

      updateOrderStatus: (id: string, status: OrderStatus) => {
        const now = new Date().toISOString();
        set(state => ({
          orders: state.orders.map(o =>
            o.id === id ? { ...o, status, updatedAt: now } : o
          ),
        }));
      },

      deleteOrder: (id: string) => {
        set(state => ({
          orders: state.orders.filter(o => o.id !== id),
        }));
      },

      markNotified: (id: string) => {
        const now = new Date().toISOString();
        set(state => ({
          orders: state.orders.map(o => {
            if (o.id !== id) return o;
            const currentCount = o.notifyCount || 0;
            return {
              ...o,
              notified: true,
              notifiedAt: now,
              notifyCount: currentCount + 1,
              updatedAt: now,
            };
          }),
        }));
      },

      confirmPickup: (id: string) => {
        const now = new Date().toISOString();
        set(state => ({
          orders: state.orders.map(o =>
            o.id === id ? {
              ...o,
              pickedUp: true,
              pickedUpAt: now,
              status: 'completed',
              updatedAt: now,
            } : o
          ),
        }));
      },

      getPriceByType: (type: string) => {
        const config = get().pricingConfigs.find(p => p.type === type);
        return config?.price || 0;
      },

      updatePricing: (id: string, price: number) => {
        set(state => ({
          pricingConfigs: state.pricingConfigs.map(p =>
            p.id === id ? { ...p, price } : p
          ),
        }));
      },

      recalculateTotal: (items: AlterationItem[]) => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
      },
    }),
    {
      name: 'tailor-shop-storage',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as Record<string, unknown>;
        if (version === 0) {
          if (Array.isArray(state.orders)) {
            state.orders = state.orders.map((order: Record<string, unknown>) => ({
              ...order,
              notifyCount: typeof order.notifyCount === 'number' ? order.notifyCount : 0,
              notifiedAt: order.notifiedAt || undefined,
            }));
          }
        }
        if (version < 2) {
          if (Array.isArray(state.orders)) {
            state.orders = state.orders.map((order: Record<string, unknown>) => ({
              ...order,
              basePrice: typeof order.basePrice === 'number' ? order.basePrice : (order.totalPrice as number || 0),
              isUrgent: typeof order.isUrgent === 'boolean' ? order.isUrgent : false,
              urgentReason: order.urgentReason || '',
              urgentFeeRate: typeof order.urgentFeeRate === 'number' ? order.urgentFeeRate : 0,
              urgentFee: typeof order.urgentFee === 'number' ? order.urgentFee : 0,
            }));
          }
        }
        return state;
      },
    }
  )
);

export const createEmptyMeasurements = (): Measurement[] => [];

export const createEmptyAlterationItems = (): AlterationItem[] => [];
