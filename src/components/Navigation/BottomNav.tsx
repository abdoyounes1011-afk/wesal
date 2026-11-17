import React from 'react';
import { Home, BookOpen, Calendar, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'reader' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: Home },
    { id: 'reader' as TabType, label: 'المصحف', icon: BookOpen },
    { id: 'history' as TabType, label: 'سجل القراءة', icon: Calendar },
    { id: 'settings' as TabType, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-t border-[#E8DEC8] px-3 py-2 pb-safe transition-all">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#1B4332] font-bold bg-[#E8DEC8]/50 shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1B4332] font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#1B4332]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1B4332] rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
