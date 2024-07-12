from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Annotated, List
from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, delete_item, get_items_raw, get_item_raw, convert_result_to_dict, update_event_details

import logging
from datetime import datetime

from schemas.payments import PaymentSchemaRead, PaymentsSchemaCreate
from models import Payments, Event
from schemas.event import EventStatus

from sqlalchemy import update, func
from sqlalchemy.orm import Session

router = APIRouter(prefix='/payments', tags=['Payments'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)



@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_payment(db: db_dependency, user: user_dependency, schema:PaymentsSchemaCreate):
    check_privileges(user, 4)
    event_query = db.query(Event).filter(Event.id == schema.event_id).first()
    if event_query is None:
        raise HTTPException(status_code=404, detail='Etkinlik bulunamadı.')
    
    
    if event_query.details and event_query.details['remaining_payment'] > 0:
        
        data = Payments(**schema.model_dump(), added_by=user.get('id'))
    
        # db.add(data)
        # db.commit()
        # db.refresh(data)

        remaining_payment = event_query.details['remaining_payment'] - schema.amount

        event = update_event_details(db, schema.event_id, 'remaining_payment', remaining_payment)
        

        if event.details['remaining_payment'] <= 0:
            event.status = EventStatus.completed

        #print(event_query.details)
        db.add(event)
        db.commit()


@router.get('/',  status_code=status.HTTP_200_OK, response_model=List[PaymentSchemaRead])
async def read_payments(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    return get_items_raw(db=db, table=Payments, skip=skip, limit=limit)

@router.get('/{payment_id}', status_code=status.HTTP_200_OK, response_model=PaymentSchemaRead)
async def read_payment(user: user_dependency, db: db_dependency, payment_id: int):
    check_privileges(user, 4)
    return get_item_raw(db=db, table=Payments, index=payment_id)

@router.put("/{payment_id}", status_code=status.HTTP_201_CREATED)
async def update_payment(user: user_dependency, db: db_dependency, payment_id: int, schema: PaymentsSchemaCreate):
    check_privileges(user, 5)

    payment_query = get_item_raw(db=db, table=Payments, index=payment_id)

    payment_query.amount = schema.amount

    db.add(payment_query)
    db.commit()
    

    pass

@router.delete('/{payment_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(user: user_dependency, db: db_dependency, payment_id: int):
    check_privileges(user, 5)

    delete_item(db=db, index=payment_id, table=Payments)
