import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabit, getTodayString } from '../../context/HabitContext';
import { formatArabicNumber, formatReadingDuration } from '../../data/quranMetadata';
import { ReadingHistory } from '../../types';

interface HistoryViewProps {
  onOpenAuth?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onOpenAuth }) => {
  const { currentUser } = useAuth();
  const isAuthenticated = Boolean(currentUser && !currentUser.isAnonymous);

  const { historyMap, toggleDayCheck } = useHabit();

  const todayStr = getTodayString();
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  // Aggregated Time & Checkmark Insights (no page counting)
  const historyEntries = Object.values(historyMap);
  const totalCheckedDays = historyEntries.filter(
    (h) => Boolean(h.isChecked ?? h.isDailyGoalCompleted)
  ).length;
  const totalDaysRead = historyEntries.filter(
    (h) => (h.minutesRead || 0) > 0 || h.isChecked || h.isDailyGoalCompleted || h.isTwoMinuteGoalCompleted
  ).length;
  const totalMinutesRead = historyEntries.reduce((sum, h) => sum + (h.minutesRead || 0), 0);

  const selectedRecord: ReadingHistory | undefined = historyMap[selectedDateStr];
  const isSelectedChecked = Boolean(
    selectedRecord && (selectedRecord.isChecked ?? selectedRecord.isDailyGoalCompleted)
  );
  const isFutureDate = selectedDateStr > todayStr;

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleToggleSelectedDayCheck = async () => {
    if (!isAuthenticated) {
      onOpenAuth?.();
      return;
    }
    if (isFutureDate) return;
    await toggleDayCheck(selectedDateStr, !isSelectedChecked);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-24 text-right">

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#1B4332] font-reading">سجل القراءة وعلامات الصح</h2>
        <p className="text-xs text-[#556B2F] mt-0.5">
          تابع وقت قراءتك، وضع علامة الصح (✓) على كل يوم قرأت فيه، وراجع آخر صفحة توقفت عندها
        </p>
      </div>

      {/* Sign-in prompt if not authenticated */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#C4A674] flex items-center justify-between gap-3">
          <div className="text-xs text-[#1B4332]">
            <span className="font-bold block">سجّل دخولك لعرض وحفظ سجل القراءة</span>
            <span className="text-[#556B2F]">تُحفظ أيامك وأوقات القراءة وعلامات الصح في حسابك دائماً.</span>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl bg-[#1B4332] text-[#FAF7F0] text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>دخول</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Peaceful Personal Insights Cards (Time & Checkmarks — no pages counter) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#1B4332]/10 text-[#1B4332] mx-auto flex items-center justify-center mb-1.5">
            <CalendarIcon className="w-4 h-4 text-[#C4A674]" />
          </div>
          <div className="text-lg font-bold text-[#1B4332] font-reading">
            {formatArabicNumber(totalDaysRead)}
          </div>
          <div className="text-[10px] text-[#556B2F]">أيام القراءة</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#1B4332]/10 text-[#1B4332] mx-auto flex items-center justify-center mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
          </div>
          <div className="text-lg font-bold text-[#1B4332] font-reading">
            {formatArabicNumber(totalCheckedDays)}
          </div>
          <div className="text-[10px] text-[#556B2F]">أيام علامة الصح ✓</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#1B4332]/10 text-[#1B4332] mx-auto flex items-center justify-center mb-1.5">
            <Clock className="w-4 h-4 text-[#C4A674]" />
          </div>
          <div className="text-lg font-bold text-[#1B4332] font-reading">
            {formatArabicNumber(Math.round(totalMinutesRead))}
          </div>
          <div className="text-[10px] text-[#556B2F]">دقيقة مع القرآن</div>
        </div>
      </div>

      {/* 2. Interactive Monthly Calendar */}
      <div className="p-5 rounded-3xl bg-white border border-[#E8DEC8] shadow-xs">

        {/* Month Navigation */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E8DEC8]/60">
          <h3 className="font-bold text-sm text-[#1B4332] flex items-center gap-2">
            <span>{monthNames[month]} {formatArabicNumber(year)}</span>
          </h3>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#8C6D37]"
              title="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-[#FAF7F0] text-[#8C6D37]"
              title="الشهر التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#8C6D37] mb-3">
          اختر أي يوم من التقويم لعرض تفاصيله أو وضع علامة الصح (✓) عليه
        </p>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((dn) => (
            <span key={dn} className="text-[11px] text-[#8C6D37] font-semibold pb-1">
              {dn}
            </span>
          ))}

          {/* Empty pre-month cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`emp-${idx}`} className="h-9 w-9" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDateStr === dStr;
            const rec = historyMap[dStr];
            const isChecked = Boolean(rec && (rec.isChecked ?? rec.isDailyGoalCompleted));
            const isTwoMin = Boolean(rec?.isTwoMinuteGoalCompleted && !isChecked);
            const hasRead = Boolean(rec && (rec.minutesRead || 0) > 0);
            const isTodayCell = dStr === todayStr;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDateStr(dStr)}
                className={`h-9 w-9 mx-auto rounded-xl flex items-center justify-center text-xs transition-all relative ${
                  isSelected
                    ? 'ring-2 ring-[#C4A674] ring-offset-1 font-bold'
                    : ''
                } ${
                  isChecked
                    ? 'bg-[#1B4332] text-[#FAF7F0] font-bold shadow-xs'
                    : isTwoMin
                    ? 'bg-[#C4A674] text-[#1B4332] font-bold shadow-2xs'
                    : hasRead
                    ? 'bg-[#2D6A4F]/20 text-[#1B4332]'
                    : isTodayCell
                    ? 'border border-[#1B4332] text-[#1B4332] font-bold'
                    : 'text-[#6B7280] hover:bg-[#FAF7F0]'
                }`}
              >
                <span>{formatArabicNumber(dayNum)}</span>
                {isChecked && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#C4A674] text-[#1B4332] flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Peaceful Visual Status Guide */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-3 border-t border-[#E8DEC8]/60 text-[11px] text-[#556B2F]">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#1B4332] text-[#C4A674] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span>يوم عليه علامة صح ✓</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#C4A674]" />
            <span>وضع الدقيقتين</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#2D6A4F]/20" />
            <span>قراءة جزئية</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md border border-[#E8DEC8] bg-[#FDFBF7]" />
            <span>يوم دون تسجيل</span>
          </div>
        </div>

      </div>

      {/* 3. Selected Date Details & Manual Checkmark Card */}
      <div className="p-5 rounded-3xl bg-[#FAF7F0] border border-[#C4A674]/50 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
          <span className="text-xs font-bold text-[#1B4332]">
            تفاصيل يوم: {selectedDateStr} {selectedDateStr === todayStr ? '(اليوم)' : ''}
          </span>
          {isSelectedChecked ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>تمت القراءة</span>
            </span>
          ) : selectedRecord?.isTwoMinuteGoalCompleted ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#C4A674]/20 text-[#8C6D37] font-bold border border-[#C4A674]/40">
              تم تفعيل وضع الدقيقتين ⏱️
            </span>
          ) : (
            <span className="text-[11px] text-[#8C6D37]">
              غير محدد بعلامة صح بعد
            </span>
          )}
        </div>

        {/* Manual Checkmark Action Button for Selected Date */}
        {!isFutureDate ? (
          <button
            type="button"
            onClick={handleToggleSelectedDayCheck}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
              isSelectedChecked
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-400'
                : 'bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] border-[#1B4332] shadow-sm'
            }`}
          >
            <Check className={`w-4 h-4 ${isSelectedChecked ? 'text-emerald-700 stroke-[3]' : 'text-[#C4A674] stroke-[3]'}`} />
            <span>
              {!isAuthenticated
                ? 'سجّل دخولك لوضع علامة الصح على هذا اليوم'
                : isSelectedChecked
                ? 'تم وضع علامة الصح على هذا اليوم ✓ (اضغط للإلغاء)'
                : 'وضع علامة الصح (✓) — قرأت في هذا اليوم'}
            </span>
          </button>
        ) : (
          <div className="p-2.5 rounded-xl bg-white/70 border border-[#E8DEC8] text-[11px] text-[#8C6D37] text-center">
            لا يمكن تحديد أيام مستقبلية قبل حلولها.
          </div>
        )}

        {selectedRecord ? (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E8DEC8]">
              <span className="text-[11px] text-[#8C6D37] block">مدة القراءة</span>
              <span className="text-base font-bold text-[#1B4332]">
                {formatReadingDuration(selectedRecord.minutesRead || 0)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E8DEC8]">
              <span className="text-[11px] text-[#8C6D37] block">آخر صفحة توقفت عندها</span>
              <span className="text-sm font-bold text-[#1B4332] flex items-center gap-1 mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-[#C4A674] shrink-0" />
                <span>
                  {selectedRecord.lastPage
                    ? `${selectedRecord.lastSurahName ? `سورة ${selectedRecord.lastSurahName} • ` : ''}ص ${formatArabicNumber(selectedRecord.lastPage)}`
                    : 'لم يُسجَّل موضع'}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#556B2F] leading-relaxed">
            لم تُسجّل قراءة تلقائية في هذا اليوم. إذا قرأت من المصحف الورقي أو في وقت آخر، يمكنك وضع علامة الصح (✓) بالأعلى لحفظ إنجازك.
          </p>
        )}
      </div>

    </div>
  );
};
