from rest_framework import serializers
from .models import Notice, NoticeCategory, NoticeAttachment

class NoticeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NoticeCategory
        fields = '__all__'

class NoticeAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoticeAttachment
        fields = '__all__'

class NoticeSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_role = serializers.CharField(source='author.role', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    target_class_name = serializers.CharField(source='target_class.name', read_only=True)
    target_dept_name = serializers.CharField(source='target_department.name', read_only=True)
    attachments = NoticeAttachmentSerializer(many=True, read_only=True)
    read_count = serializers.IntegerField(source='read_by.count', read_only=True)

    class Meta:
        model = Notice
        fields = '__all__'
        read_only_fields = ['author', 'is_cr_submission', 'published_at', 'status', 'created_at']

    def validate(self, attrs):
        user = self.context['request'].user
        priority = attrs.get('priority', Notice.Priority.NORMAL)

        # Rule 1: CR cannot create emergency alert
        if user.is_class_rep and priority == Notice.Priority.EMERGENCY:
            raise serializers.ValidationError({"priority": "Class Representatives are not permitted to publish Emergency Alerts."})

        # Rule 2: Student cannot publish notices directly
        if user.role == user.Role.STUDENT and not user.is_class_rep:
            raise serializers.ValidationError({"detail": "Students cannot publish official notices directly."})

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        is_cr = user.is_class_rep

        if is_cr:
            # Rule: CR notice goes to PENDING_APPROVAL and targets only their assigned class
            validated_data['status'] = Notice.Status.PENDING_APPROVAL
            validated_data['is_cr_submission'] = True
            validated_data['audience_scope'] = Notice.AudienceScope.CLASS
            validated_data['target_class'] = user.assigned_class
        else:
            validated_data['status'] = Notice.Status.PUBLISHED
            from django.utils import timezone
            validated_data['published_at'] = timezone.now()

        validated_data['author'] = user
        return super().create(validated_data)
