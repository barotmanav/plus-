"""
CampusPulse Notification Service Architecture
Provides clean abstraction for Firebase Cloud Messaging (FCM)
with automatic fallback to DevelopmentNotificationService when
Firebase credentials are not configured.
"""

import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import DeviceToken, Notification

logger = logging.getLogger(__name__)
User = get_user_model()

# Global Firebase Admin initialization state
_firebase_app = None
_firebase_initialized = False


def initialize_firebase_admin():
    """
    Safely initializes Firebase Admin SDK using credentials from environment variables.
    Never crashes if credentials are missing; falls back to development mode.
    """
    global _firebase_app, _firebase_initialized

    if _firebase_initialized:
        return _firebase_app

    project_id = getattr(settings, 'FIREBASE_PROJECT_ID', '')
    client_email = getattr(settings, 'FIREBASE_CLIENT_EMAIL', '')
    private_key = getattr(settings, 'FIREBASE_PRIVATE_KEY', '')

    if not (project_id and client_email and private_key):
        logger.info(
            "[CampusPulse] Firebase credentials not fully configured in environment. "
            "Using DevelopmentNotificationService (Mock Mode)."
        )
        _firebase_initialized = False
        return None

    try:
        import firebase_admin
        from firebase_admin import credentials

        # Format private key line breaks if needed
        formatted_key = private_key.replace('\\n', '\n')

        cred_dict = {
            "type": "service_account",
            "project_id": project_id,
            "private_key": formatted_key,
            "client_email": client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }

        cred = credentials.Certificate(cred_dict)
        _firebase_app = firebase_admin.initialize_app(cred, name='campuspulse-server')
        _firebase_initialized = True
        logger.info(f"[CampusPulse] Firebase Admin SDK initialized successfully for project: {project_id}")
        return _firebase_app
    except Exception as e:
        logger.warning(
            f"[CampusPulse] Failed to initialize Firebase Admin SDK ({e}). "
            "Falling back to DevelopmentNotificationService."
        )
        _firebase_initialized = False
        return None


class BaseNotificationService(ABC):
    """
    Base Notification Service contract.
    """

    @abstractmethod
    def send_notification(
        self,
        recipient_user_ids: List[int],
        title: str,
        message: str,
        notification_type: str = 'NORMAL_NOTICE',
        notice_id: Optional[int] = None,
        data: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Send notification to target user IDs via device tokens."""
        pass

    @property
    @abstractmethod
    def is_live_fcm(self) -> bool:
        """Returns True if live FCM is active."""
        pass


class DevelopmentNotificationService(BaseNotificationService):
    """
    Mock development notification service.
    Used for local development without Firebase credentials.
    Logs delivery safely and indicates dev status.
    """

    @property
    def is_live_fcm(self) -> bool:
        return False

    def send_notification(
        self,
        recipient_user_ids: List[int],
        title: str,
        message: str,
        notification_type: str = 'NORMAL_NOTICE',
        notice_id: Optional[int] = None,
        data: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        tokens_count = DeviceToken.objects.filter(
            user_id__in=recipient_user_ids,
            is_active=True
        ).count()

        logger.info(
            f"[DEV NOTIFICATION MOCK] [{notification_type}] '{title}' -> "
            f"{len(recipient_user_ids)} recipients ({tokens_count} simulated device tokens). "
            f"Notice ID: {notice_id}"
        )

        return {
            "mode": "DEVELOPMENT_MOCK",
            "success": True,
            "recipients_count": len(recipient_user_ids),
            "device_tokens_count": tokens_count,
            "message": "Notification dispatched in local development mock mode. "
                       "Configure Firebase environment variables to enable live FCM."
        }


class FirebaseNotificationService(BaseNotificationService):
    """
    Live Firebase Cloud Messaging (FCM) Notification Service.
    Dispatches web browser push and mobile push notifications.
    """

    def __init__(self, firebase_app):
        self.firebase_app = firebase_app

    @property
    def is_live_fcm(self) -> bool:
        return True

    def send_notification(
        self,
        recipient_user_ids: List[int],
        title: str,
        message: str,
        notification_type: str = 'NORMAL_NOTICE',
        notice_id: Optional[int] = None,
        data: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        from firebase_admin import messaging

        tokens = list(
            DeviceToken.objects.filter(
                user_id__in=recipient_user_ids,
                is_active=True
            ).values_list('token', flat=True)
        )

        if not tokens:
            logger.info("[CampusPulse FCM] No active device tokens found for target recipients.")
            return {
                "mode": "FIREBASE_FCM",
                "success": True,
                "recipients_count": len(recipient_user_ids),
                "device_tokens_count": 0,
                "sent_count": 0,
                "failed_count": 0
            }

        payload_data = {
            "notice_id": str(notice_id or ""),
            "notification_type": notification_type,
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
        }
        if data:
            payload_data.update(data)

        # Build Multicast FCM message
        fcm_message = messaging.MulticastMessage(
            tokens=tokens,
            notification=messaging.Notification(
                title=title,
                body=message,
            ),
            data=payload_data,
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=title,
                    body=message,
                    icon="/favicon.ico",
                    badge="/favicon.ico",
                ),
                fcm_options=messaging.WebpushFCMOptions(
                    link=f"/?notice={notice_id}" if notice_id else "/"
                )
            )
        )

        try:
            response = messaging.send_each_for_multicast(fcm_message, app=self.firebase_app)
            logger.info(
                f"[CampusPulse FCM] Sent {response.success_count} notifications, "
                f"{response.failure_count} failures."
            )

            # Deactivate invalid/expired tokens
            if response.failure_count > 0:
                invalid_tokens = []
                for idx, res in enumerate(response.responses):
                    if not res.success and res.exception:
                        error_code = getattr(res.exception, 'code', '')
                        if error_code in ('UNREGISTERED', 'INVALID_ARGUMENT'):
                            invalid_tokens.append(tokens[idx])
                if invalid_tokens:
                    DeviceToken.objects.filter(token__in=invalid_tokens).update(is_active=False)
                    logger.info(f"[CampusPulse FCM] Marked {len(invalid_tokens)} stale tokens inactive.")

            return {
                "mode": "FIREBASE_FCM",
                "success": True,
                "recipients_count": len(recipient_user_ids),
                "device_tokens_count": len(tokens),
                "sent_count": response.success_count,
                "failed_count": response.failure_count,
            }
        except Exception as e:
            logger.error(f"[CampusPulse FCM] Error broadcasting FCM multicast: {e}", exc_info=True)
            return {
                "mode": "FIREBASE_FCM",
                "success": False,
                "error": str(e),
                "recipients_count": len(recipient_user_ids),
                "device_tokens_count": len(tokens)
            }


def get_notification_service() -> BaseNotificationService:
    """
    Factory function: returns FirebaseNotificationService if credentials are configured,
    otherwise returns DevelopmentNotificationService.
    """
    app = initialize_firebase_admin()
    if app:
        return FirebaseNotificationService(app)
    return DevelopmentNotificationService()


def dispatch_notice_notifications(notice) -> Dict[str, Any]:
    """
    Primary Notice -> Notification Flow:
    1. Determine target students based on scope (College, Department, Class).
    2. Create Notification records in database.
    3. Query active device tokens (Web & Android).
    4. Send FCM push or Development Mock notification.
    """
    scope = getattr(notice, 'audience_scope', 'COLLEGE')
    students_query = User.objects.filter(role__in=[User.Role.STUDENT, User.Role.CR])

    if scope == 'COLLEGE':
        recipients = list(students_query.all())
    elif scope == 'DEPARTMENT' and notice.target_department:
        recipients = list(students_query.filter(department=notice.target_department))
    elif scope == 'CLASS' and notice.target_class:
        recipients = list(students_query.filter(assigned_class=notice.target_class))
    else:
        recipients = list(students_query.all())

    # Map priority to NotificationType
    if notice.priority == 'EMERGENCY':
        notif_type = Notification.NotificationType.EMERGENCY_ALERT
        title = f"🚨 EMERGENCY: {notice.title}"
    elif notice.priority in ('IMPORTANT', 'HIGH'):
        notif_type = Notification.NotificationType.IMPORTANT_NOTICE
        title = f"⚡ IMPORTANT: {notice.title}"
    elif getattr(notice, 'created_by_cr', False):
        notif_type = Notification.NotificationType.CR_NOTICE
        title = f"📌 Class Notice: {notice.title}"
    else:
        notif_type = Notification.NotificationType.NORMAL_NOTICE
        title = notice.title

    body = notice.description[:140] + ("..." if len(notice.description) > 140 else "")

    # 1. Create Notification records
    notif_objects = [
        Notification(
            user=student,
            notice=notice,
            title=title,
            message=body,
            notification_type=notif_type,
            is_read=False,
        )
        for student in recipients
    ]
    if notif_objects:
        Notification.objects.bulk_create(notif_objects)

    # 2. Dispatch via Notification Service (FCM or Dev Mock)
    service = get_notification_service()
    recipient_ids = [s.id for s in recipients]
    dispatch_result = service.send_notification(
        recipient_user_ids=recipient_ids,
        title=title,
        message=body,
        notification_type=notif_type,
        notice_id=notice.id,
        data={
            "notice_id": str(notice.id),
            "priority": str(notice.priority),
            "scope": str(scope),
        }
    )

    return {
        "recipients_count": len(recipients),
        "notification_type": notif_type,
        "dispatch_result": dispatch_result
    }
