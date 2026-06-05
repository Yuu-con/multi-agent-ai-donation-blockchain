from __future__ import annotations

import os
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .agents import assess_risk
from .database import get_connection, init_db
from .web3_integration import Web3DonationClient

app = FastAPI(title="Multi-Agent Donation Blockchain API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CampaignIn(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = ""
    target_amount: float = Field(gt=0)
    wallet_address: str = Field(min_length=3)


class DonationIn(BaseModel):
    campaign_id: int
    donor_wallet: str = Field(min_length=3)
    amount: float = Field(gt=0)
    submit_onchain: bool = False
    private_key: Optional[str] = None


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/campaigns")
def list_campaigns() -> list[dict]:
    with closing(get_connection()) as conn:
        rows = conn.execute("SELECT * FROM campaigns ORDER BY created_at DESC").fetchall()
    return [dict(row) for row in rows]


@app.post("/campaigns")
def create_campaign(payload: CampaignIn) -> dict:
    with closing(get_connection()) as conn:
        cur = conn.execute(
            """
            INSERT INTO campaigns (title, description, target_amount, wallet_address)
            VALUES (?, ?, ?, ?)
            """,
            (payload.title, payload.description, payload.target_amount, payload.wallet_address),
        )
        conn.commit()
        campaign_id = cur.lastrowid

        row = conn.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,)).fetchone()
    return dict(row)


def _web3_client() -> Web3DonationClient:
    return Web3DonationClient(
        provider_url=os.getenv("WEB3_PROVIDER_URL", "http://127.0.0.1:8545"),
        contract_address=os.getenv("DONATION_CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000"),
        abi_path=os.getenv(
            "DONATION_CONTRACT_ABI_PATH",
            str(Path(__file__).resolve().parents[1] / "contracts" / "DonationCampaign.abi.json"),
        ),
    )


@app.post("/donations")
def create_donation(payload: DonationIn) -> dict:
    with closing(get_connection()) as conn:
        campaign = conn.execute(
            "SELECT * FROM campaigns WHERE id = ?", (payload.campaign_id,)
        ).fetchone()
        if campaign is None:
            raise HTTPException(status_code=404, detail="Campaign not found")

        risk = assess_risk(
            conn=conn,
            campaign_id=payload.campaign_id,
            donor_wallet=payload.donor_wallet,
            amount=payload.amount,
            target_amount=float(campaign["target_amount"]),
        )

        source = "off-chain"
        tx_hash = "simulated-offchain-tx"

        if payload.submit_onchain:
            web3_client = _web3_client()
            if not web3_client.is_ready:
                raise HTTPException(
                    status_code=503,
                    detail="Web3 client is not connected. Start Ganache and set contract ABI/address.",
                )
            try:
                tx_hash = web3_client.record_donation(
                    campaign_id=payload.campaign_id,
                    donor_wallet=payload.donor_wallet,
                    amount_eth=payload.amount,
                    private_key=payload.private_key,
                )
                source = "on-chain"
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc

        cur = conn.execute(
            """
            INSERT INTO transactions (
                campaign_id, donor_wallet, amount, tx_hash, source, risk_score, risk_level, risk_explanation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.campaign_id,
                payload.donor_wallet,
                payload.amount,
                tx_hash,
                source,
                int(risk["score"]),
                str(risk["level"]),
                str(risk["explanation"]),
            ),
        )
        tx_id = cur.lastrowid

        if risk["level"] in {"high", "medium"}:
            conn.execute(
                """
                INSERT INTO alerts (transaction_id, level, message)
                VALUES (?, ?, ?)
                """,
                (
                    tx_id,
                    risk["level"],
                    f"{risk['level'].upper()} risk transaction detected for campaign {payload.campaign_id}",
                ),
            )

        conn.commit()
        transaction = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()

    return {
        "transaction": dict(transaction),
        "risk": risk,
    }


@app.get("/transactions")
def list_transactions() -> list[dict]:
    with closing(get_connection()) as conn:
        rows = conn.execute(
            """
            SELECT t.*, c.title AS campaign_title
            FROM transactions t
            JOIN campaigns c ON c.id = t.campaign_id
            ORDER BY t.created_at DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]


@app.get("/alerts")
def list_alerts() -> list[dict]:
    with closing(get_connection()) as conn:
        rows = conn.execute(
            """
            SELECT a.*, t.campaign_id, t.donor_wallet, t.amount
            FROM alerts a
            JOIN transactions t ON t.id = a.transaction_id
            ORDER BY a.created_at DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]


@app.get("/dashboard")
def dashboard() -> dict:
    with closing(get_connection()) as conn:
        campaigns = [
            dict(row)
            for row in conn.execute("SELECT * FROM campaigns ORDER BY created_at DESC").fetchall()
        ]
        transactions = [
            dict(row)
            for row in conn.execute(
                "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 20"
            ).fetchall()
        ]
        alerts = [
            dict(row)
            for row in conn.execute("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 20").fetchall()
        ]

    return {
        "campaigns": campaigns,
        "transactions": transactions,
        "alerts": alerts,
    }
