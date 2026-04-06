from pydantic import BaseModel
from datetime import date

class EmployeeCreate(BaseModel):
    name: str
    birthday: date
    address: str

class EmployeeUpdate(BaseModel):
    name: str = None
    birthday: date = None
    address: str = None
