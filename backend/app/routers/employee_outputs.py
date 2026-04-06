from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models import EmployeeOutputs
from backend.app.schemas.employee_output import EmployeeOutputCreate, EmployeeOutputUpdate
from backend.database import get_db

router = APIRouter()

@router.get("/", response_model=list[EmployeeOutputCreate])
def read_employee_outputs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    outputs = db.query(EmployeeOutputs).offset(skip).limit(limit).all()
    return outputs

@router.get("/{output_id}", response_model=EmployeeOutputCreate)
def read_employee_output(output_id: int, db: Session = Depends(get_db)):
    output = db.query(EmployeeOutputs).filter(EmployeeOutputs.id == output_id).first()
    if output is None:
        raise HTTPException(status_code=404, detail="Employee output not found")
    return output

@router.post("/", response_model=EmployeeOutputCreate)
def create_employee_output(output: EmployeeOutputCreate, db: Session = Depends(get_db)):
    db_output = EmployeeOutputs(**output.dict())
    db.add(db_output)
    db.commit()
    db.refresh(db_output)
    return db_output

@router.put("/{output_id}", response_model=EmployeeOutputCreate)
def update_employee_output(output_id: int, output: EmployeeOutputUpdate, db: Session = Depends(get_db)):
    db_output = db.query(EmployeeOutputs).filter(EmployeeOutputs.id == output_id).first()
    if db_output is None:
        raise HTTPException(status_code=404, detail="Employee output not found")
    for key, value in output.dict(exclude_unset=True).items():
        setattr(db_output, key, value)
    db.commit()
    db.refresh(db_output)
    return db_output

@router.delete("/{output_id}")
def delete_employee_output(output_id: int, db: Session = Depends(get_db)):
    db_output = db.query(EmployeeOutputs).filter(EmployeeOutputs.id == output_id).first()
    if db_output is None:
        raise HTTPException(status_code=404, detail="Employee output not found")
    db.delete(db_output)
    db.commit()
    return {"message": "Employee output deleted"}
