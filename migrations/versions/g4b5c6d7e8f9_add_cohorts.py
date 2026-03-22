"""add cohorts and cohort_members tables

Revision ID: g4b5c6d7e8f9
Revises: f3a4b5c6d7e8
Create Date: 2026-03-22 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'g4b5c6d7e8f9'
down_revision: Union[str, Sequence[str], None] = 'f3a4b5c6d7e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'cohorts',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('course_id', sa.String(), sa.ForeignKey('courses.id'), nullable=False),
        sa.Column('offer_id', sa.String(), sa.ForeignKey('course_offers.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('enrollment_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('enrollment_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('course_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('course_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('max_students', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('announcement', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'cohort_members',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('cohort_id', sa.String(), sa.ForeignKey('cohorts.id'), nullable=False),
        sa.Column('student_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('order_id', sa.String(), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('cohort_members')
    op.drop_table('cohorts')
