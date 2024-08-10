# routers/event.py

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy.orm import Session, aliased
from typing import Annotated, List, Optional, Dict, Any
from sqlalchemy import func

from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, process_details, name_mapping, convert_result_to_dict, rename_keys, clean_dicts, delete_item, get_item_raw, get_items_raw, create_dynamic_model, ValidationError, convert_timestamp_to_date_gmt3, makeup_event_foreign_key_mapping, fetch_related_data, merge_and_flatten_dicts
import logging
import json

from models import Customer, Event, Process, Department, Employee, Branch

from schemas.event import EventReadSchema, EventSchema, EventCreateSchema

from collections import namedtuple

router = APIRouter(prefix='/event', tags=['Events'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)

@router.get('/schema/base/', response_model=Dict[str, Any])
async def get_schema_base():
    return EventCreateSchema.schema()

@router.get("/schema/event/{event_id}", response_model=Dict[str, Any])
async def get_event_schema_by_id(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    process_id = event.process_id
    department_id = db.query(Process.department_id).filter(Process.id == process_id).first()
    if department_id is None:
        raise HTTPException(status_code=404, detail="Departman Bulunamadı.")
    

    # Fetch the base schema
    base_schema = EventCreateSchema.schema()

    # Fetch the details schema based on process_id
    process_query = db.query(Process.attributes).filter(Process.id == process_id).first()
    if process_query is None:
        raise HTTPException(status_code=404, detail='Process not found')
    
    attributes = process_query[0]
    DynamicSchema = create_dynamic_model("AttributeSchema", attributes=attributes)
    details_schema = DynamicSchema.schema()

    return {
        "base_schema": base_schema,
        "details_schema": details_schema,
    }

@router.get('/schema/details/{dep}', response_model=Dict[str, Any])
async def get_schema_details(db: db_dependency, dep: int):
    process_query = db.query(Process.attributes).join(Department, Department.id == Process.department_id).filter(Department.id == dep).first()
    if process_query is None:
        return {} #raise HTTPException(status_code=404, detail='İçerik bulunamadı.')
    
    attributes = process_query[0]
    
    DynamicSchema = create_dynamic_model("AttributeSchema", attributes=attributes)
    
    dynamic_schema = DynamicSchema.schema()
    
    return dynamic_schema

@router.post("/rp/", status_code=status.HTTP_201_CREATED) #, response_model=EventCreateSchema)
async def get_remaining_payment(user: user_dependency, db: db_dependency, request: Request):
    
    check_privileges(user, 3)
    # check process_id
   # Extract the JSON data as a dictionary
    form_data = await request.json()
    data_dict = dict(form_data)
    
    # Convert the dictionary to an object with attribute access
    DataObject = namedtuple('DataObject', data_dict.keys())
    data_obj = DataObject(**data_dict)
    #print(data_obj.process_id)
    try:
        details = process_details(db=db, process_id=data_obj.process_id, details=data_obj.details, schema=data_obj)
    except Exception as err:
        print(err)
        details = {}
    
    if 'remaining_payment' in details.keys():
        return details['remaining_payment']
    else:
        return 0

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=EventReadSchema)
async def create_event(user: user_dependency, db: db_dependency, schema: EventCreateSchema):
    """
    examples: {
        "makeup": {
            "date": "2024-07-05",
            "time": "09:24",
            "process_id": 1,
            "branch_id": 1,
            "employee_id": 1,
            "description": "test hello world",
            "status": "scheduled",
            "details": {
                        "optional_makeup_id": 1,
                        "hair_stylist_id": 2,
                        "is_complete": false,
                        "is_tst" : false,
                        "downpayment": 100,
                        "plus": 0,
                        "payment_type_id": 1,
                        "remaining_payment": 500,
                        "customer_id": 1
            }
        },
        "nailart": {
            "date": "2024-07-05",
            "time": "09:24",
            "process_id": 10,
            "branch_id": 3,
            "employee_id": 3,
            "description": "test hello world",
            "status": "scheduled",
            "details": {
                        "num_nail_arts": 5,
                        "remaining_payment": 0,
                        "customer_id": 1
            }
        },
        "hair": {
            "date": "2024-07-21",
            "time": "09:30",
            "process_id": 9,
            "branch_id": 1,
            "employee_id": 2,
            "description": "test hello world",
            "status": "scheduled",
            "details": {
                        "is_tst": false,
                        "remaining_payment": 0,
                        "customer_id": 1
            }
        },
    }  
    
    """

    check_privileges(user, 3)
    # check process_id
    process_query = db.query(Process.attributes).filter(Process.id == schema.process_id).first()
    if process_query is None:
        raise HTTPException(status_code=404, detail='İçerik bulunamadı.')
    
    attributes = process_query[0]
    
    DynamicSchema = create_dynamic_model("AttributeSchema", attributes=attributes)
    
    
    details = schema.details
    #print(details)
    # validate details
    try:
        # Validate and create an instance of the dynamic model
        model_instance = DynamicSchema(**details)
    except ValidationError as e:
        print(e)
        raise HTTPException(status_code=400, detail='İşlem onaylanmadı. Validasyon Hatası.')
    
    
    
    #print(model_instance.model_dump())
    details = process_details(db=db, process_id=schema.process_id, details=details, schema=schema)
    
    
    schema.details = details

    #print(schema.model_dump())


    data = Event(**schema.model_dump(), added_by=user.get('id'))

    db.add(data)
    db.commit()
    db.refresh(data)
    
    
    # Safely handle the addition to the customer's events
    if data.id and details['customer_id']:
        customer_query = db.query(Customer).filter(Customer.id == details['customer_id']).first()
        
        if customer_query:
            if(type(customer_query.events['past_events']) != list):
                existing_past_events = eval(customer_query.events['past_events'])
            else:
                existing_past_events = customer_query.events['past_events']
            existing_past_events.append(data.id)
            #print(existing_past_events)
            
            customer_query.events = {'past_events': str(existing_past_events)}
            
            db.commit()
            db.refresh(customer_query)

        else:
            print('not found')
            # Optionally, handle the case where the customer is not found
            #db.query(Event).filter(Event.id == data.id).delete()
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Customer not found.')
    print('Event created.')
    return data


@router.get("/raw/", response_model=List[EventSchema], status_code=status.HTTP_200_OK)
def get_events_raw(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    
    return get_items_raw(db=db, table=Event, skip=skip, limit=limit)

@router.get('/', status_code=status.HTTP_200_OK)
def get_events_with_attributes(db: db_dependency, user: user_dependency, t: Optional[str] = Query(None), dep: Optional[int] = Query(None), b: Optional[int] = Query(None), eid: Optional[int] = Query(None), skip: int = 0, limit: int = 10):
    """
        params: 
        t => timestamp: str
        b => branch_id: int
        eid => employee_id: int
        dep => department id: int
        skip => starting from
        limit => amount of rows in an API call.
    """
    
    check_privileges(user, 1)

    if dep is not None:
        department_query = db.query(Department).filter(Department.id == dep).first()
        if department_query is None: 
            raise HTTPException(status_code=404, detail='Departman bulunamadı.')
        
        
    cols = ['id', 'SAAT', 'PERSONEL',  'İŞLEM']
    query = db.query(
            Event.id,
            #Event.date,
            Event.time,
            Employee.name.label('employee_name'),
            #Event.status,
            #Event.details,
            #Event.details['downpayment'],
            Process.name.label('process_name'),
            #Process.department_id,
            #Department.name.label('department_name'),
            #Branch.name.label('branch_name')
        )\
        .join(Process, Event.process_id == Process.id)\
        .join(Department, Process.department_id == Department.id)\
        .join(Employee, Employee.id == Event.employee_id)\
        .join(Branch, Event.branch_id == Branch.id)

    if b is not None:
        query = query.filter(Branch.id == b)
        
    if dep is not None:
        query = query.filter(Department.id == dep)
        keys_query = db.query(Process.attributes).filter(dep == Process.department_id).first()
        
        if keys_query is not None:

            detail_keys = list(keys_query[0].keys())
            
            cols.extend(detail_keys)
            
            for key in detail_keys:
                query = query.add_columns(func.json_extract(Event.details, f'$.{key}').label(key))
        
       
    if t is not None:
        # convert from timestamp to datetime.date
        date_ = convert_timestamp_to_date_gmt3(t)
        query = query.filter(Event.date == date_)


    if eid is not None:
        query = query.filter(Employee.id == eid)


    results = query.offset(skip).limit(limit).all()
    results = [convert_result_to_dict(row, cols) for row in results]

    if dep is not None:
        processed_results = []
        for row in results:
            related_data = fetch_related_data(db, row, makeup_event_foreign_key_mapping)
            processed_results.append(merge_and_flatten_dicts(row, related_data))
            #print(row)
        processed_results = clean_dicts(processed_results)
        processed_results = rename_keys(processed_results, name_mapping=name_mapping)
        
        return processed_results
        
    results = clean_dicts(results)
    return results



@router.get('/{event_id}', status_code=status.HTTP_200_OK, response_model=EventCreateSchema)
async def get_raw_event(user: user_dependency, db: db_dependency, event_id: int):
    check_privileges(user, 1)
    return get_item_raw(db=db, table=Event, index=event_id)

@router.put("/{event_id}", response_model=EventCreateSchema, status_code=status.HTTP_201_CREATED)
def update_event(event_id: int, schema: EventCreateSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 3)
    item = db.query(Event).filter(Event.id == event_id).first() #get_item_raw(db=db, table=Event, index=event_id)
    if item is None: 
        raise HTTPException(status_code=404, detail='Etkinlik bulunamadı.')
    # make updates here.
    item.date = schema.date
    item.time = schema.time
    item.process_id = schema.process_id
    item.branch_id = schema.branch_id
    item.description = schema.description
    item.status = schema.status
    item.details = process_details(db=db, process_id=schema.process_id, details=schema.details, schema=schema)
    item.added_by = user.get('id')


    db.commit()
    db.refresh(item)
    return item


@router.delete('/{event_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(db: db_dependency, user: user_dependency, event_id: int):
    check_privileges(user, 5)

    delete_item(db=db, index=event_id, table=Event)