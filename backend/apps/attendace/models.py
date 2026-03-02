from django.db import models
from apps.employees.models import Employee

class Attendance(models.Model):
    employee = models.ForeignKey(
        Employee,
        related_name='attendances',
        on_delete=models.CASCADE
    )
    date = models.DateField()
    check_in = models.TimeField()
    check_out = models.TimeField()
    status = models.CharField(max_length=20)

    class Meta:
        unique_together = ('employee', 'date')