from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models import EmployeeSkillPrice
from backend.app.schemas.employee_skill_price import EmployeeSkillPriceCreate, EmployeeSkillPriceUpdate
from backend.database import get_db

router = APIRouter()

@router.get("/", response_model=list[EmployeeSkillPriceCreate])
def read_employee_skill_prices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prices = db.query(EmployeeSkillPrice).offset(skip).limit(limit).all()
    return prices

@router.get("/{price_id}", response_model=EmployeeSkillPriceCreate)
def read_employee_skill_price(price_id: int, db: Session = Depends(get_db)):
    price = db.query(EmployeeSkillPrice).filter(EmployeeSkillPrice.id == price_id).first()
    if price is None:
        raise HTTPException(status_code=404, detail="Employee skill price not found")
    return price

@router.post("/", response_model=EmployeeSkillPriceCreate)
def create_employee_skill_price(price: EmployeeSkillPriceCreate, db: Session = Depends(get_db)):
    db_price = EmployeeSkillPrice(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

@router.put("/{price_id}", response_model=EmployeeSkillPriceCreate)
def update_employee_skill_price(price_id: int, price: EmployeeSkillPriceUpdate, db: Session = Depends(get_db)):
    db_price = db.query(EmployeeSkillPrice).filter(EmployeeSkillPrice.id == price_id).first()
    if db_price is None:
        raise HTTPException(status_code=404, detail="Employee skill price not found")
    for key, value in price.dict(exclude_unset=True).items():
        setattr(db_price, key, value)
    db.commit()
    db.refresh(db_price)
    return db_price

@router.delete("/{price_id}")
def delete_employee_skill_price(price_id: int, db: Session = Depends(get_db)):
    db_price = db.query(EmployeeSkillPrice).filter(EmployeeSkillPrice.id == price_id).first()
    if db_price is None:
        raise HTTPException(status_code=404, detail="Employee skill price not found")
    db.delete(db_price)
    db.commit()
    return {"message": "Employee skill price deleted"}
