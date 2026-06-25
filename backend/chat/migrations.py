# backend/chat/migrations.py

from sqlalchemy import inspect, text

from database import engine


def ensure_chat_message_columns() -> None:
    """SQLite create_all does not add columns to existing tables."""
    inspector = inspect(engine)
    if "messages" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("messages")}
    statements = []
    if "sources_json" not in columns:
        statements.append("ALTER TABLE messages ADD COLUMN sources_json TEXT")
    if "confidence" not in columns:
        statements.append("ALTER TABLE messages ADD COLUMN confidence VARCHAR")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
