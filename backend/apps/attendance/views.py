from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from .models import Attendance
from .serializers import AttendanceSerializer
from apps.employees.models import Employee
from datetime import date

class EmployeeAttendanceViewSet(viewsets.ModelViewSet):

    serializer_class = AttendanceSerializer

    def get_employee(self):
        return get_object_or_404(
            Employee,
            emp_id=self.kwargs.get("employee_emp_id")
        )
    
    def get_queryset(self):
        return Attendance.objects.filter(
            employee_id=self.kwargs.get("employee_pk")
        ).order_by("-date")

    def create(self, request, *args, **kwargs):
        return Response(
            {"error": "Use the mark-today endpoint."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {"error": "Attendance cannot be modified once marked."},
            status=status.HTTP_403_FORBIDDEN
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"error": "Attendance records cannot be deleted."},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="mark-today",
        url_name="mark-today"
    )
    def mark_today(self, request, employee_emp_id=None):

        employee = self.get_employee()
        today = timezone.now().date()

        if Attendance.objects.filter(employee=employee, date=today).exists():
            print("This Date")
            return Response(
                {"error": "Attendance already marked for today."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save(
            employee=employee,
            date=today
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
    detail=False,
    methods=["post"],
    url_path="mark-attendance",
    url_name="mark-attendance"
    )
    def mark_attendance(self, request, employee_emp_id=None):

        employee = self.get_employee()

        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")
        status_value = request.data.get("status")
        check_in = request.data.get("check_in")
        check_out = request.data.get("check_out")
        print("Check in : ",check_in)
        print("check out :", check_out)
        if check_in:
            check_in = datetime.strptime(check_in, "%H:%M").time()

        if check_out:
            check_out = datetime.strptime(check_out, "%H:%M").time()
           
        if not all([from_date, to_date, status_value]):
            return Response(
                {"error": "Query params 'from', 'to' and body field 'status' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_status = ["ABSENT", "WFH"]
        if status_value not in allowed_status:
            return Response(
                {"error": f"Status must be one of {allowed_status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from_date = datetime.fromisoformat(from_date).date()
            to_date = datetime.fromisoformat(to_date).date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        existing_attendance = Attendance.objects.filter(
    employee=employee,
    date__range=(from_date, to_date)
    )

        if existing_attendance.exists():
            return Response(
                {
                    "error": "Attendance already exists for some dates in the given range.",
                    "dates": list(existing_attendance.values_list("date", flat=True))
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if from_date > to_date:
            return Response(
                {"error": "'from' date cannot be after 'to' date."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if from_date < date.today():
            return Response(
                {"error" : "Invalid from date"},
                status=status.HTTP_400_BAD_REQUEST

            )

        created_records = []
        current = from_date

        while current <= to_date:
            obj, created = Attendance.objects.get_or_create(
                employee=employee,
                date=current,
                defaults={"status": status_value},
                check_in=check_in,
                check_out=check_out
            )

            if created:
                created_records.append(obj)

            current += timedelta(days=1)

        return Response(
            AttendanceSerializer(created_records, many=True).data,
            status=status.HTTP_201_CREATED
        )
    @action(
    detail=False,
    methods=["get"],
    url_path="report/monthly",
    url_name="monthly-report"
)
    def monthly_report(self, request, employee_emp_id=None):

        employee = self.get_employee()

        month = request.query_params.get("month")
        year = request.query_params.get("year")

        if not month or not year:
            return Response(
                {"error": "month and year query params required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return Response(
                {"error": "month and year must be integers."},
                status=status.HTTP_400_BAD_REQUEST
            )

        records = Attendance.objects.filter(
            employee=employee,
            date__year=year,
            date__month=month
        ).order_by("-date")

        return Response(
            AttendanceSerializer(records, many=True).data,
            status=status.HTTP_200_OK
        ) 