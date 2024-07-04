from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, date, time

class EventTypeEnum(str, Enum):
    MEETING = "meeting"
    DAY_OFF = "day_off"
    MAKEUP_APPOINTMENT = 'makeup_appointment'
    NAILART_APPOINTMENT = 'nailart_appointment'
    TRAINING = 'training'
    MASTERCLASS = 'master_class'
    OTHER = 'other'

class Event(BaseModel):

    start_date: date
    end_date: date
    start_time: time
    end_time: time
    branch_id: int = Field(gt=0)
    employee_id: int = Field(gt=0)
    description: str