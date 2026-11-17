export type GoalType = 'pages' | 'minutes';

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingGoal {
  userId: string;
  goalType: GoalType;
  dailyTarget: number; // e.g. 1 (page) or 5 (minutes)
  minimumTwoMinuteGoal?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingProgress {
  userId: string;
  lastSurah: number;
  lastAyah: number;
  lastPage: number;
  lastSurahName?: string;
  lastReadingTimestamp?: string;
  dailyPagesRead?: number;
  dailyMinutesRead?: number;
  isDailyGoalCompleted?: boolean;
  isTwoMinuteGoalCompleted?: boolean;
  lastActiveDate?: string;
  updatedAt?: string;
}

export interface ReadingHistory {
  userId: string;
  date: string; // YYYY-MM-DD
  pagesRead?: number;
  minutesRead?: number;
  versesRead?: number;
  isDailyGoalCompleted?: boolean;
  isChecked?: boolean;
  isTwoMinuteGoalCompleted?: boolean;
  lastSurah?: number;
  lastAyah?: number;
  lastPage?: number;
  lastSurahName?: string;
  updatedAt?: string;
}

export interface HabitSettings {
  userId: string;
  dailyRoutine?: string;
  customRoutine?: string;
  preferredTime?: string;
  habitStatement?: string;
  updatedAt?: string;
}

export interface NotificationSettings {
  userId: string;
  browserPushEnabled?: boolean;
  fcmToken?: string;
  scheduledReminder?: boolean;
  missedReminder?: boolean;
  endOfDayReminder?: boolean;
  preferredTime?: string;
  updatedAt?: string;
}

export interface SurahMeta {
  number: number;
  name: string; // Arabic name, e.g. الفاتحة
  englishName: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  startPage: number;
  endPage: number;
}

export interface JuzMeta {
  number: number;
  name: string; // e.g. الجزء الأول
  startPage: number;
  startSurah: number;
  startAyah: number;
}

export interface AyahItem {
  number: number; // Overall number in Quran
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
  text: string;
  page: number;
  juz: number;
  hizbQuarter?: number;
}

export interface QuranPageData {
  pageNumber: number;
  juzNumber: number;
  surahNames: string[];
  ayahs: AyahItem[];
}

export interface TafsirVerse {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  tafsirText: string;
  source: string; // 'تفسير السعدي (تيسير الكريم الرحمن في تفسير كلام المنان)'
}
