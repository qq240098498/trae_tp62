import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerProfile, BodyMeasurements, Measurement } from '@/types';
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
  searchProfiles: (keyword: string) => CustomerProfile[];
  createProfile: (data: Partial<CustomerProfile>) => CustomerProfile;
  updateProfile: (id: string, data: Partial<CustomerProfile>) => void;
  deleteProfile: (id: string) => void;
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
      version: 1,
    }
  )
);
