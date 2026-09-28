/**
 * CampusPulse Firebase Web Client Integration
 * Handles FCM Web Push, browser notification permissions,
 * and service worker token registration with graceful fallback
 * to Development Mock Mode when credentials are not configured.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';

// Frontend Firebase Web configuration from VITE_ environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

/**
 * Validates whether client Firebase credentials are provided
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId
  );
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let messagingSupportedPromise: Promise<boolean> | null = null;

function checkMessagingSupport(): Promise<boolean> {
  if (!messagingSupportedPromise) {
    messagingSupportedPromise = isSupported().catch(() => false);
  }
  return messagingSupportedPromise;
}

/**
 * Initializes the Firebase Web SDK if configured
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!app) {
    const existingApps = getApps();
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Returns messaging instance if Firebase is configured and supported
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  const isSup = await checkMessagingSupport();
  if (!isSup) return null;

  const fbApp = getFirebaseApp();
  if (!fbApp) return null;

  if (!messaging) {
    try {
      messaging = getMessaging(fbApp);
    } catch {
      messaging = null;
    }
  }
  return messaging;
}

export interface PushPermissionResult {
  granted: boolean;
  token?: string;
  mode: 'FIREBASE_FCM' | 'DEVELOPMENT_MOCK';
  message: string;
}

/**
 * Requests browser notification permission and obtains FCM token or dev token.
 */
export async function requestBrowserPushPermission(): Promise<PushPermissionResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      granted: false,
      mode: 'DEVELOPMENT_MOCK',
      message: 'Browser notifications are not supported in this environment.',
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return {
      granted: false,
      mode: isFirebaseConfigured() ? 'FIREBASE_FCM' : 'DEVELOPMENT_MOCK',
      message: 'Notification permission was denied or dismissed by the user.',
    };
  }

  // If Firebase is configured, obtain live FCM token via service worker
  if (isFirebaseConfigured()) {
    try {
      const msg = await getFirebaseMessaging();
      if (msg && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(msg, {
          vapidKey: vapidKey || undefined,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          return {
            granted: true,
            token,
            mode: 'FIREBASE_FCM',
            message: 'Firebase FCM push token registered successfully.',
          };
        }
      }
    } catch {
      // If live token retrieval fails (e.g. invalid mock key), fallback gracefully
    }
  }

  // Development Mock Mode fallback token
  const devToken = `dev_web_token_${Math.random().toString(36).substring(2, 10)}`;
  return {
    granted: true,
    token: devToken,
    mode: 'DEVELOPMENT_MOCK',
    message: 'Notifications enabled in Development Mock mode. Live FCM is active when Firebase credentials are configured in .env.',
  };
}

/**
 * Listen for foreground push messages
 */
export async function onForegroundMessage(callback: (payload: { title: string; body: string; data?: any }) => void) {
  if (!isFirebaseConfigured()) return () => {};

  try {
    const msg = await getFirebaseMessaging();
    if (msg) {
      return onMessage(msg, (payload) => {
        callback({
          title: payload.notification?.title || payload.data?.title || 'CampusPulse Alert',
          body: payload.notification?.body || payload.data?.message || 'New notice published.',
          data: payload.data,
        });
      });
    }
  } catch {
    // Graceful fallback
  }

  return () => {};
}

/**
 * Dispatches a standard browser notification in Development Mock mode
 */
export function showBrowserNotification(title: string, body: string, noticeId?: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: noticeId || 'campuspulse-alert',
      });
    } catch {
      // Fallback
    }
  }
}

/**
 * Returns current notification service status for UI indication
 */
export function getNotificationServiceStatus(): {
  mode: 'FIREBASE_FCM' | 'DEVELOPMENT_MOCK';
  isConfigured: boolean;
  label: string;
  description: string;
} {
  const configured = isFirebaseConfigured();
  return {
    mode: configured ? 'FIREBASE_FCM' : 'DEVELOPMENT_MOCK',
    isConfigured: configured,
    label: configured ? 'Firebase Cloud Messaging (Active)' : 'Development Mode (Mock Push Active)',
    description: configured
      ? 'Connected to Firebase FCM for web browser & mobile alerts.'
      : 'Using local push simulation. When Firebase credentials are provided in .env, FCM activates automatically without code changes.',
  };
}
