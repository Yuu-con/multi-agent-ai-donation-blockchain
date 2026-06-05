from __future__ import annotations

import sqlite3
from typing import Dict, List


RISK_THRESHOLDS = {
    "low": 0,
    "medium": 40,
    "high": 70,
}


def _amount_agent(amount: float, target_amount: float) -> Dict[str, object]:
    ratio = 0.0 if target_amount <= 0 else amount / target_amount
    score = min(100, int(ratio * 90))
    if amount >= 1_000:
        score = max(score, 75)
    explanation = f"Amount agent: donation is {ratio:.2%} of campaign target"
    return {"name": "amount_agent", "score": score, "explanation": explanation}


def _velocity_agent(conn: sqlite3.Connection, campaign_id: int, donor_wallet: str) -> Dict[str, object]:
    row = conn.execute(
        """
        SELECT COUNT(*) AS tx_count, COALESCE(SUM(amount), 0) AS total_amount
        FROM transactions
        WHERE campaign_id = ?
          AND donor_wallet = ?
          AND datetime(created_at) >= datetime('now', '-60 minutes')
        """,
        (campaign_id, donor_wallet),
    ).fetchone()

    tx_count = int(row["tx_count"])
    total_amount = float(row["total_amount"])
    score = min(100, tx_count * 25 + (30 if total_amount >= 2_000 else 0))
    explanation = (
        "Velocity agent: donor made "
        f"{tx_count} transaction(s) totaling {total_amount:.2f} in the last hour"
    )
    return {"name": "velocity_agent", "score": score, "explanation": explanation}


def _risk_level(score: int) -> str:
    if score >= RISK_THRESHOLDS["high"]:
        return "high"
    if score >= RISK_THRESHOLDS["medium"]:
        return "medium"
    return "low"


def assess_risk(
    conn: sqlite3.Connection,
    campaign_id: int,
    donor_wallet: str,
    amount: float,
    target_amount: float,
) -> Dict[str, object]:
    agent_outputs: List[Dict[str, object]] = [
        _amount_agent(amount, target_amount),
        _velocity_agent(conn, campaign_id, donor_wallet),
    ]

    weighted_score = max(int(out["score"]) for out in agent_outputs)
    level = _risk_level(weighted_score)
    explanation = " | ".join(str(out["explanation"]) for out in agent_outputs)

    return {
        "score": weighted_score,
        "level": level,
        "explanation": explanation,
        "agents": agent_outputs,
    }
