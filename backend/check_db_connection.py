from sqlalchemy import create_engine, text
import os

# Try to get the database URL from environment variable, fallback to hardcoded string if not set
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:B2chtung123!@db.pdwzypnihufbyrakyyqi.supabase.co:5432/postgres")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Connection OK:", result.fetchone())
except Exception as e:
    print("Connection failed:", e)
