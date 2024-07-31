from .base import BaseNameSchema
from pydantic import BaseModel

class PaymentType(BaseNameSchema):
    id: int
    pass

class PaymentTypeCreateSchema(BaseModel):
    
    name: str