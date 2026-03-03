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
        related_name='attendances',
        on_delete=models.CASCADE
    )

    date = models.DateField()

    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices
    )

    reason = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']