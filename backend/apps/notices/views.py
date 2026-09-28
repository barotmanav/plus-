from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Notice, NoticeCategory
from .serializers import NoticeSerializer, NoticeCategorySerializer
from apps.users.permissions import IsFaculty, IsDeptAdmin, IsSuperAdmin

class NoticeCategoryViewSet(viewsets.ModelViewSet):
    queryset = NoticeCategory.objects.all()
    serializer_class = NoticeCategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDeptAdmin()]
        return [permissions.AllowAny()]

class NoticeViewSet(viewsets.ModelViewSet):
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Notice.objects.select_related('category', 'author', 'target_department', 'target_class').prefetch_related('attachments', 'read_by')

        # If unauthenticated, show published college-wide notices only
        if not user.is_authenticated:
            return qs.filter(status=Notice.Status.PUBLISHED, audience_scope=Notice.AudienceScope.COLLEGE)

        # Super Admin / Faculty / Dept Admin see all notices
        if user.is_super_admin or user.is_dept_admin or user.is_faculty_member:
            return qs.all()

        # Students / CRs see published notices targeted to them + CR's own submissions
        return qs.filter(status=Notice.Status.PUBLISHED) | qs.filter(author=user)

    @action(detail=True, methods=['post'], permission_classes=[IsFaculty])
    def approve(self, request, pk=None):
        notice = self.get_object()
        if notice.status != Notice.Status.PENDING_APPROVAL:
            return Response({"detail": "Notice is not awaiting approval."}, status=status.HTTP_400_BAD_REQUEST)

        notice.status = Notice.Status.PUBLISHED
        notice.published_at = timezone.now()
        notice.save()

        # Trigger notification dispatch
        from apps.notifications.fcm_service import dispatch_notice_notifications
        dispatch_notice_notifications(notice)

        return Response({"status": "Notice approved and published to students."})

    @action(detail=True, methods=['post'], permission_classes=[IsFaculty])
    def reject(self, request, pk=None):
        notice = self.get_object()
        reason = request.data.get('reason', 'Requires revisions.')
        notice.status = Notice.Status.REJECTED
        notice.rejection_reason = reason
        notice.save()
        return Response({"status": "Notice rejected with feedback.", "reason": reason})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_read(self, request, pk=None):
        notice = self.get_object()
        notice.read_by.add(request.user)
        return Response({"status": "Marked as read."})
