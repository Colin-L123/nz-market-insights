from dotenv import load_dotenv
import os, psycopg2
from sqlalchemy import create_engine

def get_connection():
    """Create a new connection to the local PostgreSQL, config from .env"""
    load_dotenv()
    connection = psycopg2.connect(host="localhost", port=5432, dbname=os.getenv("POSTGRES_DB"), user= os.getenv("POSTGRES_USER"), password= os.getenv("POSTGRES_PASSWORD"))
    return connection

def get_engine():
    """Create a SQLAlchemy engine, for pandas read_sql/to_sql (which warn on raw psycopg2 connections)."""
    load_dotenv()
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    db = os.getenv("POSTGRES_DB")
    return create_engine(f"postgresql+psycopg2://{user}:{password}@localhost:5432/{db}")

def replace_table(table:str, columns:list[str],rows:list[tuple]):
    columns_sql = ", ".join(columns)
    palceholders = ", ".join(["%s"]*len(columns))
    insert_sql = f"INSERT INTO {table} ({columns_sql}) VALUES ({palceholders})"
    conn = get_connection()
    # print("connected:",conn)
    try:
        with conn.cursor() as cur:
            cur.execute(f"TRUNCATE TABLE {table}")
            cur.executemany(insert_sql, rows)
        conn.commit()
    finally:
        conn.close()


if __name__ =="__main__":
    replace_table("bank_rates", ["bank", "term", "rate"], [("BNZ", "7 day", 1.7)])
    