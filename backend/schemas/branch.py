# schemas/branch.py
from .base import BaseNameSchema
from typing import List
from .department import DepartmentSchema

class BranchSchema(BaseNameSchema):
    is_franchise: bool
    studio_extra_guest_price: float
    hotel_extra_guest_price: float
    outside_extra_guest_price: float
    department_ids: List[int]

class BranchReadSchema(BaseNameSchema):
    id: int
    is_franchise: bool
    studio_extra_guest_price: float
    hotel_extra_guest_price: float
    outside_extra_guest_price: float

    departments: List[DepartmentSchema]

class BranchFetchSchema(BaseNameSchema):
    id: int
    is_franchise: bool
    studio_extra_guest_price: float
    hotel_extra_guest_price: float
    outside_extra_guest_price: float