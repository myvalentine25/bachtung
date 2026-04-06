import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found in environment variables.")
    exit(1)

print(f"Attempting to connect to: {db_url}")

engine = create_engine(db_url)
try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1;"))
        print("Connection successful! Result:", result.scalar())
except OperationalError as e:
    print("Connection failed:")
    print(e)
    exit(1)
except Exception as e:
    print("Unexpected error:")
    print(e)
    exit(1)
