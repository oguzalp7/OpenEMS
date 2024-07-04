from fastapi import HTTPException, Depends
from database import SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

def get_items_raw(db: db_dependency, table, skip: int = 0, limit: int = 10):
    return db.query(table).offset(skip).limit(limit).all()

def get_item_raw(db: db_dependency, table, index: int):
    query = db.query(table).filter(table.id == index).first()

    if query is None:
        raise HTTPException(status_code=404, detail='İçerik Bulunamadı.')
    
    return query

def delete_item(db: db_dependency, index: int, table):
    query = db.query(table).filter(table.id == index).first()

    if query is None:
        raise HTTPException(status_code=404, detail='İçerik Bulunamadı.')
    
    db.delete(query)
    db.commit()

def check_privileges(user: dict, required_level: int):
    
    if user is None:
        raise HTTPException(status_code=401, detail='Oturum açılamadı.')
    
    if not user.get('auth') >= required_level:
        raise HTTPException(status_code=403, detail='İçeriğe erişim yetkiniz bulunmamaktadır.')
    


def convert_result_to_dict(result, columns):
    if result:
        return dict(zip(columns, result))
    return None