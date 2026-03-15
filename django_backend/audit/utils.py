from .models import AuditLog


def log_action(actor, action, target_id, target_type, details=None):
    AuditLog.objects.create(
        actor=actor,
        action=action,
        target_id=target_id,
        target_type=target_type,
        details=details or {},
    )
