# routers/process_price.py

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Annotated, List

from database import SessionLocal
from starlette import status

from models import ProcessPrice

from .auth import get_current_user
from .router_utils import check_privileges, delete_item, get_item_raw, get_items_raw

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

@router.get("/", response_model=List[ProcessPriceSchema], status_code=status.HTTP_200_OK)
def get_raw_process_prices(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    
    return get_items_raw(db=db, table=ProcessPrice, skip=skip, limit=limit)

@router.get('/{price_id}', status_code=status.HTTP_200_OK, response_model=ProcessPriceSchema)
async def get_raw_process_price(user: user_dependency, db: db_dependency, price_id: int):
    check_privileges(user, 1)
    return get_item_raw(db=db, table=ProcessPrice, index=price_id)

@router.delete('/{price_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(db: db_dependency, user: user_dependency, index: int):
    check_privileges(user, 5)

    delete_item(db=db, index=index, table=ProcessPrice)

@router.put("/{price_id}", response_model=ProcessPriceSchema, status_code=status.HTTP_201_CREATED)
def update_process_price(price_id: int, price: ProcessPriceSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    db_price = db.query(ProcessPrice).filter(ProcessPrice.id == price_id).first()
    if db_price is None:
        raise HTTPException(status_code=404, detail="Makeup process price not found")
    
    db_price.employee_id = price.employee_id
    db_price.process_id = price.process_id
    db_price.price = price.price
    db_price.added_by = user.get('id')

    db.commit()
    db.refresh(db_price)
    return db_price
