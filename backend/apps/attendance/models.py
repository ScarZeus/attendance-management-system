from django.db import models
from apps.employees.models import Employee


class Attendance(models.Model):

    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        HALF_DAY = "HALF_DAY", "Half Day"
        WFH = "WFH", "Work From Home"
        LEAVE = "LEAVE", "Leave"

    employee = models.ForeignKey(
        Employee,
        related_name="attendances",
        on_delete=models.CASCADE
    )
    
    date = models.DateField(db_index=True)

    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ABSENT
    )
    reason_type = models.TextField(blank=True,null= True)
    reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["employee", "date"]),
        ]

    def __str__(self):
        return f"{self.employee} - {self.date} - {self.status}"


class LeaveRequest(models.Model):

    class LeaveType(models.TextChoices):
        SICK = "SICK", "Sick Leave"
        CASUAL = "CASUAL", "Casual Leave"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    employee = models.ForeignKey(
        Employee,
        related_name="leave_requests",
        on_delete=models.CASCADE
    )

    leave_type = models.CharField(
        max_length=20,
        choices=LeaveType.choices
    )

    from_date = models.DateField()
    to_date = models.DateField()

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    approved_by = models.ForeignKey(
        Employee,
        null=True,
        blank=True,
        related_name="approved_leaves",
        on_delete=models.SET_NULL
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]
        indexes = [
            models.Index(fields=["employee", "from_date", "to_date"]),
        ]

    def __str__(self):
        return f"{self.employee} Leave {self.from_date} -> {self.to_date}"


class WorkFromHomeRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    employee = models.ForeignKey(
        Employee,
        related_name="wfh_requests",
        on_delete=models.CASCADE
    )

    from_date = models.DateField()
    to_date = models.DateField()

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    approved_by = models.ForeignKey(
        Employee,
        null=True,
        blank=True,
        related_name="approved_wfh",
        on_delete=models.SET_NULL
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]
        indexes = [
            models.Index(fields=["employee", "from_date", "to_date"]),
        ]

    def __str__(self):
        return f"{self.employee} WFH {self.from_date} -> {self.to_date}"