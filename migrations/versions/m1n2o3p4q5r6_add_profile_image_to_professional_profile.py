"""add profile_image to professional_profile

Revision ID: m1n2o3p4q5r6
Revises: l9g0h1i2j3k4
Create Date: 2026-03-27
"""
from alembic import op
import sqlalchemy as sa

revision = 'm1n2o3p4q5r6'
down_revision = 'l9g0h1i2j3k4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('professional_profiles',
        sa.Column('profile_image', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('professional_profiles', 'profile_image')
