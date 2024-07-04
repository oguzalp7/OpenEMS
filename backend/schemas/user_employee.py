from pydantic import BaseModel, Field
from datetime import date

class UserEmployeeCreateSchema(BaseModel):
    # User fields
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    is_active: bool
    auth_id: int = Field(gt=0)

    # Employee fields
    name: str
    branch_id: int
    department_id: int
    employment_type_id: int
    country_code: str
    phone_number: str
    job_title: str
    employment_start_date: date
    salary: float
    balance: float
    employment_status: bool = True
