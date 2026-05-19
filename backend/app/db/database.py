from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.config.settings import settings

# ── Support both SQLite and PostgreSQL ──
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={
            "check_same_thread": False,
            "timeout": 30
        }
    )
else:
    # PostgreSQL / Supabase
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping  = True,
        pool_recycle   = 300,
        pool_size      = 5,
        max_overflow   = 10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()