# schemas/auth.py
from pydantic import BaseModel, Field
from .base import BaseNameSchema

class TokenSchema(BaseModel):
    access_token: str
    token_type: str

class AuthCreateSchema(BaseNameSchema):
    pass