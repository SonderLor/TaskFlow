"""Add cascade behavior

Revision ID: 700b15ec14b3
Revises: e9bbbd0d14e3
Create Date: 2025-04-13 21:28:17.754548

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '700b15ec14b3'
down_revision: Union[str, None] = 'e9bbbd0d14e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
