import { QuranPageData, TafsirVerse } from '../types';

const DB_NAME = 'AtharQuranDB';
const DB_VERSION = 3;
const PAGES_STORE = 'pages';
const TAFSIR_STORE = 'tafsir';

let dbInstance: IDBDatabase | null = null;

export async function openQuranDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Pages store
        if (!db.objectStoreNames.contains(PAGES_STORE)) {
          db.createObjectStore(PAGES_STORE, { keyPath: 'pageNumber' });
        }
        // Tafsir store (clear old corrupt cache when upgrading to v3)
        if (event.oldVersion < 3 && db.objectStoreNames.contains(TAFSIR_STORE)) {
          try {
            db.deleteObjectStore(TAFSIR_STORE);
          } catch {}
        }
        if (!db.objectStoreNames.contains(TAFSIR_STORE)) {
          db.createObjectStore(TAFSIR_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (err) => {
        console.warn('IndexedDB open error:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB unavailable:', e);
      resolve(null);
    }
  });
}

// ----------------- PAGES API -----------------
export async function getPageFromDB(pageNumber: number): Promise<QuranPageData | null> {
  const db = await openQuranDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PAGES_STORE, 'readonly');
      const store = tx.objectStore(PAGES_STORE);
      const req = store.get(pageNumber);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function savePageToDB(pageData: QuranPageData): Promise<void> {
  const db = await openQuranDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PAGES_STORE, 'readwrite');
      const store = tx.objectStore(PAGES_STORE);
      store.put(pageData);

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function saveMultiplePagesToDB(pages: QuranPageData[]): Promise<void> {
  const db = await openQuranDB();
  if (!db || pages.length === 0) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PAGES_STORE, 'readwrite');
      const store = tx.objectStore(PAGES_STORE);
      for (const page of pages) {
        store.put(page);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getCachedPagesCount(): Promise<number> {
  const db = await openQuranDB();
  if (!db) return 0;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PAGES_STORE, 'readonly');
      const store = tx.objectStore(PAGES_STORE);
      const countReq = store.count();

      countReq.onsuccess = () => resolve(countReq.result || 0);
      countReq.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

// ----------------- TAFSIR API -----------------
export interface StoredTafsirRecord extends TafsirVerse {
  id: string; // `${surahNumber}:${ayahNumber}`
}

export async function getTafsirFromDB(surahNumber: number, ayahNumber: number): Promise<TafsirVerse | null> {
  const db = await openQuranDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TAFSIR_STORE, 'readonly');
      const store = tx.objectStore(TAFSIR_STORE);
      const req = store.get(`${surahNumber}:${ayahNumber}`);

      req.onsuccess = () => {
        const res = req.result as StoredTafsirRecord | undefined;
        // Verify genuine Tafsir text (not identical to the Quranic verse)
        if (res && res.tafsirText && res.tafsirText.trim() !== res.ayahText?.trim()) {
          resolve(res);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveTafsirToDB(tafsir: TafsirVerse): Promise<void> {
  const db = await openQuranDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TAFSIR_STORE, 'readwrite');
      const store = tx.objectStore(TAFSIR_STORE);
      const record: StoredTafsirRecord = {
        ...tafsir,
        id: `${tafsir.surahNumber}:${tafsir.ayahNumber}`,
      };
      store.put(record);

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function saveMultipleTafsirToDB(records: TafsirVerse[]): Promise<void> {
  const db = await openQuranDB();
  if (!db || records.length === 0) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TAFSIR_STORE, 'readwrite');
      const store = tx.objectStore(TAFSIR_STORE);
      for (const rec of records) {
        const item: StoredTafsirRecord = {
          ...rec,
          id: `${rec.surahNumber}:${rec.ayahNumber}`,
        };
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getCachedTafsirCount(): Promise<number> {
  const db = await openQuranDB();
  if (!db) return 0;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TAFSIR_STORE, 'readonly');
      const store = tx.objectStore(TAFSIR_STORE);
      const countReq = store.count();

      countReq.onsuccess = () => resolve(countReq.result || 0);
      countReq.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}
