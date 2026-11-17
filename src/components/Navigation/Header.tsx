import React from 'react';
import { BookOpen, User as UserIcon, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabit } from '../../context/HabitContext';
import { PWAInstallButton } from '../PWA/PWAInstallButton';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenSettings }) => {
  const { currentUser, isGuest } = useAuth();
  const { isSyncing } = useHabit();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#E8DEC8] px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#E8DEC8] flex items-center justify-center shadow-sm border border-[#C4A674]/40">
            <BookOpen className="w-5 h-5 text-[#C4A674]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1B4332] tracking-wide font-reading">وِصال</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E8DEC8]/60 text-[#1B4332] font-medium border border-[#C4A674]/30">
                عادة الورد
              </span>
            </div>
            <p className="text-[11px] text-[#556B2F]">قليلٌ دائم خيرٌ من كثيرٍ مُنقطع</p>
          </div>
        </div>

        {/* Sync & Auth Status */}
        <div className="flex items-center gap-2">
          <PWAInstallButton variant="header" />

          {/* Cloud Sync Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/70 border border-[#E8DEC8] text-[#556B2F]">
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4A674]" />
                <span>جارِ الحفظ...</span>
              </>
            ) : currentUser ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="text-[#1B4332]">مُتزامن سحابياً</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>حفظ محلي</span>
              </>
            )}
          </div>

          {/* User Profile / Login */}
          {currentUser ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-[#1B4332] text-xs font-semibold border border-[#E8DEC8] transition-all shadow-xs"
              title="إعدادات الحساب"
            >
              <div className="w-5 h-5 rounded-full bg-[#2D6A4F] text-[#FAF7F0] flex items-center justify-center text-[10px]">
                {currentUser.displayName ? currentUser.displayName[0] : 'ق'}
              </div>
              <span className="max-w-[90px] truncate">{currentUser.displayName || 'حسابي'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-xs font-semibold shadow-xs transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
