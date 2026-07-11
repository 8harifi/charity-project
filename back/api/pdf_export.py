"""Persian-aware PDF export helpers (ReportLab + Vazirmatn)."""

from __future__ import annotations

import re
from datetime import datetime
from io import BytesIO
from pathlib import Path

import arabic_reshaper
from bidi.algorithm import get_display
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

FONT_DIR = Path(__file__).resolve().parent / "assets" / "fonts"
FONT_REGULAR = "Vazirmatn"
FONT_BOLD = "Vazirmatn-Bold"

_FONTS_REGISTERED = False

# Brand / UI palette (aligned with admin dashboard)
EMERALD = colors.HexColor("#059669")
EMERALD_DARK = colors.HexColor("#047857")
SLATE_800 = colors.HexColor("#1f2937")
SLATE_600 = colors.HexColor("#4b5563")
SLATE_200 = colors.HexColor("#e5e7eb")
SLATE_50 = colors.HexColor("#f9fafb")
WHITE = colors.white

_LTR_ONLY = re.compile(r"^[\d+\-/:.\s]+$")


def _register_fonts():
    global _FONTS_REGISTERED
    if _FONTS_REGISTERED:
        return
    regular = FONT_DIR / "Vazirmatn-Regular.ttf"
    bold = FONT_DIR / "Vazirmatn-Bold.ttf"
    if not regular.exists() or not bold.exists():
        raise FileNotFoundError(
            f"Persian PDF fonts missing under {FONT_DIR}. "
            "Expected Vazirmatn-Regular.ttf and Vazirmatn-Bold.ttf."
        )
    pdfmetrics.registerFont(TTFont(FONT_REGULAR, str(regular)))
    pdfmetrics.registerFont(TTFont(FONT_BOLD, str(bold)))
    _FONTS_REGISTERED = True


def rtl_text(value) -> str:
    """Shape Persian/Arabic for PDF; leave plain numbers and dates unchanged."""
    text = str(value or "").strip()
    if not text:
        return ""
    if _LTR_ONLY.match(text):
        return text
    return get_display(arabic_reshaper.reshape(text))


def _p(text, style) -> Paragraph:
    safe = (text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe, style)


def build_users_pdf(rows, *, role_labels: dict[str, str]) -> bytes:
    _register_fonts()

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title=rtl_text("گزارش کاربران"),
    )

    styles = {
        "title": ParagraphStyle(
            "Title",
            fontName=FONT_BOLD,
            fontSize=18,
            textColor=WHITE,
            alignment=TA_RIGHT,
            leading=24,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            fontName=FONT_REGULAR,
            fontSize=10,
            textColor=colors.HexColor("#d1fae5"),
            alignment=TA_RIGHT,
            leading=14,
        ),
        "cell": ParagraphStyle(
            "Cell",
            fontName=FONT_REGULAR,
            fontSize=9,
            alignment=TA_RIGHT,
            leading=12,
            textColor=SLATE_800,
        ),
        "cell_center": ParagraphStyle(
            "CellCenter",
            fontName=FONT_REGULAR,
            fontSize=9,
            alignment=TA_CENTER,
            leading=12,
            textColor=SLATE_800,
        ),
        "header": ParagraphStyle(
            "Header",
            fontName=FONT_BOLD,
            fontSize=9,
            alignment=TA_CENTER,
            leading=12,
            textColor=WHITE,
        ),
    }

    now = timezone.localtime(timezone.now())
    exported_at = now.strftime("%Y/%m/%d %H:%M")

    title_block = Table(
        [
            [
                _p(rtl_text("گزارش کاربران سامانه"), styles["title"]),
            ],
            [
                _p(
                    rtl_text(f"تاریخ گزارش: {exported_at}  ·  تعداد: {len(rows)} کاربر"),
                    styles["subtitle"],
                ),
            ],
        ],
        colWidths=[doc.width],
    )
    title_block.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), EMERALD),
                ("BOX", (0, 0), (-1, -1), 0, EMERALD),
                ("TOPPADDING", (0, 0), (-1, 0), 14),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 4),
                ("TOPPADDING", (0, 1), (-1, 1), 2),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 12),
                ("LEFTPADDING", (0, 0), (-1, -1), 16),
                ("RIGHTPADDING", (0, 0), (-1, -1), 16),
            ]
        )
    )

    headers = [
        _p(rtl_text("شناسه"), styles["header"]),
        _p(rtl_text("نام"), styles["header"]),
        _p(rtl_text("موبایل"), styles["header"]),
        _p(rtl_text("نقش"), styles["header"]),
        _p(rtl_text("وضعیت"), styles["header"]),
        _p(rtl_text("فعال"), styles["header"]),
        _p(rtl_text("تاریخ عضویت"), styles["header"]),
    ]

    table_data = [headers]
    for row in rows:
        role_key = row.get("role") or ""
        role_label = role_labels.get(role_key, role_key)
        state_label = rtl_text("تأیید شده" if row.get("state") else "در انتظار")
        active_label = rtl_text("فعال" if row.get("is_active") is not False else "غیرفعال")
        joined = str(row.get("date_joined") or "")[:10]

        table_data.append(
            [
                _p(str(row.get("id") or ""), styles["cell_center"]),
                _p(rtl_text(row.get("display_name") or ""), styles["cell"]),
                _p(row.get("phone") or row.get("username") or "", styles["cell_center"]),
                _p(rtl_text(role_label), styles["cell_center"]),
                _p(state_label, styles["cell_center"]),
                _p(active_label, styles["cell_center"]),
                _p(joined, styles["cell_center"]),
            ]
        )

    col_widths = [42, 210, 105, 95, 95, 72, 95]
    users_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    users_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), EMERALD_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("TOPPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 0.4, SLATE_200),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, SLATE_50]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 1), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    footer_style = ParagraphStyle(
        "Footer",
        fontName=FONT_REGULAR,
        fontSize=8,
        textColor=SLATE_600,
        alignment=TA_CENTER,
    )
    footer = _p(
        rtl_text(f"سامانه خیریه — خروجی خودکار — {datetime.now().year}"),
        footer_style,
    )

    def _draw_page_number(canvas, _doc):
        canvas.saveState()
        canvas.setFont(FONT_REGULAR, 8)
        canvas.setFillColor(SLATE_600)
        page_label = rtl_text(f"صفحه {canvas.getPageNumber()}")
        canvas.drawCentredString(landscape(A4)[0] / 2, 8 * mm, page_label)
        canvas.restoreState()

    doc.build(
        [title_block, Spacer(1, 8), users_table, Spacer(1, 10), footer],
        onFirstPage=_draw_page_number,
        onLaterPages=_draw_page_number,
    )
    return buffer.getvalue()
