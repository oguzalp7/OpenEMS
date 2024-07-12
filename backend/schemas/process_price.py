# schemas/process_price.py

from pydantic import BaseModel, Field

class ProcessPriceSchema(BaseModel):
    employee_id: int = Field(gt=0)
    process_id: int = Field(gt=0)
    price: float = Field(ge=0.0)

"""
pids = query(Processes).filter(Employee.dep_id == Process.dep_id)

input: employee_id
for pid in pids:
    pid => price

{
    eid: 1,
    processes: [  # automated by a query
        {
            pid => price
        }
    ]
}

Array of Schemas:
    [
        ProcessPriceSchema(employee_id = 1, process_id =1, price=100),
        ProcessPriceSchema(employee_id = 1, process_id =2, price=200),
        ProcessPriceSchema(employee_id = 1, process_id =3, price=300),
        ProcessPriceSchema(employee_id = 1, process_id =4, price=400),
    ]

"""

"""
For excel section
Array of Schemas:
    [
        ProcessPriceSchema(employee_id = 1, process_id =1, price=100),
        ProcessPriceSchema(employee_id = 1, process_id =2, price=200),
        ProcessPriceSchema(employee_id = 1, process_id =3, price=300),
        ProcessPriceSchema(employee_id = 1, process_id =4, price=400),

        ProcessPriceSchema(employee_id = 2, process_id =1, price=100),
        ProcessPriceSchema(employee_id = 2, process_id =2, price=200),
        ProcessPriceSchema(employee_id = 2, process_id =3, price=300),
        ProcessPriceSchema(employee_id = 2, process_id =4, price=400),
    ]

"""