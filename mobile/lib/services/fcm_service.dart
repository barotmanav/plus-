import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class FCMService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // Request notification permission from student
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      criticalAlert: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      String? token = await _messaging.getToken();
      if (token != null) {
        debugPrint("CampusPulse FCM Device Token: $token");
        // Register token with Django backend /api/notifications/register_token/
      }
    }

    // Foreground notification listener
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint("CampusPulse Foreground Alert: ${message.notification?.title}");
      // Show local toast or high priority banner if priority == EMERGENCY
    });
  }
}
