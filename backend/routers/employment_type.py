# routers/employment_type.py
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List, Annotated
from models import EmploymentType
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from backend.routers.router_utils import check_privileges

from schemas.employment_type import EmploymentTypeSchema
import logging
from datetime import datetime

router = APIRouter(prefix='/employment-types', tags=['employment_types'])

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
def create_employment_type(db: db_dependency, user: user_dependency, schema: EmploymentTypeSchema):
    check_privileges(user, 5)
    
    employment_type = EmploymentType(
        name=schema.name,
        added_by=user.get('id')
    )
    db.add(employment_type)
    db.commit()
    db.refresh(employment_type)
    logger.info(f"EmploymentType {employment_type.name} created by user {user.get('id')}")
    return employment_type

@router.get("/", status_code=status.HTTP_200_OK)
def read_employment_types(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    return db.query(EmploymentType).offset(skip).limit(limit).all()

@router.get("/{employment_type_id}", status_code=status.HTTP_200_OK)
def read_employment_type(db: db_dependency, user: user_dependency, employment_type_id: int = Path(gt=0)):
    check_privileges(user, 1)
    
    employment_type = db.query(EmploymentType).filter(EmploymentType.id == employment_type_id).first()
    if employment_type is None:
        raise HTTPException(status_code=404, detail="EmploymentType not found")
    return employment_type

@router.put("/{employment_type_id}", status_code=status.HTTP_200_OK)
def update_employment_type(db: db_dependency, user: user_dependency, schema: EmploymentTypeSchema, employment_type_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    employment_type = db.query(EmploymentType).filter(EmploymentType.id == employment_type_id).first()
    if employment_type is None:
        raise HTTPException(status_code=404, detail="EmploymentType not found")
    
    employment_type.name = schema.name
    employment_type.updated_at = datetime.now()
    db.commit()
    db.refresh(employment_type)
    logger.info(f"EmploymentType {employment_type.name} updated by user {user.get('id')}")
    return employment_type

@router.delete("/{employment_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employment_type(db: db_dependency, user: user_dependency, employment_type_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    employment_type = db.query(EmploymentType).filter(EmploymentType.id == employment_type_id).first()
    if employment_type is None:
        raise HTTPException(status_code=404, detail="EmploymentType not found")
    db.delete(employment_type)
    db.commit()
    logger.info(f"EmploymentType {employment_type.name} deleted by user {user.get('id')}")