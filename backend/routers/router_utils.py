from fastapi import HTTPException, Depends
from database import SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session

from pydantic import BaseModel, create_model, Field, ValidationError
from typing import Any, Dict, Type

from datetime import datetime
import pytz


def create_dynamic_model(name: str, attributes: Dict[str, Dict[str, str]]) -> Type[BaseModel]:
    field_definitions = {}
    for key, attr_info in attributes.items():
        attr_type = list(attr_info.keys())[0]
        validations = list(attr_info.values())[0]
        
        # Construct the Field with validations
        field_definitions[key] = (eval(attr_type), Field(**eval(f"dict({validations})")))
    
    return create_model(name, **field_definitions)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

def get_items_raw(db: db_dependency, table, skip: int = 0, limit: int = 10):
    return db.query(table).offset(skip).limit(limit).all()

def get_item_raw(db: db_dependency, table, index: int):
    query = db.query(table).filter(table.id == index).first()

    if query is None:
        raise HTTPException(status_code=404, detail='İçerik Bulunamadı.')
    
    return query

def delete_item(db: db_dependency, index: int, table):
    query = db.query(table).filter(table.id == index).first()

    if query is None:
        raise HTTPException(status_code=404, detail='İçerik Bulunamadı.')
    
    db.delete(query)
    db.commit()

def check_privileges(user: dict, required_level: int):
    
    if user is None:
        raise HTTPException(status_code=401, detail='Oturum açılamadı.')
    
    if not user.get('auth') >= required_level:
        raise HTTPException(status_code=403, detail='İçeriğe erişim yetkiniz bulunmamaktadır.')
    


def convert_result_to_dict(result, columns):
    if result:
        return dict(zip(columns, result))
    return None


def convert_date_to_timestamp_and_gmt3(date_str):
    # Parse the input date string into a datetime object
    date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
    
    # Convert to timestamp in milliseconds
    timestamp_ms = int(date.timestamp() * 1000)
    
    # Define the GMT+3 timezone
    gmt3 = pytz.timezone('Etc/GMT-3')
    
    # Convert the datetime to GMT+3
    date_gmt3 = date.astimezone(gmt3)
    
    # Format the date in GMT+3
    date_gmt3_str = date_gmt3.strftime('%Y-%m-%d %H:%M:%S %Z%z')
    
    return timestamp_ms, date_gmt3_str