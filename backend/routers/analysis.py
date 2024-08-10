
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Annotated, List, Optional
from sqlalchemy import and_, func
from database import SessionLocal
from starlette import status

from models import Event, Process, Employee, Department
from .auth import get_current_user
from .router_utils import check_privileges, convert_date_to_timestamp_and_gmt3, convert_timestamp_to_date_gmt3
import logging

router = APIRouter(prefix='/analysis', tags=['Analysis'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
logger = logging.getLogger(__name__)


# test start: 1691625600
# test end: 1724112000
@router.get('/chart', status_code=status.HTTP_200_OK)
async def get_visualization_data(user: user_dependency, db: db_dependency, start: Optional[str] = Query(None), end: Optional[str] = Query(None), b: Optional[int] = Query(None), dep: Optional[int]=Query(None), eid: Optional[int]=Query(None)):
    check_privileges(user, 3)
    
    start_date = convert_timestamp_to_date_gmt3(start)
    end_date = convert_timestamp_to_date_gmt3(end)


    results = db.query(
        Event.employee_id.label('employee_id'),
        func.count().label('event_count'),
        Employee.name.label('employee_name'),
    )\
    .join(Employee, Employee.id == Event.employee_id)\
    .join(Process, Process.id == Event.process_id)\
    .join(Department, Process.department_id == Department.id)\
    .group_by(
        func.extract('year', Event.date),
        Event.branch_id,
        Event.employee_id
    ).order_by(
        func.extract('year', Event.date),
        Event.branch_id,
        Event.employee_id
    ).filter(and_(Event.date >= start_date, Event.date <= end_date))

    if b is not None:
        results = results.filter(Event.branch_id == b)

    if dep is not None:
        results = results.filter(Department.id == dep)

    if eid is not None:
        results = results.filter(Employee.id == eid)

    results = results.all()
    print(results)
    return [{ 'data': row[1], 'label': row[2]} for row in results]
    

@router.get('/table', status_code=status.HTTP_200_OK)
async def get_table_data(user: user_dependency, db: db_dependency, start: Optional[str] = Query(None), end: Optional[str] = Query(None), b: Optional[int] = Query(None), dep: Optional[int]=Query(None), eid: Optional[int]=Query(None)):
    check_privileges(user, 3)

    start_date = convert_timestamp_to_date_gmt3(start)
    end_date = convert_timestamp_to_date_gmt3(end)

    results = db.query(
        Event.process_id.label('process_id'),
        func.count(Event.id).label('event_count'),
        Process.name.label('process_name')
    )\
    .join(Process, Process.id == Event.process_id)\
    .join(Department, Department.id == Process.department_id)\
    .group_by(Event.process_id)\
    .filter(and_(Event.date >= start_date, Event.date <= end_date))
    
    if b is not None:
        results = results.filter(Event.branch_id == b)

    if dep is not None:
        results = results.filter(Department.id == dep)

    if eid is not None:
        results = results.filter(Event.employee_id == eid)

    results = results.all()
    print(results)
    return [{ 'data': row[1], 'label': row[2]} for row in results]