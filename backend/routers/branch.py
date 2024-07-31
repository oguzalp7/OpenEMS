from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Annotated, List, Dict, Any
from models import Branch, Department
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges

from schemas.branch import BranchSchema, BranchReadSchema, BranchFetchSchema, BranchCreateSchema
import logging
from datetime import datetime

router = APIRouter(prefix='/branch', tags=['branch'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_branch(db: db_dependency, user: user_dependency, schema: BranchSchema):
    check_privileges(user, 5)
    
    branch = Branch(
        name=schema.name,
        is_franchise=schema.is_franchise,
        studio_extra_guest_price=schema.studio_extra_guest_price,
        hotel_extra_guest_price=schema.hotel_extra_guest_price,
        outside_extra_guest_price=schema.outside_extra_guest_price,
        added_by=user.get('id')
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)

    for dept_id in schema.department_ids:
        department = db.query(Department).filter(Department.id == dept_id).first()
        if department:
            branch.departments.append(department)
    db.commit()
    logger.info(f"Branch {branch.name} created by user {user.get('id')}")
    return branch

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[BranchReadSchema])
def read_branches(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    return db.query(Branch).offset(skip).limit(limit).all()

@router.get("/{branch_id}", status_code=status.HTTP_200_OK, response_model=BranchReadSchema)
def read_branch(db: db_dependency, user: user_dependency, branch_id: int = Path(gt=0)):
    check_privileges(user, 1)
    
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Şube Bulunamadı. ")
    return branch

@router.get('/schema/', response_model=Dict[str, Any])
async def get_schema():
    return BranchCreateSchema.schema()

@router.put("/{branch_id}", status_code=status.HTTP_200_OK)
def update_branch(db: db_dependency, user: user_dependency, schema: BranchSchema, branch_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    branch.name = schema.name
    branch.is_franchise = schema.is_franchise
    branch.studio_extra_guest_price = schema.studio_extra_guest_price
    branch.hotel_extra_guest_price = schema.hotel_extra_guest_price
    branch.outside_extra_guest_price = schema.outside_extra_guest_price
    branch.updated_at = datetime.now()

    branch.departments = []
    for dept_id in schema.department_ids:
        department = db.query(Department).filter(Department.id == dept_id).first()
        if department:
            branch.departments.append(department)

    db.commit()
    db.refresh(branch)
    logger.info(f"Branch {branch.name} updated by user {user.get('id')}")
    return branch

@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_branch(db: db_dependency, user: user_dependency, branch_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    db.delete(branch)
    db.commit()
    logger.info(f"Branch {branch.name} deleted by user {user.get('id')}")
