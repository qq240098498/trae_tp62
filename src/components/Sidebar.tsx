import { NavLink } from 'react-router-dom';
import { Scissors, ListTodo, PackageCheck, Settings, Receipt } from 'lucide-react';

const navItems = [
  { to: '/', label: '订单管理', icon: ListTodo },
  { to: '/pickup', label: '取件通知', icon: PackageCheck },
  { to: '/pricing', label: '价格配置', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-coffee-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-coffee-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-400 rounded-lg flex items-center justify-center">
            <Scissors className="w-6 h-6 text-coffee-900" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-white">匠心裁缝</h1>
            <p className="text-xs text-coffee-300">改衣管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-400 text-coffee-900 shadow-md'
                    : 'text-coffee-200 hover:bg-coffee-700 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-coffee-700">
        <div className="flex items-center gap-3 px-2 py-2">
          <Receipt className="w-5 h-5 text-coffee-400" />
          <span className="text-sm text-coffee-400">今日订单已同步</span>
        </div>
      </div>
    </aside>
  );
}
