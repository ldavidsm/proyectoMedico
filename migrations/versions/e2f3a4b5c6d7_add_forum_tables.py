"""add forum tables

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-03-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e2f3a4b5c6d7'
down_revision: Union[str, Sequence[str], None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add has_forum column to courses
    op.add_column(
        'courses',
        sa.Column('has_forum', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    )

    # Create forum_threads table
    op.create_table(
        'forum_threads',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('course_id', sa.String(), sa.ForeignKey('courses.id'), nullable=False),
        sa.Column('author_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(300), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('is_pinned', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_closed', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('views', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Create forum_posts table
    op.create_table(
        'forum_posts',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('thread_id', sa.String(), sa.ForeignKey('forum_threads.id'), nullable=False),
        sa.Column('author_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('is_answer', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('forum_posts')
    op.drop_table('forum_threads')
    op.drop_column('courses', 'has_forum')
