from pydantic import BaseModel

class ProductProcessRequirementCreate(BaseModel):
    product_id: int
    cut: float = 0.0
    shave: float = 0.0
    sharpen: float = 0.0
    paste: float = 0.0
    press: float = 0.0
    staple: float = 0.0

class ProductProcessRequirementUpdate(BaseModel):
    product_id: int = None
    cut: float = None
    shave: float = None
    sharpen: float = None
    paste: float = None
    press: float = None
    staple: float = None
