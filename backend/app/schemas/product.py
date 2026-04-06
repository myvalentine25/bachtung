from pydantic import BaseModel

class ProductCreate(BaseModel):
    product_description: str
    cost: float
    price: float
    labor_cost: float

class ProductUpdate(BaseModel):
    product_description: str = None
    cost: float = None
    price: float = None
    labor_cost: float = None
