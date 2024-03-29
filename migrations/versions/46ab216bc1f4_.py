"""empty message

Revision ID: 46ab216bc1f4
Revises: 2c25a564c76f
Create Date: 2024-01-28 18:38:37.191878

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '46ab216bc1f4'
down_revision = '2c25a564c76f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('announcement', schema=None) as batch_op:
        batch_op.add_column(sa.Column('author_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.create_foreign_key('fk_announcement_author', 'user', ['author_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('announcement', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('created_at')
        batch_op.drop_column('author_id')

    # ### end Alembic commands ###
