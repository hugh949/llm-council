"""Database models and setup for LLM Council."""

from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
from pathlib import Path

Base = declarative_base()


class Conversation(Base):
    """Conversation model."""
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    title = Column(String, default="New Conversation", nullable=False)
    
    # JSON fields for complex nested data
    prompt_engineering = Column(JSON, default=dict)
    context_engineering = Column(JSON, default=dict)
    council_deliberation = Column(JSON, default=dict)
    
    # For backward compatibility with old format
    messages = Column(JSON, default=list)


def get_database_url() -> str:
    """Get database URL from environment or use default SQLite."""
    # For production, use PostgreSQL if DATABASE_URL is set
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # PostgreSQL URL (e.g., from Azure Database for PostgreSQL)
        # Format: postgresql://user:pass@host:port/dbname
        return database_url
    else:
        # Default to SQLite - use persistent location in Azure
        # In Azure, use /home/site/wwwroot/data/ for persistence
        # Locally, use ./data/ relative to project root
        if os.path.exists("/home/site/wwwroot"):
            # Azure environment - use persistent location
            data_dir = Path("/home/site/wwwroot/data")
        else:
            # Local development - use relative path
            # Find project root (where this file is: backend/database.py)
            backend_dir = Path(__file__).parent
            project_root = backend_dir.parent
            data_dir = project_root / "data"
        
        data_dir.mkdir(parents=True, exist_ok=True)
        db_path = data_dir / "llm_council.db"
        db_url = f"sqlite:///{db_path}"
        
        # Log database path for debugging (only in Azure)
        if os.path.exists("/home/site/wwwroot"):
            import sys
            print(f"🔍 Database path: {db_path}", file=sys.stderr, flush=True)
            print(f"🔍 Database exists: {db_path.exists()}", file=sys.stderr, flush=True)
        
        return db_url


def get_engine():
    """Get SQLAlchemy engine."""
    database_url = get_database_url()
    
    # SQLite-specific settings
    if database_url.startswith("sqlite"):
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},  # Needed for SQLite
            echo=False  # Set to True for SQL debugging
        )
    else:
        # PostgreSQL or other databases
        engine = create_engine(database_url, echo=False)
    
    return engine


def init_db():
    """Initialize database tables."""
    engine = get_engine()
    Base.metadata.create_all(engine)
    return engine


# Global session factory
_engine = None
_SessionLocal = None


def get_db():
    """Dependency for FastAPI to get database session (generator)."""
    global _engine, _SessionLocal
    
    if _engine is None:
        _engine = init_db()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_session() -> Session:
    """Get a single database session (for non-FastAPI use)."""
    global _engine, _SessionLocal
    
    if _engine is None:
        _engine = init_db()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    
    return _SessionLocal()

