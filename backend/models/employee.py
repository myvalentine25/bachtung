from sqlalchemy import Column, Integer, String, Date, Float
from backend.database import Base

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    birthday = Column(Date)
    address = Column(String)

class EmployeeSkillPrice(Base):
    __tablename__ = "employee_skill_prices"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer)
    cut_price = Column(Float)
    shave_price = Column(Float)
    sharpen_price = Column(Float)
    paste_price = Column(Float)
    press_price = Column(Float)
    staple_price = Column(Float)

class EmployeeOutputs(Base):
    __tablename__ = "employee_outputs"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer)
    work_date = Column(Date)
    cut_output = Column(Float)
    shave_output = Column(Float)
    sharpen_output = Column(Float)
    paste_output = Column(Float)
    press_output = Column(Float)
    staple_output = Column(Float)
    product_id = Column(Integer)
