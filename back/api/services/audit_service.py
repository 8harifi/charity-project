from ..models import PlatformAuditLog


def log_audit_event(
    *,
    actor=None,
    event_type: str,
    summary: str,
    target_type: str = "",
    target_id=None,
    metadata=None,
):
    PlatformAuditLog.objects.create(
        actor=actor,
        event_type=event_type,
        summary=summary,
        target_type=target_type or "",
        target_id=target_id,
        metadata=metadata or {},
    )
