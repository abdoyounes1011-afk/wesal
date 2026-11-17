import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Suppress button when already running as an installed standalone app
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs flex items-center gap-3 text-xs text-emerald-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1B4332]">التطبيق مثبّت على جهازك</h3>
            <p className="text-[11px] text-[#556B2F] mt-0.5">
              أنت تستخدم «وِصال» حالياً كتطبيق مستقل على جهازك.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  const guideModal = showGuide && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#FDFBF7] rounded-3xl border-2 border-[#C4A674] shadow-2xl p-6 text-right space-y-4">
        <button
          onClick={() => setShowGuide(false)}
          className="absolute top-4 left-4 p-1.5 rounded-full text-[#8C6D37] hover:bg-[#E8DEC8]/50"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shadow-sm">
          <Smartphone className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1B4332] font-reading">
            {isIOS ? 'تثبيت تطبيق وِصال على iPhone / iPad' : 'تثبيت تطبيق وِصال على هاتفك أو جهازك'}
          </h3>
          <p className="text-xs text-[#556B2F] mt-1 leading-relaxed">
            {isIOS
              ? 'اتبع هذه الخطوات البسيطة في متصفح Safari لإضافة وِصال كتطبيق على الشاشة الرئيسية:'
              : 'لتثبيت وِصال كتطبيق على الأندرويد أو الكمبيوتر يعمل بملء الشاشة:'}
          </p>
        </div>

        {isIOS ? (
          <div className="space-y-2.5 text-xs text-[#1F2421] bg-[#FAF7F0] p-4 rounded-2xl border border-[#E8DEC8]">
            <div className="flex items-start gap-2">
              <Share className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
              <span>١. افتح رابط التطبيق في متصفح <strong>Safari</strong> واضغط على زر <strong>المشاركة (Share)</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <PlusSquare className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
              <span>٢. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> ثم اضغط <strong>إضافة</strong>.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs text-[#1F2421] bg-[#FAF7F0] p-4 rounded-2xl border border-[#E8DEC8]">
            <p>
              ١. افتح الرابط المشترك للتطبيق في متصفح <strong>Google Chrome</strong> (وليس داخل نافذة المعاينة).
            </p>
            <p>
              ٢. اضغط على قائمة المتصفح (⋮) في الأعلى ثم اختر <strong>تثبيت التطبيق (Install app)</strong> أو <strong>الإضافة إلى الشاشة الرئيسية</strong>.
            </p>
          </div>
        )}

        <button
          onClick={() => setShowGuide(false)}
          className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-xs font-bold transition-all"
        >
          حسناً، فهمت
        </button>
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <>
        <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8DEC8]/60">
            <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B4332]">تثبيت «وِصال» كتطبيق على جهازك</h3>
              <span className="text-[11px] text-[#556B2F]">أيقونة مستقلة على الشاشة الرئيسية وعمل سريع بدون شريط المتصفح</span>
            </div>
          </div>

          <p className="text-xs text-[#556B2F] leading-relaxed">
            يمكنك تثبيت «وِصال» مباشرة على هاتف الأندرويد أو الآيفون أو الكمبيوتر كتطبيق خفيف دون الحاجة لملف APK خارجي.
          </p>

          <button
            type="button"
            onClick={handleAction}
            className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#C4A674]" />
            <span>{isInstallable ? 'تثبيت التطبيق الآن' : 'خطوات تثبيت التطبيق على جهازك'}</span>
          </button>
        </div>
        {guideModal}
      </>
    );
  }

  // Header variant: visible when directly installable or on iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAction}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#C4A674]/25 hover:bg-[#C4A674]/40 text-[#1B4332] border border-[#C4A674]/60 text-xs font-bold transition-all shadow-2xs"
        title="تثبيت تطبيق وِصال على جهازك"
      >
        <Download className="w-3.5 h-3.5 text-[#1B4332]" />
        <span className="hidden sm:inline">تثبيت التطبيق</span>
      </button>
      {guideModal}
    </>
  );
};
