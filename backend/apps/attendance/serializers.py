from rest_framework import serializers
from .models import Attendance, LeaveRequest, WorkFromHomeRequest
from apps.employees.models import Employee


class EmpIdRelatedField(serializers.RelatedField):
    """Accept emp_id string on write; return emp_id string on read."""

    def get_queryset(self):
        return Employee.objects.all()

    def to_representation(self, value):
        return value.emp_id

    def to_internal_value(self, data):
        try:
            return Employee.objects.get(emp_id=data)
        except Employee.DoesNotExist:
            raise serializers.ValidationError(f"Employee with emp_id '{data}' not found.")


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "date",
            "status",
            "check_in",
            "check_out",
            "reason",
        ]


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee = EmpIdRelatedField()
    employee_name = serializers.CharField(source="employee.name", read_only=True)
    employee_emp_id = serializers.CharField(source="employee.emp_id", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee",
            "employee_name",
            "employee_emp_id",
            "leave_type",
            "from_date",
            "to_date",
            "reason",
            "status",
            "applied_at",
        ]
        read_only_fields = ["status", "applied_at"]


class WorkFromHomeRequestSerializer(serializers.ModelSerializer):
    employee = EmpIdRelatedField()
    employee_name = serializers.CharField(source="employee.name", read_only=True)
    employee_emp_id = serializers.CharField(source="employee.emp_id", read_only=True)

    class Meta:
        model = WorkFromHomeRequest
        fields = [
            "id",
            "employee",
            "employee_name",
            "employee_emp_id",
            "from_date",
            "to_date",
            "reason",
            "status",
            "applied_at",
        ]
        read_only_fields = ["status", "applied_at"]