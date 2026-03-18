"""add messaging tables

Revision ID: b3f7a1c2d4e5
Revises: 416ef6a2074c
Create Date: 2026-03-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b3f7a1c2d4e5'
down_revision: Union[str, Sequence[str], None] = '416ef6a2074c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'messages',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('sender_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('receiver_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('course_id', sa.String(), sa.ForeignKey('courses.id'), nullable=False),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_starred', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'message_replies',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('message_id', sa.String(), sa.ForeignKey('messages.id'), nullable=False),
        sa.Column('sender_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'course_announcements',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('course_id', sa.String(), sa.ForeignKey('courses.id'), nullable=False),
        sa.Column('seller_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'task_submissions',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('block_id', sa.String(), sa.ForeignKey('content_blocks.id'), nullable=False),
        sa.Column('course_id', sa.String(), sa.ForeignKey('courses.id'), nullable=False),
        sa.Column('student_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('submission_text', sa.Text(), nullable=True),
        sa.Column('file_url', sa.String(), nullable=True),
        sa.Column('file_name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), server_default='pendiente'),
        sa.Column('grade', sa.Integer(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('graded_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('task_submissions')
    op.drop_table('course_announcements')
    op.drop_table('message_replies')
    op.drop_table('messages')
