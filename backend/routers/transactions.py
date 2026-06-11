import secrets
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import models
import schemas
from agents.agent_pipeline import AgentPipeline
from database import get_db


router = APIRouter(prefix="/transactions", tags=["transactions"])
pipeline = AgentPipeline()


AGENT_NAMES = [
    "Transaction Monitoring Agent",
    "Wallet Risk Analysis Agent",
    "Anomaly Detection Agent",
    "Risk Scoring Agent",
    "Explanation Agent",
]


@router.get("/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transactions(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return _create_analyzed_transaction(transaction, db)


@router.get("/{transaction_id}", response_model=schemas.Transaction)
def read_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_tx = crud.get_transaction(db, transaction_id=transaction_id)
    if db_tx is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_tx


@router.post("/demo-normal", response_model=schemas.DemoTransactionResult)
def create_demo_normal_transaction(db: Session = Depends(get_db)):
    campaign = _ensure_demo_campaign(db)
    payload = schemas.TransactionCreate(
        tx_hash=f"0x{secrets.token_hex(32)}",
        campaign_id=campaign.id,
        sender_wallet=f"0x{secrets.token_hex(20)}",
        receiver_wallet=campaign.receiver_wallet,
        amount=0.2,
        timestamp=_utcnow(),
        wallet_age_days=180,
        receiver_verified=True,
        recent_tx_count=1,
        avg_amount=0.25,
        transfer_out_ratio=0.05,
        transfer_out_time=12.0,
    )
    tx = _create_analyzed_transaction(payload, db)
    return schemas.DemoTransactionResult(transaction=tx, agents=AGENT_NAMES, flags=tx.flags or [])


@router.post("/demo-risky", response_model=schemas.DemoTransactionResult)
def create_demo_risky_transaction(db: Session = Depends(get_db)):
    campaign = _ensure_demo_campaign(db, receiver_verified=False)
    payload = schemas.TransactionCreate(
        tx_hash=f"0x{secrets.token_hex(32)}",
        campaign_id=campaign.id,
        sender_wallet=f"0x{secrets.token_hex(20)}",
        receiver_wallet=campaign.receiver_wallet,
        amount=6.0,
        timestamp=_utcnow(),
        wallet_age_days=2,
        receiver_verified=False,
        recent_tx_count=9,
        avg_amount=0.4,
        transfer_out_ratio=0.95,
        transfer_out_time=0.2,
    )
    tx = _create_analyzed_transaction(payload, db)
    return schemas.DemoTransactionResult(transaction=tx, agents=AGENT_NAMES, flags=tx.flags or [])


def _create_analyzed_transaction(transaction: schemas.TransactionCreate, db: Session):
    db_campaign = crud.get_campaign(db, transaction.campaign_id)
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign không tồn tại")

    existing = crud.get_transaction_by_hash(db, transaction.tx_hash)
    if existing:
        return existing

    recent_txs = (
        db.query(models.Transaction)
        .filter(models.Transaction.sender_wallet == transaction.sender_wallet)
        .order_by(models.Transaction.timestamp.desc())
        .limit(20)
        .all()
    )
    recent_tx_count = max(int(transaction.recent_tx_count or 0), len(recent_txs) + 1)
    historic_amounts = [tx.amount for tx in recent_txs]
    avg_amount = (
        float(transaction.avg_amount)
        if transaction.avg_amount and transaction.avg_amount > 0
        else (sum(historic_amounts) / len(historic_amounts) if historic_amounts else transaction.amount)
    )

    tx_dict = transaction.model_dump()
    tx_dict["timestamp"] = tx_dict["timestamp"] or _utcnow()
    tx_dict["recent_tx_count"] = recent_tx_count
    tx_dict["avg_amount"] = avg_amount

    ai_result = pipeline.process_transaction(tx_dict)
    tx_dict["risk_score"] = ai_result["risk_score"]
    tx_dict["risk_level"] = ai_result["risk_level"]
    tx_dict["explanation"] = ai_result["explanation"]
    tx_dict["flags"] = ai_result["flags"]

    db_tx = models.Transaction(**tx_dict)
    db.add(db_tx)
    db_campaign.total_received += transaction.amount
    db.commit()
    db.refresh(db_tx)

    if db_tx.risk_level in ["Cao", "Rất cao"]:
        crud.create_alert(
            db=db,
            alert=schemas.AlertCreate(
                transaction_id=db_tx.id,
                risk_score=db_tx.risk_score,
                risk_level=db_tx.risk_level,
                message=(
                    f"Cảnh báo giao dịch {db_tx.tx_hash[:12]}... có mức rủi ro "
                    f"{db_tx.risk_level} ({db_tx.risk_score:.0f}/100). {db_tx.explanation}"
                ),
                status="New",
            ),
        )

    return db_tx


def _ensure_demo_campaign(db: Session, receiver_verified: bool = True):
    campaign = db.query(models.Campaign).first()
    if campaign:
        return campaign

    demo_campaign = schemas.CampaignCreate(
        blockchain_campaign_id=None,
        title="Chiến dịch demo quyên góp",
        description="Chiến dịch dùng để trình bày luồng xử lý giao dịch bất thường.",
        receiver_wallet=f"0x{secrets.token_hex(20)}",
        target_amount=10.0,
        total_received=0.0,
        active=True,
    )
    created = crud.create_campaign(db, demo_campaign)
    if receiver_verified:
        return created
    return created


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)
