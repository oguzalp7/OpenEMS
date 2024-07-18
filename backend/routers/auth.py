# routers/auth.py
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from database import SessionLocal
from models import User, Auth, Employee

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from jose import jwt, JWTError # type: ignore
from datetime import timedelta, datetime

from schemas.auth import TokenSchema, AuthCreateSchema

from .router_utils import check_privileges, delete_item, get_items_raw


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]


router = APIRouter(prefix='/auth', tags=['auth'])

SECRET_KEY = '192b2c37c391bed83fe8-79344fe73b896947a65e36206e05a1a23c2fa12702fe3'
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

def authenticate_user(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, user_auth_level, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id, 'auth_level': user_auth_level}
    expires = datetime.now() + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        user_auth_level: int = payload.get('auth_level')
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Giriş yapılamadı.')
        return {'username': username, 'id': user_id, 'auth': user_auth_level}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Giriş yapılamadı.')



@router.post("/token")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Giriş yapılamadı.')
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Sistem kaydınız sonlandırılmıştır.')

    token = create_access_token(user.username, user.id, user.auth_id, timedelta(minutes=120))

    data = {'access_token': token, 'token_type': 'bearer', 'auth_level': user.auth_id, 'uid': user.get('id')}


    if user.employee_id:
        employee_query = db.query(Employee).filter(Employee.id == user.employee_id).first()
        if employee_query is None:
            raise HTTPException(status_code=404, detail='Çalışan bulunamadı.')

        data['department'] = employee_query.department_id
        data['branch_id'] = employee_query.branch_id

    return {'access_token': token, 'token_type': 'bearer'}

user_dependency = Annotated[dict, Depends(get_current_user)]

@router.get('/current')
async def get_current_session_info(db: db_dependency, user: user_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    idx = user.get('id')
    user_query = db.query(User).filter(User.id == idx).first()
    
    if user_query is None:
        raise HTTPException(status_code=404, detail='User not found.')
    

    data = {'auth_level':user_query.auth_id, 'user_id': idx}

    if user_query.employee_id:

        employee_query = db.query(Employee).filter(Employee.id == user_query.employee_id).first()

        if employee_query is None:
            raise HTTPException(status_code=404, detail='User not found.')
        
        data['branch_id'] = employee_query.branch_id
        data['department_id'] = employee_query.department_id

    return data

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_auth(db: db_dependency, user: user_dependency, schema: AuthCreateSchema):
    
    check_privileges(user, 5)
    
    data = Auth(**schema.model_dump())
    db.add(data)
    db.commit()

@router.get("/", status_code=status.HTTP_200_OK)
async def read_auth(db: db_dependency, user: user_dependency, skip: int = 0, limit: int = 10):
    check_privileges(user, 1)
    
    return get_items_raw(db, Auth, skip, limit)

@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_auth(db: db_dependency, user: user_dependency, id: int):
    check_privileges(user, 5)
    delete_item(db, id, Auth)


# @router.get('/abc')
# async def test(db: db_dependency):
#     query = db.query(Auth.id, Auth.name, User.username).join(User, User.auth_id == Auth.id).all()
#     # query = db.quey(Auth, User).filter(Auth.id == User.auth_id).all()
#     # SELECT * FROM
#     print(query)

