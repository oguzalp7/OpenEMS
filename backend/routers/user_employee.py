from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Annotated, Any, Dict, Optional

from models import Branch, Department, EmploymentType, User, Employee, Process, ProcessPrice
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, convert_result_to_dict, remove_item_by_name
import logging

from schemas.user_employee import UserEmployeeCreateSchema, UserEmployeeReadSchema, UserEmployeeUpdateSchema
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

@router.get('/', status_code=status.HTTP_200_OK)
async def get_user_employees(db: db_dependency, user: user_dependency, b: Optional[int] = Query(None), dep: Optional[int] = Query(None), et: Optional[int] = Query(None), active: Optional[bool] = Query(True), skip: int = 0, limit: int = 10):
    """
        params: 
        b => branch id: int
        dep => department id: int
        et => employment type id: int
        active => employment status: bool
    """
    check_privileges(user, 1)

    cols = [
            'ID', 'AD-SOYAD',
            #'ÜLKE KODU',
            'TELEFON', 
            'KULLANICI ADI', 'YETKİ SEVİYESİ',
            'AKTİFLİK', 'İŞ TANIMI',
            'İŞ BAŞLANGIÇ TARİHİ', 'İŞ ÇIKIŞ TARİHİ',
            #'MAAŞ',
            #'BAKİYE', 
            'ÇALIŞMA DURUMU', 'ŞUBE', 'DEPARTMAN', 'ÇALIŞMA TİPİ'
    ]

    query = db.query(
            Employee.id,
            Employee.name,
            #Employee.country_code,
            Employee.phone_number,
            User.username,
            User.auth_id,
            User.is_active,
            Employee.job_title,
            Employee.employment_start_date,
            Employee.employment_end_date,
            #Employee.salary,
            #Employee.balance,
            Employee.employment_status,
            Branch.name.label('ŞUBE'),
            Department.name.label('DEPARTMAN'),
            EmploymentType.name.label('ÇALIŞMA TİPİ'),
        )\
        .join(User, User.employee_id == Employee.id)\
        .join(Branch, Employee.branch_id == Branch.id)\
        .join(Department, Employee.department_id == Department.id)\
        .join(EmploymentType, Employee.employment_type_id == EmploymentType.id)
    
    if b is not None:
        query = query.filter(Branch.id == b)
        if query.count() == 0 :
            raise HTTPException(status_code=404, detail="Şubede Çalışan Bulunamadı.")
        else:
            is_dep_available = False
            if dep is not None:
                branch = db.query(Branch).filter(Branch.id==b).first()
                dep_list=branch.departments
                for deps in dep_list:
                    if deps.id == dep:
                        is_dep_available = True
                        query = query.filter(Department.id == dep)
                        if query.count() == 0 :
                            raise HTTPException(status_code=404, detail="Departmanda Çalışan Bulunamadı.")
                        
                if is_dep_available == False:
                    raise HTTPException(status_code=404, detail="İstenen Şubede İstenen Departman Bulunamadı.")
    else:
        if dep is not None:
            query = query.filter(Department.id == dep)
            if query.count() == 0 :
                raise HTTPException(status_code=404, detail="Departmanda Çalışan Bulunamadı.")

    if et is not None:
        query = query.filter(EmploymentType.id == et) 
        if query.count() == 0 :
            raise HTTPException(status_code=404, detail="İstenen Çalışma Tipinde Çalışan Bulunamadı.")

    if active is not None:
        query = query.filter(Employee.employment_status == active)
        if query.count() == 0 :
            raise HTTPException(status_code=404, detail="İstenen Aktiflik Durumunda Çalışan Bulunamadı.")

    query = query.offset(skip).limit(limit).all()
    return [convert_result_to_dict(row, cols) for row in query]


@router.get('/{employee_id}', status_code=status.HTTP_200_OK, response_model=UserEmployeeUpdateSchema)
async def get_user_employees(db: db_dependency, user: user_dependency, employee_id: int):
    check_privileges(user, 1)

    query = db.query(
            Employee.name,
            Employee.country_code,
            Employee.phone_number,
            User.username,
            User.auth_id,
            User.is_active,
            Employee.job_title,
            Employee.salary,
            Employee.balance,
            Employee.employment_status,
            Branch.id.label('branch_id'),
            Department.id.label('department_id'),
            EmploymentType.id.label('employment_type_id'),
        )\
        .join(User, User.employee_id == Employee.id)\
        .join(Branch, Employee.branch_id == Branch.id)\
        .join(Department, Employee.department_id == Department.id)\
        .join(EmploymentType, Employee.employment_type_id == EmploymentType.id)\
        .filter(Employee.id == employee_id).first()
    
    return query


@router.get('/update-schema/', status_code=status.HTTP_200_OK)
async def get_update_schema():
    
    return UserEmployeeUpdateSchema.schema()

@router.put('/{employee_id}', status_code=status.HTTP_201_CREATED)
async def update_user_employee(db: db_dependency, user: user_dependency, employee_id: int, schema: UserEmployeeUpdateSchema):
    check_privileges(user, 5)
    
    employee_query = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if employee_query is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Personel bulunamadı.')
    
    user_query = db.query(User).filter(User.employee_id == employee_id).first()
    
    if user_query is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Kullanıcı bulunamadı.')
    
    user_query.auth_id = schema.auth_id
    user_query.username = schema.username
    user_query.is_active = schema.is_active

    db.add(user_query)
    db.commit()
    db.refresh(user_query)

    employee_query.name = schema.name
    employee_query.branch_id = schema.branch_id
    employee_query.department_id = schema.department_id
    employee_query.country_code = schema.country_code
    employee_query.employment_type_id = schema.employment_type_id
    employee_query.phone_number = schema.phone_number
    employee_query.job_title = schema.job_title
    employee_query.salary = schema.salary
    employee_query.balance = schema.balance
    employee_query.employment_status = schema.employment_status

    db.add(employee_query)
    db.commit()
    db.refresh(employee_query)
    
    


# TODO-1: 
# - Add a new end-point for role-based authentication context in frontend
# - End-point attrs:
# - - Method: Get
# - - In return {"user": user_data, "employee": employee_data}