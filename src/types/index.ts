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

export type UrgentLevel = 'normal' | 'urgent_3d' | 'urgent_2d' | 'urgent_1d' | 'urgent_same_day';

export interface UrgentLevelConfig {
  level: UrgentLevel;
  label: string;
  days: number;
  rate: number;
  description: string;
}

export const URGENT_LEVEL_CONFIGS: UrgentLevelConfig[] = [
  { level: 'normal', label: '普通', days: 7, rate: 0, description: '7天以上取件' },
  { level: 'urgent_3d', label: '3天加急', days: 3, rate: 0.3, description: '3天内取件' },
  { level: 'urgent_2d', label: '2天加急', days: 2, rate: 0.4, description: '2天内取件' },
  { level: 'urgent_1d', label: '次日取件', days: 1, rate: 0.5, description: '次日取件' },
  { level: 'urgent_same_day', label: '当日取件', days: 0, rate: 0.6, description: '当天取件' },
];

export const URGENT_REASON_LABELS: Record<string, string> = {
  '': '无',
  'next_day': '第二天要穿',
  'wedding': '婚礼前',
  'business': '商务会议',
  'party': '宴会活动',
  'other': '其他紧急',
};

export const URGENT_REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'next_day', label: '第二天要穿' },
  { value: 'wedding', label: '婚礼前' },
  { value: 'business', label: '商务会议' },
  { value: 'party', label: '宴会活动' },
  { value: 'other', label: '其他紧急' },
];

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
  urgentLevel: UrgentLevel;
  urgentDays: number;
  urgentFeeRate: number;
  urgentFee: number;
  urgentReason: string;
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

export type RemnantStatus = 'available' | 'reserved' | 'used_up';

export const REMNANT_STATUS_LABELS: Record<RemnantStatus, string> = {
  available: '可用',
  reserved: '已预留',
  used_up: '已用完',
};

export interface FabricRemnant {
  id: string;
  fabric: string;
  color: string;
  quantity: number;
  unit: string;
  sourceOrderId?: string;
  sourceOrderNo?: string;
  description?: string;
  status: RemnantStatus;
  createdAt: string;
  updatedAt: string;
}

export const REMNANT_UNITS = ['cm²', 'm²', '克', '米'];

export const COLOR_FAMILIES = [
  '白色系', '黑色系', '灰色系', '红色系', '橙色系', '黄色系',
  '绿色系', '蓝色系', '紫色系', '粉色系', '棕色系', '驼色系',
  '牛仔蓝', '多色/花色', '其他',
];
