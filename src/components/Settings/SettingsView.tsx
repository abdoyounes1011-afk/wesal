import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Bell,
  User,
  LogOut,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  Send,
  HardDriveDownload,
  DownloadCloud,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabit } from '../../context/HabitContext';
import { formatArabicNumber, TIME_GOAL_OPTIONS } from '../../data/quranMetadata';
import { downloadFullMushaf } from '../../services/quranApi';
import { downloadFullTafsir } from '../../services/tafsirApi';
import { getCachedPagesCount, getCachedTafsirCount } from '../../services/quranStorage';
import {
  requestBrowserNotificationPermission,
  sendGentlePushNotification,
  getNotificationPermissionStatus,
  isPushNotificationSupported,
} from '../../services/notificationService';
import { PWAInstallButton } from '../PWA/PWAInstallButton';

const OfflineStorageSection: React.FC = () => {
  const [cachedPages, setCachedPages] = useState<number>(0);
  const [isDownloadingPages, setIsDownloadingPages] = useState<boolean>(false);
  const [pagesLoaded, setPagesLoaded] = useState<number>(0);

  const [cachedTafsir, setCachedTafsir] = useState<number>(0);
  const [isDownloadingTafsir, setIsDownloadingTafsir] = useState<boolean>(false);
  const [tafsirSurahsLoaded, setTafsirSurahsLoaded] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<'pages' | 'tafsir'>('pages');

  const refreshCounts = () => {
    getCachedPagesCount().then(setCachedPages);
    getCachedTafsirCount().then(setCachedTafsir);
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  const handleDownloadPages = async () => {
    setIsDownloadingPages(true);
    setPagesLoaded(cachedPages);
    const res = await downloadFullMushaf((loaded) => {
      setPagesLoaded(loaded);
      setCachedPages(loaded);
    });
    setIsDownloadingPages(false);
    setCachedPages(res.downloaded);
  };

  const handleDownloadTafsir = async () => {
    setIsDownloadingTafsir(true);
    setTafsirSurahsLoaded(0);
    const res = await downloadFullTafsir((loadedSurahs, totalSurahs, loadedAyahs) => {
      setTafsirSurahsLoaded(loadedSurahs);
      setCachedTafsir(loadedAyahs);
    });
    setIsDownloadingTafsir(false);
    setCachedTafsir(res.totalAyahs);
  };

  const pagesPercentage = Math.min(100, Math.round(((isDownloadingPages ? pagesLoaded : cachedPages) / 604) * 100));
  const tafsirPercentage = Math.min(100, Math.round((cachedTafsir / 6236) * 100));

  return (
    <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8DEC8]/60">
        <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
          <HardDriveDownload className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[#1B4332]">تحميل المصحف وتفسير السعدي أوفلاين</h3>
          <span className="text-[11px] text-[#556B2F]">للقراءة وعرض تفسير كل آية فورياً بدون الحاجة للإنترنت</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF7F0] rounded-xl border border-[#E8DEC8]">
        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'pages' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#6B7280]'
          }`}
        >
          صفحات المصحف ({cachedPages}/٦٠٤)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tafsir')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'tafsir' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#6B7280]'
          }`}
        >
          تفسير السعدي ({cachedTafsir > 0 ? `${formatArabicNumber(cachedTafsir)} آية` : 'تحميل'})
        </button>
      </div>

      {/* 1. MUSHAF PAGES TAB */}
      {activeTab === 'pages' && (
        <div className="space-y-3">
          <p className="text-xs text-[#556B2F] leading-relaxed">
            حفظ جميع صفحات المصحف الشريف (٦٠٤ صفحة) محلياً داخل متصفحك، لفتح الصفحات فوراً بدون انتظار الشبكة أو انقطاع الاتصال.
          </p>

          <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8] space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-[#1B4332]">
              <span>الصفحات المحفوظة في متصفحك:</span>
              <span className="font-mono text-sm">
                {formatArabicNumber(isDownloadingPages ? pagesLoaded : cachedPages)} / ٦٠٤
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden p-0.5 border border-[#C4A674]/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] transition-all duration-300"
                style={{ width: `${pagesPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8C6D37]">
              <span>{pagesPercentage}% مكتمل</span>
              {cachedPages >= 604 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المصحف محفوظ بالكامل ويعمل بدون إنترنت ✅</span>
                </span>
              ) : isDownloadingPages ? (
                <span className="text-[#1B4332] font-semibold flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4A674]" />
                  <span>جارِ التحميل السريع...</span>
                </span>
              ) : (
                <span>اضغط للتحميل والحفظ دون انتظار</span>
              )}
            </div>
          </div>

          {cachedPages < 604 ? (
            <button
              onClick={handleDownloadPages}
              disabled={isDownloadingPages}
              className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDownloadingPages ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C4A674]" />
                  <span>جارِ حفظ الصفحات ({pagesLoaded}/604)...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4 text-[#C4A674]" />
                  <span>تحميل المصحف كاملاً الآن (٦٠٤ صفحة)</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-center py-2 text-xs text-emerald-800 font-bold bg-emerald-50 rounded-xl border border-emerald-200">
              ✨ تم تحميل المصحف الشريف بالكامل بنجاح، يمكنك القراءة دائماً في وضع عدم الاتصال!
            </div>
          )}
        </div>
      )}

      {/* 2. TAFSIR TAB */}
      {activeTab === 'tafsir' && (
        <div className="space-y-3">
          <p className="text-xs text-[#556B2F] leading-relaxed">
            تحميل تفسير السعدي المعتمد كاملاً (تيسير الكريم الرحمن في تفسير كلام المنان) لجميع آيات القرآن الكريم (١١٤ سورة / ٦٢٣٦ آية) بحيث يكون تفسير كل آية متاحاً فورياً بدون إنترنت.
          </p>

          <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8] space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-[#1B4332]">
              <span>الآيات المتوفر تفسيرها محلياً:</span>
              <span className="font-mono text-sm">
                {formatArabicNumber(cachedTafsir)} / ٦٢٣٦ آية
              </span>
            </div>

            {isDownloadingTafsir && (
              <div className="flex items-center justify-between text-[11px] text-[#556B2F]">
                <span>السور المنجزة:</span>
                <span className="font-mono font-bold text-[#1B4332]">
                  {formatArabicNumber(tafsirSurahsLoaded)} / ١١٤ سورة
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden p-0.5 border border-[#C4A674]/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] transition-all duration-300"
                style={{ width: `${tafsirPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8C6D37]">
              <span>{tafsirPercentage}% مكتمل</span>
              {cachedTafsir >= 6200 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تفسير كل آية محفوظ ويعمل بدون إنترنت ✅</span>
                </span>
              ) : isDownloadingTafsir ? (
                <span className="text-[#1B4332] font-semibold flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4A674]" />
                  <span>جارِ تحميل تفسير السور ({tafsirSurahsLoaded}/114)...</span>
                </span>
              ) : (
                <span>اضغط للتحميل والحفظ دون انتظار</span>
              )}
            </div>
          </div>

          {cachedTafsir < 6200 ? (
            <button
              onClick={handleDownloadTafsir}
              disabled={isDownloadingTafsir}
              className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDownloadingTafsir ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C4A674]" />
                  <span>جارِ تحميل التفسير ({tafsirSurahsLoaded}/114 سورة)...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4 text-[#C4A674]" />
                  <span>تحميل تفسير السعدي كاملاً الآن (٦٢٣٦ آية)</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-center py-2 text-xs text-emerald-800 font-bold bg-emerald-50 rounded-xl border border-emerald-200">
              ✨ تم تحميل تفسير السعدي كاملاً لكل آية، ويعمل دائماً في وضع عدم الاتصال!
            </div>
          )}
        </div>
      )}
    </div>
  );
};


interface SettingsViewProps {
  onOpenAuth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenAuth }) => {
  const { currentUser, isGuest, signOut, resetPassword } = useAuth();
  const {
    goal,
    updateGoal,
    habitSettings,
    updateHabitSettings,
    notificationSettings,
    updateNotificationSettings,
  } = useHabit();

  // Local form state
  const [dailyTarget, setDailyTarget] = useState<number>(goal.dailyTarget || 5);
  const [routine, setRoutine] = useState<string>(habitSettings.dailyRoutine || 'after_fajr');
  const [customRoutine, setCustomRoutine] = useState<string>(habitSettings.customRoutine || '');
  const [preferredTime, setPreferredTime] = useState<string>(habitSettings.preferredTime || '06:00');

  useEffect(() => {
    setDailyTarget(goal.dailyTarget || 5);
  }, [goal.dailyTarget]);
  
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    getNotificationPermissionStatus()
  );

  const showSavedMessage = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleSaveGoal = async () => {
    await updateGoal('minutes', dailyTarget);
    showSavedMessage('تم تحديث مدة الورد اليومي بنجاح.');
  };

  const handleSaveHabit = async () => {
    await updateHabitSettings(routine, customRoutine, preferredTime);
    showSavedMessage('تم تحديث ربط العادات ووقت القراءة.');
  };

  const handleToggleNotifications = async () => {
    if (!notificationSettings.browserPushEnabled) {
      const granted = await requestBrowserNotificationPermission();
      setNotifPermission(getNotificationPermissionStatus());
      if (granted) {
        await updateNotificationSettings({ browserPushEnabled: true });
        showSavedMessage('تم تفعيل إشعارات المتصفح بنجاح.');
      } else {
        alert('يرجى السماح بالإشعارات من إعدادات المتصفح.');
      }
    } else {
      await updateNotificationSettings({ browserPushEnabled: false });
      showSavedMessage('تم تعطيل إشعارات المتصفح.');
    }
  };

  const handleSendTestNotification = async () => {
    const success = await sendGentlePushNotification(
      'وِصال | تذكير تجريبي',
      'حان وقت وردك القرآني. صفحة واحدة تضيء يومك بالسكينة والبركة ✨'
    );
    if (success) {
      showSavedMessage('تم إرسال إشعار تجريبي بنجاح.');
    } else {
      alert('يرجى تفعيل صلاحية الإشعارات أولاً لتلقي التنبيه.');
    }
  };

  const handleResetPassword = async () => {
    if (currentUser?.email) {
      await resetPassword(currentUser.email);
      showSavedMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-24 text-right">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#1B4332] font-reading">الإعدادات والتفضيلات</h2>
        <p className="text-xs text-[#556B2F] mt-0.5">
          تخصيص وردك، أوقات التنبيهات، والارتباط بالعادات اليومية
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 1. READING TIME SETTINGS */}
      <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8DEC8]/60">
          <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1B4332]">إعدادات وقت الورد اليومي</h3>
            <span className="text-[11px] text-[#556B2F]">تحديد مدة القراءة اليومية بالدقائق بمرونة تامة</span>
          </div>
        </div>

        {/* Time Quantities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          {TIME_GOAL_OPTIONS.map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setDailyTarget(item.val)}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                dailyTarget === item.val
                  ? 'border-[#1B4332] bg-[#1B4332] text-white shadow-2xs'
                  : 'border-[#E8DEC8] bg-[#FAF7F0] text-[#1F2421] hover:border-[#C4A674]'
              }`}
            >
              <div>
                <div className="font-bold text-sm">{item.label}</div>
                <div className={`text-[11px] mt-0.5 ${dailyTarget === item.val ? 'text-[#C4A674]' : 'text-[#8C6D37]'}`}>
                  {item.sublabel}
                </div>
              </div>
              <div className={`text-[10px] mt-2 pt-1 border-t ${dailyTarget === item.val ? 'border-white/20 text-[#FAF7F0]/80' : 'border-[#E8DEC8] text-[#556B2F]'}`}>
                {item.hint}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSaveGoal}
          className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white text-xs font-bold transition-all shadow-xs"
        >
          حفظ وقت الورد الجديد
        </button>
      </div>

      {/* 2. HABIT STACKING SETTINGS */}
      <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8DEC8]/60">
          <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1B4332]">ربط العادات والوقت المفضل</h3>
            <span className="text-[11px] text-[#556B2F]">تثبيت قراءة القرآن بروتينك اليومي المعتاد</span>
          </div>
        </div>

        {/* Routines Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { id: 'after_fajr', label: 'بعد صلاة الفجر' },
            { id: 'after_breakfast', label: 'بعد تناول الإفطار' },
            { id: 'after_lunch', label: 'بعد تناول الغداء' },
            { id: 'after_isha', label: 'بعد صلاة العشاء' },
            { id: 'before_sleep', label: 'قبل النوم' },
            { id: 'after_waking', label: 'بعد الاستيقاظ' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setRoutine(item.id);
                setCustomRoutine('');
              }}
              className={`p-2.5 rounded-xl border font-bold text-right transition-all ${
                routine === item.id && !customRoutine
                  ? 'border-[#1B4332] bg-[#1B4332] text-white'
                  : 'border-[#E8DEC8] bg-[#FAF7F0] text-[#1F2421]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div>
          <input
            type="text"
            value={customRoutine}
            onChange={(e) => {
              setCustomRoutine(e.target.value);
              setRoutine('custom');
            }}
            placeholder="أو اكتب عادة مخصصة أخرى..."
            className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E8DEC8] text-xs focus:outline-none focus:border-[#1B4332]"
          />
        </div>

        {/* Preferred time */}
        <div>
          <label className="block text-xs font-semibold text-[#1B4332] mb-1">
            الوقت المفضل للقراءة (للتذكير اللطيف):
          </label>
          <input
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#E8DEC8] text-xs text-[#1F2421] focus:outline-none focus:border-[#1B4332]"
          />
        </div>

        <button
          onClick={handleSaveHabit}
          className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white text-xs font-bold transition-all shadow-xs"
        >
          حفظ إعدادات العادة
        </button>
      </div>

      {/* 3. BROWSER PUSH NOTIFICATIONS */}
      <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B4332]">إشعارات المتصفح اللطيفة</h3>
              <span className="text-[11px] text-[#556B2F]">تذكير فقط بدون أي إزعاج أو إعلانات</span>
            </div>
          </div>

          <button
            onClick={handleToggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notificationSettings.browserPushEnabled ? 'bg-[#1B4332]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notificationSettings.browserPushEnabled ? '-translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Notification details */}
        <div className="space-y-2 text-xs text-[#1F2421]">
          <div className="flex items-center justify-between py-1 border-b border-[#E8DEC8]/40">
            <span>تذكير الموعد المفضل المجدول</span>
            <span className="text-[#8C6D37] font-semibold">{preferredTime}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#E8DEC8]/40">
            <span>تنبيه نهاية اليوم لوضع الدقيقتين إذا لم تقرأ</span>
            <span className="text-emerald-700 font-semibold">مفعل</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span>حالة الإذن بالمتصفح:</span>
            <span className="font-bold text-[#1B4332]">
              {notifPermission === 'granted' ? 'مسموح بها ✅' : notifPermission === 'denied' ? 'محظورة ❌' : 'بحاجة للموافقة ⚠️'}
            </span>
          </div>
        </div>

        <button
          onClick={handleSendTestNotification}
          className="w-full py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#E8DEC8]/60 text-[#1B4332] text-xs font-bold border border-[#E8DEC8] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5 text-[#C4A674]" />
          <span>تجربة إشعار تذكير الآن</span>
        </button>
      </div>

      {/* 4. OFFLINE STORAGE & MUSHAF DOWNLOAD */}
      <OfflineStorageSection />

      {/* 4.5. INSTALL AS MOBILE / DESKTOP APP */}
      <PWAInstallButton variant="card" />

      {/* 5. ACCOUNT SETTINGS */}
      <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8DEC8]/60">
          <div className="w-8 h-8 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1B4332]">الحساب والمزامنة السحابية</h3>
            <span className="text-[11px] text-[#556B2F]">حفظ تقدمك عبر الهاتف والكمبيوتر</span>
          </div>
        </div>

        {currentUser ? (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8]">
              <span className="text-[10px] text-[#8C6D37] block">البريد الإلكتروني المسجل</span>
              <span className="font-bold text-[#1B4332] font-mono text-sm">{currentUser.email}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleResetPassword}
                className="flex-1 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#E8DEC8]/50 text-[#1B4332] font-bold border border-[#E8DEC8] flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>إعادة تعيين كلمة المرور</span>
              </button>

              <button
                onClick={() => signOut()}
                className="py-2 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-[#556B2F] leading-relaxed">
              أنت تستخدم التطبيق حالياً كـ (ضيف). بياناتك محفوظة محلياً في هذا المتصفح. سجّل حسابك لتتمكن من فتح نفس موضع القراءة وسجل العادات من أي جهاز آخر!
            </p>
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>تسجيل الدخول أو إنشاء حساب جديد</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
