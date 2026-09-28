from rest_framework.routers import DefaultRouter
from .views import CRApplicationViewSet

router = DefaultRouter()
router.register(r'', CRApplicationViewSet, basename='cr-applications')

urlpatterns = router.urls
