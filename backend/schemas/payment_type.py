from .base import BaseNameSchema
from pydantic import BaseModel

class PaymentType(BaseNameSchema):
    pass

class PaymentTypeCreateSchema(BaseModel):
    name: str