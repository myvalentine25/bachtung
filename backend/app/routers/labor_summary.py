from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.models import EmployeeOutputs, EmployeeSkillPrice, Employee
from backend.database import get_db

router = APIRouter()

@router.get("/")
def get_labor_cost_summary(db: Session = Depends(get_db)):
    """
    Calculate labor cost summary by employee and month.
    Returns: List of {employee_id, employee_name, month (YYYY-MM), total_cost}
    """
    outputs = db.query(EmployeeOutputs).all()
    skill_prices = db.query(EmployeeSkillPrice).all()
    employees = db.query(Employee).all()
    
    # Create lookup dictionaries
    employee_dict = {emp.id: emp for emp in employees}
    skill_price_dict = {sp.employee_id: sp for sp in skill_prices}
    
    # Calculate summary grouped by employee and month
    summary_data = {}
    
    for output in outputs:
        employee_id = output.employee_id
        month_key = output.work_date.strftime('%Y-%m')
        skill_price = skill_price_dict.get(employee_id)
        
        if not skill_price:
            continue
        
        # Calculate total cost for this output record
        total_cost = (
            output.cut_output * (skill_price.cut_price or 0) +
            output.shave_output * (skill_price.shave_price or 0) +
            output.sharpen_output * (skill_price.sharpen_price or 0) +
            output.paste_output * (skill_price.paste_price or 0) +
            output.press_output * (skill_price.press_price or 0) +
            output.staple_output * (skill_price.staple_price or 0)
        )
        
        key = (employee_id, month_key)
        if key not in summary_data:
            summary_data[key] = {
                'employee_id': employee_id,
                'employee_name': getattr(employee_dict.get(employee_id, None), 'name', f"Employee {employee_id}"),
                'month': month_key,
                'total_cost': 0.0
            }
        
        summary_data[key]['total_cost'] += total_cost
    
    # Convert to sorted list
    result = sorted(summary_data.values(), key=lambda x: (x['employee_name'], x['month']))
    return result
