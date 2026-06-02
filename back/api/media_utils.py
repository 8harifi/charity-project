import base64
import re
import uuid
from typing import Optional, Tuple

from django.core.files.base import ContentFile


def split_full_name(full: str) -> Tuple[str, str]:
    parts = (full or "").strip().split()
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return " ".join(parts[:-1]), parts[-1]


def file_from_data_uri(data_uri: Optional[str], default_name: str = "upload.bin"):
    if not data_uri or not isinstance(data_uri, str):
        return None
    m = re.match(r"^data:(?P<mime>[^;]+);base64,(?P<b64>.+)$", data_uri.strip(), re.DOTALL)
    if not m:
        return None
    raw = base64.b64decode(m.group("b64"))
    ext = ".bin"
    if "jpeg" in m.group("mime") or "jpg" in m.group("mime"):
        ext = ".jpg"
    elif "png" in m.group("mime"):
        ext = ".png"
    elif "pdf" in m.group("mime"):
        ext = ".pdf"
    name = f"{uuid.uuid4().hex}{ext}"
    return ContentFile(raw, name=name)
