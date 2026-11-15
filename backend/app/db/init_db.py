
from app.db.base import Base
from app.db.session import engine

# Import all models before create_all.
from app.models import Assessment, Patient  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


if __name__ == "__main__":
    init_db()
