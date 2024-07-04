# schemas/employee.py
from .base import BaseNameSchema
from datetime import date
from pydantic import Field

class EmployeeCreateUpdateSchema(BaseNameSchema):
    name: str
    country_code: str = Field(default='+90')
    phone_number: str = Field(min_length=10, max_length=10)
    job_title: str
    employment_start_date: date
    salary: float = Field(default=0)
    balance: float = Field(default=0)
    employment_status: bool = Field(default=True)
    branch_id: int = Field(gt=0)
    department_id: int = Field(gt=0)
    employment_type_id: int = Field(gt=0)

