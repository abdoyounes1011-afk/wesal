import { SurahMeta, JuzMeta } from '../types';

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, name: 'الفَاتِحة', englishName: 'Al-Fatihah', revelationType: 'Meccan', numberOfAyahs: 7, startPage: 1, endPage: 1 },
  { number: 2, name: 'البَقَرَة', englishName: 'Al-Baqarah', revelationType: 'Medinan', numberOfAyahs: 286, startPage: 2, endPage: 49 },
  { number: 3, name: 'آل عِمرَان', englishName: 'Aal-Imran', revelationType: 'Medinan', numberOfAyahs: 200, startPage: 50, endPage: 76 },
  { number: 4, name: 'النِّسَاء', englishName: 'An-Nisa', revelationType: 'Medinan', numberOfAyahs: 176, startPage: 77, endPage: 106 },
  { number: 5, name: 'المَائدة', englishName: 'Al-Maidah', revelationType: 'Medinan', numberOfAyahs: 120, startPage: 106, endPage: 127 },
  { number: 6, name: 'الأنعَام', englishName: 'Al-Anam', revelationType: 'Meccan', numberOfAyahs: 165, startPage: 128, endPage: 150 },
  { number: 7, name: 'الأعرَاف', englishName: 'Al-Araf', revelationType: 'Meccan', numberOfAyahs: 206, startPage: 151, endPage: 176 },
  { number: 8, name: 'الأنفَال', englishName: 'Al-Anfal', revelationType: 'Medinan', numberOfAyahs: 75, startPage: 177, endPage: 186 },
  { number: 9, name: 'التَّوبَة', englishName: 'At-Tawbah', revelationType: 'Medinan', numberOfAyahs: 129, startPage: 187, endPage: 207 },
  { number: 10, name: 'يُونُس', englishName: 'Yunus', revelationType: 'Meccan', numberOfAyahs: 109, startPage: 208, endPage: 221 },
  { number: 11, name: 'هُود', englishName: 'Hud', revelationType: 'Meccan', numberOfAyahs: 123, startPage: 221, endPage: 235 },
  { number: 12, name: 'يُوسُف', englishName: 'Yusuf', revelationType: 'Meccan', numberOfAyahs: 111, startPage: 235, endPage: 248 },
  { number: 13, name: 'الرَّعْد', englishName: 'Ar-Rad', revelationType: 'Medinan', numberOfAyahs: 43, startPage: 249, endPage: 255 },
  { number: 14, name: 'إبراهِيم', englishName: 'Ibrahim', revelationType: 'Meccan', numberOfAyahs: 52, startPage: 255, endPage: 261 },
  { number: 15, name: 'الحِجْر', englishName: 'Al-Hijr', revelationType: 'Meccan', numberOfAyahs: 99, startPage: 262, endPage: 267 },
  { number: 16, name: 'النَّحْل', englishName: 'An-Nahl', revelationType: 'Meccan', numberOfAyahs: 128, startPage: 267, endPage: 281 },
  { number: 17, name: 'الإسْرَاء', englishName: 'Al-Isra', revelationType: 'Meccan', numberOfAyahs: 111, startPage: 282, endPage: 293 },
  { number: 18, name: 'الكَهْف', englishName: 'Al-Kahf', revelationType: 'Meccan', numberOfAyahs: 110, startPage: 293, endPage: 304 },
  { number: 19, name: 'مَريَم', englishName: 'Maryam', revelationType: 'Meccan', numberOfAyahs: 98, startPage: 305, endPage: 312 },
  { number: 20, name: 'طه', englishName: 'Ta-Ha', revelationType: 'Meccan', numberOfAyahs: 135, startPage: 312, endPage: 321 },
  { number: 21, name: 'الأنبيَاء', englishName: 'Al-Anbiya', revelationType: 'Meccan', numberOfAyahs: 112, startPage: 322, endPage: 331 },
  { number: 22, name: 'الحَجّ', englishName: 'Al-Hajj', revelationType: 'Medinan', numberOfAyahs: 78, startPage: 332, endPage: 341 },
  { number: 23, name: 'المُؤمِنُون', englishName: 'Al-Muminun', revelationType: 'Meccan', numberOfAyahs: 118, startPage: 342, endPage: 349 },
  { number: 24, name: 'النُّور', englishName: 'An-Nur', revelationType: 'Medinan', numberOfAyahs: 64, startPage: 350, endPage: 359 },
  { number: 25, name: 'الفُرْقَان', englishName: 'Al-Furqan', revelationType: 'Meccan', numberOfAyahs: 77, startPage: 359, endPage: 366 },
  { number: 26, name: 'الشُّعَرَاء', englishName: 'Ash-Shuara', revelationType: 'Meccan', numberOfAyahs: 227, startPage: 367, endPage: 376 },
  { number: 27, name: 'النَّمْل', englishName: 'An-Naml', revelationType: 'Meccan', numberOfAyahs: 93, startPage: 377, endPage: 385 },
  { number: 28, name: 'القَصَص', englishName: 'Al-Qasas', revelationType: 'Meccan', numberOfAyahs: 88, startPage: 385, endPage: 396 },
  { number: 29, name: 'العَنكبوت', englishName: 'Al-Ankabut', revelationType: 'Meccan', numberOfAyahs: 69, startPage: 396, endPage: 404 },
  { number: 30, name: 'الرُّوم', englishName: 'Ar-Rum', revelationType: 'Meccan', numberOfAyahs: 60, startPage: 404, endPage: 410 },
  { number: 31, name: 'لُقمَان', englishName: 'Luqman', revelationType: 'Meccan', numberOfAyahs: 34, startPage: 411, endPage: 415 },
  { number: 32, name: 'السَّجْدَة', englishName: 'As-Sajdah', revelationType: 'Meccan', numberOfAyahs: 30, startPage: 415, endPage: 417 },
  { number: 33, name: 'الأحزَاب', englishName: 'Al-Ahzab', revelationType: 'Medinan', numberOfAyahs: 73, startPage: 418, endPage: 427 },
  { number: 34, name: 'سَبَأ', englishName: 'Saba', revelationType: 'Meccan', numberOfAyahs: 54, startPage: 428, endPage: 434 },
  { number: 35, name: 'فَاطِر', englishName: 'Fatir', revelationType: 'Meccan', numberOfAyahs: 45, startPage: 434, endPage: 440 },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', revelationType: 'Meccan', numberOfAyahs: 83, startPage: 440, endPage: 445 },
  { number: 37, name: 'الصَّافَّات', englishName: 'As-Saffat', revelationType: 'Meccan', numberOfAyahs: 182, startPage: 446, endPage: 452 },
  { number: 38, name: 'ص', englishName: 'Sad', revelationType: 'Meccan', numberOfAyahs: 88, startPage: 453, endPage: 458 },
  { number: 39, name: 'الزُّمَر', englishName: 'Az-Zumar', revelationType: 'Meccan', numberOfAyahs: 75, startPage: 458, endPage: 467 },
  { number: 40, name: 'غَافِر', englishName: 'Ghafir', revelationType: 'Meccan', numberOfAyahs: 85, startPage: 467, endPage: 476 },
  { number: 41, name: 'فُصِّلَت', englishName: 'Fussilat', revelationType: 'Meccan', numberOfAyahs: 54, startPage: 477, endPage: 482 },
  { number: 42, name: 'الشُّورَى', englishName: 'Ash-Shura', revelationType: 'Meccan', numberOfAyahs: 53, startPage: 483, endPage: 489 },
  { number: 43, name: 'الزُّخْرُف', englishName: 'Az-Zukhruf', revelationType: 'Meccan', numberOfAyahs: 89, startPage: 489, endPage: 495 },
  { number: 44, name: 'الدُّخَان', englishName: 'Ad-Dukhan', revelationType: 'Meccan', numberOfAyahs: 59, startPage: 496, endPage: 498 },
  { number: 45, name: 'الجَاثِية', englishName: 'Al-Jathiyah', revelationType: 'Meccan', numberOfAyahs: 37, startPage: 499, endPage: 502 },
  { number: 46, name: 'الأحْقَاف', englishName: 'Al-Ahqaf', revelationType: 'Meccan', numberOfAyahs: 35, startPage: 502, endPage: 506 },
  { number: 47, name: 'مُحَمَّد', englishName: 'Muhammad', revelationType: 'Medinan', numberOfAyahs: 38, startPage: 507, endPage: 510 },
  { number: 48, name: 'الفَتْح', englishName: 'Al-Fath', revelationType: 'Medinan', numberOfAyahs: 29, startPage: 511, endPage: 515 },
  { number: 49, name: 'الحُجُرَات', englishName: 'Al-Hujurat', revelationType: 'Medinan', numberOfAyahs: 18, startPage: 515, endPage: 517 },
  { number: 50, name: 'ق', englishName: 'Qaf', revelationType: 'Meccan', numberOfAyahs: 45, startPage: 518, endPage: 520 },
  { number: 51, name: 'الذَّارِيَات', englishName: 'Adh-Dhariyat', revelationType: 'Meccan', numberOfAyahs: 60, startPage: 520, endPage: 523 },
  { number: 52, name: 'الطُّور', englishName: 'At-Tur', revelationType: 'Meccan', numberOfAyahs: 49, startPage: 523, endPage: 525 },
  { number: 53, name: 'النَّجْم', englishName: 'An-Najm', revelationType: 'Meccan', numberOfAyahs: 62, startPage: 526, endPage: 528 },
  { number: 54, name: 'القَمَر', englishName: 'Al-Qamar', revelationType: 'Meccan', numberOfAyahs: 55, startPage: 528, endPage: 531 },
  { number: 55, name: 'الرَّحْمَن', englishName: 'Ar-Rahman', revelationType: 'Medinan', numberOfAyahs: 78, startPage: 531, endPage: 534 },
  { number: 56, name: 'الوَاقِعَة', englishName: 'Al-Waqiah', revelationType: 'Meccan', numberOfAyahs: 96, startPage: 534, endPage: 537 },
  { number: 57, name: 'الحَدِيد', englishName: 'Al-Hadid', revelationType: 'Medinan', numberOfAyahs: 29, startPage: 537, endPage: 541 },
  { number: 58, name: 'المجَادلة', englishName: 'Al-Mujadila', revelationType: 'Medinan', numberOfAyahs: 22, startPage: 542, endPage: 545 },
  { number: 59, name: 'الحَشْر', englishName: 'Al-Hashr', revelationType: 'Medinan', numberOfAyahs: 24, startPage: 545, endPage: 548 },
  { number: 60, name: 'المُمتَحنَة', englishName: 'Al-Mumtahanah', revelationType: 'Medinan', numberOfAyahs: 13, startPage: 549, endPage: 551 },
  { number: 61, name: 'الصَّفّ', englishName: 'As-Saff', revelationType: 'Medinan', numberOfAyahs: 14, startPage: 551, endPage: 552 },
  { number: 62, name: 'الجُمُعَة', englishName: 'Al-Jumuah', revelationType: 'Medinan', numberOfAyahs: 11, startPage: 553, endPage: 554 },
  { number: 63, name: 'المُنَافِقُون', englishName: 'Al-Munafiqun', revelationType: 'Medinan', numberOfAyahs: 11, startPage: 554, endPage: 555 },
  { number: 64, name: 'التَّغَابُن', englishName: 'At-Taghabun', revelationType: 'Medinan', numberOfAyahs: 18, startPage: 556, endPage: 557 },
  { number: 65, name: 'الطَّلَاق', englishName: 'At-Talaq', revelationType: 'Medinan', numberOfAyahs: 12, startPage: 558, endPage: 559 },
  { number: 66, name: 'التَّحْرِيم', englishName: 'At-Tahrim', revelationType: 'Medinan', numberOfAyahs: 12, startPage: 560, endPage: 561 },
  { number: 67, name: 'المُلْك', englishName: 'Al-Mulk', revelationType: 'Meccan', numberOfAyahs: 30, startPage: 562, endPage: 564 },
  { number: 68, name: 'القَلَم', englishName: 'Al-Qalam', revelationType: 'Meccan', numberOfAyahs: 52, startPage: 564, endPage: 566 },
  { number: 69, name: 'الحَاقَّة', englishName: 'Al-Haqqah', revelationType: 'Meccan', numberOfAyahs: 52, startPage: 566, endPage: 568 },
  { number: 70, name: 'المَعَارِج', englishName: 'Al-Maarij', revelationType: 'Meccan', numberOfAyahs: 44, startPage: 568, endPage: 570 },
  { number: 71, name: 'نُوح', englishName: 'Nuh', revelationType: 'Meccan', numberOfAyahs: 28, startPage: 570, endPage: 571 },
  { number: 72, name: 'الجِنّ', englishName: 'Al-Jinn', revelationType: 'Meccan', numberOfAyahs: 28, startPage: 572, endPage: 573 },
  { number: 73, name: 'المُزَّمِّل', englishName: 'Al-Muzzammil', revelationType: 'Meccan', numberOfAyahs: 20, startPage: 574, endPage: 575 },
  { number: 74, name: 'المُدَّثِّر', englishName: 'Al-Muddaththir', revelationType: 'Meccan', numberOfAyahs: 56, startPage: 575, endPage: 577 },
  { number: 75, name: 'القِيَامَة', englishName: 'Al-Qiyamah', revelationType: 'Meccan', numberOfAyahs: 40, startPage: 577, endPage: 578 },
  { number: 76, name: 'الإنسَان', englishName: 'Al-Insan', revelationType: 'Medinan', numberOfAyahs: 31, startPage: 578, endPage: 580 },
  { number: 77, name: 'المُرْسَلَات', englishName: 'Al-Mursalat', revelationType: 'Meccan', numberOfAyahs: 50, startPage: 580, endPage: 581 },
  { number: 78, name: 'النَّبَأ', englishName: 'An-Naba', revelationType: 'Meccan', numberOfAyahs: 40, startPage: 582, endPage: 583 },
  { number: 79, name: 'النَّازِعَات', englishName: 'An-Naziat', revelationType: 'Meccan', numberOfAyahs: 46, startPage: 583, endPage: 584 },
  { number: 80, name: 'عَبَسَ', englishName: 'Abasa', revelationType: 'Meccan', numberOfAyahs: 42, startPage: 585, endPage: 586 },
  { number: 81, name: 'التَّكْوِير', englishName: 'At-Takwir', revelationType: 'Meccan', numberOfAyahs: 29, startPage: 586, endPage: 587 },
  { number: 82, name: 'الانفِطَار', englishName: 'Al-Infitar', revelationType: 'Meccan', numberOfAyahs: 19, startPage: 587, endPage: 587 },
  { number: 83, name: 'المُطَفِّفِين', englishName: 'Al-Mutaffifin', revelationType: 'Meccan', numberOfAyahs: 36, startPage: 587, endPage: 589 },
  { number: 84, name: 'الانشِقَاق', englishName: 'Al-Inshiqaq', revelationType: 'Meccan', numberOfAyahs: 25, startPage: 589, endPage: 590 },
  { number: 85, name: 'البُرُوج', englishName: 'Al-Buruj', revelationType: 'Meccan', numberOfAyahs: 22, startPage: 590, endPage: 591 },
  { number: 86, name: 'الطَّارِق', englishName: 'At-Tariq', revelationType: 'Meccan', numberOfAyahs: 17, startPage: 591, endPage: 592 },
  { number: 87, name: 'الأَعْلَى', englishName: 'Al-Ala', revelationType: 'Meccan', numberOfAyahs: 19, startPage: 591, endPage: 592 },
  { number: 88, name: 'الغَاشِيَة', englishName: 'Al-Ghashiyah', revelationType: 'Meccan', numberOfAyahs: 26, startPage: 592, endPage: 593 },
  { number: 89, name: 'الفَجْر', englishName: 'Al-Fajr', revelationType: 'Meccan', numberOfAyahs: 30, startPage: 593, endPage: 594 },
  { number: 90, name: 'البَلَد', englishName: 'Al-Balad', revelationType: 'Meccan', numberOfAyahs: 20, startPage: 594, endPage: 595 },
  { number: 91, name: 'الشَّمْس', englishName: 'Ash-Shams', revelationType: 'Meccan', numberOfAyahs: 15, startPage: 595, endPage: 595 },
  { number: 92, name: 'اللَّيْل', englishName: 'Al-Layl', revelationType: 'Meccan', numberOfAyahs: 21, startPage: 595, endPage: 596 },
  { number: 93, name: 'الضُّحَى', englishName: 'Ad-Duha', revelationType: 'Meccan', numberOfAyahs: 11, startPage: 596, endPage: 596 },
  { number: 94, name: 'الشَّرْح', englishName: 'Ash-Sharh', revelationType: 'Meccan', numberOfAyahs: 8, startPage: 596, endPage: 596 },
  { number: 95, name: 'التِّين', englishName: 'At-Tin', revelationType: 'Meccan', numberOfAyahs: 8, startPage: 597, endPage: 597 },
  { number: 96, name: 'العَلَق', englishName: 'Al-Alaq', revelationType: 'Meccan', numberOfAyahs: 19, startPage: 597, endPage: 597 },
  { number: 97, name: 'القَدْر', englishName: 'Al-Qadr', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 598, endPage: 598 },
  { number: 98, name: 'البَيِّنَة', englishName: 'Al-Bayyinah', revelationType: 'Medinan', numberOfAyahs: 8, startPage: 598, endPage: 599 },
  { number: 99, name: 'الزَّلْزَلَة', englishName: 'Az-Zalzalah', revelationType: 'Medinan', numberOfAyahs: 8, startPage: 599, endPage: 599 },
  { number: 100, name: 'العَادِيَات', englishName: 'Al-Adiyat', revelationType: 'Meccan', numberOfAyahs: 11, startPage: 599, endPage: 600 },
  { number: 101, name: 'القَارِعَة', englishName: 'Al-Qariah', revelationType: 'Meccan', numberOfAyahs: 11, startPage: 600, endPage: 600 },
  { number: 102, name: 'التَّكَاثُر', englishName: 'At-Takathur', revelationType: 'Meccan', numberOfAyahs: 8, startPage: 600, endPage: 600 },
  { number: 103, name: 'العَصْر', englishName: 'Al-Asr', revelationType: 'Meccan', numberOfAyahs: 3, startPage: 601, endPage: 601 },
  { number: 104, name: 'الهُمَزَة', englishName: 'Al-Humazah', revelationType: 'Meccan', numberOfAyahs: 9, startPage: 601, endPage: 601 },
  { number: 105, name: 'الفِيل', englishName: 'Al-Fil', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 601, endPage: 601 },
  { number: 106, name: 'قُرَيْش', englishName: 'Quraysh', revelationType: 'Meccan', numberOfAyahs: 4, startPage: 602, endPage: 602 },
  { number: 107, name: 'المَاعُون', englishName: 'Al-Maun', revelationType: 'Meccan', numberOfAyahs: 7, startPage: 602, endPage: 602 },
  { number: 108, name: 'الكَوْثَر', englishName: 'Al-Kawthar', revelationType: 'Meccan', numberOfAyahs: 3, startPage: 602, endPage: 602 },
  { number: 109, name: 'الكَافِرُون', englishName: 'Al-Kafirun', revelationType: 'Meccan', numberOfAyahs: 6, startPage: 603, endPage: 603 },
  { number: 110, name: 'النَّصْر', englishName: 'An-Nasr', revelationType: 'Medinan', numberOfAyahs: 3, startPage: 603, endPage: 603 },
  { number: 111, name: 'المَسَد', englishName: 'Al-Masad', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 603, endPage: 603 },
  { number: 112, name: 'الإخْلَاص', englishName: 'Al-Ikhlas', revelationType: 'Meccan', numberOfAyahs: 4, startPage: 604, endPage: 604 },
  { number: 113, name: 'الفَلَق', englishName: 'Al-Falaq', revelationType: 'Meccan', numberOfAyahs: 5, startPage: 604, endPage: 604 },
  { number: 114, name: 'النَّاس', englishName: 'An-Nas', revelationType: 'Meccan', numberOfAyahs: 6, startPage: 604, endPage: 604 },
];

export const JUZ_LIST: JuzMeta[] = [
  { number: 1, name: 'الجزء الأول', startPage: 1, startSurah: 1, startAyah: 1 },
  { number: 2, name: 'الجزء الثاني (سَيَقُولُ)', startPage: 22, startSurah: 2, startAyah: 142 },
  { number: 3, name: 'الجزء الثالث (تِلْكَ الرُّسُلُ)', startPage: 42, startSurah: 2, startAyah: 253 },
  { number: 4, name: 'الجزء الرابع (لَنْ تَنَالُوا)', startPage: 62, startSurah: 3, startAyah: 92 },
  { number: 5, name: 'الجزء الخامس (وَالمُحْصَنَاتُ)', startPage: 82, startSurah: 4, startAyah: 24 },
  { number: 6, name: 'الجزء السادس (لَا يُحِبُّ اللَّهُ)', startPage: 102, startSurah: 4, startAyah: 148 },
  { number: 7, name: 'الجزء السابع (وَإِذَا سَمِعُوا)', startPage: 121, startSurah: 5, startAyah: 82 },
  { number: 8, name: 'الجزء الثامن (وَلَوْ أَنَّنَا)', startPage: 142, startSurah: 6, startAyah: 111 },
  { number: 9, name: 'الجزء التاسع (قَالَ المَلَأُ)', startPage: 162, startSurah: 7, startAyah: 88 },
  { number: 10, name: 'الجزء العاشر (وَاعْلَمُوا)', startPage: 182, startSurah: 8, startAyah: 41 },
  { number: 11, name: 'الجزء الحادي عشر (يَعْتَذِرُونَ)', startPage: 201, startSurah: 9, startAyah: 93 },
  { number: 12, name: 'الجزء الثاني عشر (وَمَا مِنْ دَابَّةٍ)', startPage: 222, startSurah: 11, startAyah: 6 },
  { number: 13, name: 'الجزء الثالث عشر (وَمَا أُبَرِّئُ)', startPage: 242, startSurah: 12, startAyah: 53 },
  { number: 14, name: 'الجزء الرابع عشر (رُبَمَا)', startPage: 262, startSurah: 15, startAyah: 1 },
  { number: 15, name: 'الجزء الخامس عشر (سُبْحَانَ الَّذِي)', startPage: 282, startSurah: 17, startAyah: 1 },
  { number: 16, name: 'الجزء السادس عشر (قَالَ أَلَمْ)', startPage: 302, startSurah: 18, startAyah: 75 },
  { number: 17, name: 'الجزء السابع عشر (اقْتَرَبَ)', startPage: 322, startSurah: 21, startAyah: 1 },
  { number: 18, name: 'الجزء الثامن عشر (قَدْ أَفْلَحَ)', startPage: 342, startSurah: 23, startAyah: 1 },
  { number: 19, name: 'الجزء التاسع عشر (وَقَالَ الَّذِينَ)', startPage: 362, startSurah: 25, startAyah: 21 },
  { number: 20, name: 'الجزء العشرون (أَمَّنْ خَلَقَ)', startPage: 382, startSurah: 27, startAyah: 56 },
  { number: 21, name: 'الجزء الحادي والعشرون (اتْلُ مَا أُوحِيَ)', startPage: 402, startSurah: 29, startAyah: 46 },
  { number: 22, name: 'الجزء الثاني والعشرون (وَمَنْ يَقْنُتْ)', startPage: 422, startSurah: 33, startAyah: 31 },
  { number: 23, name: 'الجزء الثالث والعشرون (وَمَا أَنْزَلْنَا)', startPage: 442, startSurah: 36, startAyah: 28 },
  { number: 24, name: 'الجزء الرابع والعشرون (فَمَنْ أَظْلَمُ)', startPage: 462, startSurah: 39, startAyah: 32 },
  { number: 25, name: 'الجزء الخامس والعشرون (إِلَيْهِ يُرَدُّ)', startPage: 482, startSurah: 41, startAyah: 47 },
  { number: 26, name: 'الجزء السادس والعشرون (حم)', startPage: 502, startSurah: 46, startAyah: 1 },
  { number: 27, name: 'الجزء السابع والعشرون (قَالَ فَمَا خَطْبُكُمْ)', startPage: 522, startSurah: 51, startAyah: 31 },
  { number: 28, name: 'الجزء الثامن والعشرون (قَدْ سَمِعَ)', startPage: 542, startSurah: 58, startAyah: 1 },
  { number: 29, name: 'الجزء التاسع والعشرون (تَبَارَكَ)', startPage: 562, startSurah: 67, startAyah: 1 },
  { number: 30, name: 'الجزء الثلاثون (عَمَّ يَتَسَاءَلُونَ)', startPage: 582, startSurah: 78, startAyah: 1 },
];

export function getJuzForPage(page: number): number {
  for (let i = JUZ_LIST.length - 1; i >= 0; i--) {
    if (page >= JUZ_LIST[i].startPage) {
      return JUZ_LIST[i].number;
    }
  }
  return 1;
}

export function getSurahForPage(page: number): SurahMeta {
  const found = SURAH_LIST.find(s => page >= s.startPage && page <= s.endPage);
  return found || SURAH_LIST[0];
}

export function formatArabicNumber(n: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n).replace(/[0-9]/g, d => digits[parseInt(d, 10)]);
}

export interface PageGoalOption {
  val: number;
  label: string;
  sublabel: string;
  hint: string;
}

// Goals starting from a Rub' (ربع حزب = 2.5 pages) up to a full Juz' (جزء كامل = 20 pages)
export const PAGE_GOAL_OPTIONS: PageGoalOption[] = [
  { val: 2.5, label: 'ربع حزب', sublabel: 'صفحتان ونصف (٢.٥ صفحة)', hint: 'بداية ميسرة وخفيفة للثبات على العادة' },
  { val: 5, label: 'نصف حزب', sublabel: '٥ صفحات (ربعان)', hint: 'خيار متوازن ومستدام' },
  { val: 7.5, label: '٣ أرباع حزب', sublabel: '٧.٥ صفحة (ثلاثة أرباع)', hint: 'وتيرة ممتازة' },
  { val: 10, label: 'حزب كامل', sublabel: '١٠ صفحات (نصف جزء)', hint: 'ختم القرآن في شهرين' },
  { val: 15, label: 'حزب ونصف', sublabel: '١٥ صفحة (٣/٤ جزء)', hint: 'همّة عالية ومثابرة' },
  { val: 20, label: 'جزء كامل', sublabel: '٢٠ صفحة (جزء كامل)', hint: 'ختم القرآن كاملاً في شهر واحد' },
];

export function formatPageGoalLabel(target: number): string {
  if (target === 2.5) return 'ربع حزب (صفحتان ونصف)';
  if (target === 5) return 'نصف حزب (٥ صفحات)';
  if (target === 7.5) return '٣ أرباع حزب (٧.٥ صفحة)';
  if (target === 10) return 'حزب كامل (١٠ صفحات)';
  if (target === 15) return 'حزب ونصف (١٥ صفحة)';
  if (target === 20) return 'جزء كامل (٢٠ صفحة)';
  if (target === 1) return 'صفحة واحدة';
  if (target === 2) return 'صفحتان';
  if (target === 0.5) return 'نصف صفحة';
  return `${formatArabicNumber(target)} صفحة`;
}

export interface TimeGoalOption {
  val: number;
  label: string;
  sublabel: string;
  hint: string;
}

export const TIME_GOAL_OPTIONS: TimeGoalOption[] = [
  { val: 2, label: 'دقيقتان', sublabel: '٢ دقيقة يومياً', hint: 'أسهل بداية لحماية العادة بدون عذر' },
  { val: 5, label: '٥ دقائق', sublabel: '٥ دقائق يومياً', hint: 'خيار مثالي لبداية هادئة ومستمرة' },
  { val: 10, label: '١٠ دقائق', sublabel: '١٠ دقائق يومياً', hint: 'وقت متوازن للقراءة والخشوع' },
  { val: 15, label: '١٥ دقيقة', sublabel: 'ربع ساعة يومياً', hint: 'قراءة وتدبر مريح' },
  { val: 20, label: '٢٠ دقيقة', sublabel: '٢٠ دقيقة يومياً', hint: 'ورد يومي عميق ومبارك' },
  { val: 30, label: '٣٠ دقيقة', sublabel: 'نصف ساعة يومياً', hint: 'همّة عالية وملازمة للقرآن' },
];

export function formatMinutesGoalLabel(minutes: number): string {
  if (minutes === 1) return 'دقيقة واحدة';
  if (minutes === 2) return 'دقيقتان';
  if (minutes >= 3 && minutes <= 10) return `${formatArabicNumber(minutes)} دقائق`;
  return `${formatArabicNumber(minutes)} دقيقة`;
}

export function formatReadingDuration(minutesFloat: number): string {
  const totalSeconds = Math.max(0, Math.round((minutesFloat || 0) * 60));
  if (totalSeconds === 0) return '٠ دقيقة';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) {
    return `${formatArabicNumber(secs)} ثانية`;
  }
  if (secs === 0) {
    return formatMinutesGoalLabel(mins);
  }
  return `${formatMinutesGoalLabel(mins)} و${formatArabicNumber(secs)} ثانية`;
}

export function formatTimerClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
