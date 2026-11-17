import React, { useState } from 'react';
import { Sparkles, Clock, HeartHandshake, Bell, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useHabit } from '../../context/HabitContext';
import { requestBrowserNotificationPermission } from '../../services/notificationService';
import { formatMinutesGoalLabel, TIME_GOAL_OPTIONS } from '../../data/quranMetadata';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onFinish }) => {
  const { updateGoal, updateHabitSettings, updateNotificationSettings, completeOnboarding } = useHabit();

  const [step, setStep] = useState<number>(1);
  const [dailyTarget, setDailyTarget] = useState<number>(5);
  const [selectedRoutine, setSelectedRoutine] = useState<string>('after_fajr');
  const [customRoutine, setCustomRoutine] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('06:00');
  const [notificationState, setNotificationState] = useState<'prompt' | 'granted' | 'skipped'>('prompt');

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step === 2) {
      await updateGoal('minutes', dailyTarget);
    }
    if (step === 5) {
      await updateHabitSettings(selectedRoutine, customRoutine, preferredTime);
    }
    if (step < 6) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      onFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      setNotificationState('granted');
      await updateNotificationSettings({ browserPushEnabled: true, preferredTime });
    } else {
      setNotificationState('skipped');
    }
    setTimeout(() => {
      completeOnboarding();
      onFinish();
    }, 600);
  };

  const handleSkipNotifications = () => {
    setNotificationState('skipped');
    completeOnboarding();
    onFinish();
  };

  // Habit statement preview
  const routineNames: Record<string, string> = {
    after_fajr: 'صلاة الفجر',
    after_breakfast: 'تناول الإفطار',
    after_lunch: 'تناول الغداء',
    after_isha: 'صلاة العشاء',
    before_sleep: 'النوم',
    after_waking: 'الاستيقاظ',
    custom: customRoutine || 'عادتي اليومية',
  };

  const goalText = formatMinutesGoalLabel(dailyTarget);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl shadow-2xl border-2 border-[#E8DEC8] p-6 sm:p-8 text-right overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E8DEC8]/60">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-[#1B4332]'
                    : s < step
                    ? 'w-3 bg-[#C4A674]'
                    : 'w-2 bg-[#E8DEC8]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-[#8C6D37]">خطوة {step} من ٦</span>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pr-1 pl-1">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-4 py-2 text-center sm:text-right">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center mx-auto sm:mx-0 shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B4332] font-reading">
                خلينا نبني عادة قراءة قرآن تقدر تستمر عليها كل يوم
              </h2>
              <p className="text-sm text-[#556B2F] leading-relaxed">
                الهدف في «وِصال» ليس إنك تقرأ أجزاء كثيرة ثم تنقطع بعد أيام.. بل إنك تجعل القرآن رفيقاً يومياً ثابتاً، حتى في أشد الأيام انشغالاً وقلّة في النشاط.
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8] text-xs text-[#1F2421] space-y-2 text-right">
                <div className="flex items-center gap-2 text-[#1B4332] font-bold">
                  <Check className="w-4 h-4 text-[#2D6A4F]" />
                  <span>الاستمرارية أهم من الكمية</span>
                </div>
                <div className="flex items-center gap-2 text-[#1B4332] font-bold">
                  <Check className="w-4 h-4 text-[#2D6A4F]" />
                  <span>البداية السهلة تحمي العادة من التسويف</span>
                </div>
                <div className="flex items-center gap-2 text-[#1B4332] font-bold">
                  <Check className="w-4 h-4 text-[#2D6A4F]" />
                  <span>لا تراكم للواجبات ولا شعور بالذنب أبداً</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE TIME GOAL */}
          {step === 2 && (
            <div className="space-y-4 py-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B4332]">كم دقيقة تحب تقرأ يومياً؟</h3>
                  <p className="text-xs text-[#556B2F]">نعدّ وقت قراءتك بالدقائق دون أي ضغط بالصفحات</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {TIME_GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDailyTarget(opt.val)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      dailyTarget === opt.val
                        ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332] font-bold shadow-xs'
                        : 'border-[#E8DEC8] bg-white text-[#1F2421] hover:border-[#C4A674]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">{opt.label}</div>
                      <div className="text-[11px] text-[#8C6D37] mt-0.5">{opt.sublabel}</div>
                    </div>
                    <div className="text-[10px] text-[#556B2F] mt-2 pt-1 border-t border-[#E8DEC8]/60">
                      {opt.hint}
                    </div>
                  </button>
                ))}
              </div>

              {/* Important Goal Setting Advice */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#C4A674]/50 text-xs text-[#8C6D37] leading-relaxed">
                💡 <strong>نصيحة ذهبية:</strong> «اختار وقتاً تقدر تحافظ عليه حتى في الأيام المزدحمة.» بإمكانك دائماً تعديل مدة الورد أو وضع علامة الصح على يومك في أي وقت.
              </div>
            </div>
          )}

          {/* STEP 3: THE TWO-MINUTE RULE */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#C4A674]/20 text-[#8C6D37] flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#1B4332]" />
              </div>
              <h3 className="text-xl font-bold text-[#1B4332]">قاعدة الدقيقتين (Don't Miss Mode)</h3>
              <p className="text-sm text-[#556B2F] leading-relaxed">
                في كتاب «العادات الذرية»، السر الأكبر للبقاء هو ألا تنقطع أبداً.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-xs space-y-2 text-xs text-[#1F2421]">
                <p className="leading-relaxed">
                  إذا جاء المساء أو كنت مجهداً جداً ومفيش وقت لوردك المعتاد:
                </p>
                <div className="p-3 rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/20 font-bold text-[#1B4332] text-sm">
                  «اضغط على وضع الدقيقتين واقرأ دقيقتين بس»
                </div>
                <p className="text-[#556B2F] leading-relaxed">
                  دقيقتان تكفي للحفاظ على صلتك بكتاب الله وتحمي عادة القراءة من الموت، بدون أي شعور بالذنب أو تراكم صفحات لليوم التالي.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: HABIT STACKING */}
          {step === 4 && (
            <div className="space-y-4 py-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B4332]">ربط العادات (Habit Stacking)</h3>
                  <p className="text-xs text-[#556B2F]">إيه الفعل اللي بتعمله كل يوم ونقدر نربط قراءة القرآن بيه؟</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'after_fajr', label: 'بعد صلاة الفجر' },
                  { id: 'after_breakfast', label: 'بعد تناول الإفطار' },
                  { id: 'after_lunch', label: 'بعد تناول الغداء' },
                  { id: 'after_isha', label: 'بعد صلاة العشاء' },
                  { id: 'before_sleep', label: 'قبل النوم مباشرة' },
                  { id: 'after_waking', label: 'بعد الاستيقاظ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoutine(item.id);
                      setCustomRoutine('');
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all font-semibold ${
                      selectedRoutine === item.id && !customRoutine
                        ? 'border-[#1B4332] bg-[#1B4332] text-white shadow-xs'
                        : 'border-[#E8DEC8] bg-white text-[#1F2421] hover:border-[#C4A674]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Custom Routine Option */}
              <div>
                <input
                  type="text"
                  value={customRoutine}
                  onChange={(e) => {
                    setCustomRoutine(e.target.value);
                    setSelectedRoutine('custom');
                  }}
                  placeholder="أو اكتب عادة يومية أخرى (مثال: بعد فنجان القهوة)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DEC8] text-xs text-[#1F2421] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              {/* Formula Statement */}
              <div className="p-3.5 rounded-2xl bg-[#E8DEC8]/40 border border-[#C4A674] text-xs text-[#1B4332]">
                <div className="font-bold text-[11px] text-[#8C6D37] mb-1">صيغة العادة الخاصة بك:</div>
                <div className="font-bold text-sm leading-relaxed">
                  «بعد ما أخلص {routineNames[selectedRoutine]}، هقرأ {goalText} من القرآن.»
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PREFERRED TIME */}
          {step === 5 && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B4332]">إمتى تحب تقرأ وردك؟</h3>
                  <p className="text-xs text-[#556B2F]">يمكنك اختيار وقت تقريبي يساعدك على التذكر</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { time: '05:30', label: 'الفجر (٥:٣٠ ص)' },
                  { time: '08:00', label: 'الصباح (٨:٠٠ ص)' },
                  { time: '13:30', label: 'الظهر (١:٣٠ م)' },
                  { time: '17:00', label: 'العصر (٥:٠٠ م)' },
                  { time: '20:30', label: 'العشاء (٨:٣٠ م)' },
                  { time: '22:30', label: 'المساء (١٠:٣٠ م)' },
                ].map((item) => (
                  <button
                    key={item.time}
                    type="button"
                    onClick={() => setPreferredTime(item.time)}
                    className={`p-2.5 rounded-xl border text-center transition-all font-semibold ${
                      preferredTime === item.time
                        ? 'border-[#1B4332] bg-[#1B4332] text-white shadow-xs'
                        : 'border-[#E8DEC8] bg-white text-[#1F2421] hover:border-[#C4A674]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#1B4332] mb-1">أو اختر وقتاً محدداً:</label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DEC8] text-sm text-[#1F2421] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
          )}

          {/* STEP 6: NOTIFICATIONS PERMISSION */}
          {step === 6 && (
            <div className="space-y-4 py-2 text-center sm:text-right">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center mx-auto sm:mx-0 shadow-md">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1B4332]">إشعارات لطيفة لتثبيت العادة</h3>
              <p className="text-xs text-[#556B2F] leading-relaxed">
                لا نرسل إعلانات أو إزعاجاً. فقط تذكير لطيف في موعد وردك اليومي، أو قبل نهاية اليوم إذا كنت مشغولاً لتفعيل «وضع الدقيقتين».
              </p>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] text-xs text-[#1F2421] text-right space-y-2">
                <div className="flex items-center gap-2 text-[#2D6A4F] font-bold">
                  <Check className="w-4 h-4" />
                  <span>تتوقف التنبيهات تلقائياً بمجرد إتمام ورد اليوم</span>
                </div>
                <div className="flex items-center gap-2 text-[#2D6A4F] font-bold">
                  <Check className="w-4 h-4" />
                  <span>يمكنك إيقافها أو تعديل موعدها في أي وقت من الإعدادات</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>تفعيل التذكير اللطيف بالمتصفح</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkipNotifications}
                  className="w-full py-2.5 rounded-xl bg-transparent hover:bg-[#E8DEC8]/40 text-[#8C6D37] text-xs font-semibold transition-all"
                >
                  تخطي الآن والمتابعة للوحة التحكم
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        {step < 6 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E8DEC8]/60">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#8C6D37] hover:bg-[#E8DEC8]/40 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-xs font-bold shadow-sm transition-all"
            >
              <span>{step === 5 ? 'الخطوة الأخيرة' : 'التالي'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
