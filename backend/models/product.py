from sqlalchemy import Column, Integer, String, Float
from database import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    product_description = Column(String)
    cost = Column(Float)
    price = Column(Float)
    labor_cost = Column(Float)
