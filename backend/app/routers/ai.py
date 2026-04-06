from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.ai_utils import calculate_completion, calculate_labor_cost, predict_productivity
from database import get_db

router = APIRouter()

@router.get("/completion/{employee_id}/{product_id}/{work_date}")
def api_completion(employee_id: int, product_id: int, work_date: str, db: Session = Depends(get_db)):
    result = calculate_completion(db, employee_id, product_id, work_date)
    if not result:
        raise HTTPException(status_code=404, detail="Data not found")
    return result

@router.get("/labor_cost/{employee_id}/{product_id}/{work_date}")
def api_labor_cost(employee_id: int, product_id: int, work_date: str, db: Session = Depends(get_db)):
    result = calculate_labor_cost(db, employee_id, product_id, work_date)
    if not result:
        raise HTTPException(status_code=404, detail="Data not found")
    return result

@router.get("/predict/{employee_id}/{product_id}")
def api_predict(employee_id: int, product_id: int, db: Session = Depends(get_db)):
    result = predict_productivity(db, employee_id, product_id)
    if not result:
        raise HTTPException(status_code=404, detail="Data not found")
    return result
