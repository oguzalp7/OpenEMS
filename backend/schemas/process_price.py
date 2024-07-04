# schemas/process_price.py

from pydantic import BaseModel, Field

class ProcessPriceSchema(BaseModel):
    employee_id: int = Field(gt=0)
    process_id: int = Field(gt=0)
    price: float = Field(ge=0.0)