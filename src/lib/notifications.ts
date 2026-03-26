import { getRoast } from './roasts';
import { getProfile } from './storage';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications.');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export function sendNotification(title: string, body: string, icon = '/pwa_icon_192.png') {
  if (!('Notification' in window)) {
    console.error('Notifications not supported in this browser.');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted.');
    return;
  }

  const options = {
    body,
    icon,
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'roast-notification',
    renotify: true,
  } as any;

  // Try standard Notification API first for immediate feedback
  try {
    new Notification(title, options);
  } catch (err) {
    console.error('Standard Notification failed:', err);
  }

  // Also try Service Worker for broader support/background
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options).catch(err => {
        console.error('ServiceWorker Notification failed:', err);
      });
    }).catch(err => {
      console.error('ServiceWorker not ready:', err);
    });
  }
}

export function triggerRoastNotification(category: 'missed' | 'low_score' | 'general') {
  const profile = getProfile();
  const message = getRoast(profile.tonePreference, category, profile.goal, profile.targetSalary);
  
  sendNotification('Roast Me! 🔥', message);
}
