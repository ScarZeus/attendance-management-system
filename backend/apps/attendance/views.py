from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta, date

from .models import Attendance, LeaveRequest, WorkFromHomeRequest
from .serializers import (
    AttendanceSerializer,
    LeaveRequestSerializer,
    WorkFromHomeRequestSerializer,
)
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

        return Response(AttendanceSerializer(attendance).data)

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

        return Response(AttendanceSerializer(attendance).data)

    @action(detail=False, methods=["post"], url_path="mark-absent")
    def mark_absent(self, request, employee_emp_id=None):

        employee = self.get_employee()
        record_date = request.data.get("date")

        if not record_date:
            return Response(
                {"error": "date required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Attendance.objects.filter(employee=employee, date=record_date).exists():
            return Response(
                {"error": "Attendance already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance = Attendance.objects.create(
            employee=employee,
            date=record_date,
            status=Attendance.Status.ABSENT
        )

        return Response(AttendanceSerializer(attendance).data)


def _create_attendance_for_range(employee, from_date, to_date, att_status, reason_type=""):
    """Helper: create or update attendance records for each day in range."""
    current = from_date
    while current <= to_date:
        Attendance.objects.update_or_create(
            employee=employee,
            date=current,
            defaults={
                "status": att_status,
                "reason_type": reason_type,
            }
        )
        current += timedelta(days=1)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    queryset = LeaveRequest.objects.all()

    def get_queryset(self):
        emp_id = self.request.query_params.get("employee")
        qs = LeaveRequest.objects.all()
        if emp_id:
            qs = qs.filter(employee__emp_id=emp_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        leave = serializer.save(status=LeaveRequest.Status.PENDING)
        return Response(
            LeaveRequestSerializer(leave).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request, pk=None):
        leave = get_object_or_404(LeaveRequest, pk=pk)

        if leave.status != LeaveRequest.Status.PENDING:
            return Response(
                {"error": "Only pending requests can be approved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.status = LeaveRequest.Status.APPROVED
        leave.save()

        _create_attendance_for_range(
            employee=leave.employee,
            from_date=leave.from_date,
            to_date=leave.to_date,
            att_status=Attendance.Status.LEAVE,
            reason_type=leave.leave_type,
        )

        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=["patch"], url_path="reject")
    def reject(self, request, pk=None):
        leave = get_object_or_404(LeaveRequest, pk=pk)

        if leave.status != LeaveRequest.Status.PENDING:
            return Response(
                {"error": "Only pending requests can be rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.status = LeaveRequest.Status.REJECTED
        leave.save()

        return Response(LeaveRequestSerializer(leave).data)


class WorkFromHomeRequestViewSet(viewsets.ModelViewSet):
    serializer_class = WorkFromHomeRequestSerializer
    queryset = WorkFromHomeRequest.objects.all()

    def get_queryset(self):
        emp_id = self.request.query_params.get("employee")
        qs = WorkFromHomeRequest.objects.all()
        if emp_id:
            qs = qs.filter(employee__emp_id=emp_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        wfh = serializer.save(status=WorkFromHomeRequest.Status.PENDING)
        return Response(
            WorkFromHomeRequestSerializer(wfh).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request, pk=None):
        wfh = get_object_or_404(WorkFromHomeRequest, pk=pk)

        if wfh.status != WorkFromHomeRequest.Status.PENDING:
            return Response(
                {"error": "Only pending requests can be approved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        wfh.status = WorkFromHomeRequest.Status.APPROVED
        wfh.save()

        _create_attendance_for_range(
            employee=wfh.employee,
            from_date=wfh.from_date,
            to_date=wfh.to_date,
            att_status=Attendance.Status.WFH,
            reason_type="WFH",
        )

        return Response(WorkFromHomeRequestSerializer(wfh).data)

    @action(detail=True, methods=["patch"], url_path="reject")
    def reject(self, request, pk=None):
        wfh = get_object_or_404(WorkFromHomeRequest, pk=pk)

        if wfh.status != WorkFromHomeRequest.Status.PENDING:
            return Response(
                {"error": "Only pending requests can be rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        wfh.status = WorkFromHomeRequest.Status.REJECTED
        wfh.save()

        return Response(WorkFromHomeRequestSerializer(wfh).data)