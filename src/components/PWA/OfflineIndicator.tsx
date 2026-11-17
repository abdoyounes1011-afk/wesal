import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg border border-amber-400">
      <WifiOff className="w-3.5 h-3.5" />
      <span>وضع عدم الاتصال — يتم استخدام الصفحات المحفوظة</span>
    </div>
  );
};
