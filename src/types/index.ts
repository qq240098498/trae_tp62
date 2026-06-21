export type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'completed';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待处理',
  in_progress: '制作中',
  ready: '待取件',
  completed: '已完成',
};

export interface Measurement {
  id: string;
  partName: string;
  originalSize: number;
  targetSize: number;
  unit: string;
}

export interface AlterationItem {
  id: string;
  type: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export type UrgentReason = 'next_day' | 'wedding' | 'business' | 'party' | 'other' | '';

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  clothingCategory: string;
  fabric: string;
  brand: string;
  color: string;
  requirements: string;
  status: OrderStatus;
  totalPrice: number;
  basePrice: number;
  isUrgent: boolean;
  urgentReason: UrgentReason;
  urgentFeeRate: number;
  urgentFee: number;
  measurements: Measurement[];
  alterationItems: AlterationItem[];
  defectDescription: string;
  defectConfirmed: boolean;
  notified: boolean;
  notifiedAt?: string;
  notifyCount: number;
  pickedUp: boolean;
  pickedUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingConfig {
  id: string;
  type: string;
  name: string;
  price: number;
}

export const DEFAULT_ALTERATION_TYPES = [
  { type: 'shorten', name: '改短', price: 30 },
  { type: 'enlarge', name: '放码', price: 50 },
  { type: 'waist', name: '收腰', price: 40 },
  { type: 'zipper', name: '换拉链', price: 35 },
  { type: 'patch', name: '补洞', price: 25 },
  { type: 'collar', name: '改领口', price: 45 },
];

export const CLOTHING_CATEGORIES = [
  '西装', '衬衫', '西裤', '牛仔裤', '连衣裙', '半身裙',
  '外套', '大衣', '风衣', 'T恤', '针织衫', '其他',
];

export const FABRIC_TYPES = [
  '纯棉', '涤纶', '羊毛', '真丝', '亚麻', '混纺',
  '牛仔', '灯芯绒', '化纤', '其他',
];

export const MEASUREMENT_PARTS = [
  { name: '衣长', unit: 'cm' },
  { name: '袖长', unit: 'cm' },
  { name: '肩宽', unit: 'cm' },
  { name: '胸围', unit: 'cm' },
  { name: '腰围', unit: 'cm' },
  { name: '臀围', unit: 'cm' },
  { name: '裤长', unit: 'cm' },
  { name: '领围', unit: 'cm' },
];

export const URGENT_REASON_OPTIONS: { value: UrgentReason; label: string; rate: number }[] = [
  { value: 'next_day', label: '第二天要穿', rate: 0.5 },
  { value: 'wedding', label: '婚礼前', rate: 0.5 },
  { value: 'business', label: '商务会议', rate: 0.4 },
  { value: 'party', label: '宴会活动', rate: 0.3 },
  { value: 'other', label: '其他紧急', rate: 0.3 },
];

export const URGENT_REASON_LABELS: Record<UrgentReason, string> = {
  '': '普通',
  'next_day': '第二天要穿',
  'wedding': '婚礼前',
  'business': '商务会议',
  'party': '宴会活动',
  'other': '其他紧急',
};

export interface BodyMeasurements {
  shoulderWidth?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  clothingLength?: number;
  sleeveLength?: number;
}

export const BODY_MEASUREMENT_KEYS: { key: keyof BodyMeasurements; label: string; unit: string }[] = [
  { key: 'shoulderWidth', label: '肩宽', unit: 'cm' },
  { key: 'chest', label: '胸围', unit: 'cm' },
  { key: 'waist', label: '腰围', unit: 'cm' },
  { key: 'hips', label: '臀围', unit: 'cm' },
  { key: 'clothingLength', label: '衣长', unit: 'cm' },
  { key: 'sleeveLength', label: '袖长', unit: 'cm' },
];

export interface CustomerProfile {
  id: string;
  customerName: string;
  customerPhone: string;
  bodyMeasurements: BodyMeasurements;
  lastMeasurementDate: string;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}
