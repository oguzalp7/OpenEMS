from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, Any, Dict

from models import User, Employee
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges
import logging

from schemas.user_employee import UserEmployeeCreateSchema
from passlib.context import CryptContext

router = APIRouter(prefix='/user-employee', tags=['UserEmployee'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user_employee(user: user_dependency, db: db_dependency, schema: UserEmployeeCreateSchema):
   
    
    check_privileges(user, 5)

    # Create Employee
    employee_data = Employee(
        name = schema.name,
        branch_id=schema.branch_id,
        department_id=schema.department_id,
        employment_type_id=schema.employment_type_id,
        country_code=schema.country_code,
        phone_number=schema.phone_number,
        job_title=schema.job_title,
        employment_start_date=schema.employment_start_date,
        salary=schema.salary,
        balance=schema.balance,
        employment_status=schema.employment_status,
        added_by=user.get('id')
    )
    db.add(employee_data)
    db.commit()
    db.refresh(employee_data)

    # Create User
    user_data = User(
        username=schema.username,
        hashed_password=bcrypt_context.hash(schema.password),
        is_active=schema.is_active,
        auth_id=schema.auth_id,
        employee_id=employee_data.id,
        added_by=user.get('id')
    )
    db.add(user_data)
    db.commit()
    db.refresh(user_data)

    return {"user": user_data, "employee": employee_data}

@router.get('/schema', response_model=Dict[str, Any])
async def get_schema():
    return UserEmployeeCreateSchema.schema()


# TODO-1: 
# - Add a new end-point for role-based authentication context in frontend
# - End-point attrs:
# - - Method: Get
# - - In return {"user": user_data, "employee": employee_data}