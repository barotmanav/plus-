from rest_framework.routers import DefaultRouter
from .views import NoticeViewSet, NoticeCategoryViewSet

router = DefaultRouter()
router.register(r'categories', NoticeCategoryViewSet, basename='notice-categories')
router.register(r'', NoticeViewSet, basename='notices')

urlpatterns = router.urls
