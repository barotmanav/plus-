from django.db import models
from django.conf import settings

class NoticeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default='Bell')
    color = models.CharField(max_length=20, default='#3b82f6')
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Notice categories'

    def __str__(self):
        return self.name

class Notice(models.Model):
    class Priority(models.TextChoices):
        NORMAL = 'NORMAL', 'Normal'
        IMPORTANT = 'IMPORTANT', 'Important'
        HIGH = 'HIGH', 'High Priority'
        EMERGENCY = 'EMERGENCY', 'Emergency'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        PUBLISHED = 'PUBLISHED', 'Published'
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        EXPIRED = 'EXPIRED', 'Expired'
        REJECTED = 'REJECTED', 'Rejected'
        ARCHIVED = 'ARCHIVED', 'Archived'

    class AudienceScope(models.TextChoices):
        COLLEGE = 'COLLEGE', 'Entire College'
        DEPARTMENT = 'DEPARTMENT', 'Department'
        YEAR = 'YEAR', 'Year'
        SEMESTER = 'SEMESTER', 'Semester'
        CLASS = 'CLASS', 'Class Section'

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(NoticeCategory, on_delete=models.PROTECT, related_name='notices')
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.NORMAL)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PUBLISHED)
    
    # Audience Targeting
    audience_scope = models.CharField(max_length=20, choices=AudienceScope.choices, default=AudienceScope.COLLEGE)
    target_department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True, blank=True)
    target_class = models.ForeignKey('classes.CollegeClass', on_delete=models.SET_NULL, null=True, blank=True)
    target_year = models.PositiveSmallIntegerField(null=True, blank=True)
    target_semester = models.PositiveSmallIntegerField(null=True, blank=True)

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='authored_notices')
    is_emergency = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    is_cr_submission = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)

    read_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='read_notices')

    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-is_emergency', '-created_at']

    def __str__(self):
        return f"[{self.priority}] {self.title}"

class NoticeAttachment(models.Model):
    notice = models.ForeignKey(Notice, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='notice_attachments/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20)
    file_size_kb = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name
