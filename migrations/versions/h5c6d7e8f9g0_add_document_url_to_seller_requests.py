"""add document_url to seller_requests

Revision ID: h5c6d7e8f9g0
Revises: g4b5c6d7e8f9
Create Date: 2026-03-22 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'h5c6d7e8f9g0'
down_revision: Union[str, Sequence[str], None] = 'g4b5c6d7e8f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('seller_requests',
        sa.Column('document_url', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('seller_requests', 'document_url')
