import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitProvider, useHabit } from './context/HabitContext';
import { Header } from './components/Navigation/Header';
import { BottomNav, TabType } from './components/Navigation/BottomNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { MushafReader } from './components/Reader/MushafReader';
import { HistoryView } from './components/History/HistoryView';
import { SettingsView } from './components/Settings/SettingsView';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { ComebackModal } from './components/Comeback/ComebackModal';
import { DontMissModal } from './components/DontMiss/DontMissModal';
import { AuthModal } from './components/Auth/AuthModal';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';
import { testFirestoreConnection } from './services/firebase';
import {
  registerServiceWorker,
  sendGentlePushNotification,
} from './services/notificationService';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [requireLoginForReading, setRequireLoginForReading] = useState<boolean>(false);
  const [pendingReaderAction, setPendingReaderAction] = useState<'normal' | 'twoMinutes' | null>(null);
  const [showDontMissModal, setShowDontMissModal] = useState<boolean>(false);

  const { currentUser, loading: authLoading } = useAuth();
  const isAuthenticated = Boolean(currentUser && !currentUser.isAnonymous);

  const {
    needsOnboarding,
    completeOnboarding,
    isComebackDetected,
    dismissComeback,
    startTwoMinuteMode,
    notificationSettings,
    isTodayChecked,
    progress,
  } = useHabit();

  // Register Service Worker & test Firestore connection on boot
  useEffect(() => {
    registerServiceWorker();
    testFirestoreConnection();
  }, []);

  // Redirect to reader seamlessly once user completes pending login before reading
  useEffect(() => {
    if (isAuthenticated && pendingReaderAction) {
      if (pendingReaderAction === 'twoMinutes') {
        startTwoMinuteMode();
      }
      setActiveTab('reader');
      setPendingReaderAction(null);
      setRequireLoginForReading(false);
      setShowAuthModal(false);
    }
  }, [isAuthenticated, pendingReaderAction, startTwoMinuteMode]);

  // Ensure signed-out user cannot stay inside reader view
  useEffect(() => {
    if (!authLoading && !isAuthenticated && activeTab === 'reader') {
      setActiveTab('dashboard');
    }
  }, [authLoading, isAuthenticated, activeTab]);

  // Background check for gentle scheduled reminders
  useEffect(() => {
    if (!notificationSettings.browserPushEnabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // 1. Scheduled reminder check
      if (
        notificationSettings.scheduledReminder &&
        currentTimeStr === notificationSettings.preferredTime &&
        !isTodayChecked
      ) {
        sendGentlePushNotification(
          'وِصال | موعد وردك اليومي 📖',
          'حان وقت وردك القرآني. افتح المصحف وابدأ بالقدر الذي يناسبك.'
        );
      }

      // 2. End-of-day reminder (21:30 if daily goal not completed)
      if (
        notificationSettings.endOfDayReminder &&
        currentTimeStr === '21:30' &&
        !isTodayChecked &&
        !progress.isTwoMinuteGoalCompleted
      ) {
        sendGentlePushNotification(
          'وِصال | اليوم لسه مخلصش ✨',
          'دقيقتان من القرآن ممكن يكونوا بداية جميلة تحمي عادتك من الانقطاع.'
        );
      }
    };

    const interval = setInterval(checkReminder, 60000);
    return () => clearInterval(interval);
  }, [notificationSettings, isTodayChecked, progress.isTwoMinuteGoalCompleted]);

  const openGeneralAuth = () => {
    setRequireLoginForReading(false);
    setPendingReaderAction(null);
    setShowAuthModal(true);
  };

  const openAuthForReading = (action: 'normal' | 'twoMinutes') => {
    setPendingReaderAction(action);
    setRequireLoginForReading(true);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setRequireLoginForReading(false);
    if (!isAuthenticated) {
      setPendingReaderAction(null);
    }
  };

  // Handlers
  const handleStartReading = () => {
    if (!isAuthenticated) {
      openAuthForReading('normal');
      return;
    }
    setActiveTab('reader');
  };

  const handleStartTwoMinutes = () => {
    if (!isAuthenticated) {
      openAuthForReading('twoMinutes');
      return;
    }
    startTwoMinuteMode();
    setActiveTab('reader');
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'reader' && !isAuthenticated) {
      openAuthForReading('normal');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1F2421] font-sans flex flex-col selection:bg-[#1B4332] selection:text-[#FAF7F0]">
      {/* Top Header */}
      <Header
        onOpenAuth={openGeneralAuth}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenReader={handleStartReading}
            onOpenTwoMinutes={() => {
              if (!isAuthenticated) {
                openAuthForReading('twoMinutes');
                return;
              }
              setShowDontMissModal(true);
            }}
            onOpenHistory={() => setActiveTab('history')}
            onOpenSettings={() => setActiveTab('settings')}
            onOpenAuth={openGeneralAuth}
          />
        )}

        {activeTab === 'reader' && (
          <MushafReader
            onBackToDashboard={() => setActiveTab('dashboard')}
            onRequireAuth={() => openAuthForReading('normal')}
          />
        )}

        {activeTab === 'history' && <HistoryView onOpenAuth={openGeneralAuth} />}

        {activeTab === 'settings' && (
          <SettingsView onOpenAuth={openGeneralAuth} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Onboarding Flow for First-Time Users */}
      <OnboardingModal
        isOpen={needsOnboarding}
        onFinish={completeOnboarding}
      />

      {/* Comeback Mode Modal (Gentle Welcome After Inactivity) */}
      <ComebackModal
        isOpen={isComebackDetected}
        onClose={dismissComeback}
        onStartReading={handleStartReading}
        onStartTwoMinutes={handleStartTwoMinutes}
      />

      {/* Don't Miss Mode (Two-Minute Rule) Modal */}
      <DontMissModal
        isOpen={showDontMissModal}
        onClose={() => setShowDontMissModal(false)}
        onStart={handleStartTwoMinutes}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        requireLoginForReading={requireLoginForReading}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <MainApp />
      </HabitProvider>
    </AuthProvider>
  );
}
