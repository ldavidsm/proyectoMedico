from logging.config import fileConfig
import os
import sys
from dotenv import load_dotenv

# Cargar .env desde la carpeta Backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, 'Backend', '.env'))

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

sys.path.insert(0, os.path.join(BASE_DIR, 'Backend'))
from app.database import Base
from app.models import courses, users, orders, notifications, collections, messaging
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(
        config.config_ini_section, {}
    )
    # Usar DATABASE_URL del .env
    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        configuration['sqlalchemy.url'] = db_url

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
