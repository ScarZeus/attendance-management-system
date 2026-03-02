from rest_framework import viewsets
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        return Attendance.objects.filter(
            employee_id=self.kwargs['employee_pk']
        )

    def perform_create(self, serializer):
        serializer.save(employee_id=self.kwargs['employee_pk'])