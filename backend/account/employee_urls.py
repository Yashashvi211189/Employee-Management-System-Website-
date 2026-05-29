from django.urls import path
from account.employee_views import (
    EmployeeLoginView,
    EmployeeRegisterView,
    EmployeePasswordChangeView,
)

app_name = 'employee'

urlpatterns = [
    # Employee login uses the password assigned from Django admin.
    path('login/', EmployeeLoginView.as_view(), name='login'),
    path('password/change/', EmployeePasswordChangeView.as_view(), name='password-change'),
    
    # Registration
    path('register/', EmployeeRegisterView.as_view(), name='register'),
]
