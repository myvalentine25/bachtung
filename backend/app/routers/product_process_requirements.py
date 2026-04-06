from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.product_process_requirement import ProductProcessRequirements
from backend.database import get_db
from backend.app.schemas.product_process_requirement import ProductProcessRequirementCreate, ProductProcessRequirementUpdate

router = APIRouter()

@router.get("/")
def read_product_process_requirements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    requirements = db.query(ProductProcessRequirements).offset(skip).limit(limit).all()
    return requirements

@router.get("/{requirement_id}")
def read_product_process_requirement(requirement_id: int, db: Session = Depends(get_db)):
    requirement = db.query(ProductProcessRequirements).filter(ProductProcessRequirements.id == requirement_id).first()
    if requirement is None:
        raise HTTPException(status_code=404, detail="Product process requirement not found")
    return requirement

@router.post("/")
def create_product_process_requirement(requirement: ProductProcessRequirementCreate, db: Session = Depends(get_db)):
    db_requirement = ProductProcessRequirements(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.put("/{requirement_id}")
def update_product_process_requirement(requirement_id: int, requirement: ProductProcessRequirementUpdate, db: Session = Depends(get_db)):
    db_requirement = db.query(ProductProcessRequirements).filter(ProductProcessRequirements.id == requirement_id).first()
    if db_requirement is None:
        raise HTTPException(status_code=404, detail="Product process requirement not found")
    for key, value in requirement.dict(exclude_unset=True).items():
        setattr(db_requirement, key, value)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.delete("/{requirement_id}")
def delete_product_process_requirement(requirement_id: int, db: Session = Depends(get_db)):
    db_requirement = db.query(ProductProcessRequirements).filter(ProductProcessRequirements.id == requirement_id).first()
    if db_requirement is None:
        raise HTTPException(status_code=404, detail="Product process requirement not found")
    db.delete(db_requirement)
    db.commit()
    return {"message": "Product process requirement deleted"}
