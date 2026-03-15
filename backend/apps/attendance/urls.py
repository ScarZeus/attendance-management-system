from rest_framework.routers import DefaultRouter
from .views import LeaveRequestViewSet, WorkFromHomeRequestViewSet

router = DefaultRouter()
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-requests')
router.register(r'wfh-requests', WorkFromHomeRequestViewSet, basename='wfh-requests')

urlpatterns = router.urls
