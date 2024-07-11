from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, Float, Date, Time, DateTime, Table, Enum, JSON
from sqlalchemy.orm import relationship
from database import DeclerativeBase
from datetime import datetime
import enum

Base_ = DeclerativeBase

class Base(Base_):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)                          
    name = Column(String)                           
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, onupdate=datetime.now())
    added_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    #{id: 1, name: 'read'}, {id: 2, name: 'read & write'}, {id: 3, name: 'read & write & edit'}, {id: 4, name: 'admin'}

class TimeStampedModel(Base_):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, onupdate=datetime.now())
    added_by = Column(Integer, ForeignKey("users.id"), nullable=True)

class User(TimeStampedModel):
    __tablename__ = 'users'

    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean)
    auth_id = Column(Integer, ForeignKey('auth.id'), nullable=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=True)

    # employee = relationship("Employee", back_populates="user", uselist=False)
    auth = relationship("Auth", back_populates="users", foreign_keys=[auth_id])

    # res = db.qeury(User).first()
    # USER_CONTEXT = res.employee

class Auth(Base):
    __tablename__ = 'auth'

    users = relationship("User", back_populates="auth", foreign_keys=[User.auth_id])

# Association table for many-to-many relationship
branch_department_association = Table(
    'branch_department_association', Base_.metadata,
    Column('branch_id', Integer, ForeignKey('branches.id'), primary_key=True),
    Column('department_id', Integer, ForeignKey('departments.id'), primary_key=True)
)


class Branch(Base):
    __tablename__ = 'branches'

    is_franchise = Column(Boolean)                           
    studio_extra_guest_price = Column(Float)
    hotel_extra_guest_price = Column(Float)
    outside_extra_guest_price = Column(Float)

    departments = relationship(
        "Department",
        secondary=branch_department_association,
        back_populates="branches"
    )
    employees = relationship("Employee", back_populates="branch")


class Department(Base):
    __tablename__ = 'departments'
    
    branches = relationship(
        "Branch",
        secondary=branch_department_association,
        back_populates="departments"
    )
    employees = relationship("Employee", back_populates="department")
    
    

class EmploymentType(Base):
    __tablename__ = 'employment_types'

    employees = relationship("Employee", back_populates="employment_type")


class Employee(Base):
    __tablename__ = 'employees'

    branch_id = Column(Integer, ForeignKey('branches.id'))
    department_id = Column(Integer, ForeignKey('departments.id'))
    employment_type_id = Column(Integer, ForeignKey('employment_types.id'))
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)

    country_code = Column(String)
    phone_number = Column(String)                                               # telefon numarası
    job_title = Column(String)                                                  # çalışan iş tanımı
    employment_start_date = Column(Date, nullable=False)                        # çalışanın çalışmaya başladığı tarih
    employment_end_date = Column(Date, nullable=True)                           # çalışanın iş çıkış tarihi
    salary = Column(Float)                                                      # çalışan maaşı
    balance = Column(Float)                                                     # çalışan bakiyesi
    employment_status = Column(Boolean, default=True)                           # çalışma durumu (aktif-pasif) 
    
    #user = relationship("User", back_populates="employee", uselist=False)

    #user = relationship("User", back_populates="employee", uselist=False, remote_side=[User.employee_id],primaryjoin="Employee.user_id == remote(User.id)")
    branch = relationship("Branch", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    employment_type = relationship("EmploymentType", back_populates="employees")
    

# ----------------------------------------------------------------------------------------------

class Process(Base):
    __tablename__ = 'process'
    department_id = Column(Integer, ForeignKey('departments.id'))
    duration = Column(Integer, nullable=True)
    attributes = Column(JSON) 
    """
        {
            for pid: 1 (Makyaj Departmanı)
            is_complete: bool
            payment_type_id: int
            .
            .
            .

        }
    
    """


# ----------------------------------------------------------------------------------------------

class PaymentTypes(Base):
    __tablename__ = 'payment_types'

# ----------------------------------------------------------------------------------------------

class ProcessPrice(TimeStampedModel):
    __tablename__ = 'process_price'
    employee_id = Column(Integer, ForeignKey('employees.id'))
    process_id = Column(Integer, ForeignKey('process.id'))
    price = Column(Float, nullable=False)

# ----------------------------------------------------------------------------------------------

class Customer(Base):
    __tablename__ = 'customer'

    # name
    country_code = Column(String)
    phone_number = Column(String, unique=True, index=True)                      # telefon numarası
    black_listed = Column(Boolean)                                              # kara listede mi?

    # relations
    # gül
    # gülbera
    # gülben
    # gülnihal
    
    # contains


# # ----------------------------------------------------------------------------------------------

class Event(TimeStampedModel):
    __tablename__ = 'events'
    
    date = Column(Date, index=True)
    time = Column(Time)
    
    process_id = Column(Integer, ForeignKey('process.id'))
    branch_id = Column(Integer, ForeignKey("branches.id"))
    employee_id = Column(Integer, ForeignKey('employees.id'))
    description = Column(String)
    details = Column(JSON, nullable=True)    




# class Appointment(Event):
#     __abstract__ = True
    
#     process_id = Column(Integer, ForeignKey('process.id'))
#     payment_type_id = Column(Integer, ForeignKey("payment_types.id"), nullable=True)
#     remaining_payment = Column(Float)
#     is_complete = Column(Boolean)

#     customer_id = Column(Integer, ForeignKey('customer.id'))
#     # add customer relations


# class MakeUpAppointment(Appointment):
#     __tablename__ = 'makeup_appointments'

#     id = Column(Integer, ForeignKey('events.id'), primary_key=True)
#     optional_makeup_id = Column(Integer, nullable=True)
#     hair_stylist_id = Column(Integer, nullable=True)
#     country = Column(String)
#     city = Column(String)
#     hotel = Column(String)
#     plus = Column(Integer)
#     is_hijab = Column(Boolean)
#     down_payment = Column(Float)
    

# class NailArtAppointment(Appointment):
#     __tablename__ = 'nailart_appointments'
#     id = Column(Integer, ForeignKey('events.id'), primary_key=True)
#     plus = Column(Integer)

# # ----------------------------------------------------------------------------------------------