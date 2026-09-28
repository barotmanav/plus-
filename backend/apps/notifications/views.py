from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, DeviceToken
from .notification_service import get_notification_service

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ['token', 'device_type']

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({"status": "Marked read"})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "All notifications marked read"})

    @action(detail=False, methods=['post'])
    def register_token(self, request):
        serializer = DeviceTokenSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            device_type = serializer.validated_data.get('device_type', DeviceToken.DeviceType.WEB)
            DeviceToken.objects.update_or_create(
                token=token,
                defaults={'user': request.user, 'device_type': device_type, 'is_active': True}
            )
            return Response({"status": "Device token registered"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def service_status(self, request):
        service = get_notification_service()
        return Response({
            "is_live_fcm": service.is_live_fcm,
            "mode": "FIREBASE_FCM" if service.is_live_fcm else "DEVELOPMENT_MOCK",
            "message": "Live Firebase Cloud Messaging is enabled." if service.is_live_fcm else "Development mock mode is active (configure Firebase credentials to enable live FCM)."
        })
