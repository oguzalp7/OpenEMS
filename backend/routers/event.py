# routers/event.py

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session, aliased
from typing import Annotated, List, Optional, Dict
from sqlalchemy import func

from database import SessionLocal
from starlette import status

from .auth import get_current_user
from .router_utils import check_privileges, process_details, convert_result_to_dict, delete_item, get_item_raw, get_items_raw, create_dynamic_model, ValidationError, convert_timestamp_to_date_gmt3, makeup_event_foreign_key_mapping, fetch_related_data, merge_and_flatten_dicts
import logging
import json

from models import Event, Process, Department, Employee, Branch

from schemas.event import EventSchema, EventCreateSchema

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

@router.post("/", status_code=status.HTTP_201_CREATED) #, response_model=EventCreateSchema)
async def create_event(user: user_dependency, db: db_dependency, schema: EventCreateSchema):
    """
    example: {
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
    }
    
    """

    check_privileges(user, 5)
    # check process_id
    process_query = db.query(Process.attributes).filter(Process.id == schema.process_id).first()
    if process_query is None:
        raise HTTPException(status_code=404, detail='İçerik bulunamadı.')
    
    attributes = process_query[0]
    
    DynamicSchema = create_dynamic_model("AttributeSchema", attributes=attributes)
    
    
    details = schema.details
    # validate details
    try:
        # Validate and create an instance of the dynamic model
        model_instance = DynamicSchema(**details)
    except ValidationError as e:
        print(e)
        raise HTTPException(status_code=400, detail='İşlem onaylanmadı. Validasyon Hatası.')
    
    print(model_instance.model_dump())
    
    #print(model_instance.model_dump())
    details = process_details(db=db, process_id=schema.process_id, details=details, schema=schema)
    # print(details)
    
    schema.details = details

    #print(schema.model_dump())


    data = Event(**schema.model_dump(), added_by=user.get('id'))

    db.add(data)
    db.commit()
    db.refresh(data)
    return data


@router.get("/raw/", response_model=List[EventSchema], status_code=status.HTTP_200_OK)
def get_events_raw(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    
    return get_items_raw(db=db, table=Event, skip=skip, limit=limit)

@router.get('/', status_code=status.HTTP_200_OK)
def get_events_with_attributes(db: db_dependency, user: user_dependency, t: Optional[str] = Query(None), dep: Optional[int] = Query(None), b: Optional[int] = Query(None), skip: int = 0, limit: int = 10):
    """
        params: 
        t => timestamp: str
        b => branch_id: int
        dep => department id: int
        skip => starting from
        limit => amount of rows in an API call.
    """
    
    check_privileges(user, 1)

    if dep is not None:
        department_query = db.query(Department).filter(Department.id == dep).first()
        if department_query is None: 
            raise HTTPException(status_code=404, detail='Departman bulunamadı.')
        
        
    cols = ['id', 'date', 'time', 'employee_name', 'status', 'process', 'department']
    query = db.query(
            Event.id,
            Event.date,
            Event.time,
            Employee.name.label('employee_name'),
            Event.status,
            #Event.details,
            #Event.details['downpayment'],
            Process.name.label('process_name'),
            #Process.department_id,
            Department.name.label('department_name'),
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
        
        detail_keys = list(keys_query[0].keys())
        
        cols.extend(detail_keys)
        
        for key in detail_keys:
            query = query.add_columns(func.json_extract(Event.details, f'$.{key}').label(key))
        
       
    if t is not None:
        # convert from timestamp to datetime.date
        date_ = convert_timestamp_to_date_gmt3(t)
        query = query.filter(Event.date == date_)


    results = query.offset(skip).limit(limit).all()
    results = [convert_result_to_dict(row, cols) for row in results]

    # print(results)
    

    if dep is not None:
        processed_results = []
        for row in results:
            related_data = fetch_related_data(db, row, makeup_event_foreign_key_mapping)
            processed_results.append(merge_and_flatten_dicts(row, related_data))
        #print(processed_results)
        return processed_results
        
    return results



@router.get('/{event_id}', status_code=status.HTTP_200_OK, response_model=EventCreateSchema)
async def get_raw_event(user: user_dependency, db: db_dependency, event_id: int):
    check_privileges(user, 1)
    return get_item_raw(db=db, table=Event, index=event_id)

@router.put("/{event_id}", response_model=EventCreateSchema, status_code=status.HTTP_201_CREATED)
def update_event(event_id: int, schema: EventCreateSchema, db: db_dependency, user: user_dependency):
    check_privileges(user, 5)
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