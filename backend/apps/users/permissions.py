from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_super_admin)

class IsDeptAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_dept_admin or request.user.is_super_admin)
        )

class IsFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_faculty_member or request.user.is_dept_admin or request.user.is_super_admin)
        )

class IsClassRepresentative(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_class_rep)

class IsOwnerOrElevated(permissions.BasePermission):
    """
    Object level permission to only allow owner or elevated staff to view/edit.
    """
    def has_object_permission(self, request, view, obj):
        if getattr(obj, 'user', None) == request.user or getattr(obj, 'author', None) == request.user:
            return True
        return bool(request.user.is_super_admin or request.user.is_dept_admin)
