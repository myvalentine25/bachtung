import psycopg2
from psycopg2 import sql
from database import engine, Base
from models import *

# Create database if it doesn't exist
def create_database():
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            dbname="postgres",
            user="hungleminh",
            host="localhost",
            port="5432"
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'bach_tung'")
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier('bach_tung')))
            print("Database 'bach_tung' created successfully")
        else:
            print("Database 'bach_tung' already exists")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error creating database: {e}")

# Create tables
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    create_database()
    create_tables()