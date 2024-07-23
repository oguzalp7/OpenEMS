from .base import BaseNameSchema
from pydantic import Field
from typing import Dict, Any

class CustomerSchema(BaseNameSchema):
    country_code: str = Field(default='+90')
    phone_number: str = Field(min_length=0, max_length=10)
    black_listed: bool = Field(default=False)

class CustomerCreateSchema(CustomerSchema):
    events: Dict[str, Any] = Field(default={'past_events': []})
