from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Kết nối PostgreSQL database bach_tung
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://hungleminh@localhost:5432/bach_tung"

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