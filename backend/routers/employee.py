from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from sqlalchemy import select, join
from typing import List, Annotated
from models import Employee, Branch, Department, EmploymentType
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, convert_result_to_dict

from schemas.employee import EmployeeCreateUpdateSchema
import logging
from datetime import datetime


router = APIRouter(prefix='/employees', tags=['employees'])

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
def create_employee(db: db_dependency, user: user_dependency, schema: EmployeeCreateUpdateSchema):
    check_privileges(user, 5)
    
    employee = Employee(
        **schema.model_dump(),
        added_by=user.get('id')
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    logger.info(f"Employee {employee.id} created by user {user.get('id')}")
    return employee

@router.get("/", status_code=status.HTTP_200_OK) #, response_model=List[EmployeeReadSchema])
def read_employees(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    
    employee_api_columns  = [
            'ID', 'AD-SOYAD', 'ÜLKE KODU', 'TELEFON', 'İŞ TANIMI',
            'İŞ BAŞLANGIÇ TARİHİ', 'İŞ ÇIKIŞ TARİHİ', 'MAAŞ',
            'BAKİYE', 'ÇALIŞMA DURUMU', 'ŞUBE', 'DEPARTMAN', 'ÇALIŞMA TİPİ'
        ]
    
    results = db.query(
            Employee.id,
            Employee.name,
            Employee.country_code,
            Employee.phone_number,
            Employee.job_title,
            Employee.employment_start_date,
            Employee.employment_end_date,
            Employee.salary,
            Employee.balance,
            Employee.employment_status,
            Branch.name.label('branch_name'),
            Department.name.label('department_name'),
            EmploymentType.name.label('employment_type_name'),
        )\
        .join(Branch, Employee.branch_id == Branch.id)\
        .join(Department, Employee.department_id == Department.id)\
        .join(EmploymentType, Employee.employment_type_id == EmploymentType.id)\
        .offset(skip)\
        .limit(limit).all()
    
    return [convert_result_to_dict(row, employee_api_columns) for row in results]
    

@router.get("/{employee_id}", status_code=status.HTTP_200_OK)#, response_model=EmployeeCreateUpdateSchema)
def read_employee(db: db_dependency, user: user_dependency, employee_id: int = Path(gt=0)):
    check_privileges(user, 1)

    columns = [
        "name","country_code", "phone_number", "job_title",
        "employment_start_date", "salary", "balance",
        "employment_status", "branch_id", "department_id", "employment_type_id"
    ]
    
    result = db.query(
            Employee.name,
            Employee.country_code,
            Employee.phone_number,
            Employee.job_title,
            Employee.employment_start_date,
            #Employee.employment_end_date,
            Employee.salary,
            Employee.balance,
            Employee.employment_status,
            Branch.id,
            Department.id,
            EmploymentType.id,
        )\
        .join(Branch, Employee.branch_id == Branch.id)\
        .join(Department, Employee.department_id == Department.id)\
        .join(EmploymentType, Employee.employment_type_id == EmploymentType.id)\
        .filter(Employee.id == employee_id).first()
    

    
    if result is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    
    return convert_result_to_dict(result, columns=columns)

@router.put("/{employee_id}", status_code=status.HTTP_201_CREATED, response_model=EmployeeCreateUpdateSchema)
def update_employee(db: db_dependency, user: user_dependency, schema: EmployeeCreateUpdateSchema, employee_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if not schema.employment_status:
        employee.employment_end_date = datetime.now()
    employee.name = schema.name
    employee.country_code = schema.country_code
    employee.phone_number = schema.phone_number
    employee.job_title = schema.job_title
    employee.employment_start_date = schema.employment_start_date
    employee.salary = schema.salary
    employee.balance = schema.balance
    employee.employment_status = schema.employment_status
    employee.branch_id = schema.branch_id
    employee.department_id = schema.department_id
    employee.employment_type_id = schema.employment_type_id
    employee.updated_at = datetime.now()
    employee.added_by = user.get('id')
    
    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee
    

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(db: db_dependency, user: user_dependency, employee_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    logger.info(f"Employee {employee.id} deleted by user {user.get('id')}")
