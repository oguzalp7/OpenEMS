# schemas/employment_type.py
from pydantic import BaseModel
from .base import BaseNameSchema

class EmploymentTypeSchema(BaseNameSchema):
    pass

class EmploymentTypeCreateSchema(BaseModel):
    name: str
    