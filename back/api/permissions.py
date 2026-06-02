from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    """
    Base permission for role-based access.
    Subclasses must define `allowed_roles`.
    """

    allowed_roles = ()

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if getattr(user, "is_superuser", False):
            return True

        return getattr(user, "role", None) in self.allowed_roles


class IsAdmin(RolePermission):
    allowed_roles = ("admin",)


class IsPlatformAdmin(BasePermission):
    """Admin role, Django staff, or superuser."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return True
        return getattr(user, "role", None) == "admin"


class IsPatient(RolePermission):
    allowed_roles = ("patient",)


class IsDoctor(RolePermission):
    allowed_roles = ("doctor",)


class IsHealthAssistant(RolePermission):
    allowed_roles = ("health_assistant",)


class IsBenefactor(RolePermission):
    allowed_roles = ("benefactor",)
#
#
# class IsCharityOperator(RolePermission):
#     allowed_roles = ("charity_operator",)
#
#
# class IsServiceCenterOperator(RolePermission):
#     allowed_roles = ("service_center_operator",)
#
#
# class IsMedicalCenterOperator(RolePermission):
#     allowed_roles = ("medical_center_operator",)
#
#
# class IsOrganizationStaff(RolePermission):
#     allowed_roles = ("organization_staff",)
#
#
# class IsPresenter(RolePermission):
#     allowed_roles = ("presenter",)
