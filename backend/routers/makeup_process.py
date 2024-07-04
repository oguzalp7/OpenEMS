# routers/makeup_process.py
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Annotated, List

from models import MakeUpProcess
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from router_utils import check_privileges
import logging

from schemas.process import ProcessSchema

router = APIRouter(prefix='/makeup-processes', tags=['MakeUpProcesses'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProcessSchema)
async def create_makeup_process(user: user_dependency, db: db_dependency, schema: ProcessSchema):
    check_privileges(user, 5)
    
    data = MakeUpProcess(**schema.model_dump(), added_by=user.get('id'))
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.get("/", response_model=List[ProcessSchema], status_code=status.HTTP_200_OK)
def read_makeup_processes(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    processes = db.query(MakeUpProcess).offset(skip).limit(limit).all()
    return processes

@router.get("/{process_id}", response_model=ProcessSchema, status_code=status.HTTP_200_OK)
def read_makeup_process(process_id: int, db: db_dependency, user: user_dependency):
    check_privileges(user, 1)
    process = db.query(MakeUpProcess).filter(MakeUpProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Process not found")
    return process

@router.put("/{process_id}", response_model=ProcessSchema, status_code=status.HTTP_201_CREATED)
def update_makeup_process(process_id: int, process: ProcessSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    db_process = db.query(MakeUpProcess).filter(MakeUpProcess.id == process_id).first()
    if db_process is None:
        raise HTTPException(status_code=404, detail="Process not found")
    
    db_process.name = process.name
    db_process.duration = process.duration

    db.commit()
    db.refresh(db_process)
    return db_process

@router.delete("/{process_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_makeup_process(process_id: int, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    process = db.query(MakeUpProcess).filter(MakeUpProcess.id == process_id).first()
    if process is None:
        raise HTTPException(status_code=404, detail="Process not found")

    db.delete(process)
    db.commit()
    