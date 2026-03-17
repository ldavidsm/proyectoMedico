"""add_rating_columns_to_courses

Revision ID: a6a6bea9ae13
Revises: 7c15d43436de
Create Date: 2026-03-17 16:41:45.282365

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a6a6bea9ae13'
down_revision: Union[str, Sequence[str], None] = '7c15d43436de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('courses', sa.Column('rating_avg', sa.Float(), nullable=True))
    op.add_column('courses', sa.Column('rating_count', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('courses', 'rating_count')
    op.drop_column('courses', 'rating_avg')
