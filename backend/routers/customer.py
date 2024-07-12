# routers/customer.py

from fastapi import APIRouter, Depends, HTTPException, Path,Query
from sqlalchemy.orm import Session
from typing import Annotated, List, Dict, Any,Optional
import json
from models import Customer, Department, Event
from sqlalchemy import cast, JSON
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, delete_item, get_item_raw, get_items_raw, convert_result_to_dict, jaccard_similarity
import logging

from schemas.customer import CustomerSchema, CustomerCreateSchema

router = APIRouter(prefix='/customers', tags=['Customers'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=CustomerCreateSchema)
async def create_customer(user: user_dependency, db: db_dependency, schema: CustomerCreateSchema): 
    """
    example: {
        "name": "Ayşe",
        "country_code": "+90",
        "phone_number": "5555555555",
        "black_listed": False
        "events": {
        }
    }
    """
    check_privileges(user, 5)

    data = Customer(**schema.model_dump(), added_by=user.get('id'))
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.get("/raw/", response_model=List[CustomerSchema], status_code=status.HTTP_200_OK)
def get_customers(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    return get_items_raw(db=db, table=Customer, skip=skip, limit=limit)

@router.get('/{customer_id}', status_code=status.HTTP_200_OK, response_model=CustomerCreateSchema)
async def get_raw_customer(user: user_dependency, db: db_dependency, customer_id: int):
    check_privileges(user, 1)
    return get_item_raw(db=db, table=Customer, index=customer_id)

@router.get('/', status_code=status.HTTP_200_OK)
def get_processed_customers(user: user_dependency, db: db_dependency, p: Optional[str] = Query(None), n: Optional[str] = Query(None), bl: Optional[bool] = Query(False), skip: int = 0, limit: int = 10):
    """
        params: 
        p => phone number: str
        n => name: str
        bl => black listed: bool
    """
    check_privileges(user, 1)
    
    process_api_columns = ['ID', 'ADI', 'ÜLKE KODU', 'TELEFON NUMARASI', 'KARA LİSTE']
    
    query = db.query(
        Customer.id,
        Customer.name,
        Customer.country_code,
        Customer.phone_number,
        Customer.black_listed
    )

    if p is not None:
        query = query.filter(Customer.phone_number == p)
        if query.count() == 0 :
            raise HTTPException(status_code=404, detail="İstenen Telefon Numarasına Sahip Müşteri Bulunamadı.")
        
    if n is not None:
        query = query.filter(jaccard_similarity(Customer.name, n) > 0.5)
        if query.count() == 0 :
            raise HTTPException(status_code=404, detail="Müşteri Bulunamadı.")
        
    if bl is not None:
        query = query.filter(Customer.black_listed == bl)
        if query.count() == 0 :
            raise HTTPException(status_code=404, detail="İstenen Kara Liste Durumunda Müşteri Bulunamadı.") 
        
    query = query.offset(skip).limit(limit).all()         
    return [convert_result_to_dict(row, process_api_columns) for row in query]

@router.put("/{customer_id}", response_model=CustomerCreateSchema, status_code=status.HTTP_201_CREATED)
def update_customer(customer_id: int, schema: CustomerCreateSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db_customer.name = schema.name
    db_customer.country_code = schema.country_code
    db_customer.phone_number = schema.phone_number
    db_customer.black_listed = schema.black_listed
    db_customer.events = schema.events
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.delete('/{customer_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(db: db_dependency, user: user_dependency, customer_id: int):
    check_privileges(user, 5)

    delete_item(db=db, index=customer_id, table=Customer)