# routers/process.py

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Annotated, List, Dict, Any
import json
from models import Process

from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, delete_item, get_item_raw, get_items_raw, convert_result_to_dict
import logging

from schemas.process import ProcessSchema, ProcessCreateSchema

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
    example: {
        "name": "GELİN",
        "department_id": 1,
        "duration": 120,
        "attributes": {
            "optional_makeup_id": {"int": "gt=0"},
            "hair_stylist_id": {"int": "gt=0"},
            "is_complete": false,
            "is_tst": {"bool": "default=False"},
            "downpayment": {"float": "ge=0"},
            "plus": {"int": "ge=0"},
            "payment_type_id": {"int": "gt=0"},
            "remaining_payment": {"float": "ge=0"},
            "customer_id": {"int": "gt=0"}
        }
    }
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

@router.get('/', status_code=status.HTTP_200_OK,response_model=List[ProcessCreateSchema])
def get_processed_processes(user: user_dependency, db: db_dependency, department_id: int, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    processes=db.query(Process).filter(Process.department_id == department_id).all()
    filtered_processes = []
    for process in processes:
        if(process.attributes["is_complete"]==True):
            filtered_processes.append(process)
    return filtered_processes
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