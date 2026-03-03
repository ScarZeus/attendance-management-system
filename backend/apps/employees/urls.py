from rest_framework.routers import DefaultRouter

from apps.attendance.views import EmployeeAttendanceViewSet
from .views import EmployeeView
from rest_framework_nested import routers

router = DefaultRouter()
router.register(r'employees', EmployeeView, basename='employees')

employees_router = routers.NestedDefaultRouter(
    router,
    r'employees',
    lookup='employee'
)
employees_router.register(
    r'attendance',
    EmployeeAttendanceViewSet,
    basename='employee-attendance'
)
urlpatterns = router.urls + employees_router.urls