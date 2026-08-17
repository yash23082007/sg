"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-16 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.Column('target_role', sa.String(), nullable=False),
        sa.Column('resume_uploaded', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_users_email'), ['email'], unique=True)

    # 2. skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('normalized_key', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('demand_score', sa.Float(), nullable=False),
        sa.Column('required_proficiency', sa.Float(), nullable=False),
        sa.Column('centrality', sa.Float(), nullable=False),
        sa.Column('estimated_hours', sa.Float(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.CheckConstraint('demand_score >= 0.0 AND demand_score <= 1.0', name='check_demand_score_range'),
        sa.CheckConstraint('required_proficiency >= 0.0 AND required_proficiency <= 1.0', name='check_req_prof_range'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('skills', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_skills_name'), ['name'], unique=True)
        batch_op.create_index(batch_op.f('ix_skills_normalized_key'), ['normalized_key'], unique=True)

    # 3. skill_edges table
    op.create_table(
        'skill_edges',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('prerequisite_id', sa.String(), nullable=False),
        sa.Column('dependent_id', sa.String(), nullable=False),
        sa.CheckConstraint('prerequisite_id != dependent_id', name='check_no_self_loops'),
        sa.ForeignKeyConstraint(['dependent_id'], ['skills.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['prerequisite_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('prerequisite_id', 'dependent_id', name='uq_prerequisite_dependent')
    )

    # 4. user_skill_proficiencies table
    op.create_table(
        'user_skill_proficiencies',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('skill_id', sa.String(), nullable=False),
        sa.Column('proficiency', sa.Float(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('proficiency >= 0.0 AND proficiency <= 1.0', name='check_proficiency_range'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'skill_id', name='uq_user_skill')
    )


def downgrade() -> None:
    op.drop_table('user_skill_proficiencies')
    op.drop_table('skill_edges')
    with op.batch_alter_table('skills', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_skills_normalized_key'))
        batch_op.drop_index(batch_op.f('ix_skills_name'))
    op.drop_table('skills')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_email'))
    op.drop_table('users')
