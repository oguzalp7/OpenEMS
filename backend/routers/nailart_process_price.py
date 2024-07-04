from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List, Annotated

from models import NailArtProcessPrice
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from backend.routers.router_utils import check_privileges
import logging

from schemas.process_price import ProcessPriceSchema

router = APIRouter(prefix='/nailart-process-prices', tags=['NailArtProcessPrices'])

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
async def create_nailart_process_price(user: user_dependency, db: db_dependency, schema: ProcessPriceSchema):
    check_privileges(user, 5)
    
    data = NailArtProcessPrice(**schema.model_dump(), added_by=user.get('id'))
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

@router.get("/", response_model=List[ProcessPriceSchema], status_code=status.HTTP_200_OK)
def read_nailart_process_prices(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    prices = db.query(NailArtProcessPrice).offset(skip).limit(limit).all()
    return prices

@router.get("/{price_id}", response_model=ProcessPriceSchema, status_code=status.HTTP_200_OK)
def read_nailart_process_price(price_id: int, db: db_dependency, user: user_dependency):
    check_privileges(user, 1)
    price = db.query(NailArtProcessPrice).filter(NailArtProcessPrice.id == price_id).first()
    if price is None:
        raise HTTPException(status_code=404, detail="Nail art process price not found")
    return price

@router.put("/{price_id}", response_model=ProcessPriceSchema, status_code=status.HTTP_201_CREATED)
def update_nailart_process_price(price_id: int, price: ProcessPriceSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    db_price = db.query(NailArtProcessPrice).filter(NailArtProcessPrice.id == price_id).first()
    if db_price is None:
        raise HTTPException(status_code=404, detail="Nail art process price not found")
    
    db_price.employee_id = price.employee_id
    db_price.process_id = price.process_id
    db_price.price = price.price

    db.commit()
    db.refresh(db_price)
    return db_price

@router.delete("/{price_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nailart_process_price(price_id: int, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
    price = db.query(NailArtProcessPrice).filter(NailArtProcessPrice.id == price_id).first()
    if price is None:
        raise HTTPException(status_code=404, detail="Nail art process price not found")

    db.delete(price)
    db.commit()
