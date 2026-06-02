from rest_framework import serializers

from .. import messages as msg


def resolve_lookup(model, raw, *, field_name="value", required=True):
    """Resolve a lookup FK from a model instance or primary key."""
    if isinstance(raw, model):
        return raw
    if raw is None or (isinstance(raw, str) and not str(raw).strip()):
        if required:
            raise serializers.ValidationError({field_name: msg.FIELD_REQUIRED})
        return None
    if isinstance(raw, bool):
        raise serializers.ValidationError({field_name: msg.INVALID_LOOKUP_ID})
    try:
        pk = int(raw)
    except (TypeError, ValueError):
        if isinstance(raw, str) and str(raw).strip():
            match = model.objects.filter(name=str(raw).strip()).first()
            if match:
                return match
        raise serializers.ValidationError({field_name: msg.LOOKUP_ID_MUST_BE_INTEGER})
    try:
        return model.objects.get(pk=pk)
    except model.DoesNotExist:
        raise serializers.ValidationError({field_name: msg.INVALID_LOOKUP_ID})
