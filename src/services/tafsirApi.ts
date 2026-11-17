import { TafsirVerse } from '../types';
import { SURAH_LIST, getSurahForPage } from '../data/quranMetadata';
import {
  getTafsirFromDB,
  saveTafsirToDB,
  saveMultipleTafsirToDB,
  getCachedTafsirCount,
} from './quranStorage';

const TAFSIR_SAADI_TITLE = 'تفسير السعدي (تيسير الكريم الرحمن في تفسير كلام المنان)';
const memoryTafsirCache = new Map<string, TafsirVerse>();

// Clean HTML tags, brackets and entities from raw Tafsir text
function cleanTafsirText(raw: string): string {
  if (!raw) return '';
  let clean = raw.replace(/<[^>]*>/g, ' ');
  clean = clean.replace(/&nbsp;/g, ' ');
  clean = clean.replace(/&quot;/g, '"');
  clean = clean.replace(/&apos;/g, "'");
  clean = clean.replace(/&amp;/g, '&');
  clean = clean.replace(/&rlm;/g, '');
  clean = clean.replace(/&lrm;/g, '');
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
}

// Timeout fetch helper
async function fetchWithTimeout(url: string, timeoutMs: number = 7000): Promise<Response> {
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

// 1. Fetch all Tafsir verses for an entire page (Quran.com API v4 ID 91)
export async function fetchAndCachePageTafsir(pageNumber: number): Promise<TafsirVerse[]> {
  try {
    const res = await fetchWithTimeout(
      `https://api.quran.com/api/v4/tafsirs/91/by_page/${pageNumber}`,
      8000
    );

    if (!res.ok) {
      throw new Error(`Quran.com page Tafsir HTTP error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.tafsirs || !Array.isArray(data.tafsirs)) {
      return [];
    }

    const verses: TafsirVerse[] = [];

    for (const item of data.tafsirs) {
      // verse_key is e.g. "1:2"
      const [sStr, aStr] = (item.verse_key || '1:1').split(':');
      const sNum = parseInt(sStr, 10);
      const aNum = parseInt(aStr, 10);
      const sMeta = SURAH_LIST.find((s) => s.number === sNum);
      const sName = sMeta?.name || `سورة ${sNum}`;
      const text = cleanTafsirText(item.text || '');

      if (text) {
        const verseObj: TafsirVerse = {
          surahNumber: sNum,
          ayahNumber: aNum,
          surahName: sName,
          ayahText: '',
          tafsirText: text,
          source: TAFSIR_SAADI_TITLE,
        };
        memoryTafsirCache.set(`${sNum}:${aNum}`, verseObj);
        verses.push(verseObj);
      }
    }

    if (verses.length > 0) {
      saveMultipleTafsirToDB(verses).catch(() => {});
    }

    return verses;
  } catch (error) {
    console.warn(`Could not cache Tafsir for page ${pageNumber}:`, error);
    return [];
  }
}

// 2. Fetch specific Ayah Tafsir (Quran.com resource 91 = Arabic Saadi Tafseer)
export async function fetchTafsirSaadi(
  surahNumber: number,
  ayahNumber: number,
  ayahText: string = ''
): Promise<TafsirVerse> {
  const cacheKey = `${surahNumber}:${ayahNumber}`;

  // 1. Check Memory Cache (ensure it is genuine Tafsir, not the Quranic verse itself)
  if (memoryTafsirCache.has(cacheKey)) {
    const cached = memoryTafsirCache.get(cacheKey)!;
    if (cached.tafsirText && cached.tafsirText.trim() !== ayahText.trim()) {
      if (ayahText && !cached.ayahText) cached.ayahText = ayahText;
      return cached;
    }
  }

  // 2. Check IndexedDB Persistent Cache
  try {
    const dbTafsir = await getTafsirFromDB(surahNumber, ayahNumber);
    if (dbTafsir && dbTafsir.tafsirText && dbTafsir.tafsirText.trim() !== ayahText.trim()) {
      if (ayahText && !dbTafsir.ayahText) dbTafsir.ayahText = ayahText;
      memoryTafsirCache.set(cacheKey, dbTafsir);
      return dbTafsir;
    }
  } catch (e) {
    console.warn('IndexedDB Tafsir read notice:', e);
  }

  const surahMeta = SURAH_LIST.find((s) => s.number === surahNumber);
  const surahName = surahMeta?.name || `سورة ${surahNumber}`;

  let tafsirText: string | null = null;
  let sourceName = TAFSIR_SAADI_TITLE;

  // 3. Primary: Quran.com API v4 (Authentic Arabic Saadi Tafseer, ID 91)
  try {
    const res = await fetchWithTimeout(
      `https://api.quran.com/api/v4/tafsirs/91/by_ayah/${surahNumber}:${ayahNumber}`,
      6000
    );

    if (res.ok) {
      const data = await res.json();
      if (data.tafsir && data.tafsir.text) {
        const cleaned = cleanTafsirText(data.tafsir.text);
        // Ensure it's not empty and not just the Ayah
        if (cleaned && cleaned.trim() !== ayahText.trim()) {
          tafsirText = cleaned;
        }
      }
    }
  } catch (err) {
    console.warn(`Primary Saadi Tafsir API failed for ${surahNumber}:${ayahNumber}:`, err);
  }

  // 4. Secondary: Quran.com page endpoint fallback
  if (!tafsirText && surahMeta) {
    try {
      const pageVerses = await fetchAndCachePageTafsir(surahMeta.startPage);
      const found = pageVerses.find((v) => v.surahNumber === surahNumber && v.ayahNumber === ayahNumber);
      if (found && found.tafsirText) {
        tafsirText = found.tafsirText;
      }
    } catch {}
  }

  // 5. Authentic Fallback if network blocked: Al-Muyassar (King Fahd Complex)
  if (!tafsirText) {
    try {
      const resFallback = await fetchWithTimeout(
        `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`,
        5000
      );
      if (resFallback.ok) {
        const dataFallback = await resFallback.json();
        if (dataFallback.data && dataFallback.data.text) {
          const cleaned = cleanTafsirText(dataFallback.data.text);
          if (cleaned && cleaned.trim() !== ayahText.trim()) {
            tafsirText = cleaned;
            sourceName = 'التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف)';
          }
        }
      }
    } catch (fbErr) {
      console.warn('Fallback Tafsir API failed:', fbErr);
    }
  }

  if (tafsirText) {
    const result: TafsirVerse = {
      surahNumber,
      ayahNumber,
      surahName,
      ayahText: ayahText || `سورة ${surahName} - الآية ${ayahNumber}`,
      tafsirText,
      source: sourceName,
    };

    memoryTafsirCache.set(cacheKey, result);
    saveTafsirToDB(result).catch(() => {});

    return result;
  }

  throw new Error(`تعذر جلب تفسير السعدي للآية ${ayahNumber} من سورة ${surahName}. يرجى التحقق من الاتصال بالإنترنت.`);
}

// 3. Offline Full Tafsir Downloader (Downloads all 604 pages / 6236 Ayahs of Tafsir Al-Saadi)
let isTafsirDownloading = false;

export function isTafsirDownloadRunning(): boolean {
  return isTafsirDownloading;
}

export async function downloadFullTafsir(
  onProgress: (loadedSurahs: number, totalSurahs: number, loadedAyahs: number) => void
): Promise<{ success: boolean; totalSurahs: number; loadedSurahs: number; totalAyahs: number }> {
  if (isTafsirDownloading) {
    return { success: false, totalSurahs: 114, loadedSurahs: 0, totalAyahs: 0 };
  }

  isTafsirDownloading = true;
  const totalPages = 604;
  let totalAyahs = await getCachedTafsirCount().catch(() => 0);
  const batchSize = 6; // 6 concurrent pages for fast, smooth downloading

  try {
    for (let p = 1; p <= totalPages; p += batchSize) {
      const batchPromises = [];
      for (let offset = 0; offset < batchSize && p + offset <= totalPages; offset++) {
        const pageNum = p + offset;
        batchPromises.push(
          (async () => {
            const verses = await fetchAndCachePageTafsir(pageNum);
            totalAyahs += verses.length;
          })()
        );
      }

      await Promise.all(batchPromises);

      // Estimate completed surahs based on progress through the 604 pages
      const completedPages = Math.min(totalPages, p + batchSize);
      const estimatedSurahs = Math.min(114, Math.round((completedPages / totalPages) * 114));
      onProgress(estimatedSurahs, 114, totalAyahs);

      // Brief gentle delay between batches
      await new Promise((r) => setTimeout(r, 100));
    }

    const finalCount = await getCachedTafsirCount().catch(() => totalAyahs);
    isTafsirDownloading = false;
    onProgress(114, 114, finalCount);
    return { success: true, totalSurahs: 114, loadedSurahs: 114, totalAyahs: finalCount };
  } catch (error) {
    isTafsirDownloading = false;
    console.error('Error in downloadFullTafsir:', error);
    return { success: false, totalSurahs: 114, loadedSurahs: 0, totalAyahs };
  }
}
