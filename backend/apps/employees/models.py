from django.db import models
class Employee(models.Model):
    class Role(models.TextChoices):
        HR = "HR", "HR"
        EMPLOYEE = "EMPLOYEE" , "Employee"

    emp_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role =  models.CharField(
        max_length=20,
        choices=Role.choices,
        default= Role.EMPLOYEE
    )
    
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.name