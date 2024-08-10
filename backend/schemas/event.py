from pydantic import BaseModel, Field
from datetime import datetime, date, time
from typing import Dict, Any
from enum import Enum


class EventStatus(str, Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    postponed = "postponed"
    suspended = "suspended"

class EventSchema(BaseModel):

    date: date
    time: time

    process_id: int = Field(gt=0)
    branch_id: int = Field(gt=0)
    employee_id: int = Field(gt=0)
    status: EventStatus = EventStatus.scheduled
    description: str
    

class EventCreateSchema(EventSchema):
    details: Dict[str, Any] 


class EventReadSchema(EventCreateSchema):
    id: int
