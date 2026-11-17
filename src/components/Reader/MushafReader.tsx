import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Clock,
  Compass,
  DownloadCloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  X,
  HardDriveDownload,
  Check,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchQuranPage, downloadFullMushaf } from '../../services/quranApi';
import { downloadFullTafsir, fetchAndCachePageTafsir } from '../../services/tafsirApi';
import { getCachedPagesCount, getCachedTafsirCount } from '../../services/quranStorage';
import { QuranPageData, AyahItem } from '../../types';
import {
  formatArabicNumber,
  formatTimerClock,
  formatReadingDuration,
  getJuzForPage,
  getSurahForPage,
  SURAH_LIST,
  JUZ_LIST,
} from '../../data/quranMetadata';
import { useAuth } from '../../context/AuthContext';
import { useHabit, getTodayString } from '../../context/HabitContext';
import { TafsirDrawer } from './TafsirDrawer';

interface MushafReaderProps {
  onBackToDashboard?: () => void;
  onRequireAuth?: () => void;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  onBackToDashboard,
  onRequireAuth,
}) => {
  const { currentUser } = useAuth();
  const isAuthenticated = Boolean(currentUser && !currentUser.isAnonymous);

  const {
    progress,
    todayMinutesRead,
    isTodayChecked,
    isProgressLoaded,
    saveReadingPosition,
    recordSessionTime,
    toggleDayCheck,
    isTwoMinuteModeActive,
    stopTwoMinuteMode,
    completeTwoMinuteSession,
  } = useHabit();

  const [currentPage, setCurrentPage] = useState<number>(progress.lastPage || 1);
  const [hasHydratedStartPage, setHasHydratedStartPage] = useState<boolean>(false);
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(24);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [selectedAyah, setSelectedAyah] = useState<{ surah: number; ayah: number; text: string } | null>(null);
  const [liveSessionSeconds, setLiveSessionSeconds] = useState<number>(0);

  // Jump Picker state
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerTab, setPickerTab] = useState<'surah' | 'juz' | 'page'>('surah');
  const [pageInput, setPageInput] = useState<string>('');

  // 2-Minute Timer state
  const [twoMinTimeLeft, setTwoMinTimeLeft] = useState<number>(120);
  const [twoMinCompleted, setTwoMinCompleted] = useState<boolean>(false);

  // Offline Download state (Pages & Tafsir)
  const [cachedPagesCount, setCachedPagesCount] = useState<number>(0);
  const [cachedTafsirCount, setCachedTafsirCount] = useState<number>(0);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [downloadModalTab, setDownloadModalTab] = useState<'pages' | 'tafsir'>('pages');

  const [downloadProgress, setDownloadProgress] = useState<{
    loaded: number;
    total: number;
    isDownloading: boolean;
    finished: boolean;
  }>({
    loaded: 0,
    total: 604,
    isDownloading: false,
    finished: false,
  });

  const [tafsirDownloadProgress, setTafsirDownloadProgress] = useState<{
    loadedSurahs: number;
    totalSurahs: number;
    loadedAyahs: number;
    isDownloading: boolean;
    finished: boolean;
  }>({
    loadedSurahs: 0,
    totalSurahs: 114,
    loadedAyahs: 0,
    isDownloading: false,
    finished: false,
  });

  // Reading Session duration tracking
  const sessionSecondsRef = useRef<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Check cached pages and tafsir on mount
  useEffect(() => {
    getCachedPagesCount().then((count) => {
      setCachedPagesCount(count);
      if (count >= 604) {
        setDownloadProgress((prev) => ({ ...prev, loaded: 604, finished: true }));
      }
    });

    getCachedTafsirCount().then((count) => {
      setCachedTafsirCount(count);
      if (count >= 6200) {
        setTafsirDownloadProgress((prev) => ({ ...prev, loadedAyahs: count, finished: true }));
      }
    });
  }, []);

  // Hydrate initial page from Firestore once progress finishes loading (prevents overwriting saved lastPage with page 1)
  useEffect(() => {
    if (!isAuthenticated || !isProgressLoaded || hasHydratedStartPage) return;
    const savedPage = progress.lastPage && progress.lastPage >= 1 && progress.lastPage <= 604 ? progress.lastPage : 1;
    setCurrentPage(savedPage);
    setHasHydratedStartPage(true);
  }, [isAuthenticated, isProgressLoaded, hasHydratedStartPage, progress.lastPage]);

  // Stable ref for saveReadingPosition to avoid re-triggering loadPage
  const savePosRef = useRef(saveReadingPosition);
  useEffect(() => {
    savePosRef.current = saveReadingPosition;
  }, [saveReadingPosition]);

  // Load Page Data (stable without circular dependencies)
  const loadPage = useCallback(async (page: number) => {
    const validPage = Math.max(1, Math.min(604, page));
    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchQuranPage(validPage);
      setPageData(data);
      // Auto-save stopped reading position safely
      const firstAyah = data.ayahs?.[0];
      savePosRef.current(validPage, firstAyah?.surahNumber, firstAyah?.numberInSurah).catch(() => {});

      // Background pre-cache page Tafsir Al-Saadi for all ayahs on this page
      setTimeout(() => {
        fetchAndCachePageTafsir(validPage).catch(() => {});
      }, 200);
    } catch (err: any) {
      console.error('Failed to load Quran page:', err);
      setLoadError(err?.message || 'تعذر تحميل الصفحة. يرجى التحقق من اتصال الإنترنت أو استخدام زر إعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch only after user is authenticated and initial stopped page has hydrated
  useEffect(() => {
    if (!isAuthenticated || !hasHydratedStartPage) return;
    loadPage(currentPage);
  }, [isAuthenticated, hasHydratedStartPage, currentPage, loadPage]);

  // Active reading time tracking (pauses when tab is hidden, flushes every 10s and on exit)
  useEffect(() => {
    if (!isAuthenticated) return;

    const flushSessionTime = () => {
      if (sessionSecondsRef.current > 0) {
        const secsToFlush = sessionSecondsRef.current;
        sessionSecondsRef.current = 0;
        recordSessionTime(secsToFlush);
      }
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      sessionSecondsRef.current += 1;
      setLiveSessionSeconds((prev) => prev + 1);
      if (sessionSecondsRef.current >= 10) {
        flushSessionTime();
      }
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSessionTime();
      }
    };

    window.addEventListener('pagehide', flushSessionTime);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pagehide', flushSessionTime);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushSessionTime();
    };
  }, [isAuthenticated, recordSessionTime]);

  // 2-Minute Timer logic
  useEffect(() => {
    if (!isTwoMinuteModeActive || twoMinCompleted) return;

    const timer = setInterval(() => {
      setTwoMinTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTwoMinCompleted(true);
          completeTwoMinuteSession();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#1B4332', '#C4A674', '#40916C'],
            });
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTwoMinuteModeActive, twoMinCompleted, completeTwoMinuteSession]);

  // Navigation Handlers
  const goToNextPage = useCallback(() => {
    if (currentPage < 604) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Keyboard navigation: ArrowLeft goes to Next Page, ArrowRight goes to Prev Page (RTL)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPicker || selectedAyah || showDownloadModal) return;
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, showPicker, selectedAyah, showDownloadModal]);

  // Touch Swipe Handlers (Swipe Left -> Next Page, Swipe Right -> Prev Page)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen?.().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullScreen(false)).catch(() => {});
    }
  };

  // Start Offline Mushaf Bulk Download
  const handleStartDownload = async () => {
    setDownloadProgress({
      loaded: cachedPagesCount,
      total: 604,
      isDownloading: true,
      finished: false,
    });

    const res = await downloadFullMushaf((loaded, total) => {
      setDownloadProgress({
        loaded,
        total,
        isDownloading: true,
        finished: false,
      });
      setCachedPagesCount(loaded);
    });

    setDownloadProgress((prev) => ({
      ...prev,
      isDownloading: false,
      finished: res.success || res.downloaded >= 600,
    }));
    setCachedPagesCount(res.downloaded);
  };

  // Start Offline Tafsir Bulk Download
  const handleStartTafsirDownload = async () => {
    setTafsirDownloadProgress({
      loadedSurahs: 0,
      totalSurahs: 114,
      loadedAyahs: cachedTafsirCount,
      isDownloading: true,
      finished: false,
    });

    const res = await downloadFullTafsir((loadedSurahs, totalSurahs, loadedAyahs) => {
      setTafsirDownloadProgress({
        loadedSurahs,
        totalSurahs,
        loadedAyahs,
        isDownloading: true,
        finished: false,
      });
      setCachedTafsirCount(loadedAyahs);
    });

    setTafsirDownloadProgress((prev) => ({
      ...prev,
      isDownloading: false,
      finished: res.success || res.loadedSurahs >= 114,
    }));
    setCachedTafsirCount(res.totalAyahs);
  };

  // Surah & Juz headers
  const currentSurahMeta = getSurahForPage(currentPage);
  const currentJuzNum = getJuzForPage(currentPage);
  const currentJuzMeta = JUZ_LIST.find((j) => j.number === currentJuzNum);

  // Group Ayahs on page by Surah for correct header placement
  const ayahsBySurah = React.useMemo(() => {
    if (!pageData || !pageData.ayahs) return [];
    const groups: { surahMeta: (typeof SURAH_LIST)[0]; ayahs: AyahItem[]; isFirstPageOfSurah: boolean }[] = [];

    let currentGroup: { surahMeta: (typeof SURAH_LIST)[0]; ayahs: AyahItem[]; isFirstPageOfSurah: boolean } | null = null;

    pageData.ayahs.forEach((ayah) => {
      if (!currentGroup || currentGroup.surahMeta.number !== ayah.surahNumber) {
        const meta = SURAH_LIST.find((s) => s.number === ayah.surahNumber) || SURAH_LIST[0];
        const isFirstPageOfSurah = ayah.numberInSurah === 1;
        currentGroup = {
          surahMeta: meta,
          ayahs: [ayah],
          isFirstPageOfSurah,
        };
        groups.push(currentGroup);
      } else {
        currentGroup.ayahs.push(ayah);
      }
    });

    return groups;
  }, [pageData]);

  const handleToggleTodayCheck = async () => {
    const today = getTodayString();
    const willBeChecked = !isTodayChecked;
    await toggleDayCheck(today, willBeChecked);
    if (willBeChecked) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#1B4332', '#C4A674', '#40916C'],
        });
      } catch {}
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FDFBF7] rounded-3xl border-2 border-[#C4A674] p-6 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#C4A674] mx-auto flex items-center justify-center shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[#1B4332] font-reading">
            سجّل دخولك أولاً قبل القراءة
          </h3>
          <p className="text-xs text-[#556B2F] leading-relaxed">
            لضمان حفظ وقت قراءتك، وضع علامة الصح على أيامك، وحفظ الصفحة التي تتوقف عندها تلقائياً في حسابك.
          </p>
          <div className="space-y-2 pt-2">
            <button
              onClick={onRequireAuth}
              className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-sm font-bold shadow-md transition-all"
            >
              تسجيل الدخول أو إنشاء حساب
            </button>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="w-full py-2 text-xs text-[#8C6D37] hover:underline"
              >
                العودة للرئيسية
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={readerContainerRef}
      className={`min-h-screen bg-[#FAF7F0] flex flex-col items-center select-none pb-20 ${
        isFullScreen ? 'p-0 fixed inset-0 z-50 overflow-y-auto' : 'pt-2 px-2 sm:px-4'
      }`}
    >
      {/* 2-MINUTE MODE FLOATING BANNER */}
      {isTwoMinuteModeActive && (
        <div className="w-full max-w-2xl mx-auto mb-3 px-3 py-2 rounded-2xl bg-[#1B4332] text-[#FAF7F0] shadow-lg border border-[#C4A674]/50 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C4A674]/20 text-[#C4A674] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>وضع الدقيقتين (قاعدة الدقيقتين)</span>
                {twoMinCompleted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    تم الإنجاز بنجاح ✨
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#C4A674]">
                {twoMinCompleted
                  ? 'الحمد لله، حافظت على عادة القراءة النهارده. يمكنك الاستمرار بالقدر الذي تريده.'
                  : 'اقرأ بهدوء وبدون ضغط، دقيقتان لحماية العادة من الانقطاع'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!twoMinCompleted ? (
              <div className="text-sm font-mono font-bold px-3 py-1 rounded-lg bg-black/30 border border-[#C4A674]/30 text-[#FAF7F0]">
                {Math.floor(twoMinTimeLeft / 60)}:{String(twoMinTimeLeft % 60).padStart(2, '0')}
              </div>
            ) : (
              <button
                onClick={stopTwoMinuteMode}
                className="text-xs px-3 py-1 rounded-lg bg-[#C4A674] text-[#1B4332] font-bold hover:bg-[#D4AF37] transition-all"
              >
                إنهاء الوضع
              </button>
            )}
          </div>
        </div>
      )}

      {/* TOP CONTROL BAR */}
      <div className="w-full max-w-2xl bg-[#FDFBF7] rounded-2xl border border-[#E8DEC8] px-3 py-2 shadow-xs mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#1B4332]">
        
        {/* Navigation Quick Picker Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#E8DEC8]/50 border border-[#E8DEC8] font-bold transition-all"
          >
            <Compass className="w-4 h-4 text-[#C4A674]" />
            <span>{currentSurahMeta.name}</span>
            <span className="text-[#8C6D37] font-normal">| ص {formatArabicNumber(currentPage)}</span>
          </button>

          {/* Live Reading Timer Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1B4332]/8 border border-[#C4A674]/40 text-[#1B4332] font-bold"
            title={`إجمالي قراءتك اليوم: ${formatReadingDuration(todayMinutesRead)}`}
          >
            <Clock className="w-3.5 h-3.5 text-[#C4A674]" />
            <span className="font-mono text-xs">{formatTimerClock(liveSessionSeconds)}</span>
          </div>
        </div>

        {/* View Controls & Today Checkmark */}
        <div className="flex items-center gap-1.5">
          {/* Today Checkmark Button */}
          <button
            onClick={handleToggleTodayCheck}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
              isTodayChecked
                ? 'bg-[#1B4332] text-[#FAF7F0] border-[#1B4332] shadow-xs'
                : 'bg-[#FAF7F0] text-[#1B4332] border-[#C4A674] hover:bg-[#E8DEC8]/60'
            }`}
            title="ضع علامة صح عند إتمام قراءة اليوم"
          >
            <Check className={`w-3.5 h-3.5 ${isTodayChecked ? 'text-[#C4A674]' : 'text-[#8C6D37]'}`} />
            <span>{isTodayChecked ? 'تمت قراءة اليوم' : 'علامة صح لليوم'}</span>
          </button>

          <button
            onClick={() => setShowDownloadModal(true)}
            className="p-1.5 rounded-lg hover:bg-[#FAF7F0] text-[#8C6D37]"
            title="تحميل المصحف والتفسير أوفلاين"
          >
            <DownloadCloud className={`w-4 h-4 ${cachedPagesCount >= 604 ? 'text-emerald-600' : ''}`} />
          </button>
          <button
            onClick={() => setFontSize((f) => Math.max(18, f - 2))}
            className="p-1.5 rounded-lg hover:bg-[#FAF7F0] text-[#8C6D37]"
            title="تصغير الخط"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFontSize((f) => Math.min(36, f + 2))}
            className="p-1.5 rounded-lg hover:bg-[#FAF7F0] text-[#8C6D37]"
            title="تكبير الخط"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-1.5 rounded-lg hover:bg-[#FAF7F0] text-[#8C6D37]"
            title={isFullScreen ? 'إنهاء وضع ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* AUTO-SAVED POSITION & TODAY TIME BAR */}
      <div className="w-full max-w-2xl px-3 py-1.5 mb-2 flex items-center justify-between text-[11px] text-[#556B2F]">
        <span>
          إجمالي وقت اليوم: <strong className="text-[#1B4332]">{formatReadingDuration(todayMinutesRead)}</strong>
        </span>
        <span className="flex items-center gap-1 text-[#8C6D37] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>الصفحة محفوظة تلقائياً (ص {formatArabicNumber(currentPage)})</span>
        </span>
      </div>

      {/* THE PRINTED MUSHAF PAGE CONTAINER WITH BEIGE FRAME */}
      <div
        className="relative w-full max-w-2xl mushaf-beige-frame rounded-3xl p-3 sm:p-4 transition-all duration-300"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Crisp Cream Mushaf Paper with Double Beige Inner Frame */}
        <div className="mushaf-paper mushaf-inner-frame rounded-2xl px-4 py-4 sm:px-7 sm:py-6 relative min-h-[560px] flex flex-col justify-between">
          
          {/* Top Mushaf Header: Juz on Right, Surah on Left */}
          <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-[#DFCCA8] text-xs font-bold text-[#8C6D37]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5ECD9]/70 border border-[#DFCCA8]/80">
              <span>{currentJuzMeta?.name || `الجزء ${formatArabicNumber(currentJuzNum)}`}</span>
            </div>
            <div className="font-reading text-sm sm:text-base text-[#1B4332] px-2.5 py-1 rounded-lg bg-[#F5ECD9]/70 border border-[#DFCCA8]/80">
              سُورَةُ {currentSurahMeta.name}
            </div>
          </div>

          {/* Page Quranic Verses Content */}
          <div className="flex-1 flex flex-col justify-center my-auto py-1">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#8C6D37]">
                <div className="w-9 h-9 rounded-full border-3 border-[#1B4332] border-t-transparent animate-spin" />
                <span className="text-xs font-semibold">جارِ فتح صفحة المصحف الشريف...</span>
              </div>
            ) : loadError ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-sm text-[#1B4332]">تعذر تحميل الصفحة عبر الشبكة</h4>
                <p className="text-xs text-[#556B2F] max-w-sm mx-auto leading-relaxed">
                  {loadError}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => loadPage(currentPage)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة المحاولة الآن</span>
                  </button>
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F0] border border-[#E8DEC8] text-[#1B4332] text-xs font-semibold hover:bg-[#E8DEC8]/50 transition-colors"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5 text-[#C4A674]" />
                    <span>تحميل المصحف أوفلاين</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {ayahsBySurah.map((group) => {
                  const isTawbah = group.surahMeta.number === 9;
                  const isFatihah = group.surahMeta.number === 1;

                  return (
                    <div key={group.surahMeta.number} className="space-y-3.5">
                      {/* Surah Ornamental Header Banner (if this is the first page of the Surah) */}
                      {group.isFirstPageOfSurah && (
                        <div className="surah-header-frame rounded-xl py-2.5 px-3 text-center my-2 relative overflow-hidden">
                          <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-[#8C6D37]">
                            <span>{group.surahMeta.revelationType === 'Meccan' ? 'مَكِّيَّة' : 'مَدَنِيَّة'}</span>
                            <span className="font-reading text-base sm:text-lg font-bold text-[#1B4332]">
                              سُورَةُ {group.surahMeta.name}
                            </span>
                            <span>آيَاتُهَا {formatArabicNumber(group.surahMeta.numberOfAyahs)}</span>
                          </div>

                          {/* Bismillah Header (except Surah At-Tawbah and Al-Fatihah where Bismillah is Ayah 1) */}
                          {!isTawbah && !isFatihah && (
                            <div className="mt-2 pt-1.5 border-t border-[#D8C39E]/60 text-center">
                              <span className="font-quran text-lg sm:text-xl text-[#1B4332]">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quran Verses Continuous Balanced Flow within the page */}
                      <div
                        className="font-quran mushaf-verses-block leading-[2.45] text-[#1F2421] px-1"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {group.ayahs.map((ayah) => {
                          const isSelected =
                            selectedAyah?.surah === ayah.surahNumber &&
                            selectedAyah?.ayah === ayah.numberInSurah;
                          const ayahDigits = formatArabicNumber(ayah.numberInSurah);
                          const digitCount = String(ayah.numberInSurah).length;
                          const numFontScale =
                            digitCount >= 3 ? '0.47em' : digitCount === 2 ? '0.54em' : '0.6em';

                          return (
                            <React.Fragment key={ayah.number}>
                              <span
                                onClick={() => {
                                  savePosRef.current(currentPage, ayah.surahNumber, ayah.numberInSurah).catch(() => {});
                                  setSelectedAyah({
                                    surah: ayah.surahNumber,
                                    ayah: ayah.numberInSurah,
                                    text: ayah.text,
                                  });
                                }}
                                className={`cursor-pointer rounded-lg px-0.5 py-0.5 transition-all inline ${
                                  isSelected
                                    ? 'bg-[#E6D5B8]/60 text-[#1B4332] ring-1 ring-[#C4A674]'
                                    : 'hover:bg-[#E6D5B8]/35'
                                }`}
                                title="انقر لعرض تفسير السعدي وحفظ موضع الآية"
                              >
                                {ayah.text}
                              </span>
                              {/* Authentic Mushaf Verse Marker with Number Centered Inside Circle */}
                              <span
                                onClick={() => {
                                  savePosRef.current(currentPage, ayah.surahNumber, ayah.numberInSurah).catch(() => {});
                                  setSelectedAyah({
                                    surah: ayah.surahNumber,
                                    ayah: ayah.numberInSurah,
                                    text: ayah.text,
                                  });
                                }}
                                className={`verse-end-symbol cursor-pointer transition-transform ${
                                  isSelected
                                    ? 'scale-110'
                                    : 'hover:scale-110'
                                }`}
                                title={`الآية ${ayahDigits} - انقر لتفسير السعدي`}
                              >
                                <svg
                                  viewBox="0 0 36 36"
                                  className="w-full h-full pointer-events-none"
                                  aria-hidden="true"
                                >
                                  {/* Outer ornamental ring */}
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15.5"
                                    fill={isSelected ? '#E6D5B8' : '#F7EFE0'}
                                    stroke={isSelected ? '#1B4332' : '#B99455'}
                                    strokeWidth="1.8"
                                  />
                                  {/* Inner delicate ring */}
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="12.5"
                                    fill="none"
                                    stroke={isSelected ? '#1B4332' : '#CBB07E'}
                                    strokeWidth="0.9"
                                    strokeDasharray="2 1.5"
                                  />
                                </svg>
                                <span
                                  className={`absolute inset-0 flex items-center justify-center font-bold leading-none ${
                                    isSelected ? 'text-[#1B4332]' : 'text-[#5C441E]'
                                  }`}
                                  style={{ fontSize: numFontScale }}
                                >
                                  {ayahDigits}
                                </span>
                              </span>{' '}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Mushaf Footer: Medina Page Number inside Beige Pill */}
          <div className="pt-3 mt-4 border-t border-[#DFCCA8] flex items-center justify-center">
            <span className="font-reading text-sm font-bold text-[#1B4332] px-4 py-0.5 rounded-full bg-[#F5ECD9]/80 border border-[#D8C39E]">
              ـ {formatArabicNumber(currentPage)} ـ
            </span>
          </div>

        </div>

        {/* Desktop Side Navigation Arrows */}
        <button
          onClick={goToNextPage}
          disabled={currentPage >= 604}
          className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FAF7F0] hover:bg-[#1B4332] text-[#1B4332] hover:text-[#FAF7F0] border border-[#E8DEC8] shadow-md items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none"
          title="الصفحة التالية (يسار)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FAF7F0] hover:bg-[#1B4332] text-[#1B4332] hover:text-[#FAF7F0] border border-[#E8DEC8] shadow-md items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none"
          title="الصفحة السابقة (يمين)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* MOBILE PAGE FLIP CONTROLS */}
      <div className="w-full max-w-2xl flex items-center justify-between mt-3 px-2">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#1B4332] border border-[#E8DEC8] text-xs font-bold shadow-2xs transition-all disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الصفحة السابقة</span>
        </button>

        <span className="text-xs font-semibold text-[#8C6D37]">
          اسحب الشاشة أو استخدم الأسهم للتقليب
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage >= 604}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-xs font-bold shadow-xs transition-all disabled:opacity-40"
        >
          <span>الصفحة التالية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* TAFSIR AL-SAADI DRAWER */}
      {selectedAyah && (
        <TafsirDrawer
          surahNumber={selectedAyah.surah}
          ayahNumber={selectedAyah.ayah}
          ayahText={selectedAyah.text}
          isOpen={Boolean(selectedAyah)}
          onClose={() => setSelectedAyah(null)}
          onOpenDownloadModal={() => {
            setDownloadModalTab('tafsir');
            setShowDownloadModal(true);
          }}
        />
      )}

      {/* QUICK JUMP / PICKER MODAL */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FDFBF7] rounded-3xl border border-[#E8DEC8] shadow-2xl p-5 text-right flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <h3 className="font-bold text-sm text-[#1B4332]">الانتقال السريع في المصحف</h3>
              <button onClick={() => setShowPicker(false)} className="text-xs text-[#8C6D37] hover:underline">
                إغلاق
              </button>
            </div>

            {/* Tabs: Surahs / Ajza / Page */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F0] rounded-xl border border-[#E8DEC8] my-3">
              <button
                onClick={() => setPickerTab('surah')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  pickerTab === 'surah' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#6B7280]'
                }`}
              >
                السور (١١٤)
              </button>
              <button
                onClick={() => setPickerTab('juz')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  pickerTab === 'juz' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#6B7280]'
                }`}
              >
                الأجزاء (٣٠)
              </button>
              <button
                onClick={() => setPickerTab('page')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  pickerTab === 'page' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#6B7280]'
                }`}
              >
                رقم الصفحة
              </button>
            </div>

            {/* Tab contents */}
            <div className="flex-1 overflow-y-auto pr-1">
              {pickerTab === 'surah' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {SURAH_LIST.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => {
                        setCurrentPage(s.startPage);
                        setShowPicker(false);
                      }}
                      className="p-2.5 rounded-xl border border-[#E8DEC8] bg-white hover:bg-[#FAF7F0] text-right transition-all flex items-center justify-between"
                    >
                      <span className="font-bold text-[#1B4332]">
                        {s.number}. {s.name}
                      </span>
                      <span className="text-[10px] text-[#8C6D37]">ص {formatArabicNumber(s.startPage)}</span>
                    </button>
                  ))}
                </div>
              )}

              {pickerTab === 'juz' && (
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {JUZ_LIST.map((j) => (
                    <button
                      key={j.number}
                      onClick={() => {
                        setCurrentPage(j.startPage);
                        setShowPicker(false);
                      }}
                      className="p-2.5 rounded-xl border border-[#E8DEC8] bg-white hover:bg-[#FAF7F0] text-right transition-all flex items-center justify-between"
                    >
                      <span className="font-bold text-[#1B4332]">{j.name}</span>
                      <span className="text-[10px] text-[#8C6D37]">صفحة {formatArabicNumber(j.startPage)}</span>
                    </button>
                  ))}
                </div>
              )}

              {pickerTab === 'page' && (
                <div className="py-6 space-y-4 text-center">
                  <label className="block text-xs font-bold text-[#1B4332]">
                    أدخل رقم الصفحة من ١ إلى ٦٠٤:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    placeholder="مثال: ٤٥"
                    className="w-32 mx-auto text-center py-2 px-3 text-lg font-bold rounded-xl border border-[#C4A674] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                  <button
                    onClick={() => {
                      const p = parseInt(pageInput, 10);
                      if (p >= 1 && p <= 604) {
                        setCurrentPage(p);
                        setShowPicker(false);
                      }
                    }}
                    className="block w-full max-w-xs mx-auto py-2.5 rounded-xl bg-[#1B4332] text-white font-bold text-xs"
                  >
                    الانتقال للصفحة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OFFLINE FULL MUSHAF & TAFSIR DOWNLOADER MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-2 border-[#C4A674] shadow-2xl p-6 text-right overflow-hidden space-y-4">
            
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-[#8C6D37] hover:bg-[#E8DEC8]/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-[#C4A674] flex items-center justify-center shadow-xs">
                <HardDriveDownload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1B4332]">تحميل المصحف وتفسير السعدي كاملاً</h3>
                <span className="text-xs text-[#556B2F]">للقراءة والتفسير الفوري لكل آية وبدون إنترنت</span>
              </div>
            </div>

            {/* Switch Tabs: Pages vs Tafsir */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF7F0] rounded-xl border border-[#E8DEC8]">
              <button
                type="button"
                onClick={() => setDownloadModalTab('pages')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  downloadModalTab === 'pages' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#6B7280]'
                }`}
              >
                صفحات المصحف ({cachedPagesCount}/٦٠٤)
              </button>
              <button
                type="button"
                onClick={() => setDownloadModalTab('tafsir')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  downloadModalTab === 'tafsir' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#6B7280]'
                }`}
              >
                تفسير السعدي ({cachedTafsirCount > 0 ? `${cachedTafsirCount} آية` : 'تحميل'})
              </button>
            </div>

            {/* TAB 1: PAGES */}
            {downloadModalTab === 'pages' && (
              <div className="space-y-3">
                <p className="text-xs text-[#556B2F] leading-relaxed">
                  حفظ جميع صفحات المصحف الشريف (٦٠٤ صفحة) محلياً داخل متصفحك، لفتح الصفحات فوراً بدون انتظار الشبكة أو انقطاع الاتصال.
                </p>

                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#1B4332]">
                    <span>الصفحات المحفوظة في جهازك:</span>
                    <span className="font-mono text-sm">
                      {formatArabicNumber(downloadProgress.loaded || cachedPagesCount)} / ٦٠٤
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden p-0.5 border border-[#C4A674]/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round(((downloadProgress.loaded || cachedPagesCount) / 604) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8C6D37]">
                    <span>
                      {Math.min(100, Math.round(((downloadProgress.loaded || cachedPagesCount) / 604) * 100))}% مكتمل
                    </span>
                    {downloadProgress.isDownloading && (
                      <span className="flex items-center gap-1 text-[#1B4332] font-semibold">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#C4A674]" />
                        <span>جارِ التحميل والحفظ محلياً...</span>
                      </span>
                    )}
                    {cachedPagesCount >= 604 && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>المصحف مكتمل الحفظ محلياً!</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {cachedPagesCount >= 604 ? (
                    <div className="text-center py-2 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                      ✨ صفحات المصحف محفوظة بالكامل وتعمل دون اتصال!
                    </div>
                  ) : (
                    <button
                      onClick={handleStartDownload}
                      disabled={downloadProgress.isDownloading}
                      className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {downloadProgress.isDownloading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#C4A674]" />
                          <span>جارِ حفظ الصفحات في جهازك ({downloadProgress.loaded}/604)...</span>
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-4 h-4 text-[#C4A674]" />
                          <span>بدء تحميل صفحات المصحف (٦٠٤ صفحة)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TAFSIR AL-SAADI */}
            {downloadModalTab === 'tafsir' && (
              <div className="space-y-3">
                <p className="text-xs text-[#556B2F] leading-relaxed">
                  تحميل تفسير السعدي كاملاً (تيسير الكريم الرحمن في تفسير كلام المنان) لجميع آيات القرآن الكريم (١١٤ سورة / ٦٢٣٦ آية) بحيث تكون تفسير كل آية متاحاً فورياً بدون إنترنت.
                </p>

                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8DEC8] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#1B4332]">
                    <span>السور المحفوظة من التفسير:</span>
                    <span className="font-mono text-sm">
                      {formatArabicNumber(tafsirDownloadProgress.loadedSurahs)} / ١١٤ سورة
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#556B2F]">
                    <span>الآيات المتوفر تفسيرها:</span>
                    <span className="font-mono font-bold text-[#1B4332]">
                      {formatArabicNumber(cachedTafsirCount)} آية
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden p-0.5 border border-[#C4A674]/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((cachedTafsirCount / 6236) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8C6D37]">
                    <span>
                      {Math.min(100, Math.round((cachedTafsirCount / 6236) * 100))}% مكتمل
                    </span>
                    {tafsirDownloadProgress.isDownloading && (
                      <span className="flex items-center gap-1 text-[#1B4332] font-semibold">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#C4A674]" />
                        <span>جارِ تحميل تفسير السور ({tafsirDownloadProgress.loadedSurahs}/114)...</span>
                      </span>
                    )}
                    {cachedTafsirCount >= 6200 && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تفسير كل آية متاح أوفلاين بنجاح!</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {cachedTafsirCount >= 6200 ? (
                    <div className="text-center py-2 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                      ✨ تفسير السعدي محفوظ بالكامل لجميع الآيات!
                    </div>
                  ) : (
                    <button
                      onClick={handleStartTafsirDownload}
                      disabled={tafsirDownloadProgress.isDownloading}
                      className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {tafsirDownloadProgress.isDownloading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#C4A674]" />
                          <span>جارِ تحميل التفسير ({tafsirDownloadProgress.loadedSurahs}/114 سورة)...</span>
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-4 h-4 text-[#C4A674]" />
                          <span>تحميل تفسير السعدي كاملاً (٦٢٣٦ آية)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
