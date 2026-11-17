export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    return reg;
  } catch (error) {
    console.warn('Service worker readiness notice:', error);
    return null;
  }
}

export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function sendGentlePushNotification(title: string, body: string): Promise<boolean> {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'athar-habit',
        dir: 'rtl',
        lang: 'ar',
      });
      return true;
    } else {
      new Notification(title, { body, dir: 'rtl', lang: 'ar' });
      return true;
    }
  } catch (error) {
    console.warn('Notification trigger fallback:', error);
    try {
      new Notification(title, { body, dir: 'rtl', lang: 'ar' });
      return true;
    } catch {
      return false;
    }
  }
}
