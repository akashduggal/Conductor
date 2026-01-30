# This project uses Supabase for the database; Alembic is not used.
# Schema is in supabase/schema.sql (run in Supabase SQL Editor).
from alembic import context

config = context.config

def run_migrations_offline():
    pass

def run_migrations_online():
    pass

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
