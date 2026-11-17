import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  BookOpen,
  Share2,
  Check,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  HardDriveDownload,
  DownloadCloud,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { fetchTafsirSaadi, downloadFullTafsir, isTafsirDownloadRunning } from '../../services/tafsirApi';
import { getAyahQuranText } from '../../services/quranApi';
import { getTafsirFromDB, getCachedTafsirCount } from '../../services/quranStorage';
import { TafsirVerse } from '../../types';
import { formatArabicNumber, SURAH_LIST } from '../../data/quranMetadata';

interface TafsirDrawerProps {
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadModal?: () => void;
}

export const TafsirDrawer: React.FC<TafsirDrawerProps> = ({
  surahNumber: initialSurah,
  ayahNumber: initialAyah,
  ayahText: initialAyahText,
  isOpen,
  onClose,
  onOpenDownloadModal,
}) => {
  const [currentSurah, setCurrentSurah] = useState<number>(initialSurah);
  const [currentAyah, setCurrentAyah] = useState<number>(initialAyah);
  const [currentAyahText, setCurrentAyahText] = useState<string>(initialAyahText);

  const [loading, setLoading] = useState<boolean>(true);
  const [tafsir, setTafsir] = useState<TafsirVerse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFromOffline, setIsFromOffline] = useState<boolean>(false);

  // Offline Book Download prompt state
  const [cachedTafsirCount, setCachedTafsirCount] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(isTafsirDownloadRunning());
  const [downloadProgress, setDownloadProgress] = useState<{
    loadedSurahs: number;
    totalSurahs: number;
    loadedAyahs: number;
    finished: boolean;
  }>({
    loadedSurahs: 0,
    totalSurahs: 114,
    loadedAyahs: 0,
    finished: false,
  });

  // Sync state if props change
  useEffect(() => {
    setCurrentSurah(initialSurah);
    setCurrentAyah(initialAyah);
    setCurrentAyahText(initialAyahText);
  }, [initialSurah, initialAyah, initialAyahText]);

  // Check how many ayahs of Tafsir are cached locally
  const checkCachedStatus = useCallback(async () => {
    try {
      const count = await getCachedTafsirCount();
      setCachedTafsirCount(count);
      if (count >= 6200) {
        setDownloadProgress((prev) => ({ ...prev, loadedAyahs: count, finished: true }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkCachedStatus();
    }
  }, [isOpen, checkCachedStatus]);

  const surahMeta = SURAH_LIST.find((s) => s.number === currentSurah) || SURAH_LIST[0];
  const maxAyahs = surahMeta?.numberOfAyahs || 1;

  // Load Tafsir for current Ayah
  const loadTafsir = useCallback(async (sNum: number, aNum: number, aText: string) => {
    setLoading(true);
    setError(null);

    // 1. Check if already cached in IndexedDB
    try {
      const dbRecord = await getTafsirFromDB(sNum, aNum);
      if (dbRecord && dbRecord.tafsirText) {
        setIsFromOffline(true);
      } else {
        setIsFromOffline(false);
      }
    } catch {
      setIsFromOffline(false);
    }

    let textToUse = aText;
    if (!textToUse) {
      try {
        const fetched = await getAyahQuranText(sNum, aNum);
        if (fetched) {
          textToUse = fetched;
          setCurrentAyahText(fetched);
        }
      } catch {}
    }

    try {
      const data = await fetchTafsirSaadi(sNum, aNum, textToUse);
      setTafsir(data);
      // Re-verify cached count after fetch (background caching may have added items)
      checkCachedStatus();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'تعذر تحميل تفسير السعدي لهذه الآية حالياً. يرجى التحقق من الاتصال بالإنترنت أو تحميل الكتاب أوفلاين.');
    } finally {
      setLoading(false);
    }
  }, [checkCachedStatus]);

  useEffect(() => {
    if (!isOpen || !currentSurah || !currentAyah) return;
    loadTafsir(currentSurah, currentAyah, currentAyahText);
  }, [isOpen, currentSurah, currentAyah, currentAyahText, loadTafsir]);

  // Trigger inline download of the entire Tafsir Al-Saadi book
  const handleStartDownloadTafsir = async () => {
    setIsDownloading(true);
    setDownloadProgress({
      loadedSurahs: 0,
      totalSurahs: 114,
      loadedAyahs: cachedTafsirCount,
      finished: false,
    });

    const res = await downloadFullTafsir((loadedSurahs, totalSurahs, loadedAyahs) => {
      setDownloadProgress({
        loadedSurahs,
        totalSurahs,
        loadedAyahs,
        finished: false,
      });
      setCachedTafsirCount(loadedAyahs);
    });

    setIsDownloading(false);
    setDownloadProgress((prev) => ({
      ...prev,
      finished: res.success || res.loadedSurahs >= 114,
    }));
    setCachedTafsirCount(res.totalAyahs);
    setIsFromOffline(true);
  };

  if (!isOpen) return null;

  const handleNextAyah = () => {
    if (currentAyah < maxAyahs) {
      const nextAyah = currentAyah + 1;
      setCurrentAyah(nextAyah);
      setCurrentAyahText('');
    }
  };

  const handlePrevAyah = () => {
    if (currentAyah > 1) {
      const prevAyah = currentAyah - 1;
      setCurrentAyah(prevAyah);
      setCurrentAyahText('');
    }
  };

  const handleCopy = () => {
    if (!tafsir) return;
    const textToCopy = `﴿${currentAyahText || tafsir.ayahText}﴾ [${tafsir.surahName}: ${currentAyah}]\n\nتفسير السعدي (تيسير الكريم الرحمن):\n${tafsir.tafsirText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBookFullyDownloaded = cachedTafsirCount >= 6200 || downloadProgress.finished;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 border-[#C4A674]/80 p-5 sm:p-7 text-right max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1B4332] font-reading">
                  كتاب تفسير السعدي
                </h3>
                {isFromOffline || isBookFullyDownloaded ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>محفوظ أوفلاين</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                    معروض عبر الإنترنت
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#556B2F]">
                تيسير الكريم الرحمن في تفسير كلام المنان • سورة {surahMeta.name} (الآية {formatArabicNumber(currentAyah)} من {formatArabicNumber(maxAyahs)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {tafsir && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl text-[#8C6D37] hover:bg-[#E8DEC8]/50 transition-colors"
                title="نسخ الآية وتفسيرها"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8C6D37] hover:bg-[#E8DEC8]/50 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ayah Navigator Bar */}
        <div className="flex items-center justify-between py-2 border-b border-[#E8DEC8]/60 text-xs">
          <button
            onClick={handlePrevAyah}
            disabled={currentAyah <= 1}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-[#E8DEC8] hover:bg-[#FAF7F0] text-[#1B4332] font-semibold transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>الآية السابقة</span>
          </button>

          <span className="text-[11px] font-bold text-[#8C6D37]">
            الآية {formatArabicNumber(currentAyah)} من {formatArabicNumber(maxAyahs)}
          </span>

          <button
            onClick={handleNextAyah}
            disabled={currentAyah >= maxAyahs}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-[#E8DEC8] hover:bg-[#FAF7F0] text-[#1B4332] font-semibold transition-colors disabled:opacity-40"
          >
            <span>الآية التالية</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 pl-1">
          
          {/* USER PROMPT: OFFER TO DOWNLOAD THE BOOK IF NOT DOWNLOADED YET */}
          {!isBookFullyDownloaded ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF7F0] to-[#F5EFE0] border-2 border-[#C4A674]/60 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shrink-0">
                    <DownloadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#1B4332]">
                      كتاب تفسير السعدي غير محمّل على جهازك
                    </h4>
                    <p className="text-[11px] text-[#556B2F]">
                      تفسير هذه الآية معروض الآن عبر الإنترنت. هل ترغب في تنزيل كتاب تفسير السعدي كاملاً (٦٢٣٦ آية) ليعمل معك دائماً بغير إنترنت؟
                    </p>
                  </div>
                </div>
              </div>

              {isDownloading ? (
                <div className="space-y-1.5 pt-1.5 bg-white/70 p-2.5 rounded-xl border border-[#E8DEC8]">
                  <div className="flex items-center justify-between text-xs text-[#1B4332]">
                    <span className="font-semibold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4A674]" />
                      <span>جارِ تحميل تفسير السور ({formatArabicNumber(downloadProgress.loadedSurahs)}/١١٤)...</span>
                    </span>
                    <span className="font-mono font-bold text-[#8C6D37]">
                      {formatArabicNumber(downloadProgress.loadedAyahs)} آية
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((downloadProgress.loadedAyahs / 6236) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleStartDownloadTafsir}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5 text-[#C4A674]" />
                    <span>تحميل كتاب تفسير السعدي كاملاً الآن (أوفلاين)</span>
                  </button>
                  {onOpenDownloadModal && (
                    <button
                      onClick={onOpenDownloadModal}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#1B4332] text-xs font-semibold border border-[#E8DEC8] transition-colors"
                    >
                      إدارة التحميلات
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>كتاب تفسير السعدي محفوظ بالكامل على جهازك (٦٢٣٦ آية) وتعمل كل آية دون إنترنت.</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md font-mono">
                أوفلاين جاهز
              </span>
            </div>
          )}

          {/* Ayah Quranic Text Display */}
          {(currentAyahText || tafsir?.ayahText) && (
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#C4A674]/50 shadow-xs">
              <p className="font-quran text-lg sm:text-xl text-[#1B4332] text-center leading-loose">
                ﴿ {currentAyahText || tafsir?.ayahText} ﴾
              </p>
            </div>
          )}

          {/* Tafsir Body Text */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#8C6D37] gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#1B4332]" />
              <span className="text-xs font-semibold">جارِ فتح تفسير الآية من كتاب تفسير السعدي...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200 text-center space-y-2">
              <AlertCircle className="w-5 h-5 mx-auto text-amber-700" />
              <p>{error}</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => loadTafsir(currentSurah, currentAyah, currentAyahText)}
                  className="px-4 py-1.5 rounded-lg bg-[#1B4332] text-white text-xs font-bold hover:bg-[#16382B]"
                >
                  إعادة المحاولة
                </button>
                <button
                  onClick={handleStartDownloadTafsir}
                  className="px-4 py-1.5 rounded-lg bg-[#C4A674] text-[#1B4332] text-xs font-bold hover:bg-[#D4AF37]"
                >
                  تحميل الكتاب أوفلاين
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#8C6D37] border-b border-[#E8DEC8]/60 pb-1.5">
                <span className="flex items-center gap-1.5 text-[#1B4332]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A674]" />
                  <span>تفسير الشيخ عبد الرحمن بن ناصر السعدي</span>
                </span>
                <span className="text-[10px] text-[#556B2F] font-normal">
                  (تيسير الكريم الرحمن في تفسير كلام المنان)
                </span>
              </div>
              <p className="font-reading text-base sm:text-lg text-[#1F2421] leading-relaxed tracking-wide text-justify">
                {tafsir?.tafsirText}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-between text-[11px] text-[#556B2F]">
          <span>المصدر: كتاب تفسير السعدي المعتمد</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1B4332] text-[#FAF7F0] font-bold text-xs hover:bg-[#16382B] transition-colors"
          >
            العودة للمصحف
          </button>
        </div>

      </div>
    </div>
  );
};
