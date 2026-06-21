import type { ReactNode } from 'react';
import { TrendingUp, Clock, CheckCircle2, Package } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';

const statConfigs = [
  {
    key: 'pending',
    label: '待处理',
    icon: Clock,
    bgClass: 'from-amber-50 to-amber-100',
    iconBg: 'bg-amber-200',
    iconColor: 'text-amber-700',
    textColor: 'text-amber-700',
  },
  {
    key: 'in_progress',
    label: '制作中',
    icon: TrendingUp,
    bgClass: 'from-blue-50 to-blue-100',
    iconBg: 'bg-blue-200',
    iconColor: 'text-blue-700',
    textColor: 'text-blue-700',
  },
  {
    key: 'ready',
    label: '待取件',
    icon: Package,
    bgClass: 'from-green-50 to-green-100',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-700',
    textColor: 'text-green-700',
  },
  {
    key: 'completed',
    label: '已完成',
    icon: CheckCircle2,
    bgClass: 'from-coffee-100 to-coffee-200',
    iconBg: 'bg-coffee-300',
    iconColor: 'text-coffee-700',
    textColor: 'text-coffee-700',
  },
];

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  bgClass: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
}

function StatCard({ icon, label, value, bgClass, iconBg, iconColor, textColor }: StatCardProps) {
  return (
    <div className={`card p-5 bg-gradient-to-br ${bgClass} border-transparent`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-coffee-600 mb-1">{label}</p>
          <p className={`text-3xl font-serif font-bold ${textColor}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function StatsCards() {
  const { orders } = useOrderStore();

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statConfigs.map(config => {
        const Icon = config.icon as typeof TrendingUp;
        return (
          <StatCard
            key={config.key}
            icon={<Icon className="w-6 h-6" />}
            label={config.label}
            value={counts[config.key as keyof typeof counts]}
            bgClass={config.bgClass}
            iconBg={config.iconBg}
            iconColor={config.iconColor}
            textColor={config.textColor}
          />
        );
      })}
    </div>
  );
}
