from .base import BaseNameSchema
from pydantic import Field, BaseModel
from typing import Dict, Any, Optional

class ProcessSchema(BaseNameSchema):
    id: Optional[int]
    department_id: int = Field(gt=0)
    duration: float = Field()

class ProcessCreateSchema(ProcessSchema):
    attributes: Dict[str, Any] 

class ProcessCreSchema(BaseModel):
    name: str
    department_id: int
    duration: float