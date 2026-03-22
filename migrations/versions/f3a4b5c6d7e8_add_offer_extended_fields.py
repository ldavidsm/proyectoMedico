"""add offer extended fields

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-03-22 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f3a4b5c6d7e8'
down_revision: Union[str, Sequence[str], None] = 'e2f3a4b5c6d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── course_offers: new columns ──
    op.add_column('course_offers', sa.Column('is_recommended', sa.Boolean(), server_default=sa.text('false')))
    op.add_column('course_offers', sa.Column('currency_origin', sa.String(), nullable=True))
    op.add_column('course_offers', sa.Column('country_origin', sa.String(), nullable=True))
    op.add_column('course_offers', sa.Column('country_prices', sa.JSON(), nullable=True))
    op.add_column('course_offers', sa.Column('inscription_type', sa.String(), server_default='siempre'))
    op.add_column('course_offers', sa.Column('enrollment_start', sa.DateTime(timezone=True), nullable=True))
    op.add_column('course_offers', sa.Column('enrollment_end', sa.DateTime(timezone=True), nullable=True))
    op.add_column('course_offers', sa.Column('course_start', sa.DateTime(timezone=True), nullable=True))
    op.add_column('course_offers', sa.Column('course_end', sa.DateTime(timezone=True), nullable=True))
    op.add_column('course_offers', sa.Column('max_students', sa.Integer(), nullable=True))
    op.add_column('course_offers', sa.Column('accompaniment', sa.JSON(), nullable=True))
    op.add_column('course_offers', sa.Column('chat_questions_per_student', sa.Integer(), nullable=True))
    op.add_column('course_offers', sa.Column('chat_response_time', sa.String(), nullable=True))
    op.add_column('course_offers', sa.Column('access_content', sa.String(), server_default='vitalicio'))
    op.add_column('course_offers', sa.Column('access_months', sa.Integer(), nullable=True))
    op.add_column('course_offers', sa.Column('certificate_min_progress', sa.Integer(), server_default='100'))
    op.add_column('course_offers', sa.Column('certificate_requires_exam', sa.Boolean(), server_default=sa.text('false')))

    # ── courses: progression_type ──
    op.add_column('courses', sa.Column('progression_type', sa.String(), server_default='libre'))


def downgrade() -> None:
    op.drop_column('courses', 'progression_type')
    op.drop_column('course_offers', 'certificate_requires_exam')
    op.drop_column('course_offers', 'certificate_min_progress')
    op.drop_column('course_offers', 'access_months')
    op.drop_column('course_offers', 'access_content')
    op.drop_column('course_offers', 'chat_response_time')
    op.drop_column('course_offers', 'chat_questions_per_student')
    op.drop_column('course_offers', 'accompaniment')
    op.drop_column('course_offers', 'max_students')
    op.drop_column('course_offers', 'course_end')
    op.drop_column('course_offers', 'course_start')
    op.drop_column('course_offers', 'enrollment_end')
    op.drop_column('course_offers', 'enrollment_start')
    op.drop_column('course_offers', 'inscription_type')
    op.drop_column('course_offers', 'country_prices')
    op.drop_column('course_offers', 'country_origin')
    op.drop_column('course_offers', 'currency_origin')
    op.drop_column('course_offers', 'is_recommended')
