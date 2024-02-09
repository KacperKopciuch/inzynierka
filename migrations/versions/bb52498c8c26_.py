"""empty message

Revision ID: bb52498c8c26
Revises: e807e971b505
Create Date: 2024-01-29 18:48:57.769107

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bb52498c8c26'
down_revision = 'e807e971b505'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('announcement', schema=None) as batch_op:
        batch_op.add_column(sa.Column('visible_departments', sa.String(length=256), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('announcement', schema=None) as batch_op:
        batch_op.drop_column('visible_departments')

    # ### end Alembic commands ###
