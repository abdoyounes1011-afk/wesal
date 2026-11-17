import { AyahItem, QuranPageData } from '../types';
import { getJuzForPage, SURAH_LIST } from '../data/quranMetadata';
import { getPageFromDB, savePageToDB, saveMultiplePagesToDB } from './quranStorage';

const PAGE_CACHE_KEY_PREFIX = 'athar_quran_page_';

// Offline fallback for Page 1 (Al-Fatihah)
const FALLBACK_PAGE_1: QuranPageData = {
  pageNumber: 1,
  juzNumber: 1,
  surahNames: ['الفَاتِحة'],
  ayahs: [
    { number: 1, numberInSurah: 1, surahNumber: 1, surahName: 'الفَاتِحة', text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', page: 1, juz: 1 },
    { number: 2, numberInSurah: 2, surahNumber: 1, surahName: 'الفَاتِحة', text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', page: 1, juz: 1 },
    { number: 3, numberInSurah: 3, surahNumber: 1, surahName: 'الفَاتِحة', text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', page: 1, juz: 1 },
    { number: 4, numberInSurah: 4, surahNumber: 1, surahName: 'الفَاتِحة', text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ', page: 1, juz: 1 },
    { number: 5, numberInSurah: 5, surahNumber: 1, surahName: 'الفَاتِحة', text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', page: 1, juz: 1 },
    { number: 6, numberInSurah: 6, surahNumber: 1, surahName: 'الفَاتِحة', text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', page: 1, juz: 1 },
    { number: 7, numberInSurah: 7, surahNumber: 1, surahName: 'الفَاتِحة', text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', page: 1, juz: 1 }
  ]
};

// Offline fallback for Page 2 (Al-Baqarah 1-5)
const FALLBACK_PAGE_2: QuranPageData = {
  pageNumber: 2,
  juzNumber: 1,
  surahNames: ['البَقَرَة'],
  ayahs: [
    { number: 8, numberInSurah: 1, surahNumber: 2, surahName: 'البَقَرَة', text: 'الٓمٓ', page: 2, juz: 1 },
    { number: 9, numberInSurah: 2, surahNumber: 2, surahName: 'البَقَرَة', text: 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ', page: 2, juz: 1 },
    { number: 10, numberInSurah: 3, surahNumber: 2, surahName: 'البَقَرَة', text: 'ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ', page: 2, juz: 1 },
    { number: 11, numberInSurah: 4, surahNumber: 2, surahName: 'البَقَرَة', text: 'وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ', page: 2, juz: 1 },
    { number: 12, numberInSurah: 5, surahNumber: 2, surahName: 'البَقَرَة', text: 'أُو۟لَٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ', page: 2, juz: 1 }
  ]
};

// Offline fallback for Page 604 (Al-Ikhlas, Al-Falaq, An-Nas)
const FALLBACK_PAGE_604: QuranPageData = {
  pageNumber: 604,
  juzNumber: 30,
  surahNames: ['الإخْلَاص', 'الفَلَق', 'النَّاس'],
  ayahs: [
    { number: 6222, numberInSurah: 1, surahNumber: 112, surahName: 'الإخْلَاص', text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', page: 604, juz: 30 },
    { number: 6223, numberInSurah: 2, surahNumber: 112, surahName: 'الإخْلَاص', text: 'ٱللَّهُ ٱلصَّمَدُ', page: 604, juz: 30 },
    { number: 6224, numberInSurah: 3, surahNumber: 112, surahName: 'الإخْلَاص', text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', page: 604, juz: 30 },
    { number: 6225, numberInSurah: 4, surahNumber: 112, surahName: 'الإخْلَاص', text: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ', page: 604, juz: 30 },
    { number: 6226, numberInSurah: 1, surahNumber: 113, surahName: 'الفَلَق', text: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ', page: 604, juz: 30 },
    { number: 6227, numberInSurah: 2, surahNumber: 113, surahName: 'الفَلَق', text: 'مِن شَرِّ مَا خَلَقَ', page: 604, juz: 30 },
    { number: 6228, numberInSurah: 3, surahNumber: 113, surahName: 'الفَلَق', text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', page: 604, juz: 30 },
    { number: 6229, numberInSurah: 4, surahNumber: 113, surahName: 'الفَلَق', text: 'وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ', page: 604, juz: 30 },
    { number: 6230, numberInSurah: 5, surahNumber: 113, surahName: 'الفَلَق', text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', page: 604, juz: 30 },
    { number: 6231, numberInSurah: 1, surahNumber: 114, surahName: 'النَّاس', text: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ', page: 604, juz: 30 },
    { number: 6232, numberInSurah: 2, surahNumber: 114, surahName: 'النَّاس', text: 'مَلِكِ ٱلنَّاسِ', page: 604, juz: 30 },
    { number: 6233, numberInSurah: 3, surahNumber: 114, surahName: 'النَّاس', text: 'إِلَٰهِ ٱلنَّاسِ', page: 604, juz: 30 },
    { number: 6234, numberInSurah: 4, surahNumber: 114, surahName: 'النَّاس', text: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ', page: 604, juz: 30 },
    { number: 6235, numberInSurah: 5, surahNumber: 114, surahName: 'النَّاس', text: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ', page: 604, juz: 30 },
    { number: 6236, numberInSurah: 6, surahNumber: 114, surahName: 'النَّاس', text: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ', page: 604, juz: 30 }
  ]
};

// Memory cache to ensure instant page flipping
const memoryPageCache = new Map<number, QuranPageData>();
memoryPageCache.set(1, FALLBACK_PAGE_1);
memoryPageCache.set(2, FALLBACK_PAGE_2);
memoryPageCache.set(604, FALLBACK_PAGE_604);

// Helper for fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs: number = 6000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Fetch from Primary CDN (Al-Quran Cloud)
async function fetchFromAlQuranCloud(page: number): Promise<QuranPageData> {
  const response = await fetchWithTimeout(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`, 5000);
  if (!response.ok) {
    throw new Error(`Al-Quran Cloud error: ${response.status}`);
  }

  const json = await response.json();
  if (json.code !== 200 || !json.data || !Array.isArray(json.data.ayahs)) {
    throw new Error('Invalid Al-Quran Cloud data structure');
  }

  const ayahs: AyahItem[] = json.data.ayahs.map((a: any) => {
    const surahNum = a.surah?.number || 1;
    const meta = SURAH_LIST.find((s) => s.number === surahNum);
    const surahName = meta?.name || a.surah?.name || 'سورة';
    let cleanText = (a.text || '').replace(/^\uFEFF/, '').trim();

    return {
      number: a.number,
      numberInSurah: a.numberInSurah,
      surahNumber: surahNum,
      surahName,
      text: cleanText,
      page,
      juz: a.juz || getJuzForPage(page),
      hizbQuarter: a.hizbQuarter,
    };
  });

  const surahNames = Array.from(new Set(ayahs.map((a) => a.surahName)));
  return {
    pageNumber: page,
    juzNumber: ayahs[0]?.juz || getJuzForPage(page),
    surahNames,
    ayahs,
  };
}

// Fetch from Backup CDN (Quran.com API v4)
async function fetchFromQuranDotCom(page: number): Promise<QuranPageData> {
  const response = await fetchWithTimeout(
    `https://api.quran.com/api/v4/verses/by_page/${page}?words=false&fields=text_uthmani`,
    5000
  );

  if (!response.ok) {
    throw new Error(`Quran.com error: ${response.status}`);
  }

  const json = await response.json();
  if (!json.verses || !Array.isArray(json.verses)) {
    throw new Error('Invalid Quran.com data structure');
  }

  const ayahs: AyahItem[] = json.verses.map((v: any) => {
    // verse_key is e.g. "2:5"
    const [surahStr, ayahStr] = (v.verse_key || '1:1').split(':');
    const surahNum = parseInt(surahStr, 10);
    const ayahNum = parseInt(ayahStr, 10);
    const meta = SURAH_LIST.find((s) => s.number === surahNum);
    const surahName = meta?.name || `سورة ${surahNum}`;
    let cleanText = (v.text_uthmani || '').replace(/^\uFEFF/, '').trim();

    return {
      number: v.id || v.verse_number || ayahNum,
      numberInSurah: ayahNum,
      surahNumber: surahNum,
      surahName,
      text: cleanText,
      page,
      juz: v.juz_number || getJuzForPage(page),
      hizbQuarter: v.rub_el_hizb_number,
    };
  });

  const surahNames = Array.from(new Set(ayahs.map((a) => a.surahName)));
  return {
    pageNumber: page,
    juzNumber: ayahs[0]?.juz || getJuzForPage(page),
    surahNames,
    ayahs,
  };
}

export async function fetchQuranPage(pageNumber: number): Promise<QuranPageData> {
  const safePage = Math.max(1, Math.min(604, pageNumber));

  // 1. Check memory cache
  if (memoryPageCache.has(safePage)) {
    return memoryPageCache.get(safePage)!;
  }

  // 2. Check IndexedDB persistent cache
  try {
    const dbPage = await getPageFromDB(safePage);
    if (dbPage && dbPage.ayahs && dbPage.ayahs.length > 0) {
      memoryPageCache.set(safePage, dbPage);
      return dbPage;
    }
  } catch (e) {
    console.warn('IndexedDB read notice:', e);
  }

  // 3. Check LocalStorage fallback
  try {
    const cached = localStorage.getItem(`${PAGE_CACHE_KEY_PREFIX}${safePage}`);
    if (cached) {
      const parsed: QuranPageData = JSON.parse(cached);
      memoryPageCache.set(safePage, parsed);
      savePageToDB(parsed).catch(() => {});
      return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage read error for Quran page', e);
  }

  // 4. Multi-CDN fetch with fallback
  let pageData: QuranPageData | null = null;
  let primaryError: any = null;

  try {
    pageData = await fetchFromAlQuranCloud(safePage);
  } catch (err) {
    primaryError = err;
    console.warn(`Primary Quran CDN failed for page ${safePage}, trying backup CDN...`, err);
  }

  if (!pageData) {
    try {
      pageData = await fetchFromQuranDotCom(safePage);
    } catch (err2) {
      console.error(`Backup Quran CDN also failed for page ${safePage}:`, err2);
    }
  }

  // 5. If successful, cache and return
  if (pageData && pageData.ayahs && pageData.ayahs.length > 0) {
    memoryPageCache.set(safePage, pageData);
    savePageToDB(pageData).catch(() => {});
    try {
      localStorage.setItem(`${PAGE_CACHE_KEY_PREFIX}${safePage}`, JSON.stringify(pageData));
    } catch {}

    prefetchAdjacentPages(safePage);
    return pageData;
  }

  // 6. Hard-coded fallbacks if offline on start
  if (safePage === 1) return FALLBACK_PAGE_1;
  if (safePage === 2) return FALLBACK_PAGE_2;
  if (safePage === 604) return FALLBACK_PAGE_604;

  throw new Error(`تعذر تحميل الصفحة ${safePage}. يرجى التحقق من اتصالك بالإنترنت والضغط على إعادة المحاولة.`);
}

// Background prefetch for adjacent pages
function prefetchAdjacentPages(currentPage: number) {
  setTimeout(() => {
    if (currentPage > 1 && !memoryPageCache.has(currentPage - 1)) {
      fetchQuranPage(currentPage - 1).catch(() => {});
    }
    if (currentPage < 604 && !memoryPageCache.has(currentPage + 1)) {
      fetchQuranPage(currentPage + 1).catch(() => {});
    }
  }, 400);
}

// Offline Full Mushaf Downloader (Downloads all 604 pages in controlled batches)
let isDownloading = false;

export function isMushafDownloading(): boolean {
  return isDownloading;
}

export async function downloadFullMushaf(
  onProgress: (loaded: number, total: number) => void
): Promise<{ success: boolean; total: number; downloaded: number }> {
  if (isDownloading) {
    return { success: false, total: 604, downloaded: 0 };
  }

  isDownloading = true;
  let downloadedCount = 0;
  const totalPages = 604;
  const batchSize = 6; // 6 concurrent page requests to avoid rate limiting

  try {
    for (let p = 1; p <= totalPages; p += batchSize) {
      const batchPromises = [];
      for (let offset = 0; offset < batchSize && p + offset <= totalPages; offset++) {
        const pageNum = p + offset;
        batchPromises.push(
          (async () => {
            // Check if already in DB or memory
            const existing = await getPageFromDB(pageNum);
            if (existing && existing.ayahs?.length > 0) {
              downloadedCount++;
              onProgress(downloadedCount, totalPages);
              return;
            }

            try {
              await fetchQuranPage(pageNum);
              downloadedCount++;
              onProgress(downloadedCount, totalPages);
            } catch (e) {
              console.warn(`Could not cache page ${pageNum} during bulk download`, e);
            }
          })()
        );
      }

      await Promise.all(batchPromises);
      // Small pause between batches
      await new Promise((r) => setTimeout(r, 120));
    }

    isDownloading = false;
    return { success: true, total: totalPages, downloaded: downloadedCount };
  } catch (error) {
    isDownloading = false;
    console.error('Error in downloadFullMushaf:', error);
    return { success: false, total: totalPages, downloaded: downloadedCount };
  }
}

// Quick lookup for a single Ayah Quranic text (from memory, IndexedDB, or quick API)
export async function getAyahQuranText(surahNumber: number, ayahNumber: number): Promise<string> {
  // 1. Check in memory page cache
  for (const page of memoryPageCache.values()) {
    const found = page.ayahs?.find((a) => a.surahNumber === surahNumber && a.numberInSurah === ayahNumber);
    if (found && found.text) {
      return found.text;
    }
  }

  // 2. Check IndexedDB near the surah's starting page
  const surahMeta = SURAH_LIST.find((s) => s.number === surahNumber);
  if (surahMeta) {
    const startP = surahMeta.startPage;
    const maxScan = Math.min(604, startP + 40);
    for (let p = startP; p <= maxScan; p++) {
      const dbPage = await getPageFromDB(p);
      if (dbPage && dbPage.ayahs) {
        const found = dbPage.ayahs.find((a) => a.surahNumber === surahNumber && a.numberInSurah === ayahNumber);
        if (found && found.text) {
          return found.text;
        }
      }
    }
  }

  // 3. Quick fetch with timeout
  try {
    const res = await fetchWithTimeout(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`,
      4000
    );
    if (res.ok) {
      const j = await res.json();
      if (j.data?.text) {
        return (j.data.text as string).replace(/^\uFEFF/, '').trim();
      }
    }
  } catch {}

  return '';
}
