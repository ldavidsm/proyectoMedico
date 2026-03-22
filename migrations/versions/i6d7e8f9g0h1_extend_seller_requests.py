"""extend seller_requests with onboarding fields

Revision ID: i6d7e8f9g0h1
Revises: h5c6d7e8f9g0
Create Date: 2026-03-22 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'i6d7e8f9g0h1'
down_revision: Union[str, Sequence[str], None] = 'h5c6d7e8f9g0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('seller_requests',
        sa.Column('flow_type', sa.String(), server_default='new_user'))
    op.add_column('seller_requests',
        sa.Column('country', sa.String(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('profession', sa.String(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('education_level', sa.String(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('specialty', sa.String(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('college_number', sa.String(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('content_types', sa.JSON(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('languages', sa.JSON(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('teaching_experience', sa.String(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('motivation', sa.JSON(), nullable=True))
    op.add_column('seller_requests',
        sa.Column('legal_accepted', sa.Boolean(), server_default='false'))
    op.add_column('seller_requests',
        sa.Column('legal_accepted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('seller_requests',
        sa.Column('rejection_reason', sa.String(), nullable=True))

    # Make bio nullable (was NOT NULL before)
    op.alter_column('seller_requests', 'bio', nullable=True)


def downgrade() -> None:
    op.drop_column('seller_requests', 'rejection_reason')
    op.drop_column('seller_requests', 'legal_accepted_at')
    op.drop_column('seller_requests', 'legal_accepted')
    op.drop_column('seller_requests', 'motivation')
    op.drop_column('seller_requests', 'teaching_experience')
    op.drop_column('seller_requests', 'languages')
    op.drop_column('seller_requests', 'content_types')
    op.drop_column('seller_requests', 'college_number')
    op.drop_column('seller_requests', 'specialty')
    op.drop_column('seller_requests', 'education_level')
    op.drop_column('seller_requests', 'profession')
    op.drop_column('seller_requests', 'country')
    op.drop_column('seller_requests', 'flow_type')
    op.alter_column('seller_requests', 'bio', nullable=False)
