from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import datetime

from .models import Attendance, LeaveRequest, WorkFromHomeRequest
from .serializers import AttendanceSerializer
from apps.employees.models import Employee


class EmployeeAttendanceViewSet(viewsets.ModelViewSet):

    serializer_class = AttendanceSerializer

    def get_employee(self):
        return get_object_or_404(
            Employee,
            emp_id=self.kwargs.get("employee_emp_id")
        )

    def get_queryset(self):
        return Attendance.objects.filter(
            employee=self.get_employee()
        ).order_by("-date")
    


    @action(detail=False, methods=["post"], url_path="check-in")
    def check_in(self, request, employee_emp_id=None):

        employee = self.get_employee()
        today = timezone.now().date()
        now_time = timezone.now().time()

        attendance = Attendance.objects.filter(
            employee=employee,
            date=today
        ).first()

        if attendance and attendance.status == Attendance.Status.ABSENT:
            return Response(
                {"error": "Cannot check-in. Marked absent today."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attendance and attendance.check_in:
            return Response(
                {"error": "Already checked in."},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave = LeaveRequest.objects.filter(
            employee=employee,
            status="APPROVED",
            from_date__lte=today,
            to_date__gte=today
        ).exists()

        if leave:
            return Response(
                {"error": "You are on approved leave."},
                status=status.HTTP_400_BAD_REQUEST
            )

        wfh = WorkFromHomeRequest.objects.filter(
            employee=employee,
            status="APPROVED",
            from_date__lte=today,
            to_date__gte=today
        ).exists()

        status_value = Attendance.Status.WFH if wfh else Attendance.Status.PRESENT

        if attendance:
            attendance.check_in = now_time
            attendance.status = status_value
            attendance.save()
        else:
            attendance = Attendance.objects.create(
                employee=employee,
                date=today,
                check_in=now_time,
                status=status_value
            )

        return Response(
            AttendanceSerializer(attendance).data
        )
    @action(detail=False, methods=["post"], url_path="check-out")
    def check_out(self, request, employee_emp_id=None):

        employee = self.get_employee()
        today = timezone.now().date()
        now_time = timezone.now().time()

        attendance = Attendance.objects.filter(
                employee=employee,
                date=today
            ).first()

        if not attendance:
            return Response(
               {"error": "You must check-in first."},
                    status=status.HTTP_400_BAD_REQUEST
            )

        if attendance.check_out:
            return Response(
                {"error": "Already checked out."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if attendance.status == Attendance.Status.ABSENT:
                return Response(
                    {"error": "Cannot check-out. Marked absent."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        attendance.check_out = now_time
        attendance.save()

        return Response(
                AttendanceSerializer(attendance).data
            )
    
    @action(detail=False, methods=["post"], url_path="apply-leave")
    def apply_leave(self, request, employee_emp_id=None):

        employee = self.get_employee()

        from_date = request.data.get("from_date")
        to_date = request.data.get("to_date")
        reason = request.data.get("reason")

        if not all([from_date, to_date]):
            return Response(
                {"error": "from_date and to_date required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave = LeaveRequest.objects.create(
            employee=employee,
            from_date=from_date,
            to_date=to_date,
            reason=reason,
            status="PENDING"
        )

        return Response(
            {"message": "Leave request submitted", "id": leave.id},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=["post"], url_path="apply-wfh")
    def apply_wfh(self, request, employee_emp_id=None):

        employee = self.get_employee()

        from_date = request.data.get("from_date")
        to_date = request.data.get("to_date")
        reason = request.data.get("reason")

        if not all([from_date, to_date]):
            return Response(
                {"error": "from_date and to_date required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        wfh = WorkFromHomeRequest.objects.create(
            employee=employee,
            from_date=from_date,
            to_date=to_date,
            reason=reason,
            status="PENDING"
        )

        return Response(
            {"message": "WFH request submitted", "id": wfh.id},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=["post"], url_path="mark-absent")
    def mark_absent(self, request, employee_emp_id=None):

        employee = self.get_employee()
        date = request.data.get("date")

        if not date:
            return Response(
                {"error": "date required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Attendance.objects.filter(employee=employee, date=date).exists():
            return Response(
                {"error": "Attendance already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance = Attendance.objects.create(
            employee=employee,
            date=date,
            status=Attendance.Status.ABSENT
        )

        return Response(
            AttendanceSerializer(attendance).data
        )