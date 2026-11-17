import React from 'react';
import { Clock, Sparkles, BookOpen, X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useHabit } from '../../context/HabitContext';
import { formatArabicNumber } from '../../data/quranMetadata';

interface DontMissModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const DontMissModal: React.FC<DontMissModalProps> = ({ isOpen, onClose, onStart }) => {
  const { progress } = useHabit();

  if (!isOpen) return null;

  const handleStart = () => {
    onClose();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl shadow-2xl border-2 border-[#C4A674] p-6 text-right overflow-hidden">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-[#8C6D37] hover:bg-[#E8DEC8]/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center mb-4 shadow-md">
          <Clock className="w-7 h-7" />
        </div>

        {/* Title & Copy */}
        <h3 className="text-xl font-bold text-[#1B4332] font-reading mb-1">
          لسه مفيش وقت؟ اقرأ دقيقتين بس
        </h3>
        
        <p className="text-xs text-[#556B2F] leading-relaxed mb-4">
          قاعدة الدقيقتين من كتاب «العادات الذرية»: دقيقتان فقط تحمي الرابط الروحي بينك وبين كتاب الله في أكثر الأيام ازدحاماً أو إرهاقاً.
        </p>

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8] space-y-2.5 mb-5 text-xs text-[#1F2421]">
          <div className="flex items-center gap-2 text-[#1B4332] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            <span>سيفتح المصحف عند صفحة {formatArabicNumber(progress.lastPage || 1)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#1B4332] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            <span>عداد هادئ لمدة دقيقتين دون أي إزعاج أو ضغط</span>
          </div>
          <div className="flex items-center gap-2 text-[#1B4332] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            <span>يمكنك التوقف بعد الدقيقتين أو متابعة القراءة براحتك</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>ابدأ الدقيقتين الآن</span>
            <ArrowLeft className="w-4 h-4 text-[#C4A674]" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs text-[#8C6D37] hover:underline"
          >
            العودة لاحقاً
          </button>
        </div>

      </div>
    </div>
  );
};
