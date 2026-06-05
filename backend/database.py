import os
import sqlite3
from pathlib import Path

DEFAULT_DB_PATH = Path(__file__).resolve().parent / "data" / "donations.db"


def get_connection() -> sqlite3.Connection:
    db_path = Path(os.getenv("DONATION_DB_PATH", str(DEFAULT_DB_PATH)))
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                target_amount REAL NOT NULL,
                wallet_address TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id INTEGER NOT NULL,
                donor_wallet TEXT NOT NULL,
                amount REAL NOT NULL,
                tx_hash TEXT,
                source TEXT NOT NULL DEFAULT 'off-chain',
                risk_score INTEGER NOT NULL,
                risk_level TEXT NOT NULL,
                risk_explanation TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id INTEGER NOT NULL,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(transaction_id) REFERENCES transactions(id)
            );
            """
        )
