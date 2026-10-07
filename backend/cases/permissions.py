from rest_framework.permissions import BasePermission

from auth_app.models import User


class IsJudicialOrRegistry(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser
            or request.user.role
            in {
                User.Role.JUDICIAL_OFFICER,
                User.Role.COURT_REGISTRY,
            }
        )


class IsRegistry(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.role == User.Role.COURT_REGISTRY
        )
