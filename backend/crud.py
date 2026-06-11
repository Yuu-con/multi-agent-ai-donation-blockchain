from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas


def get_campaign(db: Session, campaign_id: int):
    return db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()


def get_campaign_by_blockchain_id(db: Session, blockchain_campaign_id: int | None):
    if blockchain_campaign_id is None:
        return None
    return (
        db.query(models.Campaign)
        .filter(models.Campaign.blockchain_campaign_id == blockchain_campaign_id)
        .first()
    )


def get_campaigns(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Campaign)
        .order_by(models.Campaign.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_campaign(db: Session, campaign: schemas.CampaignCreate):
    db_campaign = get_campaign_by_blockchain_id(db, campaign.blockchain_campaign_id)
    if db_campaign:
        return db_campaign

    db_campaign = models.Campaign(**campaign.model_dump())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign


def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()


def get_transaction_by_hash(db: Session, tx_hash: str):
    return db.query(models.Transaction).filter(models.Transaction.tx_hash == tx_hash).first()


def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Transaction)
        .order_by(models.Transaction.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    db_tx = get_transaction_by_hash(db, transaction.tx_hash)
    if db_tx:
        return db_tx

    db_tx = models.Transaction(**transaction.model_dump())
    db.add(db_tx)

    db_campaign = get_campaign(db, transaction.campaign_id)
    if db_campaign:
        db_campaign.total_received += transaction.amount

    db.commit()
    db.refresh(db_tx)
    return db_tx


def get_alerts(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Alert)
        .order_by(models.Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_alert(db: Session, alert: schemas.AlertCreate):
    db_alert = models.Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


def get_dashboard_summary(db: Session):
    total_campaigns = db.query(models.Campaign).count()
    total_donations_eth = db.query(func.sum(models.Transaction.amount)).scalar() or 0.0
    total_transactions = db.query(models.Transaction).count()
    active_alerts = db.query(models.Alert).filter(models.Alert.status.in_(["New", "Reviewing"])).count()
    avg_risk_score = db.query(func.avg(models.Transaction.risk_score)).scalar() or 0.0
    high_risk_count = (
        db.query(models.Transaction)
        .filter(models.Transaction.risk_level.in_(["Cao", "Rất cao"]))
        .count()
    )

    risk_distribution = [
        schemas.RiskDistributionItem(
            risk_level=level,
            count=db.query(models.Transaction).filter(models.Transaction.risk_level == level).count(),
        )
        for level in ["Thấp", "Trung bình", "Cao", "Rất cao"]
    ]

    timeline_rows = (
        db.query(
            func.date(models.Transaction.timestamp).label("date"),
            func.count(models.Transaction.id).label("count"),
            func.sum(models.Transaction.amount).label("total_amount"),
        )
        .group_by(func.date(models.Transaction.timestamp))
        .order_by(func.date(models.Transaction.timestamp))
        .all()
    )
    transactions_over_time = [
        schemas.TransactionTimelineItem(
            date=str(row.date),
            count=int(row.count),
            total_amount=float(row.total_amount or 0.0),
        )
        for row in timeline_rows
    ]

    return schemas.DashboardSummary(
        total_campaigns=total_campaigns,
        total_donations_eth=float(total_donations_eth),
        total_transactions=total_transactions,
        active_alerts=active_alerts,
        avg_risk_score=float(avg_risk_score),
        high_risk_count=high_risk_count,
        risk_distribution=risk_distribution,
        transactions_over_time=transactions_over_time,
    )
