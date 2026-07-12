#!/bin/bash
set -e

mkdir -p database

# One-time: copy users from ephemeral app DB if we switched to the disk mount.
if [ ! -f database/db.sqlite3 ] && [ -f db.sqlite3 ]; then
  cp -a db.sqlite3 database/db.sqlite3
fi

# SQLite needs write access to the file and directory (journal files).
chmod 777 database
if [ -f database/db.sqlite3 ]; then
  chmod 666 database/db.sqlite3
fi

python manage.py migrate --noinput

if [ -f database/db.sqlite3 ]; then
  chmod 666 database/db.sqlite3
fi
