from django.db import models
from django.conf import settings

class DeviceToken(models.Model):
    class DeviceType(models.TextChoices):
        WEB = 'WEB', 'Web Browser'
        ANDROID = 'ANDROID', 'Android Phone'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='device_tokens'
    )
    token = models.CharField(max_length=512, unique=True)
    device_type = models.CharField(
        max_length=20,
        choices=DeviceType.choices,
        default=DeviceType.WEB
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - {self.device_type} ({'active' if self.is_active else 'inactive'})"


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NORMAL_NOTICE = 'NORMAL_NOTICE', 'Normal Notice'
        IMPORTANT_NOTICE = 'IMPORTANT_NOTICE', 'Important Notice'
        EMERGENCY_ALERT = 'EMERGENCY_ALERT', 'Emergency Alert'
        CR_NOTICE = 'CR_NOTICE', 'CR Notice'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notice = models.ForeignKey(
        'notices.Notice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.NORMAL_NOTICE
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.user.email}: {self.title}"
