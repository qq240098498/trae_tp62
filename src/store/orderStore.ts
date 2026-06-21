import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, PricingConfig, Measurement, AlterationItem } from '@/types';
import { mockOrders, mockPricingConfigs } from '@/data/mockData';
import { generateId, generateOrderNo, todayStr } from '@/utils/helpers';

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

      createOrder: (data: Partial<Order>) => {
        const now = new Date().toISOString();
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
          totalPrice: data.totalPrice || 0,
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
        set(state => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
      },

      updateOrder: (id: string, data: Partial<Order>) => {
        const now = new Date().toISOString();
        set(state => ({
          orders: state.orders.map(o =>
            o.id === id ? { ...o, ...data, updatedAt: now } : o
          ),
        }));
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
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const state = persistedState as Record<string, unknown>;
          if (Array.isArray(state.orders)) {
            state.orders = state.orders.map((order: Record<string, unknown>) => ({
              ...order,
              notifyCount: typeof order.notifyCount === 'number' ? order.notifyCount : 0,
              notifiedAt: order.notifiedAt || undefined,
            }));
          }
          return state;
        }
        return persistedState as Record<string, unknown>;
      },
    }
  )
);

export const createEmptyMeasurements = (): Measurement[] => [];

export const createEmptyAlterationItems = (): AlterationItem[] => [];
