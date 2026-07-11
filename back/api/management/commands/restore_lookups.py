from django.core.management.base import BaseCommand

from api.lookup_seeds import restore_lookups


class Command(BaseCommand):
    help = "Restore lookup tables to canonical values (migration 0011) and remove populate_db extras."

    def handle(self, *args, **options):
        restore_lookups(verbose=True)
