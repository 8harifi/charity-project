"""Outbound SMS. Messages are always stored in SmsLog.

A real provider can later be wired through SMS_BACKEND; until then SmsLog is
the delivery record used by password reset and contact replies.
"""

from ..models import SmsLog


def send_sms(phone: str, body: str, purpose: str = "") -> SmsLog:
    phone = (phone or "").strip()
    body = (body or "").strip()
    log = SmsLog.objects.create(phone=phone, body=body, purpose=purpose, sent=False)
    if phone and body:
        log.sent = True
        log.save(update_fields=["sent"])
    return log
