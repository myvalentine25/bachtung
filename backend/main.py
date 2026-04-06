from datetime import date


from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import Base, SessionLocal, engine
from backend.models import Product, Employee, EmployeeSkillPrice, EmployeeOutputs
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import ai
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"status": "ok"}

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Include routers

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.app.routers.products import router as products_router


from backend.app.routers.employees import router as employees_router


from backend.app.routers.employee_skill_prices import router as employee_skill_prices_router




from backend.app.routers.employee_outputs import router as employee_outputs_router


from backend.app.routers.product_process_requirements import router as product_process_requirements_router


app.include_router(products_router, prefix="/products", tags=["Products"])




app.include_router(employees_router, prefix="/employees", tags=["Employees"])


app.include_router(employee_skill_prices_router, prefix="/employee-skill-prices", tags=["Employee Skill Prices"])


app.include_router(employee_outputs_router, prefix="/employee-outputs", tags=["Employee Outputs"])


app.include_router(product_process_requirements_router, prefix="/product-process-requirements", tags=["Product Process Requirements"])


from backend.app.routers.labor_summary import router as labor_summary_router
app.include_router(labor_summary_router, prefix="/labor-cost-summary", tags=["Labor Cost Summary"])


from backend.app.routers.ai import router as ai_router
app.include_router(ai_router, prefix="/ai", tags=["AI"])