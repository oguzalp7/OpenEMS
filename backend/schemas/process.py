from .base import BaseNameSchema
from pydantic import Field
from typing import Dict, Any

class ProcessSchema(BaseNameSchema):
    department_id: int = Field(gt=0)
    duration: int = Field()

class ProcessCreateSchema(ProcessSchema):
    attributes: Dict[str, Any] 