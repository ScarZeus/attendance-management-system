from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeView(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = "emp_id"
    lookup_url_kwarg = "emp_id"      # Recommended    

    @action(detail=False, methods=['post'], url_path='create-new')
    def create_new(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        emp_id = request.data.get("emp_id")
        email = request.data.get("email")

        try:
            employee = Employee.objects.get(emp_id=emp_id, email=email)
            serializer = self.get_serializer(employee)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Employee.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['delete'], url_path='remove')
    def remove_employee(self, request, pk=None):
        employee = self.get_object()
        employee.delete()

        return Response(
            {"message": "Employee removed"},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=["get"], url_path="all")
    def get_all_employees(self, request):
        employees = self.get_queryset()
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)