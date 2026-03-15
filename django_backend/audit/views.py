from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.permissions import IsAdmin, IsApproved
from .models import AuditLog
from .serializers import AuditLogSerializer


@api_view(['GET'])
@permission_classes([IsAdmin])
def global_audit_logs(request):
    qs = AuditLog.objects.select_related('actor__profile').all()[:200]
    action_filter = request.query_params.get('action')
    if action_filter:
        qs = AuditLog.objects.filter(action__icontains=action_filter).select_related('actor__profile')[:200]
    return Response(AuditLogSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsApproved])
def candidate_audit_logs(request, candidate_id):
    qs = AuditLog.objects.filter(target_id=str(candidate_id)).select_related('actor__profile')[:100]
    return Response(AuditLogSerializer(qs, many=True).data)
