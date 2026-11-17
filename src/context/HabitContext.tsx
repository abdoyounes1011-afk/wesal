import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import {
  ReadingGoal,
  ReadingProgress,
  ReadingHistory,
  HabitSettings,
  NotificationSettings,
  GoalType,
} from '../types';
import { getSurahForPage, formatMinutesGoalLabel } from '../data/quranMetadata';
import { handleFirestoreError, OperationType } from '../services/firestoreError';

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface HabitContextType {
  // Goal
  goal: ReadingGoal;
  updateGoal: (type: GoalType, target: number) => Promise<void>;

  // Progress
  progress: ReadingProgress;
  todayMinutesRead: number;
  isTodayChecked: boolean;
  isProgressLoaded: boolean;
  saveReadingPosition: (page: number, surah?: number, ayah?: number) => Promise<void>;
  recordSessionTime: (seconds: number) => Promise<void>;
  toggleDayCheck: (dateStr: string, explicitValue?: boolean) => Promise<void>;
  markGoalComplete: () => Promise<void>;

  // Don't Miss Mode (2-Minute Rule)
  isTwoMinuteModeActive: boolean;
  startTwoMinuteMode: () => void;
  stopTwoMinuteMode: () => void;
  completeTwoMinuteSession: () => Promise<void>;

  // Comeback Mode
  isComebackDetected: boolean;
  daysSinceLastRead: number;
  dismissComeback: () => void;

  // Habit Stacking
  habitSettings: HabitSettings;
  updateHabitSettings: (routine: string, customRoutine: string, preferredTime: string) => Promise<void>;

  // Notification Settings
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;

  // History & Calendar
  historyMap: Record<string, ReadingHistory>;
  isSyncing: boolean;
  needsOnboarding: boolean;
  completeOnboarding: () => void;
}

const DEFAULT_GOAL: ReadingGoal = {
  userId: '',
  goalType: 'minutes',
  dailyTarget: 5, // Default: 5 minutes daily reading
  minimumTwoMinuteGoal: true,
};

const DEFAULT_PROGRESS: ReadingProgress = {
  userId: '',
  lastSurah: 1,
  lastAyah: 1,
  lastPage: 1,
  lastSurahName: 'الفَاتِحة',
  dailyPagesRead: 0,
  dailyMinutesRead: 0,
  isDailyGoalCompleted: false,
  isTwoMinuteGoalCompleted: false,
};

const DEFAULT_HABIT: HabitSettings = {
  userId: '',
  dailyRoutine: 'after_fajr',
  customRoutine: '',
  preferredTime: '06:00',
  habitStatement: 'بعد ما أخلص صلاة الفجر، هقرأ ٥ دقائق من القرآن.',
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  userId: '',
  browserPushEnabled: false,
  scheduledReminder: true,
  missedReminder: true,
  endOfDayReminder: true,
  preferredTime: '06:00',
};

function normalizeGoalToMinutes(g: Partial<ReadingGoal> | null | undefined, userId = ''): ReadingGoal {
  if (!g) return { ...DEFAULT_GOAL, userId };
  if (g.goalType === 'pages') {
    const convertedMinutes = Math.min(30, Math.max(5, Math.round((g.dailyTarget || 2.5) * 2)));
    return {
      ...DEFAULT_GOAL,
      ...g,
      userId: g.userId || userId,
      goalType: 'minutes',
      dailyTarget: convertedMinutes,
    };
  }
  return {
    ...DEFAULT_GOAL,
    ...g,
    userId: g.userId || userId,
    goalType: 'minutes',
    dailyTarget: g.dailyTarget && g.dailyTarget > 0 ? g.dailyTarget : 5,
  };
}

function normalizeProgressForToday(p: Partial<ReadingProgress> | null | undefined, userId = ''): ReadingProgress {
  if (!p) return { ...DEFAULT_PROGRESS, userId };
  const today = getTodayString();
  const isSameDay =
    p.lastActiveDate === today ||
    (!p.lastActiveDate && p.updatedAt?.slice(0, 10) === today);

  return {
    ...DEFAULT_PROGRESS,
    ...p,
    userId: p.userId || userId,
    lastSurah: p.lastSurah && p.lastSurah >= 1 && p.lastSurah <= 114 ? p.lastSurah : 1,
    lastAyah: p.lastAyah && p.lastAyah >= 1 ? p.lastAyah : 1,
    lastPage: p.lastPage && p.lastPage >= 1 && p.lastPage <= 604 ? p.lastPage : 1,
    lastSurahName: p.lastSurahName || getSurahForPage(p.lastPage || 1).name,
    dailyPagesRead: 0, // Never count pages
    dailyMinutesRead: isSameDay ? (p.dailyMinutesRead || 0) : 0,
    isDailyGoalCompleted: isSameDay ? Boolean(p.isDailyGoalCompleted) : false,
    isTwoMinuteGoalCompleted: isSameDay ? Boolean(p.isTwoMinuteGoalCompleted) : false,
    lastActiveDate: isSameDay ? today : p.lastActiveDate,
  };
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const isAuthenticated = Boolean(currentUser && !currentUser.isAnonymous);
  const uid = currentUser?.uid || '';

  const [goal, setGoal] = useState<ReadingGoal>(DEFAULT_GOAL);
  const [progress, setProgress] = useState<ReadingProgress>(DEFAULT_PROGRESS);
  const [habitSettings, setHabitSettings] = useState<HabitSettings>(DEFAULT_HABIT);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [historyMap, setHistoryMap] = useState<Record<string, ReadingHistory>>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isProgressLoaded, setIsProgressLoaded] = useState<boolean>(false);
  const [isTwoMinuteModeActive, setIsTwoMinuteModeActive] = useState<boolean>(false);
  const [dismissedComebackToday, setDismissedComebackToday] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('athar_onboarding_completed') === 'true';
  });

  const progressRef = useRef<ReadingProgress>(DEFAULT_PROGRESS);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const goalRef = useRef<ReadingGoal>(DEFAULT_GOAL);
  useEffect(() => {
    goalRef.current = goal;
  }, [goal]);

  const historyMapRef = useRef<Record<string, ReadingHistory>>({});
  useEffect(() => {
    historyMapRef.current = historyMap;
  }, [historyMap]);

  const uidRef = useRef<string>(uid);
  useEffect(() => {
    uidRef.current = uid;
  }, [uid]);

  const isAuthenticatedRef = useRef<boolean>(isAuthenticated);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const prevUidRef = useRef<string>('');

  // Calculate days since last read
  const daysSinceLastRead = useMemo(() => {
    if (!progress.lastReadingTimestamp) return 0;
    const lastDate = new Date(progress.lastReadingTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [progress.lastReadingTimestamp]);

  const isComebackDetected = isAuthenticated && !dismissedComebackToday && daysSinceLastRead >= 2;
  const dismissComeback = () => setDismissedComebackToday(true);

  // Derived today metrics (rollover-safe & history-backed)
  const todayStr = getTodayString();
  const todayRecord = historyMap[todayStr];

  const todayMinutesRead = useMemo(() => {
    if (todayRecord && typeof todayRecord.minutesRead === 'number') {
      return todayRecord.minutesRead;
    }
    if (progress.lastActiveDate === todayStr) {
      return progress.dailyMinutesRead || 0;
    }
    return 0;
  }, [todayRecord, progress.lastActiveDate, progress.dailyMinutesRead, todayStr]);

  const isTodayChecked = useMemo(() => {
    if (todayRecord) {
      if (typeof todayRecord.isChecked === 'boolean') return todayRecord.isChecked;
      return Boolean(todayRecord.isDailyGoalCompleted);
    }
    if (progress.lastActiveDate === todayStr) {
      return Boolean(progress.isDailyGoalCompleted);
    }
    return false;
  }, [todayRecord, progress.lastActiveDate, progress.isDailyGoalCompleted, todayStr]);

  // Load local onboarding preferences when signed out
  const loadSignedOutState = useCallback(() => {
    try {
      const g = localStorage.getItem('athar_goal');
      setGoal(g ? normalizeGoalToMinutes(JSON.parse(g)) : DEFAULT_GOAL);

      const h = localStorage.getItem('athar_habit');
      setHabitSettings(h ? JSON.parse(h) : DEFAULT_HABIT);

      const n = localStorage.getItem('athar_notifications');
      setNotificationSettings(n ? JSON.parse(n) : DEFAULT_NOTIFICATIONS);
    } catch (e) {
      console.warn('Error reading local preferences', e);
    }
    setProgress(DEFAULT_PROGRESS);
    setHistoryMap({});
  }, []);

  // Sync with Firestore when authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!uid || !isAuthenticated) {
      if (prevUidRef.current) {
        // User just signed out — clear user-specific progress caches
        localStorage.removeItem(`athar_progress_${prevUidRef.current}`);
        localStorage.removeItem(`athar_history_${prevUidRef.current}`);
      }
      prevUidRef.current = '';
      loadSignedOutState();
      setIsProgressLoaded(true);
      setIsSyncing(false);
      return;
    }

    prevUidRef.current = uid;
    setIsSyncing(true);
    setIsProgressLoaded(false);

    // Pre-hydrate from uid-scoped cache if available while Firestore connects
    try {
      const cachedProg = localStorage.getItem(`athar_progress_${uid}`);
      if (cachedProg) {
        setProgress(normalizeProgressForToday(JSON.parse(cachedProg), uid));
      }
      const cachedHist = localStorage.getItem(`athar_history_${uid}`);
      if (cachedHist) {
        setHistoryMap(JSON.parse(cachedHist));
      }
    } catch {}

    let loadedGoals = false;
    let loadedProgress = false;
    let loadedHistory = false;
    const checkDoneSyncing = () => {
      if (loadedGoals && loadedProgress && loadedHistory) {
        setIsSyncing(false);
      }
    };

    // 1. Goal listener
    const goalPath = `users/${uid}/goals/current`;
    const goalRefDoc = doc(db, 'users', uid, 'goals', 'current');
    const unsubGoal = onSnapshot(
      goalRefDoc,
      (docSnap) => {
        loadedGoals = true;
        if (docSnap.exists()) {
          const normalized = normalizeGoalToMinutes(docSnap.data() as ReadingGoal, uid);
          setGoal(normalized);
          localStorage.setItem(`athar_goal_${uid}`, JSON.stringify(normalized));
        } else {
          // If user picked a goal during pre-login onboarding, persist it to their new account
          let initialGoal: ReadingGoal = { ...DEFAULT_GOAL, userId: uid, updatedAt: new Date().toISOString() };
          try {
            const localGoalRaw = localStorage.getItem('athar_goal');
            if (localGoalRaw) {
              initialGoal = {
                ...normalizeGoalToMinutes(JSON.parse(localGoalRaw), uid),
                userId: uid,
                updatedAt: new Date().toISOString(),
              };
            }
          } catch {}
          setGoal(initialGoal);
          setDoc(goalRefDoc, initialGoal, { merge: true }).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, goalPath)
          );
        }
        checkDoneSyncing();
      },
      (err) => {
        loadedGoals = true;
        checkDoneSyncing();
        handleFirestoreError(err, OperationType.GET, goalPath);
      }
    );

    // 2. Progress listener (contains saved lastPage, lastSurah, lastAyah)
    const progressPath = `users/${uid}/readingProgress/current`;
    const progressRefDoc = doc(db, 'users', uid, 'readingProgress', 'current');
    const unsubProgress = onSnapshot(
      progressRefDoc,
      (docSnap) => {
        loadedProgress = true;
        if (docSnap.exists()) {
          const normalized = normalizeProgressForToday(docSnap.data() as ReadingProgress, uid);
          setProgress(normalized);
          localStorage.setItem(`athar_progress_${uid}`, JSON.stringify(normalized));
        } else {
          const initialProg: ReadingProgress = {
            ...DEFAULT_PROGRESS,
            userId: uid,
            lastActiveDate: getTodayString(),
            updatedAt: new Date().toISOString(),
          };
          setProgress(initialProg);
          setDoc(progressRefDoc, initialProg, { merge: true }).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, progressPath)
          );
        }
        setIsProgressLoaded(true);
        checkDoneSyncing();
      },
      (err) => {
        loadedProgress = true;
        setIsProgressLoaded(true);
        checkDoneSyncing();
        handleFirestoreError(err, OperationType.GET, progressPath);
      }
    );

    // 3. Reading History collection listener (checkmarks, time read, stopped page per day)
    const historyPath = `users/${uid}/readingHistory`;
    const historyColRef = collection(db, 'users', uid, 'readingHistory');
    const unsubHistory = onSnapshot(
      historyColRef,
      (snapshot) => {
        loadedHistory = true;
        const map: Record<string, ReadingHistory> = {};
        snapshot.forEach((d) => {
          const data = d.data() as ReadingHistory;
          const dateKey = data.date || d.id;
          map[dateKey] = {
            ...data,
            date: dateKey,
            userId: data.userId || uid,
          };
        });
        setHistoryMap(map);
        localStorage.setItem(`athar_history_${uid}`, JSON.stringify(map));
        checkDoneSyncing();
      },
      (err) => {
        loadedHistory = true;
        checkDoneSyncing();
        handleFirestoreError(err, OperationType.LIST, historyPath);
      }
    );

    // 4. Habit listener
    const habitPath = `users/${uid}/habitSettings/main`;
    const habitRefDoc = doc(db, 'users', uid, 'habitSettings', 'main');
    const unsubHabit = onSnapshot(
      habitRefDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as HabitSettings;
          setHabitSettings(data);
          localStorage.setItem(`athar_habit_${uid}`, JSON.stringify(data));
        } else {
          let initialHabit: HabitSettings = { ...DEFAULT_HABIT, userId: uid, updatedAt: new Date().toISOString() };
          try {
            const localHabitRaw = localStorage.getItem('athar_habit');
            if (localHabitRaw) {
              initialHabit = { ...DEFAULT_HABIT, ...JSON.parse(localHabitRaw), userId: uid };
            }
          } catch {}
          setHabitSettings(initialHabit);
          setDoc(habitRefDoc, initialHabit, { merge: true }).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, habitPath)
          );
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, habitPath);
      }
    );

    // 5. Notification listener
    const notifPath = `users/${uid}/notificationSettings/main`;
    const notifRefDoc = doc(db, 'users', uid, 'notificationSettings', 'main');
    const unsubNotif = onSnapshot(
      notifRefDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as NotificationSettings;
          setNotificationSettings(data);
          localStorage.setItem(`athar_notifications_${uid}`, JSON.stringify(data));
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, notifPath);
      }
    );

    return () => {
      unsubGoal();
      unsubProgress();
      unsubHistory();
      unsubHabit();
      unsubNotif();
    };
  }, [uid, isAuthenticated, authLoading, loadSignedOutState]);

  // Update Goal (time-based minutes)
  const updateGoal = useCallback(async (_type: GoalType, target: number) => {
    const activeUid = uidRef.current;
    const authed = isAuthenticatedRef.current;
    const safeTarget = Math.max(1, Math.min(180, target));

    const updated: ReadingGoal = {
      ...goalRef.current,
      userId: activeUid,
      goalType: 'minutes',
      dailyTarget: safeTarget,
      updatedAt: new Date().toISOString(),
    };
    setGoal(updated);
    localStorage.setItem('athar_goal', JSON.stringify(updated));
    if (activeUid) {
      localStorage.setItem(`athar_goal_${activeUid}`, JSON.stringify(updated));
    }

    if (activeUid && authed) {
      const path = `users/${activeUid}/goals/current`;
      try {
        await setDoc(doc(db, 'users', activeUid, 'goals', 'current'), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  }, []);

  // Save Reading Position (ONLY saves the stopped page/surah/ayah — never counts pages)
  const saveReadingPosition = useCallback(async (page: number, surah?: number, ayah?: number) => {
    const activeUid = uidRef.current;
    const authed = isAuthenticatedRef.current;
    if (!activeUid || !authed) return;

    const validPage = Math.max(1, Math.min(604, page));
    const today = getTodayString();
    const surahMeta = getSurahForPage(validPage);
    const surahNum = surah && surah >= 1 && surah <= 114 ? surah : surahMeta.number;
    const ayahNum = ayah && ayah >= 1 ? ayah : 1;

    const currentProg = progressRef.current;
    if (
      currentProg.lastPage === validPage &&
      currentProg.lastSurah === surahNum &&
      currentProg.lastAyah === ayahNum &&
      currentProg.lastActiveDate === today
    ) {
      return;
    }

    const now = new Date().toISOString();
    const isSameDay = currentProg.lastActiveDate === today;

    const updated: ReadingProgress = {
      ...currentProg,
      userId: activeUid,
      lastPage: validPage,
      lastSurah: surahNum,
      lastAyah: ayahNum,
      lastSurahName: surahMeta.name,
      lastReadingTimestamp: now,
      lastActiveDate: today,
      dailyPagesRead: 0,
      dailyMinutesRead: isSameDay ? (currentProg.dailyMinutesRead || 0) : 0,
      isDailyGoalCompleted: isSameDay ? Boolean(currentProg.isDailyGoalCompleted) : false,
      isTwoMinuteGoalCompleted: isSameDay ? Boolean(currentProg.isTwoMinuteGoalCompleted) : false,
      updatedAt: now,
    };

    progressRef.current = updated;
    setProgress(updated);
    localStorage.setItem(`athar_progress_${activeUid}`, JSON.stringify(updated));

    const histMap = historyMapRef.current;
    const prevHistory = histMap[today] || {
      userId: activeUid,
      date: today,
      minutesRead: 0,
    };

    const updatedHistory: ReadingHistory = {
      ...prevHistory,
      userId: activeUid,
      date: today,
      lastPage: validPage,
      lastSurah: surahNum,
      lastAyah: ayahNum,
      lastSurahName: surahMeta.name,
      updatedAt: now,
    };

    const newHistMap = { ...histMap, [today]: updatedHistory };
    historyMapRef.current = newHistMap;
    setHistoryMap(newHistMap);
    localStorage.setItem(`athar_history_${activeUid}`, JSON.stringify(newHistMap));

    const progressPath = `users/${activeUid}/readingProgress/current`;
    const historyPath = `users/${activeUid}/readingHistory/${today}`;
    try {
      await Promise.all([
        setDoc(doc(db, 'users', activeUid, 'readingProgress', 'current'), updated, { merge: true }),
        setDoc(doc(db, 'users', activeUid, 'readingHistory', today), updatedHistory, { merge: true }),
      ]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, progressPath + ' | ' + historyPath);
    }
  }, []);

  // Record Session Time (seconds) — time-only progress tracking
  const recordSessionTime = useCallback(async (seconds: number) => {
    const activeUid = uidRef.current;
    const authed = isAuthenticatedRef.current;
    if (seconds <= 0 || !activeUid || !authed) return;

    const today = getTodayString();
    const now = new Date().toISOString();
    const currentProg = progressRef.current;
    const histMap = historyMapRef.current;
    const prevHistory = histMap[today];

    const baseMinutes =
      typeof prevHistory?.minutesRead === 'number'
        ? prevHistory.minutesRead
        : currentProg.lastActiveDate === today
        ? currentProg.dailyMinutesRead || 0
        : 0;

    const newDailyMinutes = Math.round((baseMinutes + seconds / 60) * 100) / 100;
    const targetMinutes = goalRef.current.dailyTarget || 5;
    const targetMet = newDailyMinutes >= targetMinutes;

    // Respect explicit manual uncheck (isChecked === false) if user toggled it off
    const previouslyChecked =
      typeof prevHistory?.isChecked === 'boolean'
        ? prevHistory.isChecked
        : Boolean(
            prevHistory?.isDailyGoalCompleted ||
              (currentProg.lastActiveDate === today && currentProg.isDailyGoalCompleted)
          );

    const isGoalCompleted =
      prevHistory?.isChecked === false ? false : Boolean(previouslyChecked || targetMet);

    const updated: ReadingProgress = {
      ...currentProg,
      userId: activeUid,
      dailyPagesRead: 0,
      dailyMinutesRead: newDailyMinutes,
      isDailyGoalCompleted: isGoalCompleted,
      lastReadingTimestamp: now,
      lastActiveDate: today,
      updatedAt: now,
    };

    progressRef.current = updated;
    setProgress(updated);
    localStorage.setItem(`athar_progress_${activeUid}`, JSON.stringify(updated));

    const updatedHistory: ReadingHistory = {
      ...(prevHistory || { userId: activeUid, date: today }),
      userId: activeUid,
      date: today,
      minutesRead: newDailyMinutes,
      isDailyGoalCompleted: isGoalCompleted,
      ...(typeof prevHistory?.isChecked === 'boolean'
        ? { isChecked: prevHistory.isChecked }
        : targetMet
        ? { isChecked: true }
        : {}),
      lastPage: currentProg.lastPage,
      lastSurah: currentProg.lastSurah,
      lastAyah: currentProg.lastAyah,
      lastSurahName: currentProg.lastSurahName,
      updatedAt: now,
    };

    const newHistMap = { ...histMap, [today]: updatedHistory };
    historyMapRef.current = newHistMap;
    setHistoryMap(newHistMap);
    localStorage.setItem(`athar_history_${activeUid}`, JSON.stringify(newHistMap));

    const progressPath = `users/${activeUid}/readingProgress/current`;
    const historyPath = `users/${activeUid}/readingHistory/${today}`;
    try {
      await Promise.all([
        setDoc(doc(db, 'users', activeUid, 'readingProgress', 'current'), updated, { merge: true }),
        setDoc(doc(db, 'users', activeUid, 'readingHistory', today), updatedHistory, { merge: true }),
      ]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, progressPath + ' | ' + historyPath);
    }
  }, []);

  // Toggle manual checkmark (✓) on any day (up to today)
  const toggleDayCheck = useCallback(async (dateStr: string, explicitValue?: boolean) => {
    const activeUid = uidRef.current;
    const authed = isAuthenticatedRef.current;
    if (!activeUid || !authed) return;

    const today = getTodayString();
    if (dateStr > today) return; // Cannot mark future days

    const now = new Date().toISOString();
    const histMap = historyMapRef.current;
    const prevHistory = histMap[dateStr] || {
      userId: activeUid,
      date: dateStr,
      minutesRead: 0,
    };

    const currentlyChecked = Boolean(
      typeof prevHistory.isChecked === 'boolean'
        ? prevHistory.isChecked
        : prevHistory.isDailyGoalCompleted
    );
    const nextChecked = explicitValue !== undefined ? explicitValue : !currentlyChecked;

    const updatedHistory: ReadingHistory = {
      ...prevHistory,
      userId: activeUid,
      date: dateStr,
      isChecked: nextChecked,
      isDailyGoalCompleted: nextChecked,
      updatedAt: now,
    };

    const newHistMap = { ...histMap, [dateStr]: updatedHistory };
    historyMapRef.current = newHistMap;
    setHistoryMap(newHistMap);
    localStorage.setItem(`athar_history_${activeUid}`, JSON.stringify(newHistMap));

    const historyPath = `users/${activeUid}/readingHistory/${dateStr}`;

    if (dateStr === today) {
      const currentProg = progressRef.current;
      const isSameDay = currentProg.lastActiveDate === today;
      const updatedProg: ReadingProgress = {
        ...currentProg,
        userId: activeUid,
        lastActiveDate: today,
        dailyMinutesRead: isSameDay ? (currentProg.dailyMinutesRead || 0) : (prevHistory.minutesRead || 0),
        isDailyGoalCompleted: nextChecked,
        lastReadingTimestamp: nextChecked ? now : currentProg.lastReadingTimestamp,
        updatedAt: now,
      };
      progressRef.current = updatedProg;
      setProgress(updatedProg);
      localStorage.setItem(`athar_progress_${activeUid}`, JSON.stringify(updatedProg));

      const progressPath = `users/${activeUid}/readingProgress/current`;
      try {
        await Promise.all([
          setDoc(doc(db, 'users', activeUid, 'readingHistory', dateStr), updatedHistory, { merge: true }),
          setDoc(doc(db, 'users', activeUid, 'readingProgress', 'current'), updatedProg, { merge: true }),
        ]);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, historyPath + ' | ' + progressPath);
      }
    } else {
      try {
        await setDoc(doc(db, 'users', activeUid, 'readingHistory', dateStr), updatedHistory, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, historyPath);
      }
    }
  }, []);

  // Mark Today's Goal Complete
  const markGoalComplete = useCallback(async () => {
    await toggleDayCheck(getTodayString(), true);
  }, [toggleDayCheck]);

  // Don't Miss Mode controls
  const startTwoMinuteMode = useCallback(() => setIsTwoMinuteModeActive(true), []);
  const stopTwoMinuteMode = useCallback(() => setIsTwoMinuteModeActive(false), []);

  const completeTwoMinuteSession = useCallback(async () => {
    const activeUid = uidRef.current;
    const authed = isAuthenticatedRef.current;
    if (!activeUid || !authed) return;

    const today = getTodayString();
    const now = new Date().toISOString();
    const currentProg = progressRef.current;
    const histMap = historyMapRef.current;
    const prevHistory = histMap[today] || { userId: activeUid, date: today, minutesRead: 0 };

    const updated: ReadingProgress = {
      ...currentProg,
      userId: activeUid,
      isTwoMinuteGoalCompleted: true,
      lastActiveDate: today,
      lastReadingTimestamp: now,
      updatedAt: now,
    };
    progressRef.current = updated;
    setProgress(updated);
    localStorage.setItem(`athar_progress_${activeUid}`, JSON.stringify(updated));

    const updatedHistory: ReadingHistory = {
      ...prevHistory,
      userId: activeUid,
      date: today,
      isTwoMinuteGoalCompleted: true,
      isChecked: prevHistory.isChecked ?? true,
      isDailyGoalCompleted: prevHistory.isDailyGoalCompleted ?? true,
      updatedAt: now,
    };
    const newHistMap = { ...histMap, [today]: updatedHistory };
    historyMapRef.current = newHistMap;
    setHistoryMap(newHistMap);
    localStorage.setItem(`athar_history_${activeUid}`, JSON.stringify(newHistMap));

    const progressPath = `users/${activeUid}/readingProgress/current`;
    const historyPath = `users/${activeUid}/readingHistory/${today}`;
    try {
      await Promise.all([
        setDoc(doc(db, 'users', activeUid, 'readingProgress', 'current'), updated, { merge: true }),
        setDoc(doc(db, 'users', activeUid, 'readingHistory', today), updatedHistory, { merge: true }),
      ]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, progressPath + ' | ' + historyPath);
    }
  }, []);

  // Update Habit Settings
  const updateHabitSettings = useCallback(async (routine: string, customRoutine: string, preferredTime: string) => {
    const activeUid = uidRef.current;
    const authed = isAuthenticatedRef.current;

    let routineNameInArabic = 'صلاة الفجر';
    if (routine === 'after_breakfast') routineNameInArabic = 'تناول الإفطار';
    if (routine === 'after_lunch') routineNameInArabic = 'تناول الغداء';
    if (routine === 'after_isha') routineNameInArabic = 'صلاة العشاء';
    if (routine === 'before_sleep') routineNameInArabic = 'النوم';
    if (routine === 'after_waking') routineNameInArabic = 'الاستيقاظ';
    if (routine === 'custom' && customRoutine) routineNameInArabic = customRoutine;

    const goalDesc = formatMinutesGoalLabel(goalRef.current.dailyTarget || 5);
    const habitStatement = `بعد ما أخلص ${routineNameInArabic}، هقرأ ${goalDesc} من القرآن.`;

    const updated: HabitSettings = {
      userId: activeUid,
      dailyRoutine: routine,
      customRoutine,
      preferredTime,
      habitStatement,
      updatedAt: new Date().toISOString(),
    };

    setHabitSettings(updated);
    localStorage.setItem('athar_habit', JSON.stringify(updated));
    if (activeUid) {
      localStorage.setItem(`athar_habit_${activeUid}`, JSON.stringify(updated));
    }

    if (activeUid && authed) {
      const path = `users/${activeUid}/habitSettings/main`;
      try {
        await setDoc(doc(db, 'users', activeUid, 'habitSettings', 'main'), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  }, []);

  // Update Notification Settings
  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    const activeUid = uidRef.current;
    const authed = isAuthenticatedRef.current;

    const updated: NotificationSettings = {
      ...notificationSettings,
      ...settings,
      userId: activeUid,
      updatedAt: new Date().toISOString(),
    };

    setNotificationSettings(updated);
    localStorage.setItem('athar_notifications', JSON.stringify(updated));
    if (activeUid) {
      localStorage.setItem(`athar_notifications_${activeUid}`, JSON.stringify(updated));
    }

    if (activeUid && authed) {
      const path = `users/${activeUid}/notificationSettings/main`;
      try {
        await setDoc(doc(db, 'users', activeUid, 'notificationSettings', 'main'), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  }, [notificationSettings]);

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('athar_onboarding_completed', 'true');
  };

  return (
    <HabitContext.Provider
      value={{
        goal,
        updateGoal,
        progress,
        todayMinutesRead,
        isTodayChecked,
        isProgressLoaded,
        saveReadingPosition,
        recordSessionTime,
        toggleDayCheck,
        markGoalComplete,
        isTwoMinuteModeActive,
        startTwoMinuteMode,
        stopTwoMinuteMode,
        completeTwoMinuteSession,
        isComebackDetected,
        daysSinceLastRead,
        dismissComeback,
        habitSettings,
        updateHabitSettings,
        notificationSettings,
        updateNotificationSettings,
        historyMap,
        isSyncing,
        needsOnboarding: !hasCompletedOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};
