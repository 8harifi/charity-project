"""Zarinpal payment gateway integration."""

import json
import logging
import urllib.error
import urllib.request
from dataclasses import dataclass
from decimal import Decimal

from django.conf import settings

from .. import messages as msg

logger = logging.getLogger(__name__)


@dataclass
class PaymentRequestResult:
    authority: str
    payment_url: str


@dataclass
class PaymentVerifyResult:
    ref_id: str
    raw: dict


class ZarinpalError(Exception):
    pass


def _sandbox() -> bool:
    return getattr(settings, "ZARINPAL_SANDBOX", True)


def _base_url() -> str:
    if _sandbox():
        return "https://sandbox.zarinpal.com/pg/v4/payment"
    return "https://payment.zarinpal.com/pg/v4/payment"


def _start_pay_url(authority: str) -> str:
    host = "https://sandbox.zarinpal.com" if _sandbox() else "https://www.zarinpal.com"
    return f"{host}/pg/StartPay/{authority}"


def _post(path: str, payload: dict) -> dict:
    url = f"{_base_url()}{path}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        logger.error("Zarinpal HTTP error %s: %s", exc.code, detail)
        raise ZarinpalError(msg.gateway_http_error(exc.code)) from exc
    except urllib.error.URLError as exc:
        logger.error("Zarinpal connection error: %s", exc)
        raise ZarinpalError(msg.GATEWAY_CONNECTION_FAILED) from exc


def payment_request(*, amount: Decimal, description: str, callback_url: str, metadata: dict | None = None) -> PaymentRequestResult:
    merchant_id = getattr(settings, "ZARINPAL_MERCHANT_ID", "") or ""
    if not merchant_id:
        raise ZarinpalError(msg.ZARINPAL_NOT_CONFIGURED)

    # Zarinpal expects amount in Rials; our UI uses Toman — multiply by 10
    amount_rials = int(amount * 10)

    payload = {
        "merchant_id": merchant_id,
        "amount": amount_rials,
        "callback_url": callback_url,
        "description": description[:255],
    }
    if metadata:
        payload["metadata"] = metadata

    result = _post("/request.json", payload)
    data = result.get("data") or {}
    errors = result.get("errors") or []

    if errors or data.get("code") not in (100,):
        raise ZarinpalError(msg.payment_request_failed(errors or data))

    authority = data.get("authority")
    if not authority:
        raise ZarinpalError(msg.NO_AUTHORITY_FROM_GATEWAY)

    return PaymentRequestResult(
        authority=authority,
        payment_url=_start_pay_url(authority),
    )


def payment_verify(*, authority: str, amount: Decimal) -> PaymentVerifyResult:
    merchant_id = getattr(settings, "ZARINPAL_MERCHANT_ID", "") or ""
    if not merchant_id:
        raise ZarinpalError(msg.ZARINPAL_NOT_CONFIGURED)

    amount_rials = int(amount * 10)
    payload = {
        "merchant_id": merchant_id,
        "amount": amount_rials,
        "authority": authority,
    }

    result = _post("/verify.json", payload)
    data = result.get("data") or {}
    errors = result.get("errors") or []

    if errors or data.get("code") not in (100, 101):
        raise ZarinpalError(msg.payment_verification_failed(errors or data))

    ref_id = str(data.get("ref_id", ""))
    return PaymentVerifyResult(ref_id=ref_id, raw=result)
