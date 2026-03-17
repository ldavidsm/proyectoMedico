"""add_collections_table

Revision ID: 868cfc77f85b
Revises: a6a6bea9ae13
Create Date: 2026-03-17 17:27:25.389510

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '868cfc77f85b'
down_revision: Union[str, Sequence[str], None] = 'a6a6bea9ae13'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('collections',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('seller_id', sa.String(), nullable=False),
        sa.Column('nombre', sa.String(), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('progression', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('collection_courses',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('collection_id', sa.String(), nullable=False),
        sa.Column('course_id', sa.String(), nullable=False),
        sa.Column('order', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['collection_id'], ['collections.id']),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('collection_courses')
    op.drop_table('collections')
