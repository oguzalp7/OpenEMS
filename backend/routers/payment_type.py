from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Annotated, List

from models import PaymentTypes
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges
import logging

from schemas.payment_type import PaymentType

router = APIRouter(prefix='/payment-types', tags=['PaymentTypes'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=PaymentType)
async def create_payment_type(user: user_dependency, db: db_dependency, schema: PaymentType):
    check_privileges(user, 5)
    
    data = PaymentTypes(**schema.model_dump(), added_by=user.get('id'))
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.get("/", response_model=List[PaymentType], status_code=status.HTTP_200_OK)
def read_payment_types(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    types = db.query(PaymentTypes).offset(skip).limit(limit).all()
    return types

@router.get("/{type_id}", response_model=PaymentType, status_code=status.HTTP_200_OK)
def read_payment_type(type_id: int, db: db_dependency, user: user_dependency):
    check_privileges(user, 1)
    type = db.query(PaymentTypes).filter(PaymentTypes.id == type_id).first()
    if type is None:
        raise HTTPException(status_code=404, detail="Payment type not found")
    return type

@router.put("/{type_id}", response_model=PaymentType, status_code=status.HTTP_201_CREATED)
def update_payment_type(type_id: int, schema: PaymentType, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    db_type = db.query(PaymentTypes).filter(PaymentTypes.id == type_id).first()
    if db_type is None:
        raise HTTPException(status_code=404, detail="Payment type not found")
    
    db_type.name = schema.name
    

    db.commit()
    db.refresh(db_type)
    return db_type

@router.delete("/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment_type(type_id: int, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    type = db.query(PaymentTypes).filter(PaymentTypes.id == type_id).first()
    if type is None:
        raise HTTPException(status_code=404, detail="Payment type not found")

    db.delete(type)
    db.commit()
