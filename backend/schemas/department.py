# schemas/department.py
from .base import BaseNameSchema
from pydantic import BaseModel

class DepartmentSchema(BaseNameSchema):
    pass

class DepartmentCreateSchema(BaseModel):
    name: str
    