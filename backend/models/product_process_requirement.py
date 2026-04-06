from sqlalchemy import Column, Integer, Float
from backend.database import Base

class ProductProcessRequirements(Base):
    __tablename__ = "product_process_requirements"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer)
    cut = Column(Float)
    shave = Column(Float)
    sharpen = Column(Float)
    paste = Column(Float)
    press = Column(Float)
    staple = Column(Float)
