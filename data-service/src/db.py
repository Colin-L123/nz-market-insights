from dotenv import load_dotenv
import os, json, psycopg2
from sqlalchemy import create_engine

def get_connection():
    """Create a new connection to the local PostgreSQL, config from .env"""
    load_dotenv()
    host = os.getenv("POSTGRES_HOST", "localhost")
    connection = psycopg2.connect(host=host, port=5432, dbname=os.getenv("POSTGRES_DB"), user= os.getenv("POSTGRES_USER"), password= os.getenv("POSTGRES_PASSWORD"))
    return connection

def get_engine():
    """Create a SQLAlchemy engine, for pandas read_sql/to_sql (which warn on raw psycopg2 connections)."""
    load_dotenv()
    host = os.getenv("POSTGRES_HOST", "localhost")
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    db = os.getenv("POSTGRES_DB")
    return create_engine(f"postgresql+psycopg2://{user}:{password}@{host}:5432/{db}")

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

def keep_history_table(table:str, columns:list[str],rows:list[tuple]):
    columns_sql = ", ".join(columns)
    palceholders = ", ".join(["%s"]*len(columns))
    insert_sql = f"INSERT INTO {table} ({columns_sql}) VALUES ({palceholders})"
    conn = get_connection()
    # print("connected:",conn)
    try:
        with conn.cursor() as cur:
            cur.executemany(insert_sql, rows)
        conn.commit()
    finally:
        conn.close()

def upsert_insight(insight_key: str, payload: dict):
    """Insert a market_insights row, or overwrite it if insight_key already exists (recomputed each run)."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO market_insights (insight_key, computed_at, payload)
                VALUES (%s, NOW(), %s)
                ON CONFLICT (insight_key) DO UPDATE
                SET computed_at = EXCLUDED.computed_at, payload = EXCLUDED.payload
                """,
                (insight_key, json.dumps(payload)),
            )
        conn.commit()
    finally:
        conn.close()


if __name__ =="__main__":
    replace_table("bank_rates", ["bank", "term", "rate"], [("BNZ", "7 day", 1.7)])
