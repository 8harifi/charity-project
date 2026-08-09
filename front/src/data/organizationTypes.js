/**
 * Organization taxonomy from «مشخصات برخی بخش های سامانه».
 *
 * Organizations are not separate tables — they all live in `OrganizationApplication`,
 * where `org_type` / `org_subtype` hold these literal Persian strings and
 * `organization_role` holds the signup track the account came through.
 */

export const ORGANIZATION_TYPES = [
  "مرکز درمانی",
  "سازمان دولتی",
  "شرکت خصوصی",
  "تشکل",
  "مطب پزشک",
  "مرکز خدمات سلامت",
  "مرکز نیکوکاری",
];

export const ORGANIZATION_SUBTYPES = {
  "مرکز درمانی": ["مرکز بهداشت", "کلینیک", "مرکز تخصصی", "بیمارستان"],
  "سازمان دولتی": ["دانشگاه علوم پزشکی", "سازمان بهزیستی"],
  "شرکت خصوصی": ["عمرانی", "تاسیساتی"],
  تشکل: [
    "دهیاری",
    "خادمیاران آستان رضوی",
    "مسجد",
    "پایگاه بسیج مساجد",
    "کانون فرهنگی هنری مساجد",
  ],
  "مرکز خدمات سلامت": [
    "آزمایشگاهی",
    "تصویربرداری",
    "تست های تخصصی پاراکلینیکی",
    "خدمات پاراکلینیکی",
    "خدمات توانبخشی",
    "پرستاری",
    "کار در منزل",
    "داروخانه",
    "لوازم پزشکی",
    "خدمات حمل و نقل برای بیماران مناطق دورافتاده",
    "سایر موارد",
  ],
  "مطب پزشک": [],
  "مرکز نیکوکاری": [],
};

export const ORGANIZATION_ROLES = [
  { value: "service_center", label: "مرکز خدمات سلامت" },
  { value: "charity_center", label: "مرکز نیکوکاری" },
  { value: "social_work_unit", label: "واحد مددکاری / امور اجتماعی" },
];
