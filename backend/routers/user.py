# routers/user.py
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import  Annotated
from models import User
from database import  SessionLocal
from starlette import status

from .auth import get_current_user
from passlib.context import CryptContext

from schemas.user import UserCreateSchema, UserUpdateSchema, PasswordChangeSchema

from .router_utils import check_privileges

import logging


router = APIRouter(prefix='/user', tags=['user'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

logger = logging.getLogger(__name__)

@router.post("/temp", status_code=status.HTTP_201_CREATED)
def create_user_offline(db: db_dependency, schema: UserCreateSchema):
    data = User(
        username=schema.username,
        hashed_password=bcrypt_context.hash(schema.password),
        is_active=schema.is_active,
        auth_id=schema.auth_id,
        added_by=1
    )
    db.add(data)
    db.commit()
    db.refresh(data)
    pass

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(db: db_dependency, schema: UserCreateSchema, user: user_dependency):

    # check if there are authorized users, for initial user creation.
    num_users_query = db.query(User).filter(User.auth_id == 5).all()
    if len(num_users_query) > 0:
        check_privileges(user, 5)
    
    data = User(
        username=schema.username,
        hashed_password=bcrypt_context.hash(schema.password),
        is_active=schema.is_active,
        auth_id=schema.auth_id,
        added_by=user.get('id')
    )
    db.add(data)
    db.commit()
    db.refresh(data)
    logger.info(f"User {data.username} created by user {user.get('id')}")
    return data

@router.get("/", status_code=status.HTTP_200_OK)
def read_users(db: db_dependency, user: user_dependency, skip: int=0, limit: int=10, active: bool=True):
    
    check_privileges(user, 1)
    
    if active:
        return db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    else:
        return db.query(User).offset(skip).limit(limit).all()

@router.get("/{user_id}", status_code=status.HTTP_200_OK)
def read_user(db: db_dependency, user: user_dependency, user_id: int = Path(gt=0)):
    
    check_privileges(user, 1)
    
    data = db.query(User).filter(User.id == user_id).first()

    if data is None:
        raise HTTPException(status_code=404, detail="User not found")
    return data

@router.get("/password/", status_code=status.HTTP_200_OK)
def read_password(db: db_dependency, user: user_dependency):
    
    check_privileges(user, 1)
    
    data = db.query(User).filter(User.id == user.get('id')).first()

    if data is None:
        raise HTTPException(status_code=404, detail="User not found")
    return data.hashed_password


@router.put("/{user_id}", status_code=status.HTTP_201_CREATED)
async def update_user(db: db_dependency, user: user_dependency, schema: UserUpdateSchema, user_id: int = Path(gt=0)):
    check_privileges(user, 1)
    
    data = db.query(User).filter(User.id == user_id).first()

    if data is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    data.added_by = user.get('id')
    data.auth_id = schema.auth_id
    data.username = schema.username

    allow_disable_user = False
    if user.get('auth') >=5:
        allow_disable_user = True

    if allow_disable_user:
        data.is_active = schema.is_active

    db.add(data)
    db.commit()
    db.refresh(data)
    logger.info(f"User {data.username} updated by user {user.get('id')}")
    return data

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(db: db_dependency, user: user_dependency, user_id: int = Path(gt=0)):
    check_privileges(user, 5)
    
    data = db.query(User).filter(User.id == user_id).first()
    if data is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(data)
    db.commit()
    logger.info(f"User {data.username} deleted by user {user.get('id')}")


    
@router.put('/password/', status_code=status.HTTP_201_CREATED)
async def change_password(user: user_dependency, db: db_dependency, schema: PasswordChangeSchema):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    result = db.query(User).filter(User.id == user.get('id')).first()

    if result is None:
        raise HTTPException(status_code=404, detail='User not found.')
    
    if not bcrypt_context.verify(schema.password, result.hashed_password):
        raise HTTPException(status_code=401, detail='Error on password change')
    
    result.hashed_password = bcrypt_context.hash(schema.new_password)
    db.add(result)
    db.commit()
    logger.info(f"User {user.get('id')} changed their password")