from .base import BaseNameSchema
from pydantic import Field, BaseModel
from typing import Dict, Any, Optional

class PaymentsSchemaCreate(BaseModel):
    event_id: int = Field(gt=0)
    payment_type_id: int = Field(gt=0)
    amount: float = Field(ge=0)

class PaymentSchemaRead(PaymentsSchemaCreate):
    id: Optional[int]