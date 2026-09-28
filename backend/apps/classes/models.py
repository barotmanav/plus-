from django.db import models
from django.conf import settings

class CollegeClass(models.Model):
    name = models.CharField(max_length=50) # e.g. "IT-A"
    department = models.ForeignKey('departments.Department', on_delete=models.CASCADE, related_name='classes')
    year = models.PositiveSmallIntegerField(default=1) # 1, 2, 3, 4
    semester = models.PositiveSmallIntegerField(default=1) # 1 to 8
    cr = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cr_assigned_class'
    )
    total_students = models.PositiveIntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'College classes'
        unique_together = ('name', 'department', 'year', 'semester')

    def __str__(self):
        return f"{self.name} - {self.department.code} (Sem {self.semester})"
