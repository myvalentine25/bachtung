from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Product, ProductProcessRequirements, Employee, EmployeeSkillPrice, EmployeeOutputs
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from routers import ai


app = FastAPI()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Include AI router
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ProductCreate(BaseModel):
    product_description: str
    cost: float
    price: float
    labor_cost: float

class ProductUpdate(BaseModel):
    product_description: str = None
    cost: float = None
    price: float = None
    labor_cost: float = None

class EmployeeCreate(BaseModel):
    name: str
    birthday: date
    address: str

class EmployeeUpdate(BaseModel):
    name: str = None
    birthday: date = None
    address: str = None

class EmployeeSkillPriceCreate(BaseModel):
    employee_id: int
    cut_price: float = 0.0
    shave_price: float = 0.0
    sharpen_price: float = 0.0
    paste_price: float = 0.0
    press_price: float = 0.0
    staple_price: float = 0.0

class EmployeeSkillPriceUpdate(BaseModel):
    employee_id: int = None
    cut_price: float = None
    shave_price: float = None
    sharpen_price: float = None
    paste_price: float = None
    press_price: float = None
    staple_price: float = None

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

class EmployeeOutputCreate(BaseModel):
    employee_id: int
    work_date: date
    cut_output: float = 0.0
    shave_output: float = 0.0
    sharpen_output: float = 0.0
    paste_output: float = 0.0
    press_output: float = 0.0
    staple_output: float = 0.0
    product_id: int

class EmployeeOutputUpdate(BaseModel):
    employee_id: int = None
    work_date: date = None
    cut_output: float = None
    shave_output: float = None
    sharpen_output: float = None
    paste_output: float = None
    press_output: float = None
    staple_output: float = None
    product_id: int = None

# Product CRUD endpoints
@app.get("/products/")
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}")
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products/")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}")
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

# Product process requirements CRUD endpoints
@app.get("/product-process-requirements/")
def read_product_process_requirements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    requirements = db.query(ProductProcessRequirements).offset(skip).limit(limit).all()
    return requirements

@app.get("/product-process-requirements/{requirement_id}")
def read_product_process_requirement(requirement_id: int, db: Session = Depends(get_db)):
    requirement = db.query(ProductProcessRequirements).filter(ProductProcessRequirements.id == requirement_id).first()
    if requirement is None:
        raise HTTPException(status_code=404, detail="Product process requirement not found")
    return requirement

@app.post("/product-process-requirements/")
def create_product_process_requirement(requirement: ProductProcessRequirementCreate, db: Session = Depends(get_db)):
    db_requirement = ProductProcessRequirements(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@app.put("/product-process-requirements/{requirement_id}")
def update_product_process_requirement(requirement_id: int, requirement: ProductProcessRequirementUpdate, db: Session = Depends(get_db)):
    db_requirement = db.query(ProductProcessRequirements).filter(ProductProcessRequirements.id == requirement_id).first()
    if db_requirement is None:
        raise HTTPException(status_code=404, detail="Product process requirement not found")
    for key, value in requirement.dict(exclude_unset=True).items():
        setattr(db_requirement, key, value)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@app.delete("/product-process-requirements/{requirement_id}")
def delete_product_process_requirement(requirement_id: int, db: Session = Depends(get_db)):
    db_requirement = db.query(ProductProcessRequirements).filter(ProductProcessRequirements.id == requirement_id).first()
    if db_requirement is None:
        raise HTTPException(status_code=404, detail="Product process requirement not found")
    db.delete(db_requirement)
    db.commit()
    return {"message": "Product process requirement deleted"}

# Employee CRUD endpoints
@app.get("/employees/")
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = db.query(Employee).offset(skip).limit(limit).all()
    return employees

@app.get("/employees/{employee_id}")
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@app.post("/employees/")
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.put("/employees/{employee_id}")
def update_employee(employee_id: int, employee: EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in employee.dict(exclude_unset=True).items():
        setattr(db_employee, key, value)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted"}

# Employee skill price CRUD endpoints
@app.get("/employee-skill-prices/")
def read_employee_skill_prices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prices = db.query(EmployeeSkillPrice).offset(skip).limit(limit).all()
    return prices

@app.get("/employee-skill-prices/{price_id}")
def read_employee_skill_price(price_id: int, db: Session = Depends(get_db)):
    price = db.query(EmployeeSkillPrice).filter(EmployeeSkillPrice.id == price_id).first()
    if price is None:
        raise HTTPException(status_code=404, detail="Employee skill price not found")
    return price

@app.post("/employee-skill-prices/")
def create_employee_skill_price(price: EmployeeSkillPriceCreate, db: Session = Depends(get_db)):
    db_price = EmployeeSkillPrice(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

@app.put("/employee-skill-prices/{price_id}")
def update_employee_skill_price(price_id: int, price: EmployeeSkillPriceUpdate, db: Session = Depends(get_db)):
    db_price = db.query(EmployeeSkillPrice).filter(EmployeeSkillPrice.id == price_id).first()
    if db_price is None:
        raise HTTPException(status_code=404, detail="Employee skill price not found")
    for key, value in price.dict(exclude_unset=True).items():
        setattr(db_price, key, value)
    db.commit()
    db.refresh(db_price)
    return db_price

@app.delete("/employee-skill-prices/{price_id}")
def delete_employee_skill_price(price_id: int, db: Session = Depends(get_db)):
    db_price = db.query(EmployeeSkillPrice).filter(EmployeeSkillPrice.id == price_id).first()
    if db_price is None:
        raise HTTPException(status_code=404, detail="Employee skill price not found")
    db.delete(db_price)
    db.commit()
    return {"message": "Employee skill price deleted"}

# Employee outputs (Labor Cost) CRUD endpoints
@app.get("/employee-outputs/")
def read_employee_outputs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    outputs = db.query(EmployeeOutputs).offset(skip).limit(limit).all()
    return outputs

@app.get("/employee-outputs/{output_id}")
def read_employee_output(output_id: int, db: Session = Depends(get_db)):
    output = db.query(EmployeeOutputs).filter(EmployeeOutputs.id == output_id).first()
    if output is None:
        raise HTTPException(status_code=404, detail="Employee output not found")
    return output

@app.post("/employee-outputs/")
def create_employee_output(output: EmployeeOutputCreate, db: Session = Depends(get_db)):
    db_output = EmployeeOutputs(**output.dict())
    db.add(db_output)
    db.commit()
    db.refresh(db_output)
    return db_output

@app.put("/employee-outputs/{output_id}")
def update_employee_output(output_id: int, output: EmployeeOutputUpdate, db: Session = Depends(get_db)):
    db_output = db.query(EmployeeOutputs).filter(EmployeeOutputs.id == output_id).first()
    if db_output is None:
        raise HTTPException(status_code=404, detail="Employee output not found")
    for key, value in output.dict(exclude_unset=True).items():
        setattr(db_output, key, value)
    db.commit()
    db.refresh(db_output)
    return db_output

@app.delete("/employee-outputs/{output_id}")
def delete_employee_output(output_id: int, db: Session = Depends(get_db)):
    db_output = db.query(EmployeeOutputs).filter(EmployeeOutputs.id == output_id).first()
    if db_output is None:
        raise HTTPException(status_code=404, detail="Employee output not found")
    db.delete(db_output)
    db.commit()
    return {"message": "Employee output deleted"}

# Labor cost summary endpoint
@app.get("/labor-cost-summary/")
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
            (output.cut_output or 0) * (skill_price.cut_price or 0) +
            (output.shave_output or 0) * (skill_price.shave_price or 0) +
            (output.sharpen_output or 0) * (skill_price.sharpen_price or 0) +
            (output.paste_output or 0) * (skill_price.paste_price or 0) +
            (output.press_output or 0) * (skill_price.press_price or 0) +
            (output.staple_output or 0) * (skill_price.staple_price or 0)
        )
        
        key = (employee_id, month_key)
        if key not in summary_data:
            emp = employee_dict.get(employee_id)
            summary_data[key] = {
                'employee_id': employee_id,
                'employee_name': emp.name if emp else f"Employee {employee_id}",
                'month': month_key,
                'total_cost': 0.0
            }
        
        summary_data[key]['total_cost'] += total_cost
    
    # Convert to sorted list
    result = sorted(summary_data.values(), key=lambda x: (x['employee_name'], x['month']))
    return result

# Existing AI endpoints
from ai_utils import calculate_completion, calculate_labor_cost, predict_productivity

# Tính % hoàn thành công đoạn
@app.get("/ai/completion/{employee_id}/{product_id}/{work_date}")
def api_completion(employee_id: int, product_id: int, work_date: str, db: Session = Depends(get_db)):
    result = calculate_completion(db, employee_id, product_id, work_date)
    if not result:
        raise HTTPException(status_code=404, detail="Data not found")
    return result

# Tính chi phí nhân công
@app.get("/ai/labor_cost/{employee_id}/{product_id}/{work_date}")
def api_labor_cost(employee_id: int, product_id: int, work_date: str, db: Session = Depends(get_db)):
    result = calculate_labor_cost(db, employee_id, product_id, work_date)
    if not result:
        raise HTTPException(status_code=404, detail="Data not found")
    return result

# Dự đoán năng suất
@app.get("/ai/predict/{employee_id}/{product_id}")
def api_predict(employee_id: int, product_id: int, db: Session = Depends(get_db)):
    result = predict_productivity(db, employee_id, product_id)
    if not result:
        raise HTTPException(status_code=404, detail="Data not found")
    return result