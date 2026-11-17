import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  ChevronLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sliders,
  HeartHandshake,
  Check,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabit, getTodayString } from '../../context/HabitContext';
import {
  formatArabicNumber,
  formatMinutesGoalLabel,
  formatReadingDuration,
  TIME_GOAL_OPTIONS,
} from '../../data/quranMetadata';

interface DashboardProps {
  onOpenReader: () => void;
  onOpenTwoMinutes: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenReader,
  onOpenTwoMinutes,
  onOpenHistory,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const isAuthenticated = Boolean(currentUser && !currentUser.isAnonymous);

  const {
    goal,
    progress,
    todayMinutesRead,
    isTodayChecked,
    habitSettings,
    updateGoal,
    toggleDayCheck,
    historyMap,
  } = useHabit();

  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [selectedTarget, setSelectedTarget] = useState<number>(goal.dailyTarget || 5);

  const todayStr = getTodayString();

  // Time-based progress calculation (count time, not pages)
  const targetMinutes = goal.dailyTarget || 5;
  const progressRatio = Math.min(1, todayMinutesRead / targetMinutes);
  const progressPercent = Math.round(progressRatio * 100);
  const remainingMinutes = Math.max(0, Math.round((targetMinutes - todayMinutesRead) * 100) / 100);
  const isGoalFinished = isTodayChecked || todayMinutesRead >= targetMinutes;

  const handleSaveGoal = async () => {
    await updateGoal('minutes', selectedTarget);
    setShowGoalModal(false);
  };

  const handleToggleTodayCheck = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    await toggleDayCheck(todayStr, !isTodayChecked);
  };

  // Calendar mini-month helper
  const renderMiniCalendar = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = i === today.getDate();
      const hist = historyMap[dateStr];
      const isChecked = Boolean(hist?.isChecked ?? hist?.isDailyGoalCompleted);
      const isTwoMin = Boolean(hist?.isTwoMinuteGoalCompleted && !isChecked);
      const hasRead = Boolean(hist && ((hist.minutesRead || 0) > 0 || isChecked || isTwoMin));

      days.push({
        dayNum: i,
        dateStr,
        isToday,
        hasRead,
        isChecked,
        isTwoMin,
      });
    }

    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];

    return (
      <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8DEC8]/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4332]">
            <CalendarIcon className="w-4 h-4 text-[#C4A674]" />
            <span>شهر {monthNames[currentMonth]} {formatArabicNumber(currentYear)}</span>
          </div>
          <button
            onClick={onOpenHistory}
            className="text-[11px] font-semibold text-[#8C6D37] hover:text-[#1B4332] flex items-center gap-1 transition-colors"
          >
            <span>عرض السجل وتحديد الأيام</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((dn) => (
            <span key={dn} className="text-[10px] text-[#8C6D37] font-medium pb-1">
              {dn}
            </span>
          ))}

          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-8 w-8" />
          ))}

          {/* Month days */}
          {days.map((d) => (
            <button
              key={d.dayNum}
              type="button"
              onClick={() => {
                if (d.isToday && isAuthenticated) {
                  toggleDayCheck(d.dateStr, !d.isChecked);
                } else {
                  onOpenHistory();
                }
              }}
              className={`relative h-8 w-8 mx-auto rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                d.isChecked
                  ? 'bg-[#1B4332] text-[#FAF7F0] shadow-2xs font-bold'
                  : d.isTwoMin
                  ? 'bg-[#C4A674] text-[#1B4332] font-bold'
                  : d.hasRead
                  ? 'bg-[#2D6A4F]/20 text-[#1B4332]'
                  : d.isToday
                  ? 'border border-[#1B4332] text-[#1B4332] font-bold'
                  : 'text-[#6B7280] hover:bg-[#FAF7F0]'
              }`}
              title={
                d.isChecked
                  ? `يوم ${d.dayNum}: ✓ تمت القراءة`
                  : d.isTwoMin
                  ? `يوم ${d.dayNum}: تم وضع الدقيقتين`
                  : d.hasRead
                  ? `يوم ${d.dayNum}: تمت القراءة`
                  : `يوم ${d.dayNum}`
              }
            >
              <span>{formatArabicNumber(d.dayNum)}</span>
              {d.isChecked && (
                <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#C4A674] text-[#1B4332] flex items-center justify-center shadow-2xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Friendly subtle Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-2 border-t border-[#E8DEC8]/50 text-[10px] text-[#556B2F]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
              <Check className="w-2 h-2 stroke-[3]" />
            </span>
            <span>يوم عليه علامة صح ✓</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C4A674]" />
            <span>وضع الدقيقتين</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border border-[#1B4332]" />
            <span>اليوم الحالي</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

      {/* Pre-reading Sign-in Prompt if not logged in */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-[#FDFBF7] border-2 border-[#C4A674] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1B4332]">سجّل دخولك قبل القراءة</h3>
              <p className="text-[11px] text-[#556B2F] mt-0.5">
                لحفظ وقت قراءتك، وضع علامة الصح على أيامك، وحفظ الصفحة التي توقفت عندها.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-xs font-bold shrink-0 shadow-xs transition-all"
          >
            تسجيل الدخول
          </button>
        </div>
      )}

      {/* 1. DAILY READING TIME GOAL HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B4332] to-[#16382B] text-[#FAF7F0] p-5 sm:p-6 shadow-md border border-[#C4A674]/30">
        
        {/* Subtle decorative background watermark */}
        <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full bg-[#C4A674]/10 blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#C4A674]/20 text-[#C4A674] border border-[#C4A674]/30 mb-1.5">
              ورد الوقت اليومي
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-reading">
              {`وردك اليوم: ${formatMinutesGoalLabel(targetMinutes)}`}
            </h2>
            <p className="text-xs text-[#C4A674]/90 mt-1">
              {!isAuthenticated
                ? 'سجّل دخولك لبدء القراءة وحساب وقتك اليومي تلقائياً'
                : isGoalFinished
                ? `الحمد لله! قرأت ${formatReadingDuration(todayMinutesRead)} وأتممت وردك اليومي.`
                : todayMinutesRead > 0
                ? `قرأت اليوم ${formatReadingDuration(todayMinutesRead)} • متبقي ${formatReadingDuration(remainingMinutes)}`
                : `لم تبدأ القراءة اليوم بعد • الهدف ${formatMinutesGoalLabel(targetMinutes)}`}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedTarget(targetMinutes);
              setShowGoalModal(true);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF7F0] border border-white/10 transition-colors shadow-2xs"
            title="تعديل مدة الورد اليومي"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Time Progress Bar */}
        <div className="space-y-1.5 my-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#E8DEC8]">
            <span>الوقت المقروء اليوم ({formatReadingDuration(todayMinutesRead)})</span>
            <span>{formatArabicNumber(progressPercent)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden p-0.5 border border-[#C4A674]/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C4A674] to-[#E8DEC8] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Primary Actions: Start Reading & Don't Miss Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={onOpenReader}
            className="w-full py-3 px-4 rounded-2xl bg-[#C4A674] hover:bg-[#D4AF37] text-[#1B4332] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isAuthenticated ? 'ابدأ القراءة الآن' : 'سجّل دخولك وابدأ القراءة'}</span>
          </button>

          <button
            onClick={onOpenTwoMinutes}
            className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FAF7F0] border border-white/20 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-[#C4A674]" />
            <span>وضع الدقيقتين (Don't Miss)</span>
          </button>
        </div>

      </div>

      {/* 2. TODAY'S MANUAL CHECKMARK TOGGLE CARD */}
      <button
        type="button"
        onClick={handleToggleTodayCheck}
        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-right shadow-xs ${
          isTodayChecked
            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
            : 'bg-white border-[#E8DEC8] hover:border-[#C4A674] text-[#1B4332]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
              isTodayChecked
                ? 'bg-[#1B4332] text-[#C4A674] border-[#1B4332]'
                : 'bg-[#FAF7F0] text-[#8C6D37] border-[#E8DEC8]'
            }`}
          >
            <Check className={`w-5 h-5 ${isTodayChecked ? 'stroke-[3]' : ''}`} />
          </div>
          <div>
            <div className="font-bold text-sm">
              {isTodayChecked ? '✓ تمت قراءة اليوم (علامة الصح مفعّلة)' : 'وضع علامة الصح (✓) على قراءة اليوم'}
            </div>
            <p className="text-[11px] text-[#556B2F] mt-0.5">
              {!isAuthenticated
                ? 'سجّل دخولك لتسجيل علامة الصح وحفظ تقدمك في حسابك'
                : isTodayChecked
                ? 'بارك الله فيك! اضغط هنا إذا أردت تعديل الحالة أو إلغاء العلامة'
                : 'اضغط هنا لوضع علامة صح على اليوم في سجل قراءتك'}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
            isTodayChecked
              ? 'bg-[#1B4332] text-[#FAF7F0]'
              : 'bg-[#FAF7F0] text-[#1B4332] border border-[#C4A674]'
          }`}
        >
          {isTodayChecked ? 'مكتمل ✓' : 'تحديد ✓'}
        </span>
      </button>

      {/* 3. LAST STOPPED PAGE CARD */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#1B4332] border border-[#E8DEC8] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#8C6D37]" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8C6D37] block">آخر صفحة توقفت عندها</span>
            {isAuthenticated ? (
              <div className="font-bold text-sm text-[#1B4332]">
                سورة {progress.lastSurahName || 'الفاتحة'} • صفحة {formatArabicNumber(progress.lastPage || 1)}
                {progress.lastAyah && progress.lastAyah > 1 && (
                  <span className="text-xs font-normal text-[#556B2F]"> (آية {formatArabicNumber(progress.lastAyah)})</span>
                )}
              </div>
            ) : (
              <div className="text-xs font-medium text-[#556B2F]">
                سجّل دخولك لحفظ الصفحة التي تتوقف عندها واستئنافها في أي وقت
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onOpenReader}
          className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#1B4332] text-[#1B4332] hover:text-[#FAF7F0] border border-[#E8DEC8] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0"
        >
          <span>{isAuthenticated ? 'استئناف' : 'دخول'}</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. HABIT STACKING REMINDER CARD */}
      <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#C4A674]/50 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8C6D37] block">ربط العادات اليومية</span>
            <p className="font-bold text-xs text-[#1B4332] mt-0.5">
              {habitSettings.habitStatement || 'قراءتك مرتبطة بروتينك اليومي المختار.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-[11px] font-semibold text-[#8C6D37] hover:underline shrink-0"
        >
          تغيير
        </button>
      </div>

      {/* 5. COMPACT READING CALENDAR */}
      {renderMiniCalendar()}

      {/* 6. QUICK TIME-BASED GOAL ADJUSTMENT MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FDFBF7] rounded-3xl border border-[#E8DEC8] shadow-2xl p-6 text-right space-y-4">
            <h3 className="font-bold text-base text-[#1B4332]">تعديل مدة الورد اليومي</h3>
            <p className="text-xs text-[#556B2F]">
              اختر عدد الدقائق اليومية الأنسب لظروف يومك. التغيير مرن ومتاح في أي وقت.
            </p>

            {/* Time Target Options */}
            <div className="grid grid-cols-2 gap-2">
              {TIME_GOAL_OPTIONS.map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setSelectedTarget(item.val)}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    selectedTarget === item.val
                      ? 'border-[#1B4332] bg-[#1B4332] text-white shadow-2xs'
                      : 'border-[#E8DEC8] bg-white text-[#1F2421] hover:border-[#C4A674]'
                  }`}
                >
                  <span className="font-bold text-xs">{item.label}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      selectedTarget === item.val ? 'text-[#C4A674]' : 'text-[#8C6D37]'
                    }`}
                  >
                    {item.sublabel}
                  </span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DEC8]">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C6D37] hover:bg-[#E8DEC8]/40"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="px-5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#16382B]"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
