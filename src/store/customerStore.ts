import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerProfile, BodyMeasurements, Measurement, AlterationPreferences, LastAlterationRecord, Order } from '@/types';
import { BODY_MEASUREMENT_KEYS } from '@/types';
import { generateId, todayStr } from '@/utils/helpers';

const mockCustomerProfiles: CustomerProfile[] = [
  {
    id: 'cust-1',
    customerName: '张明华',
    customerPhone: '13812345678',
    bodyMeasurements: {
      shoulderWidth: 45,
      chest: 100,
      waist: 90,
      hips: 96,
      clothingLength: 78,
      sleeveLength: 62,
    },
    lastMeasurementDate: '2026-06-18',
    orderCount: 1,
    preferences: {
      fitPreference: 'slim',
      hemPreference: 'original',
      keepOriginalHem: true,
      notes: '喜欢修身版型，西裤一定要保留原边',
    },
    lastAlteration: {
      orderId: 'order-1',
      orderNo: 'TF20260618001',
      clothingCategory: '西装',
      alterationSummary: '衣长改短3cm，袖长改短2cm，腰围收小4cm',
      date: '2026-06-18',
    },
    createdAt: '2026-06-18T10:30:00Z',
    updatedAt: '2026-06-18T10:30:00Z',
  },
  {
    id: 'cust-2',
    customerName: '李雪梅',
    customerPhone: '13987654321',
    bodyMeasurements: {
      shoulderWidth: 38,
      chest: 86,
      waist: 76,
      hips: 90,
      clothingLength: 105,
      sleeveLength: 58,
    },
    lastMeasurementDate: '2026-06-19',
    orderCount: 1,
    preferences: {
      fitPreference: 'regular',
      notes: '连衣裙喜欢腰身要合身，不要太紧身',
    },
    lastAlteration: {
      orderId: 'order-2',
      orderNo: 'TF20260619002',
      clothingCategory: '连衣裙',
      alterationSummary: '领口改小4cm，腰围收小4cm，衣长改短3cm',
      date: '2026-06-19',
    },
    createdAt: '2026-06-19T14:20:00Z',
    updatedAt: '2026-06-19T14:20:00Z',
  },
  {
    id: 'cust-3',
    customerName: '王建国',
    customerPhone: '13611112222',
    bodyMeasurements: {
      shoulderWidth: 44,
      chest: 98,
      waist: 88,
      hips: 94,
      clothingLength: 76,
      sleeveLength: 60,
    },
    lastMeasurementDate: '2026-06-20',
    orderCount: 1,
    preferences: {
      fitPreference: 'loose',
      hemPreference: 'regular',
      notes: '年纪大了喜欢宽松一点，穿着舒服',
    },
    lastAlteration: {
      orderId: 'order-3',
      orderNo: 'TF20260620003',
      clothingCategory: '西裤',
      alterationSummary: '腰围收小4cm，更换拉链',
      date: '2026-06-20',
    },
    createdAt: '2026-06-20T09:00:00Z',
    updatedAt: '2026-06-20T09:00:00Z',
  },
  {
    id: 'cust-4',
    customerName: '陈晓燕',
    customerPhone: '13755556666',
    bodyMeasurements: {
      shoulderWidth: 40,
      chest: 100,
      waist: 82,
      hips: 96,
      clothingLength: 115,
      sleeveLength: 60,
    },
    lastMeasurementDate: '2026-06-15',
    orderCount: 1,
    preferences: {
      fitPreference: 'slim',
      keepOriginalHem: false,
      notes: '大衣喜欢修身，袖口要补好',
    },
    lastAlteration: {
      orderId: 'order-4',
      orderNo: 'TF20260615004',
      clothingCategory: '大衣',
      alterationSummary: '整体放码收一码，衣长改短3cm，袖口补洞',
      date: '2026-06-15',
    },
    createdAt: '2026-06-15T11:20:00Z',
    updatedAt: '2026-06-15T11:20:00Z',
  },
];

export const measurementsToBody = (measurements: Measurement[]): BodyMeasurements => {
  const body: BodyMeasurements = {};
  measurements.forEach(m => {
    const key = BODY_MEASUREMENT_KEYS.find(k => k.label === m.partName)?.key;
    if (key && m.originalSize > 0) {
      body[key] = m.originalSize;
    }
  });
  return body;
};

export const bodyToMeasurements = (body: BodyMeasurements): Measurement[] => {
  return BODY_MEASUREMENT_KEYS
    .filter(k => body[k.key] !== undefined)
    .map(k => ({
      id: generateId(),
      partName: k.label,
      originalSize: body[k.key]!,
      targetSize: body[k.key]!,
      unit: k.unit,
    }));
};

interface CustomerStore {
  profiles: CustomerProfile[];
  getProfileByPhone: (phone: string) => CustomerProfile | undefined;
  getProfileByName: (name: string) => CustomerProfile | undefined;
  getProfileByPhoneAndName: (phone: string, name: string) => CustomerProfile | undefined;
  searchProfiles: (keyword: string) => CustomerProfile[];
  createProfile: (data: Partial<CustomerProfile>) => CustomerProfile;
  updateProfile: (id: string, data: Partial<CustomerProfile>) => void;
  deleteProfile: (id: string) => void;
  updatePreferences: (id: string, preferences: Partial<AlterationPreferences>) => void;
  updateLastAlteration: (phone: string, order: Order) => void;
  updateProfileFromMeasurements: (
    customerName: string,
    customerPhone: string,
    measurements: Measurement[]
  ) => CustomerProfile;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      profiles: mockCustomerProfiles,

      getProfileByPhone: (phone: string) => {
        return get().profiles.find(p => p.customerPhone === phone.trim());
      },

      getProfileByName: (name: string) => {
        return get().profiles.find(p => p.customerName === name.trim());
      },

      getProfileByPhoneAndName: (phone: string, name: string) => {
        const phoneTrimmed = phone.trim();
        const nameTrimmed = name.trim();
        const byPhone = get().profiles.find(p => p.customerPhone === phoneTrimmed);
        if (byPhone) {
          if (!nameTrimmed || byPhone.customerName === nameTrimmed) {
            return byPhone;
          }
          return undefined;
        }
        if (nameTrimmed) {
          return get().profiles.find(p =>
            p.customerName === nameTrimmed
          );
        }
        return undefined;
      },

      searchProfiles: (keyword: string) => {
        const kw = keyword.toLowerCase().trim();
        if (!kw) return get().profiles;
        return get().profiles.filter(p =>
          p.customerName.toLowerCase().includes(kw) ||
          p.customerPhone.includes(kw)
        );
      },

      createProfile: (data: Partial<CustomerProfile>) => {
        const now = new Date().toISOString();
        const newProfile: CustomerProfile = {
          id: generateId(),
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          bodyMeasurements: data.bodyMeasurements || {},
          lastMeasurementDate: data.lastMeasurementDate || todayStr(),
          orderCount: data.orderCount || 1,
          preferences: data.preferences || {},
          lastAlteration: data.lastAlteration || undefined,
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ profiles: [newProfile, ...state.profiles] }));
        return newProfile;
      },

      updateProfile: (id: string, data: Partial<CustomerProfile>) => {
        const now = new Date().toISOString();
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, ...data, updatedAt: now } : p
          ),
        }));
      },

      updatePreferences: (id: string, preferences: Partial<AlterationPreferences>) => {
        const now = new Date().toISOString();
        set(state => ({
          profiles: state.profiles.map(p => {
            if (p.id !== id) return p;
            return {
              ...p,
              preferences: { ...p.preferences, ...preferences },
              updatedAt: now,
            };
          }),
        }));
      },

      updateLastAlteration: (phone: string, order: Order) => {
        const now = new Date().toISOString();
        const alterationSummary = order.alterationItems
          .map(item => `${item.name} x${item.quantity}`)
          .join('、');
        const lastAlteration: LastAlterationRecord = {
          orderId: order.id,
          orderNo: order.orderNo,
          clothingCategory: order.clothingCategory,
          alterationSummary: alterationSummary || order.requirements,
          date: order.createdAt ? order.createdAt.split('T')[0] : todayStr(),
        };
        set(state => ({
          profiles: state.profiles.map(p => {
            if (p.customerPhone !== phone.trim()) return p;
            return {
              ...p,
              lastAlteration,
              orderCount: p.orderCount + 1,
              updatedAt: now,
            };
          }),
        }));
      },

      deleteProfile: (id: string) => {
        set(state => ({
          profiles: state.profiles.filter(p => p.id !== id),
        }));
      },

      updateProfileFromMeasurements: (
        customerName: string,
        customerPhone: string,
        measurements: Measurement[]
      ) => {
        const phone = customerPhone.trim();
        const body = measurementsToBody(measurements);
        const existing = get().profiles.find(p => p.customerPhone === phone);

        if (existing) {
          const mergedBody = { ...existing.bodyMeasurements, ...body };
          const hasNewData = Object.keys(body).length > 0;
          get().updateProfile(existing.id, {
            customerName,
            bodyMeasurements: mergedBody,
            lastMeasurementDate: hasNewData ? todayStr() : existing.lastMeasurementDate,
            orderCount: existing.orderCount + 1,
          });
          return { ...existing, bodyMeasurements: mergedBody };
        } else {
          return get().createProfile({
            customerName,
            customerPhone: phone,
            bodyMeasurements: body,
            lastMeasurementDate: todayStr(),
            orderCount: 1,
          });
        }
      },
    }),
    {
      name: 'customer-profiles-storage',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as Record<string, unknown>;
        if (version < 2) {
          if (Array.isArray(state.profiles)) {
            state.profiles = state.profiles.map((profile: Record<string, unknown>) => ({
              ...profile,
              preferences: (profile as Record<string, unknown>).preferences || {},
              lastAlteration: (profile as Record<string, unknown>).lastAlteration || undefined,
            }));
          }
        }
        return state;
      },
    }
  )
);
