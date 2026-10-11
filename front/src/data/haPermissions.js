/**
 * Per-health-assistant permissions, grouped the way the requirements doc describes them.
 *
 * The `*_all` flags widen a capability from "my own patients" to "every patient".
 * Without them a health assistant can still work, but only inside their own caseload.
 */

export const HA_PERMISSION_GROUPS = [
  {
    id: "base",
    label: "دسترسی‌های پایه",
    permissions: [
      { key: "can_approve_patients", label: "تأیید بیماران" },
      { key: "can_edit_patients", label: "ویرایش بیماران" },
      { key: "can_claim_orphan_patients", label: "پذیرش بیماران بدون معرف" },
      { key: "can_create_visits", label: "ثبت درخواست ویزیت" },
      { key: "can_create_financial", label: "ثبت درخواست مالی" },
      { key: "can_create_services", label: "ثبت درخواست خدمات" },
      { key: "can_approve_visits", label: "تأیید نوبت بیماران خود" },
      { key: "can_edit_visits", label: "ویرایش نوبت بیماران خود" },
      { key: "can_approve_financial", label: "تأیید مالی بیماران خود" },
      { key: "can_edit_financial", label: "ویرایش مالی بیماران خود" },
      { key: "can_approve_services", label: "تأیید خدمات بیماران خود" },
      { key: "can_edit_services", label: "ویرایش خدمات بیماران خود" },
      { key: "is_network_consultant", label: "مشاور شبکه (صندوق تماس و ارجاع به پزشک)" },
    ],
  },
  {
    id: "all_patients",
    label: "تأیید و ویرایش برای کل بیماران",
    permissions: [
      { key: "can_approve_registration_all", label: "تأیید ثبت‌نام بیمار" },
      { key: "can_edit_registration_all", label: "ویرایش ثبت‌نام بیمار" },
      { key: "can_approve_visits_all", label: "تأیید نوبت و مشاوره" },
      { key: "can_edit_visits_all", label: "ویرایش نوبت و مشاوره" },
      { key: "can_approve_financial_all", label: "تأیید درخواست مالی" },
      { key: "can_edit_financial_all", label: "ویرایش درخواست مالی" },
      { key: "can_approve_services_all", label: "تأیید خدمات" },
      { key: "can_edit_services_all", label: "ویرایش خدمات" },
    ],
  },
  {
    id: "search",
    label: "دسترسی جستجوی کلی",
    permissions: [
      { key: "can_search_patients", label: "جستجوی بیماران" },
      { key: "can_search_doctors", label: "جستجوی پزشکان" },
      { key: "can_search_assistants", label: "جستجوی سلامتیاران" },
      { key: "can_search_benefactors", label: "جستجوی خیرین" },
      { key: "can_search_organizations", label: "جستجوی سازمان‌ها" },
    ],
  },
  {
    id: "org",
    label: "سازمان",
    permissions: [{ key: "org_approved", label: "تأیید زیرمجموعه بودن توسط سازمان" }],
  },
];

export const HA_PERMISSION_KEYS = HA_PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key)
);
