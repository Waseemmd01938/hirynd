from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsApproved(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.approval_status == 'approved'


class IsAdminOrTeamLead(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'team_lead', 'team_manager')


class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('recruiter', 'team_lead', 'team_manager', 'admin')


class IsCandidate(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'candidate'


class IsSelfOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        user_id = getattr(obj, 'user_id', None) or getattr(obj, 'id', None)
        return request.user.role == 'admin' or str(request.user.id) == str(user_id)
