"""
Canonical lookup values (from migration 0011_seed_patient_lookups).
populate_db and restore_lookups must use this list only.
"""

LOOKUP_SEEDS = {
    "Gender": ["مرد", "زن"],
    "MaritalStatus": ["مجرد", "متأهل", "مطلقه"],
    "Education": [
        "زیر دیپلم",
        "دیپلم",
        "فوق‌دیپلم",
        "کارشناسی",
        "کارشناسی ارشد",
        "دکتری",
    ],
    "JobStatus": ["شاغل", "بیکار"],
    "HousingStatus": [
        "شخصی",
        "مستاجر",
        "خانه پدری",
        "سازمانی",
        "سایر",
        "هیچکدام",
    ],
    "CoveredOrganization": [
        "کمیته",
        "بهزیستی",
        "موسسه خیریه",
        "سایر",
        "هیچکدام",
    ],
    "Insurance": [
        "تأمین اجتماعی",
        "سلامت",
        "نیروهای مسلح",
        "بانک‌ها",
        "بیمه تکمیلی",
        "آزاد",
        "بدون بیمه",
    ],
    "Specialty": ["مغز و اعصاب", "داخلی", "اطفال", "پوست و زیبایی"],
    "HealthAssistantCooperationType": [
        "معرفی بیمار",
        "انجام امور مربوط به بیمارن",
        "پروژه های ساخت و ساز",
        "سایر موارد",
    ],
}

# Optional — not in 0011 but used by HA organization signup in populate_db
ORGANIZATION_TYPE_SEEDS = [
    "بیمارستان",
    "کلینیک",
    "پزشکی خانواده",
    "سازمان خدماتی",
]

# Non-canonical names → canonical name (for FK remapping before delete)
LOOKUP_REMAP = {
    "Gender": {"Male": "مرد", "Female": "زن"},
    "MaritalStatus": {"متاهل": "متأهل"},
    "Education": {
        "بیسواد": "زیر دیپلم",
        "ابتدایی": "زیر دیپلم",
        "راهنمایی": "زیر دیپلم",
        "دبیرستان": "دیپلم",
    },
    "JobStatus": {
        "کارمند دولتی": "شاغل",
        "کارمند خصوصی": "شاغل",
        "خودروز": "شاغل",
        "بازنشسته": "بیکار",
        "دانشجو": "شاغل",
    },
    "HousingStatus": {
        "مالک": "شخصی",
        "اجاره‌ای": "مستاجر",
        "رایگان": "سایر",
    },
    "CoveredOrganization": {
        "تامین اجتماعی": "هیچکدام",
        "سلامت": "هیچکدام",
        "آموزش": "سایر",
    },
    "Insurance": {
        "دولتی": "تأمین اجتماعی",
        "خصوصی": "بیمه تکمیلی",
        "تامین اجتماعی": "تأمین اجتماعی",
        "بیمه نیروهای مسلح": "نیروهای مسلح",
    },
    "Specialty": {
        "General practice": "داخلی",
        "Internal medicine": "داخلی",
        "Pediatrics": "اطفال",
        "Other": "داخلی",
        "پزشک عمومی": "داخلی",
        "قلب": "داخلی",
        "جراحی": "داخلی",
        "روانشناسی": "مغز و اعصاب",
        "دندانپزشکی": "پوست و زیبایی",
    },
    "HealthAssistantCooperationType": {
        "فردی": "سایر موارد",
        "سازمانی": "سایر موارد",
    },
}


def _get_model(model_name):
    from django.apps import apps

    return apps.get_model("api", model_name)


def _referring_count(instance):
    count = 0
    for rel in instance._meta.related_objects:
        accessor = rel.get_accessor_name()
        try:
            related = getattr(instance, accessor)
        except Exception:
            continue
        if rel.one_to_one or rel.many_to_one:
            if related is not None:
                count += 1
        else:
            count += related.count()
    return count


def _remap_fk_to(instance, target):
    """Point all FKs from instance to target, then delete instance."""
    if instance.pk == target.pk:
        return
    for rel in instance._meta.related_objects:
        if not (rel.one_to_many or rel.one_to_one):
            continue
        model = rel.related_model
        field = rel.field
        if field.many_to_one:
            model.objects.filter(**{field.name: instance.pk}).update(
                **{field.name: target.pk}
            )
    instance.delete()


def seed_lookups(*, verbose=True):
    """Ensure canonical lookup rows exist; skip if already present."""
    created_any = False
    for model_name, names in LOOKUP_SEEDS.items():
        Model = _get_model(model_name)
        for name in names:
            _, created = Model.objects.get_or_create(name=name)
            if created:
                created_any = True
                if verbose:
                    print(f"  + {model_name}: {name}")
    for name in ORGANIZATION_TYPE_SEEDS:
        Model = _get_model("OrganizationType")
        _, created = Model.objects.get_or_create(name=name)
        if created:
            created_any = True
            if verbose:
                print(f"  + OrganizationType: {name}")
    return created_any


def restore_lookups(*, verbose=True):
    """
    Restore lookups to canonical 0011 values:
    1. Ensure all canonical names exist
    2. Remap FKs from known aliases to canonical rows
    3. Delete unused non-canonical rows
    """
    if verbose:
        print("📋 Seeding canonical lookups...")
    seed_lookups(verbose=verbose)

    if verbose:
        print("🔄 Remapping and pruning extra lookup rows...")

    for model_name, canonical_names in LOOKUP_SEEDS.items():
        Model = _get_model(model_name)
        canonical = {n: Model.objects.get(name=n) for n in canonical_names}
        remap = LOOKUP_REMAP.get(model_name, {})

        for row in Model.objects.exclude(name__in=canonical_names):
            target_name = remap.get(row.name)
            if target_name and target_name in canonical:
                if verbose:
                    print(f"  ↪ {model_name}: {row.name!r} → {target_name!r}")
                _remap_fk_to(row, canonical[target_name])
                continue

            refs = _referring_count(row)
            if refs == 0:
                if verbose:
                    print(f"  − {model_name}: deleted unused {row.name!r}")
                row.delete()
            elif verbose:
                print(f"  ! {model_name}: kept {row.name!r} ({refs} references)")

    # OrganizationType: only keep ORGANIZATION_TYPE_SEEDS
    OrgType = _get_model("OrganizationType")
    for row in OrgType.objects.exclude(name__in=ORGANIZATION_TYPE_SEEDS):
        refs = _referring_count(row)
        if refs == 0:
            if verbose:
                print(f"  − OrganizationType: deleted unused {row.name!r}")
            row.delete()
        elif verbose:
            print(f"  ! OrganizationType: kept {row.name!r} ({refs} references)")

    if verbose:
        print("✅ Lookup restore finished.")
