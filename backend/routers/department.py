# routers/department.py

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import  Annotated

from .auth import get_current_user
from .router_utils import check_privileges

from models import Department
from database import SessionLocal
from starlette import status

from schemas.department import DepartmentSchema
import logging

router = APIRouter(prefix='/departments', tags=['departments'])

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
def create_department(db: db_dependency, user: user_dependency, schema: DepartmentSchema):
    check_privileges(user, 5)
    
    department = Department(name=schema.name, added_by=user.get('id'))
    db.add(department)
    db.commit()
    db.refresh(department)
    logger.info(f"Department {department.name} created by user {user.get('id')}")
    return department

@router.get("/", status_code=status.HTTP_200_OK)
def read_departments(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    return db.query(Department).offset(skip).limit(limit).all()

@router.get("/{department_id}",  status_code=status.HTTP_200_OK)
def read_department(db: db_dependency, user: user_dependency, department_id: int = Path(gt=0)):
    check_privileges(user, 1)
    
    department = db.query(Department).filter(Department.id == department_id).first()
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.put("/{department_id}", status_code=status.HTTP_200_OK, response_model=DepartmentSchema)
def update_department(db: db_dependency, user: user_dependency, schema: DepartmentSchema, department_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    department = db.query(Department).filter(Department.id == department_id).first()
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    department.name = schema.name
    db.commit()
    db.refresh(department)
    logger.info(f"Department {department.name} updated by user {user.get('id')}")
    return department

@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(db: db_dependency, user: user_dependency, department_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    department = db.query(Department).filter(Department.id == department_id).first()
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(department)
    db.commit()
    logger.info(f"Department {department.name} deleted by user {user.get('id')}")