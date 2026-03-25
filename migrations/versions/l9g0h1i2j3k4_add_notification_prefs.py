"""add notification preferences to privacy settings

Revision ID: l9g0h1i2j3k4
Revises: k8f9g0h1i2j3
Create Date: 2026-03-25
"""
from alembic import op
import sqlalchemy as sa

revision = 'l9g0h1i2j3k4'
down_revision = 'k8f9g0h1i2j3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('privacy_settings',
        sa.Column('marketing_emails', sa.Boolean(),
            server_default='true', nullable=False))
    op.add_column('privacy_settings',
        sa.Column('course_updates', sa.Boolean(),
            server_default='true', nullable=False))
    op.add_column('privacy_settings',
        sa.Column('push_notifications', sa.Boolean(),
            server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('privacy_settings', 'push_notifications')
    op.drop_column('privacy_settings', 'course_updates')
    op.drop_column('privacy_settings', 'marketing_emails')
