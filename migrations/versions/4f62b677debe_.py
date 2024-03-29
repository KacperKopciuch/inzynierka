"""empty message

Revision ID: 4f62b677debe
Revises: dbf350976793
Create Date: 2024-01-30 01:16:35.113105

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4f62b677debe'
down_revision = 'dbf350976793'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('announcement', schema=None) as batch_op:
        batch_op.drop_column('departments')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('announcement', schema=None) as batch_op:
        batch_op.add_column(sa.Column('departments', sa.VARCHAR(), nullable=True))

    # ### end Alembic commands ###
