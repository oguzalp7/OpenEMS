from fastapi import FastAPI
import uvicorn
import models
from database import engine
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, user, department, branch, employment_type, employee, process, process_price, user_employee
from routers import event
#from routers import payment_type, makeup_process_price, user_employee, nailart_process_price

models.DeclerativeBase.metadata.create_all(bind=engine)
app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"] 


app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(department.router)
app.include_router(branch.router)
app.include_router(employment_type.router)
app.include_router(employee.router)
app.include_router(process.router)
app.include_router(process_price.router)

# app.include_router(payment_type.router)

app.include_router(user_employee.router)
app.include_router(event.router)


# Instructions
# - activate virtual environment: "..\..\appointment-v2\backend\fastapienv\Scripts\activate"
# - run uvicorn: python -m uvicorn main:app --reload

# TODO List @05.07.2024
# - Add data || details to events.
# - Create an API endpoint for creating both User & Employee at the same time. (Gülbera) DONE!
# - Add Payment-Type Router (API Endpoints) (İrem)
# - Add Customers Table

