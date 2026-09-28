// CampusPulse Firebase Cloud Messaging Service Worker
// Handles background push notifications when browser tab is inactive or closed

importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Click listener opens the related notice
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const noticeId = event.notification.data?.noticeId || event.notification.data?.notice_id;
  const targetUrl = noticeId ? '/?notice=' + noticeId : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Push event listener
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload.notification?.title || payload.data?.title || 'CampusPulse Notification';
      const options = {
        body: payload.notification?.body || payload.data?.message || 'A new notice has been published.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data || {},
        tag: payload.data?.notice_id || 'campuspulse-notice',
        renotify: true,
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      // Fallback text notification
      event.waitUntil(
        self.registration.showNotification('CampusPulse Alert', {
          body: event.data.text() || 'New campus notice published.',
          icon: '/favicon.ico',
        })
      );
    }
  }
});
