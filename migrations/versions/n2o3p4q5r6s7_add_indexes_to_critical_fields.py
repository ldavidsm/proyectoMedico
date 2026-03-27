"""add indexes to critical fields

Revision ID: n2o3p4q5r6s7
Revises: m1n2o3p4q5r6
Create Date: 2026-03-27
"""
from alembic import op

revision = 'n2o3p4q5r6s7'
down_revision = 'm1n2o3p4q5r6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index('ix_orders_user_id', 'orders', ['user_id'])
    op.create_index('ix_orders_course_id', 'orders', ['course_id'])
    op.create_index('ix_orders_status', 'orders', ['status'])
    op.create_index('ix_courses_seller_id', 'courses', ['seller_id'])
    op.create_index('ix_courses_status', 'courses', ['status'])
    op.create_index('ix_courses_category', 'courses', ['category'])


def downgrade() -> None:
    op.drop_index('ix_orders_user_id', 'orders')
    op.drop_index('ix_orders_course_id', 'orders')
    op.drop_index('ix_orders_status', 'orders')
    op.drop_index('ix_courses_seller_id', 'courses')
    op.drop_index('ix_courses_status', 'courses')
    op.drop_index('ix_courses_category', 'courses')
