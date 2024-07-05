from pydantic import BaseModel, Field
from datetime import datetime, date, time
from typing import Dict, Any



class EventSchema(BaseModel):

    date: date
    time: time

    process_id: int = Field(gt=0)
    branch_id: int = Field(gt=0)
    employee_id: int = Field(gt=0)
    description: str
    

class EventCreateSchema(EventSchema):
    details: Dict[str, Any] 