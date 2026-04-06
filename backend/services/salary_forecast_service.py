from sqlalchemy import text

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