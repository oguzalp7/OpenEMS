# routers/process.py

from fastapi import APIRouter, Depends, HTTPException, Path,Query
from sqlalchemy.orm import Session
from typing import Annotated, List, Dict, Any,Optional
import json
from models import Process, Department
from sqlalchemy import cast, JSON
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, delete_item, get_item_raw, get_items_raw, convert_result_to_dict
import logging

from schemas.process import ProcessSchema, ProcessCreateSchema, ProcessCreSchema

router = APIRouter(prefix='/processes', tags=['Processes'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProcessCreateSchema)
async def create_process(user: user_dependency, db: db_dependency, schema: ProcessCreateSchema): 
    """
    examples: "department_1": [
        {
        "name": "GELİN",
        "duration": 120,
        "department_id": 1,
        "attributes": {
            "optional_makeup_id": {"int": "gt=0"},
            "hair_stylist_id": {"int": "gt=0"},
            "is_tst": {"bool": "default=False"},
            "downpayment": {"float": "ge=0"},
            "plus": {"int": "ge=0"},
            "payment_type_id": {"int": "gt=0"},
            "remaining_payment": {"float": "ge=0"},
            "customer_id": {"int": "gt=0"},
            "country": {"str": "default=''"},
            "city": {"str": "default=''"},
            "hotel": {"str": "default=''"}
        },
        {
        "name": "KINA",
        "duration": 120,
        "department_id": 1,
        "attributes": {
            "optional_makeup_id": {"int": "gt=0"},
            "hair_stylist_id": {"int": "gt=0"},
            "is_tst": {"bool": "default=False"},
            "downpayment": {"float": "ge=0"},
            "plus": {"int": "ge=0"},
            "payment_type_id": {"int": "gt=0"},
            "remaining_payment": {"float": "ge=0"},
            "customer_id": {"int": "gt=0"},
            "country": {"str": "default=''"},
            "city": {"str": "default=''"},
            "hotel": {"str": "default=''"}
        },
        {
            "name": "DIŞ ÇEKİM",
            "duration": 120,
            "department_id": 1,
            "attributes": {
                "optional_makeup_id": {"int": "gt=0"},
                "hair_stylist_id": {"int": "gt=0"},
                "is_tst": {"bool": "default=False"},
                "downpayment": {"float": "ge=0"},
                "plus": {"int": "ge=0"},
                "payment_type_id": {"int": "gt=0"},
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "country": {"str": "default=''"},
                "city": {"str": "default=''"},
                "hotel": {"str": "default=''"}
            }
        },
        {
            "name": "NİŞAN",
            "duration": 120,
            "department_id": 1,
            "attributes": {
                "optional_makeup_id": {"int": "gt=0"},
                "hair_stylist_id": {"int": "gt=0"},
                "is_tst": {"bool": "default=False"},
                "downpayment": {"float": "ge=0"},
                "plus": {"int": "ge=0"},
                "payment_type_id": {"int": "gt=0"},
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "country": {"str": "default=''"},
                "city": {"str": "default=''"},
                "hotel": {"str": "default=''"}
            }
        },
        {
            "name": "ÖZEL GÜN",
            "duration": 120,
            "department_id": 1,
            "attributes": {
                "optional_makeup_id": {"int": "gt=0"},
                "hair_stylist_id": {"int": "gt=0"},
                "is_tst": {"bool": "default=False"},
                "downpayment": {"float": "ge=0"},
                "plus": {"int": "ge=0"},
                "payment_type_id": {"int": "gt=0"},
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "country": {"str": "default=''"},
                "city": {"str": "default=''"},
                "hotel": {"str": "default=''"}
            }
        },
        {
            "name": "OTEL",
            "duration": 360,
            "department_id": 1,
            "attributes": {
                "optional_makeup_id": {"int": "gt=0"},
                "hair_stylist_id": {"int": "gt=0"},
                "is_tst": {"bool": "default=False"},
                "downpayment": {"float": "ge=0"},
                "plus": {"int": "ge=0"},
                "payment_type_id": {"int": "gt=0"},
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "country": {"str": "default=''"},
                "city": {"str": "default=''"},
                "hotel": {"str": "default=''"}
            }
        },
        {
            "name": "ŞEHİRDIŞI",
            "duration": 1440,
            "department_id": 1,
            "attributes": {
                "optional_makeup_id": {"int": "gt=0"},
                "hair_stylist_id": {"int": "gt=0"},
                "is_tst": {"bool": "default=False"},
                "downpayment": {"float": "ge=0"},
                "plus": {"int": "ge=0"},
                "payment_type_id": {"int": "gt=0"},
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "country": {"str": "default=''"},
                "city": {"str": "default=''"},
                "hotel": {"str": "default=''"}
            }
        },
        {
            "name": "YURTDIŞI",
            "duration": 4320,
            "department_id": 1,
            "attributes": {
                "optional_makeup_id": {"int": "gt=0"},
                "hair_stylist_id": {"int": "gt=0"},
                "is_tst": {"bool": "default=False"},
                "downpayment": {"float": "ge=0"},
                "plus": {"int": "ge=0"},
                "payment_type_id": {"int": "gt=0"},
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "country": {"str": "default=''"},
                "city": {"str": "default=''"},
                "hotel": {"str": "default=''"}
            }
        },
    ],
    department_2: [
        {
            "name": "SAÇ BAKIM",
            "duration": 120,
            "department_id": 2,
            "attributes": {
                "is_tst": {"bool": "default=False"},
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"}
            }
        },
    ],
    department_3: [
        {
            "name": "JEL TIRNAK",
            "duration": 120,
            "department_id": 3,
            "attributes": {
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "num_nail_arts": {"int": "gt=0"}
            }
        },
        {
            "name": "NAIL-ART",
            "duration": 120,
            "department_id": 3,
            "attributes": {}
        },
        {
            "name": "KALICI OJE",
            "duration": 120,
            "department_id": 3,
            "attributes": {
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "num_nail_arts": {"int": "gt=0"}
            }
        },
        {
            "name": "DOLGU",
            "duration": 120,
            "department_id": 3,
            "attributes": {
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "num_nail_arts": {"int": "gt=0"},
            }
        },
        {
            "name": "MANİKÜR",
            "duration": 120,
            "department_id": 3,
            "attributes": {
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "num_nail_arts": {"int": "gt=0"},
            }
        },
        {
            "name": "PEDİKÜR",
            "duration": 120,
            "department_id": 3,
            "attributes": {
                "remaining_payment": {"float": "ge=0"},
                "customer_id": {"int": "gt=0"},
                "num_nail_arts": {"int": "gt=0"},
            }
        },
    ] 
    """
    check_privileges(user, 5)

    data = Process(**schema.model_dump(), added_by=user.get('id'))
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.get("/raw/", response_model=List[ProcessSchema], status_code=status.HTTP_200_OK)
def get_processes(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    return get_items_raw(db=db, table=Process, skip=skip, limit=limit)

@router.get('/{process_id}', status_code=status.HTTP_200_OK, response_model=ProcessCreateSchema)
async def get_raw_process(user: user_dependency, db: db_dependency, process_id: int):
    check_privileges(user, 1)
    return get_item_raw(db=db, table=Process, index=process_id)

@router.get('/', status_code=status.HTTP_200_OK)
def get_processed_processes(user: user_dependency, db: db_dependency, dep: Optional[int] = Query(None), skip: int = 0, limit: int = 10):
    """
        params: 
        dep => department id: int
    """
    check_privileges(user, 1)

    if dep is not None:
        department_query = db.query(Department).filter(Department.id == dep).first()
        if department_query is None: 
            raise HTTPException(status_code=404, detail='Departman Bulunamadı.')
        
    process_api_columns = ['ID', 'ADI', 'SÜRE', 'DEPARTMAN', 'ÖZELLİKLER']
    
    query = db.query(
        Process.id,
        Process.name,
        Process.duration,
        Process.department_id,
        Process.attributes
    )\
    .join(Department, Process.department_id == Department.id)
 
    if dep is not None:
        query = query.filter(Department.id == dep)
        
    query = query.offset(skip).limit(limit).all()         
    return [convert_result_to_dict(row, process_api_columns) for row in query]

@router.get('/schema/', response_model=Dict[str, Any])
async def get_schema():
    return ProcessCreSchema.schema()

@router.put("/{process_id}", response_model=ProcessCreateSchema, status_code=status.HTTP_201_CREATED)
def update_process(process_id: int, schema: ProcessCreateSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    db_process = db.query(Process).filter(Process.id == process_id).first()
    if db_process is None:
        raise HTTPException(status_code=404, detail="Process not found")
    
    db_process.name = schema.name
    db_process.duration = schema.duration
    db_process.attributes = schema.attributes
    db.commit()
    db.refresh(db_process)
    return db_process


@router.delete('/{process_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(db: db_dependency, user: user_dependency, process_id: int):
    check_privileges(user, 5)

    delete_item(db=db, index=process_id, table=Process)