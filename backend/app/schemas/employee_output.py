from pydantic import BaseModel
from datetime import date

class EmployeeOutputCreate(BaseModel):
    employee_id: int
    work_date: date
    cut_output: float = 0.0
    shave_output: float = 0.0
    sharpen_output: float = 0.0
    paste_output: float = 0.0
    press_output: float = 0.0
    staple_output: float = 0.0
    product_id: int

class EmployeeOutputUpdate(BaseModel):
    employee_id: int = None
    work_date: date = None
    cut_output: float = None
    shave_output: float = None
    sharpen_output: float = None
    paste_output: float = None
    press_output: float = None
    staple_output: float = None
    product_id: int = None
