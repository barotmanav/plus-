from rest_framework.routers import DefaultRouter
from .views import PersonalNoteViewSet

router = DefaultRouter()
router.register(r'', PersonalNoteViewSet, basename='personal-notes')

urlpatterns = router.urls
