from pydantic import BaseModel

class EmployeeSkillPriceCreate(BaseModel):
    employee_id: int
    cut_price: float = 0.0
    shave_price: float = 0.0
    sharpen_price: float = 0.0
    paste_price: float = 0.0
    press_price: float = 0.0
    staple_price: float = 0.0

class EmployeeSkillPriceUpdate(BaseModel):
    employee_id: int = None
    cut_price: float = None
    shave_price: float = None
    sharpen_price: float = None
    paste_price: float = None
    press_price: float = None
    staple_price: float = None
