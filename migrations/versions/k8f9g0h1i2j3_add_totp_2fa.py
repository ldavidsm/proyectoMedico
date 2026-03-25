"""add totp 2fa

Revision ID: k8f9g0h1i2j3
Revises: j7e8f9g0h1i2
Create Date: 2026-03-25
"""
from alembic import op
import sqlalchemy as sa

revision = 'k8f9g0h1i2j3'
down_revision = 'j7e8f9g0h1i2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users',
        sa.Column('totp_secret', sa.String(), nullable=True))
    op.add_column('users',
        sa.Column('totp_enabled', sa.Boolean(),
            server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'totp_enabled')
    op.drop_column('users', 'totp_secret')
