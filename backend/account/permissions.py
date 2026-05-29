from rest_framework.permissions import BasePermission, SAFE_METHODS

from account.employee_models import CurrentProjectAssignment, PrivateProjectAssignment


def _can_access_private_project_object(user, project):
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False) or getattr(user, "is_admin", False):
        return True
    if getattr(project, "project_manager_id", None) == getattr(user, "id", None):
        return True

    employee = getattr(user, "employee_profile", None)
    if not employee:
        return False

    if getattr(employee, "private_project_id", None) == getattr(project, "id", None):
        return True

    if CurrentProjectAssignment.objects.filter(plan__project_id=getattr(project, "id", None), employee=employee).exists():
        return True
    if PrivateProjectAssignment.objects.filter(plan__project_id=getattr(project, "id", None), employee=employee).exists():
        return True

    try:
        if getattr(project, "employee_team_members", None) is not None and project.employee_team_members.filter(pk=employee.pk).exists():
            return True
    except Exception:
        pass

    membership = getattr(project, "memberships", None)
    if membership is not None:
        try:
            if membership.filter(employee=employee, is_active=True).exists():
                return True
        except Exception:
            pass

    return False


class CanAccessPrivateProject(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(getattr(user, "is_staff", False) or getattr(user, "is_superuser", False) or getattr(user, "is_admin", False))

    def has_object_permission(self, request, view, obj):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return _can_access_private_project_object(user, obj)

