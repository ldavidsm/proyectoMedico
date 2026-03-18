"""add webinars tables

Revision ID: d1e2f3a4b5c6
Revises: c1d2e3f4a5b6
Create Date: 2026-03-18 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = 'c1d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'seller_google_tokens',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('seller_id', sa.String(), sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('access_token', sa.Text(), nullable=False),
        sa.Column('refresh_token', sa.Text(), nullable=False),
        sa.Column('token_expiry', sa.DateTime(timezone=True), nullable=True),
        sa.Column('google_email', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'webinars',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('seller_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('course_id', sa.String(), sa.ForeignKey('courses.id'), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), server_default='60'),
        sa.Column('meet_link', sa.String(), nullable=True),
        sa.Column('google_event_id', sa.String(), nullable=True),
        sa.Column('status', sa.String(), server_default='scheduled'),
        sa.Column('max_attendees', sa.Integer(), nullable=True),
        sa.Column('is_public', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('recording_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'webinar_registrations',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('webinar_id', sa.String(), sa.ForeignKey('webinars.id'), nullable=False),
        sa.Column('student_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('registered_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('attended', sa.Boolean(), server_default=sa.text('false')),
    )


def downgrade() -> None:
    op.drop_table('webinar_registrations')
    op.drop_table('webinars')
    op.drop_table('seller_google_tokens')
