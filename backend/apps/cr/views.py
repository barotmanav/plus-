from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import CRApplication
from apps.users.permissions import IsFaculty, IsDeptAdmin

class CRApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    class_name = serializers.CharField(source='target_class.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = CRApplication
        fields = '__all__'
        read_only_fields = ['student', 'status', 'reviewed_by', 'reviewed_at', 'applied_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['student'] = user
        validated_data['department'] = user.department or validated_data.get('department')
        validated_data['target_class'] = user.assigned_class or validated_data.get('target_class')
        return super().create(validated_data)

class CRApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = CRApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin or user.is_dept_admin or user.is_faculty_member:
            return CRApplication.objects.select_related('student', 'department', 'target_class').all()
        return CRApplication.objects.filter(student=user)

    @action(detail=True, methods=['post'], permission_classes=[IsFaculty])
    def approve(self, request, pk=None):
        app = self.get_object()
        app.status = CRApplication.Status.APPROVED
        app.reviewed_by = request.user
        app.reviewed_at = timezone.now()
        app.save()

        # Update student profile to CR role
        student = app.student
        student.role = student.Role.CR
        student.is_cr = True
        student.assigned_class = app.target_class
        student.save()

        # Attach to class
        cls = app.target_class
        cls.cr = student
        cls.save()

        return Response({"status": f"{student.email} approved as Class Representative for {cls.name}."})

    @action(detail=True, methods=['post'], permission_classes=[IsFaculty])
    def reject(self, request, pk=None):
        app = self.get_object()
        remarks = request.data.get('remarks', 'Application declined.')
        app.status = CRApplication.Status.REJECTED
        app.reviewed_by = request.user
        app.review_remarks = remarks
        app.reviewed_at = timezone.now()
        app.save()
        return Response({"status": "Application rejected."})
