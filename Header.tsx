import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { notifications, markNotificationRead } = useAppStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div>
        <h1 className="font-semibold text-2xl text-primary-dark">{title}</h1>
        {subtitle && <p className="text-sm mt-0.5 text-text-secondary">{subtitle}</p>}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2.5 rounded-2xl border-2 border-gray-200 hover:border-success hover:bg-success_light transition-all"
        >
          <Bell size={18} className="text-text-secondary hover:text-success" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center bg-danger text-white">
              {unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-lg border-2 border-gray-200 z-50">
            <div className="flex items-center justify-between mb-3 px-4 py-3 border-b border-gray-200">
              <p className="font-semibold text-sm text-primary-dark">Notificações</p>
              <button onClick={() => setShowNotifs(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto px-4 py-3">
              {notifications.length === 0 && (
                <p className="text-xs text-center py-4 text-text-tertiary">Sem notificações</p>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    n.read
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-success bg-success_light bg-opacity-20'
                  }`}
                  onClick={() => markNotificationRead(n.id)}
                >
                  <p className="text-sm font-semibold text-primary-dark">{n.title}</p>
                  <p className="text-xs mt-1 text-text-secondary">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
