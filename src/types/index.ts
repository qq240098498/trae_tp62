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
  measurements: Measurement[];
  alterationItems: AlterationItem[];
  defectDescription: string;
  defectConfirmed: boolean;
  notified: boolean;
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
