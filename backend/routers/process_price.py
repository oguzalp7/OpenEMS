# routers/process_price.py

import pandas as pd
from fastapi.responses import FileResponse
from fastapi import APIRouter, Depends, HTTPException, Path, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import Annotated, List, Optional
from sqlalchemy import cast, JSON
from database import SessionLocal
from starlette import status

from models import Process, ProcessPrice, Employee, Department, Branch
from .auth import get_current_user
from .router_utils import check_privileges, delete_item, get_item_raw, get_items_raw,convert_result_to_dict

import logging

from schemas.process_price import ProcessPriceSchema

router = APIRouter(prefix='/proces-prices', tags=['ProcessPrices'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProcessPriceSchema)
async def create_process_price(user: user_dependency, db: db_dependency, schema: ProcessPriceSchema):
    check_privileges(user, 5)

    data = ProcessPrice(**schema.model_dump(), added_by=user.get('id'))
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.post("/all_processes/", status_code=status.HTTP_201_CREATED)
async def create_process_prices_per_employee(user: user_dependency, db: db_dependency, e: int):
    check_privileges(user, 5)

    employee = db.query(Employee).filter(Employee.id == e).first()
  
    if employee is None:
        raise HTTPException(status_code=404, detail="Çalışan Bulunamadı.")
    
    employee_department = db.query(Employee.department_id).filter(Employee.id == e).first()
    if employee_department is not None:
        employee_department = employee_department[0]

    pids = db.query(Process.id).filter(Process.department_id == employee_department).all()
    if len(pids) == 0:
        raise HTTPException(status_code=404, detail="Departmanda İşlem Bulunamadı.")
    process_ids = [pid[0] for pid in pids]

    for process_id in process_ids:
        process_price = ProcessPrice(employee_id=e, process_id=process_id, price=0, added_by=user.get('id'))  # Price will be updated later
        db.add(process_price)
    
    # Commit the transaction to save the new entries
    db.commit()

    return {"message": "Process prices created successfully for the employee. Prices will be imported later."}

@router.get("/raw", response_model=List[ProcessPriceSchema], status_code=status.HTTP_200_OK)
def get_raw_process_prices(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    
    return get_items_raw(db=db, table=ProcessPrice, skip=skip, limit=limit)

@router.get('/{price_id}', status_code=status.HTTP_200_OK, response_model=ProcessPriceSchema)
async def get_raw_process_price(user: user_dependency, db: db_dependency, price_id: int):
    check_privileges(user, 1)
    return get_item_raw(db=db, table=ProcessPrice, index=price_id)

@router.get('/', status_code=status.HTTP_200_OK)
def get_processed_process_prices(user: user_dependency, db: db_dependency, e: Optional[int] = Query(None), pid: Optional[int] = Query(None), skip: int = 0, limit: int = 10):
    """
        params: 
        e => employee id: int
        pid => process id: int
    """
    check_privileges(user, 1)

    if e is None:
        raise HTTPException(status_code=404, detail='Çalışan Girilmedi.')
    
    if pid is None:
        raise HTTPException(status_code=404, detail='İşlem Girilmedi.')
    
    if e is not None:
        employee_query = db.query(Employee).filter(Employee.id == e).first()
        if employee_query is None: 
            raise HTTPException(status_code=404, detail='Çalışan Bulunamadı.')

    if pid is not None:
        process_query = db.query(Process).filter(Process.id == pid).first()
        if process_query is None: 
            raise HTTPException(status_code=404, detail='İşlem Bulunamadı.')    
    
    process_price_api_columns = ['ID', 'ŞUBE', 'DEPARTMAN', 'ÇALIŞAN', 'İŞLEM', 'ÜCRET']

    query = db.query(
        ProcessPrice.id,
        Branch.name.label('ŞUBE'),
        Department.name.label('DEPARTMAN'),
        Employee.name.label('ÇALIŞAN'),  
        Process.name.label('İŞLEM'),
        ProcessPrice.price
    )\
    .join(Employee, ProcessPrice.employee_id == Employee.id)\
    .join(Process, ProcessPrice.process_id == Process.id)\
    .join(Department, Process.department_id == Department.id)\
    .join(Branch, Employee.branch_id == Branch.id)

    if e is not None:
        query = query.filter(Employee.id == e)
        if query.count() == 0 :
                raise HTTPException(status_code=404, detail="Çalışanın İşlem Ücreti Bulunamadı.")

    if pid is not None:
        query = query.filter(Process.id == pid)
        if query.count() == 0 :
                raise HTTPException(status_code=404, detail="İşlemin İşlem Ücreti Bulunamadı.")
    
    query = query.offset(skip).limit(limit).all()    
    return [convert_result_to_dict(row, process_price_api_columns) for row in query]


@router.delete('/{price_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_process_price(db: db_dependency, user: user_dependency, index: int):
    check_privileges(user, 5)

    delete_item(db=db, index=index, table=ProcessPrice)

@router.put("/{price_id}", response_model=ProcessPriceSchema, status_code=status.HTTP_201_CREATED)
def update_process_price(price_id: int, price: ProcessPriceSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    db_price = db.query(ProcessPrice).filter(ProcessPrice.id == price_id).first()
    if db_price is None:
        raise HTTPException(status_code=404, detail="Fiyat Bulunamadı.")
    
    db_price.employee_id = price.employee_id
    db_price.process_id = price.process_id
    db_price.price = price.price
    db_price.added_by = user.get('id')

    db.commit()
    db.refresh(db_price)
    return db_price

@router.get("/export_process_prices/")
async def export_process_prices(db: db_dependency, user: user_dependency, b: Optional[int] = Query(None), dep: Optional[int] = Query(None)):
    """
        params: 
        b => branch id: int
        dep => department id: int
    """
    check_privileges(user, 1)
    if b is not None:
        branch_query = db.query(Branch).filter(Branch.id == b).first()
        if branch_query is None: 
            raise HTTPException(status_code=404, detail='Şube bulunamadı.')
        
    if dep is not None:
        department_query = db.query(Department).filter(Department.id == dep).first()
        if department_query is None: 
            raise HTTPException(status_code=404, detail='Departman bulunamadı.')
    
    # Query all process_price data
    process_prices = db.query(
        ProcessPrice.id,
        Branch.name.label("branch_name"),
        Department.name.label("department_name"),
        Employee.name.label("employee_name"),  
        Process.name.label("process_name"), 
        ProcessPrice.price
        )\
        .join(Employee, ProcessPrice.employee_id == Employee.id)\
        .join(Process, ProcessPrice.process_id == Process.id)\
        .join(Department, Process.department_id == Department.id)\
        .join(Branch, Employee.branch_id == Branch.id)
    
    if b is not None:
        process_prices = process_prices.filter(Branch.id == b)
        if process_prices.count() == 0 :
            raise HTTPException(status_code=404, detail="Şubede İşlem Ücreti Bulunamadı.")
        
        else:
            is_dep_available = False
            if dep is not None:
                branch = db.query(Branch).filter(Branch.id==b).first()
                dep_list=branch.departments
                for deps in dep_list:
                    if deps.id == dep:
                        is_dep_available = True
                        process_prices = process_prices.filter(Department.id == dep)
                        if process_prices.count() == 0 :
                            raise HTTPException(status_code=404, detail="Departmanda İşlem Ücreti Bulunamadı.")
                        
                if is_dep_available == False:
                    raise HTTPException(status_code=404, detail="İstenen Şubede İstenen Departman Bulunamadı.")
                data = [
                {
                        "İşlem Ücret ID": pp.id,
                        "Çalışan": pp.employee_name,
                        "İşlem": pp.process_name,
                        "Ücret": pp.price,
                }
                for pp in process_prices
                ]
            else:
                data = [
                {
                        "İşlem Ücret ID": pp.id,
                        "Departman": pp.department_name,
                        "Çalışan": pp.employee_name,
                        "İşlem": pp.process_name,
                        "Ücret": pp.price,
                }
                for pp in process_prices
                ]
    else:
        if dep is not None:
            process_prices = process_prices.filter(Department.id == dep).all()
            if process_prices is None :
                raise HTTPException(status_code=404, detail="Departmanda İşlem Ücreti Bulunamadı.")
            data = [
            {
                    "İşlem Ücret ID": pp.id,
                    "Şube": pp.branch_name,
                    "Çalışan": pp.employee_name,
                    "İşlem": pp.process_name,
                    "Ücret": pp.price,
            }
            for pp in process_prices
            ]
        else:
            data = [
            {
                    "İşlem Ücret ID": pp.id,
                    "Şube": pp.branch_name,
                    "Departman": pp.department_name,
                    "Çalışan": pp.employee_name,
                    "İşlem": pp.process_name,
                    "Ücret": pp.price,
            }
            for pp in process_prices
            ]


    
    df = pd.DataFrame(data)

    # Define the filename
    filename = "process_prices.xlsx"

    # Save DataFrame to Excel
    df.to_excel(filename, index=False)

    return FileResponse(filename, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename=filename)

@router.post("/import_process_prices/")
async def import_process_prices(db: db_dependency, user: user_dependency,file: UploadFile = File(...)):
    check_privileges(user, 5)  # Ensure user has appropriate privileges
    
    # Load Excel file into pandas DataFrame
    df = pd.read_excel(file.file, engine='openpyxl')
    
    # Convert DataFrame to list of dictionaries
    data = df.to_dict(orient='records')

    # Delete existing records
    db.query(ProcessPrice).delete()
    db.commit()
    
    # Extract necessary IDs from database for foreign key references
    employees = db.query(Employee).all()
    employees_map = {employee.name: employee.id for employee in employees}
    
    processes = db.query(Process).all()
    processes_map = {process.name: process.id for process in processes}
    
    departments = db.query(Department).all()
    departments_map = {department.name: department.id for department in departments}
    
    branches = db.query(Branch).all()
    branches_map = {branch.name: branch.id for branch in branches}
    
    # Process data and perform bulk insert
    records = []
    for row in data:
        record = ProcessPrice(
            employee_id=employees_map.get(row['Çalışan']),
            process_id=processes_map.get(row['İşlem']),
            price=row['Ücret']
            # Add more fields as necessary
        )
        records.append(record)
    
    db.bulk_save_objects(records)
    db.commit()
    
    return {"message": f"{len(records)} records imported successfully"}
