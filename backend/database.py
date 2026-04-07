import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Kết nối PostgreSQL database bach_tung
_db_url = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg2://hungleminh@localhost:5432/bach_tung"
)
# Railway provides postgres:// URLs; SQLAlchemy requires postgresql+psycopg2://
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
SQLALCHEMY_DATABASE_URL = _db_url

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