from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# Kết nối Supabase PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:B2chtung123!@db.pdwzypnihufbyrakyyqi.supabase.co:5432/postgres"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True  # True để log SQL query
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()