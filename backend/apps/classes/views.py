from rest_framework import serializers, viewsets
from .models import CollegeClass
from apps.users.permissions import IsDeptAdmin

class CollegeClassSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    cr_name = serializers.CharField(source='cr.get_full_name', read_only=True)

    class Meta:
        model = CollegeClass
        fields = '__all__'

class CollegeClassViewSet(viewsets.ModelViewSet):
    queryset = CollegeClass.objects.select_related('department', 'cr').all()
    serializer_class = CollegeClassSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDeptAdmin()]
        return []
