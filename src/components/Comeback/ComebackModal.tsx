import React from 'react';
import { Heart, Sparkles, BookOpen, Clock, ArrowLeft, X } from 'lucide-react';
import { useHabit } from '../../context/HabitContext';
import { formatArabicNumber } from '../../data/quranMetadata';

interface ComebackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartReading: () => void;
  onStartTwoMinutes: () => void;
}

export const ComebackModal: React.FC<ComebackModalProps> = ({
  isOpen,
  onClose,
  onStartReading,
  onStartTwoMinutes,
}) => {
  const { progress, goal, updateGoal, daysSinceLastRead } = useHabit();

  if (!isOpen) return null;

  const handleStartEasyTwoMinutes = () => {
    onClose();
    onStartTwoMinutes();
  };

  const handleResumeNormal = () => {
    onClose();
    onStartReading();
  };

  const handleReduceGoal = async () => {
    if (goal.dailyTarget > 5) {
      await updateGoal('minutes', 5);
    }
    onClose();
    onStartReading();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl shadow-2xl border-2 border-[#C4A674] p-6 text-right overflow-hidden">
        
        {/* Subtle decorative top glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1B4332] via-[#C4A674] to-[#1B4332]" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-[#8C6D37] hover:bg-[#E8DEC8]/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mb-4 border border-[#C4A674]/30 shadow-xs">
          <Heart className="w-7 h-7 text-[#1B4332] fill-[#C4A674]/20" />
        </div>

        {/* Main Arabic Message */}
        <h3 className="text-xl font-bold text-[#1B4332] font-reading mb-2">
          وحشتنا قراءتك يا صديقي..
        </h3>
        
        <p className="text-sm text-[#556B2F] leading-relaxed mb-4">
          «مش محتاج تعوض اللي فات أبداً، ولا فيه أي تراكم واجبات.. ابدأ النهارده من جديد بالقدر اللي يناسبك وبكل راحة.»
        </p>

        {/* Friendly Inactivity Context */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8] text-xs text-[#1F2421] space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-[#8C6D37] font-semibold">
            <span>آخر موضع وقفت عنده:</span>
            <span className="text-[#1B4332] font-bold">
              سورة {progress.lastSurahName || 'الفاتحة'} • ص {formatArabicNumber(progress.lastPage || 1)}
            </span>
          </div>
          <p className="text-[11px] text-[#556B2F] pt-1 border-t border-[#E8DEC8]/60">
            القرآن ينتظرك دائماً.. دقيقة أو دقيقتان اليوم ستعيد فتح الباب بينك وبينه.
          </p>
        </div>

        {/* Options to Resume Comfortably */}
        <div className="space-y-2.5">
          {/* Option A: Two-Minute rule start */}
          <button
            onClick={handleStartEasyTwoMinutes}
            className="w-full p-3.5 rounded-2xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-right flex items-center justify-between shadow-md transition-all group"
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C4A674]" />
                <span>ابدأ بدقيقتين بس النهارده</span>
              </div>
              <div className="text-[11px] text-[#C4A674] mt-0.5">
                قراءة خفيفة بدون أي ضغط لإحياء العادة
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-[#C4A674] group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Option B: Resume regular portion */}
          <button
            onClick={handleResumeNormal}
            className="w-full p-3 rounded-2xl bg-white hover:bg-[#FAF7F0] border border-[#E8DEC8] text-right flex items-center justify-between transition-all"
          >
            <div>
              <div className="font-bold text-xs text-[#1B4332] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#8C6D37]" />
                <span>استئناف وردي المعتاد</span>
              </div>
              <div className="text-[11px] text-[#556B2F]">
                متابعة القراءة من صفحة {formatArabicNumber(progress.lastPage || 1)}
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-[#8C6D37]" />
          </button>

          {/* Option C: Ease the goal if needed */}
          {goal.dailyTarget > 5 && (
            <button
              onClick={handleReduceGoal}
              className="w-full py-2 text-center text-xs text-[#8C6D37] hover:underline hover:text-[#1B4332]"
            >
              تخفيف الورد اليومي مؤقتاً لتسهيل العودة
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
