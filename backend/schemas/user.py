# schemas/user.py
from pydantic import BaseModel, Field
from typing import Optional
from .base import BaseNameSchema

class PasswordChangeSchema(BaseModel):
    password: str
    new_password: str = Field(min_length=6)

class UserCreateSchema(BaseModel):
    #employee_id: int
    username: str
    password: str 
    is_active: bool 
    auth_id: int = Field(gt=0)      

class UserUpdateSchema(BaseModel):
    username: str
    is_active: bool
    auth_id: int