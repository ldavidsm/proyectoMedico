"""add requires_professional_profile to courses

Revision ID: j7e8f9g0h1i2
Revises: i6d7e8f9g0h1
Create Date: 2026-03-23 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'j7e8f9g0h1i2'
down_revision: Union[str, Sequence[str], None] = 'i6d7e8f9g0h1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('courses',
        sa.Column('requires_professional_profile', sa.Boolean(),
                   server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('courses', 'requires_professional_profile')
