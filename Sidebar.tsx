import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Car, Zap, CreditCard, Bell, LogOut, Settings, BarChart2, Menu, X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/cars', icon: <Car size={18} />, label: 'Veículos' },
  { to: '/stations', icon: <Zap size={18} />, label: 'Recargas' },
  { to: '/payments', icon: <CreditCard size={18} />, label: 'Pagamentos' },
  { to: '/admin', icon: <BarChart2 size={18} />, label: 'Admin', adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-success text-white font-bold">
            ⚡
          </div>
          <span className="font-semibold text-xl text-primary-dark">VoltRide</span>
        </div>
        <p className="text-xs mt-1 text-text-tertiary">Frota elétrica inteligente</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter(item => !item.adminOnly || currentUser?.role === 'admin')
          .map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-success_light text-success border-2 border-success'
                    : 'text-text-secondary hover:text-primary-dark hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <div className="px-3 py-3 rounded-2xl bg-gray-100 mb-3">
          <p className="text-xs font-semibold text-primary-dark">{currentUser?.name}</p>
          <p className="text-xs mt-0.5 text-text-secondary">
            Plano {currentUser?.plan === 'basic' ? '🥉 Basic' : currentUser?.plan === 'pro' ? '🥈 Pro' : '🥇 Premium'}
          </p>
          <p className="text-xs mt-1 font-semibold text-success">
            R$ {currentUser?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-sm transition-all duration-150 text-text-secondary hover:text-danger hover:bg-red-50"
          onClick={() => {
            logout();
            setMobileOpen(false);
          }}
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center text-sm bg-success text-white font-bold">
            ⚡
          </div>
          <span className="font-semibold text-lg text-primary-dark">VoltRide</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)}>
          <aside className="absolute left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
