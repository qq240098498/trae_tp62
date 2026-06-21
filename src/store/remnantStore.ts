import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FabricRemnant, RemnantStatus } from '@/types';
import { generateId } from '@/utils/helpers';

const mockRemnants: FabricRemnant[] = [
  {
    id: 'remnant-1',
    fabric: '羊毛',
    color: '深蓝',
    quantity: 800,
    unit: 'cm²',
    sourceOrderId: 'order-1',
    sourceOrderNo: 'TF20260618001',
    description: '西装修改后剩余的羊毛面料，约30x27cm大小',
    status: 'available',
    createdAt: '2026-06-19T10:00:00Z',
    updatedAt: '2026-06-19T10:00:00Z',
  },
  {
    id: 'remnant-2',
    fabric: '真丝',
    color: '酒红',
    quantity: 500,
    unit: 'cm²',
    sourceOrderId: 'order-2',
    sourceOrderNo: 'TF20260619002',
    description: '连衣裙改领口后剩余真丝面料',
    status: 'available',
    createdAt: '2026-06-20T15:00:00Z',
    updatedAt: '2026-06-20T15:00:00Z',
  },
  {
    id: 'remnant-3',
    fabric: '羊毛',
    color: '驼色',
    quantity: 1200,
    unit: 'cm²',
    sourceOrderId: 'order-4',
    sourceOrderNo: 'TF20260615004',
    description: '大衣放码后剩余的驼色羊毛面料',
    status: 'available',
    createdAt: '2026-06-16T14:00:00Z',
    updatedAt: '2026-06-16T14:00:00Z',
  },
  {
    id: 'remnant-4',
    fabric: '纯棉',
    color: '白色',
    quantity: 300,
    unit: 'cm²',
    description: '客户捐赠的白色纯棉布头',
    status: 'available',
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'remnant-5',
    fabric: '混纺',
    color: '黑色',
    quantity: 150,
    unit: 'cm²',
    sourceOrderId: 'order-3',
    sourceOrderNo: 'TF20260620003',
    description: '西裤收腰后剩余少量黑色混纺面料',
    status: 'used_up',
    createdAt: '2026-06-21T11:00:00Z',
    updatedAt: '2026-06-21T11:00:00Z',
  },
];

interface RemnantStore {
  remnants: FabricRemnant[];
  getRemnantById: (id: string) => FabricRemnant | undefined;
  getAvailableRemnants: () => FabricRemnant[];
  searchRemnants: (keyword: string) => FabricRemnant[];
  findMatchingRemnants: (fabric: string, color: string) => FabricRemnant[];
  addRemnant: (data: Partial<FabricRemnant>) => FabricRemnant;
  updateRemnant: (id: string, data: Partial<FabricRemnant>) => void;
  updateRemnantStatus: (id: string, status: RemnantStatus) => void;
  deleteRemnant: (id: string) => void;
  useRemnant: (id: string, usedQuantity: number) => void;
  getRemnantsByFabric: (fabric: string) => FabricRemnant[];
}

export const useRemnantStore = create<RemnantStore>()(
  persist(
    (set, get) => ({
      remnants: mockRemnants,

      getRemnantById: (id: string) => get().remnants.find(r => r.id === id),

      getAvailableRemnants: () => get().remnants.filter(r => r.status === 'available'),

      searchRemnants: (keyword: string) => {
        const kw = keyword.toLowerCase().trim();
        if (!kw) return get().remnants;
        return get().remnants.filter(r =>
          r.fabric.toLowerCase().includes(kw) ||
          r.color.toLowerCase().includes(kw) ||
          r.description?.toLowerCase().includes(kw) ||
          r.sourceOrderNo?.toLowerCase().includes(kw)
        );
      },

      findMatchingRemnants: (fabric: string, color: string): FabricRemnant[] => {
        const available = get().getAvailableRemnants();
        if (!fabric && !color) return [];

        return available
          .filter(r => {
            const fabricMatch = !fabric || r.fabric === fabric;
            const colorMatch = !color || r.color.includes(color) || color.includes(r.color);
            return fabricMatch && colorMatch;
          })
          .sort((a, b) => b.quantity - a.quantity);
      },

      addRemnant: (data: Partial<FabricRemnant>) => {
        const now = new Date().toISOString();
        const newRemnant: FabricRemnant = {
          id: generateId(),
          fabric: data.fabric || '',
          color: data.color || '',
          quantity: data.quantity || 0,
          unit: data.unit || 'cm²',
          sourceOrderId: data.sourceOrderId,
          sourceOrderNo: data.sourceOrderNo,
          description: data.description || '',
          status: 'available',
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ remnants: [newRemnant, ...state.remnants] }));
        return newRemnant;
      },

      updateRemnant: (id: string, data: Partial<FabricRemnant>) => {
        const now = new Date().toISOString();
        set(state => ({
          remnants: state.remnants.map(r =>
            r.id === id ? { ...r, ...data, updatedAt: now } : r
          ),
        }));
      },

      updateRemnantStatus: (id: string, status: RemnantStatus) => {
        const now = new Date().toISOString();
        set(state => ({
          remnants: state.remnants.map(r =>
            r.id === id ? { ...r, status, updatedAt: now } : r
          ),
        }));
      },

      deleteRemnant: (id: string) => {
        set(state => ({
          remnants: state.remnants.filter(r => r.id !== id),
        }));
      },

      useRemnant: (id: string, usedQuantity: number) => {
        const now = new Date().toISOString();
        set(state => ({
          remnants: state.remnants.map(r => {
            if (r.id !== id) return r;
            const remaining = Math.max(0, r.quantity - usedQuantity);
            const status: RemnantStatus = remaining <= 0 ? 'used_up' : r.status;
            return {
              ...r,
              quantity: remaining,
              status,
              updatedAt: now,
            };
          }),
        }));
      },

      getRemnantsByFabric: (fabric: string) => {
        return get().remnants.filter(r => r.fabric === fabric);
      },
    }),
    {
      name: 'tailor-shop-remnants',
      version: 1,
    }
  )
);
