from rest_framework.routers import DefaultRouter
from .views import CollegeClassViewSet

router = DefaultRouter()
router.register(r'', CollegeClassViewSet, basename='classes')

urlpatterns = router.urls
