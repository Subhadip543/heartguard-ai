from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Safe automatic migration on startup
    try:
        with engine.begin() as conn:
            inspector = inspect(conn)
            table_names = inspector.get_table_names()
            if "patients" in table_names:
                existing_cols = {c["name"] for c in inspector.get_columns("patients")}
                columns_to_add = [
                    ("blood_group", "VARCHAR(10)"),
                    ("height", "DOUBLE PRECISION"),
                    ("weight", "DOUBLE PRECISION"),
                    ("medical_conditions", "VARCHAR(500)"),
                    ("allergies", "VARCHAR(500)"),
                    ("medications", "VARCHAR(500)"),
                    ("emergency_contact", "VARCHAR(100)"),
                    ("city", "VARCHAR(100)"),
                    ("address", "VARCHAR(255)"),
                ]
                for col_name, col_type in columns_to_add:
                    if col_name not in existing_cols:
                        conn.execute(
                            text(f"ALTER TABLE patients ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                        )
    except Exception:
        pass
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for the HeartGuard AI heart disease risk assessment system.",
    lifespan=lifespan,
)

cors_origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
)
