from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, Any, Dict

from models import User, Employee, Process, ProcessPrice
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, remove_item_by_name
import logging

from schemas.user_employee import UserEmployeeCreateSchema
from schemas.process_price import ProcessPriceSchema
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

    # initialize the process prices 0
    current_employee_id = employee_data.id
    current_department_id = employee_data.department_id

    if current_department_id in [1, 2, 3]:
        processes = db.query(Process.id, Process.name).filter(Process.department_id == current_department_id).all()

        if processes is None:
            pass
        
        if current_department_id == 1:
            processes = remove_item_by_name(processes, 'GELİN+')

        processes = [process[0] for process in processes]
        
        entries = []
        for process_id in processes:
            schema_ = ProcessPriceSchema(
                    employee_id=current_employee_id,
                    process_id=process_id,
                    price=0
                )
            process_price_data = ProcessPrice(**schema_.model_dump(), added_by=user.get('id'))
            entries.append(process_price_data)

        db.add_all(entries)
        db.commit()
        #db.refresh()


    return {"user": user_data, "employee": employee_data}

@router.get('/schema/', response_model=Dict[str, Any])
async def get_schema():
    return UserEmployeeCreateSchema.schema()


# TODO-1: 
# - Add a new end-point for role-based authentication context in frontend
# - End-point attrs:
# - - Method: Get
# - - In return {"user": user_data, "employee": employee_data}