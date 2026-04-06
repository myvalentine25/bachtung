
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

def calculate_all_employees_salary_forecast(db):
    query = """
    SELECT
        e.id,
        e.name,
        AVG(
            eo.cut_output * esp.cut_price +
            eo.shave_output * esp.shave_price +
            eo.sharpen_output * esp.sharpen_price +
            eo.paste_output * esp.paste_price +
            eo.press_output * esp.press_price +
            eo.staple_output * esp.staple_price
        ) AS avg_daily_salary
    FROM employees e
    JOIN employee_outputs eo ON e.id = eo.employee_id
    JOIN employee_skill_prices esp ON e.id = esp.employee_id
    GROUP BY e.id, e.name
    """
    results = db.execute(text(query)).fetchall()
    forecasts = []
    for result in results:
        if result.avg_daily_salary is not None:
            avg_daily_salary = float(result.avg_daily_salary)
            monthly_forecast = avg_daily_salary * 22
            forecasts.append({
                "employee_id": result.id,
                "employee": result.name,
                "avg_daily_salary": round(avg_daily_salary, 2),
                "forecast_month_salary": round(monthly_forecast, 2)
            })
    return forecasts

def calculate_salary_forecast(db, employee_id):
    query = """
    SELECT
        e.name,
        AVG(
            eo.cut_output * esp.cut_price +
            eo.shave_output * esp.shave_price +
            eo.sharpen_output * esp.sharpen_price +
            eo.paste_output * esp.paste_price +
            eo.press_output * esp.press_price +
            eo.staple_output * esp.staple_price
        ) AS avg_daily_salary
    FROM employees e
    JOIN employee_outputs eo ON e.id = eo.employee_id
    JOIN employee_skill_prices esp ON e.id = esp.employee_id
    WHERE e.id = :employee_id
    GROUP BY e.name
    """
    result = db.execute(text(query), {"employee_id": employee_id}).fetchone()
    if not result:
        return None
    avg_daily_salary = float(result.avg_daily_salary)
    monthly_forecast = avg_daily_salary * 22
    return {
        "employee": result.name,
        "avg_daily_salary": round(avg_daily_salary, 2),
        "forecast_month_salary": round(monthly_forecast, 2)
    }

# Register /salary-forecast/all BEFORE /salary-forecast/{employee_id}
@router.get("/salary-forecast/all")
def salary_forecast_all(db: Session = Depends(get_db)):
    results = calculate_all_employees_salary_forecast(db)
    return results

@router.get("/salary-forecast/{employee_id}")
def salary_forecast(employee_id: int, db: Session = Depends(get_db)):
    result = calculate_salary_forecast(db, employee_id)
    if not result:
        raise HTTPException(status_code=404, detail="No forecast data for this employee")
    return result