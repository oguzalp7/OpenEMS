# routers/customer.py
from turkish_string import upper_tr
from fastapi import APIRouter, Depends, HTTPException, Path,Query
from sqlalchemy.orm import Session
from typing import Annotated, List, Dict, Any,Optional
import json
from models import Customer, Department
from sqlalchemy import cast, JSON, func
from database import SessionLocal
from starlette import status
from urllib.parse import unquote
from .auth import get_current_user
from .router_utils import check_privileges, delete_item, get_item_raw, get_items_raw, convert_result_to_dict
import logging

from schemas.customer import CustomerReadSchema, CustomerSchema, CustomerCreateSchema, CustomerCreSchema

router = APIRouter(prefix='/customer', tags=['Customers'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=CustomerReadSchema)
async def create_customer(user: user_dependency, db: db_dependency, schema: CustomerCreateSchema): 
    """
    example: {
        "name": "Ayşe",
        "country_code": "+90",
        "phone_number": "5555555555",
        "black_listed": False
        "events": {
                "past_events" : [
                1, 2, 3
                ]
            }
    }
    """
    check_privileges(user, 3)

    data = Customer(**schema.model_dump(), added_by=user.get('id'))
    data.phone_number = data.phone_number.replace(" ", "")
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

@router.get("/get/")
async def get_customer_by_phone(country_code: str, phone_number: str, db: db_dependency):
    customer = db.query(Customer).filter(Customer.country_code == country_code, Customer.phone_number == phone_number).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.get('/', status_code=status.HTTP_200_OK)
def get_processed_customers(user: user_dependency, db: db_dependency, cc: Optional[str] = Query(None), p: Optional[str] = Query(None), n: Optional[str] = Query(None), bl: Optional[bool] = Query(False), skip: int = 0, limit: int = 10):
    """
        params: 
        c => country code: str
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
        #Customer.black_listed
    )

    if cc is not None: 
        cc = cc.replace(" ", "")
        cc = "+" + cc
        query = query.filter(Customer.country_code == cc)
        
    if p is not None:
        cleaned_substring = p.replace(" ", "")
        query = query.filter(Customer.phone_number.startswith(cleaned_substring))

    if n is not None:
        n = n.replace(" ", "")
        n_upper = upper_tr(n)
        query = query.filter(func.lower(func.replace(Customer.name, " ", "")).contains(n_upper))
    
    if bl is not None:
        query = query.filter(Customer.black_listed == bl)
        
    query = query.offset(skip).limit(limit).all()         
    return [convert_result_to_dict(row, process_api_columns) for row in query]

@router.get('/countryCodes/')
def get_country_codes(user: user_dependency, db: db_dependency):
    check_privileges(user, 1)
    distinct_country_codes = db.query(Customer.country_code).distinct().all()
    return [code[0] for code in distinct_country_codes]

@router.get('/schema/', response_model=Dict[str, Any])
async def get_schema():
    return CustomerCreSchema.schema()

@router.put("/{customer_id}", response_model=CustomerCreateSchema, status_code=status.HTTP_201_CREATED)
def update_customer(customer_id: int, schema: CustomerCreateSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 4)
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db_customer.name = upper_tr(schema.name)
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