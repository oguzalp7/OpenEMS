from fastapi import HTTPException, Depends
from database import SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session

from pydantic import BaseModel, create_model, Field, ValidationError
from typing import Any, Dict, Type
from models import Process, Customer, PaymentTypes, Employee, Event
from datetime import datetime
import pytz

from .details_controller import DetailController
from sqlalchemy import update, func



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
    
    return str(timestamp_ms)[0:-2], date_gmt3_str

def convert_timestamp_to_date_gmt3(timestamp_str):
    """
    example input: time.time()
    example output: datetime.date
    """
    timestamp_int = int(timestamp_str)
    dt_utc = datetime.utcfromtimestamp(timestamp_int)
    tz_gmt_plus_3 = pytz.timezone('Etc/GMT-3')
    dt_gmt_plus_3 = dt_utc.astimezone(tz_gmt_plus_3)
    date_gmt_plus_3 = dt_gmt_plus_3.date()
    return date_gmt_plus_3

"""
https://blabla.com/api?date=05-05-2024&dep=1&t=1720181953
"""

def process_details(db, process_id, details, schema):

    process_query = db.query(Process).filter(Process.id == process_id).first()

    if process_query is None:
        raise HTTPException(status_code=404, detail='İşlem Bulunamadı.')
    
    controller = DetailController(db=db, process_id=process_id, details=details, schema=schema)

    details = controller.execute()
    
    del controller

    return details

# Mapping of detail keys to their corresponding tables and columns
makeup_event_foreign_key_mapping = {
    'customer_id': {'table': Customer, 'column': Customer.id, 'related_columns': [Customer.country_code, Customer.phone_number, Customer.name], 'related_labels': ['ÜLKE KODU', 'TELEFON', 'AD-SOYAD']},
    'optional_makeup_id': {'table': Employee, 'column': Employee.id, 'related_columns': [Employee.name], 'related_labels': ['MAKEUP2']},
    'hair_stylist_id': {'table': Employee, 'column': Employee.id, 'related_columns': [Employee.name], 'related_labels': ['SAÇ']},
    'payment_type_id': {'table': PaymentTypes, 'column': PaymentTypes.id, 'related_columns': [PaymentTypes.name], 'related_labels': ['ÖDEME TİPİ']}
}

def update_event_details(db: Session, event_id: int, key: str, value):
    # Get the event
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Update the specific key in the details JSON column
    stmt = (
        update(Event)
        .where(Event.id == event_id)
        .values(details=func.json_set(Event.details, f'$.{key}', value))
        .execution_options(synchronize_session="fetch")
    )
    
    db.execute(stmt)
    db.commit()

    # Refresh the event instance to get the updated details
    db.refresh(event)
    return event


def fetch_related_data(db: Session, row: Dict, mapping: Dict) -> Dict:
    related_data = {}
    for key, value in row.items():
        if key in mapping:
            related_columns = mapping[key]['related_columns'] 
            column = mapping[key]['column']
            related_labels = mapping[key]['related_labels']
            query = db.query(*related_columns).filter(column == value).first()
            if query:
                
                
                related_data[key] = dict(zip([related_labels[i] for i ,col in enumerate(related_columns)], query))
    
    return related_data

def merge_and_flatten_dicts(base_dict, related_data):
    for key, value in related_data.items():
        if isinstance(value, dict):
            for sub_key, sub_value in value.items():
                base_dict[f"{sub_key}"] = sub_value
        else:
            base_dict[key] = value
    return base_dict

def clean_dicts(dict_list):
    cleaned_list = []
    for item in dict_list:
        cleaned_dict = {k: v for k, v in item.items() if not (k.endswith('_id') and isinstance(v, int))}
        cleaned_list.append(cleaned_dict)
    return cleaned_list

def rename_keys(dict_list, name_mapping):
    renamed_list = []
    for item in dict_list:
        renamed_dict = {name_mapping.get(k, k): v for k, v in item.items()}
        renamed_list.append(renamed_dict)
    return renamed_list


name_mapping = {
    'downpayment': "KAPORA",
    'is_tst': 'TST',
    'plus': 'ARTI+',
    'remaining_payment': 'BAKİYE',
    'country': 'ÜLKE',
    'city': 'ŞEHİR',
    'hotel': 'OTEL',

}
