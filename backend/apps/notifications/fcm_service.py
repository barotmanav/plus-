"""
CampusPulse FCM Service Compatibility Layer
Delegates to the unified notification_service module.
"""

from .notification_service import (
    dispatch_notice_notifications,
    get_notification_service,
    initialize_firebase_admin,
    FirebaseNotificationService,
    DevelopmentNotificationService,
)

__all__ = [
    'dispatch_notice_notifications',
    'get_notification_service',
    'initialize_firebase_admin',
    'FirebaseNotificationService',
    'DevelopmentNotificationService',
]
