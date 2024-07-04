# schemas/base.py
from pydantic import BaseModel, Field

class BaseNameSchema(BaseModel):
    name: str = Field(min_length=3)