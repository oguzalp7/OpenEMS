from .base import BaseNameSchema
from pydantic import Field

class ProcessSchema(BaseNameSchema):
    duration: int = Field()