from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    blockchain_campaign_id = Column(Integer, unique=True, index=True, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    receiver_wallet = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    total_received = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)

    transactions = relationship(
        "Transaction",
        back_populates="campaign",
        cascade="all, delete-orphan",
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String, unique=True, index=True, nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    sender_wallet = Column(String, nullable=False)
    receiver_wallet = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Các trường phục vụ phân tích rủi ro.
    wallet_age_days = Column(Integer, default=30)
    receiver_verified = Column(Boolean, default=False)
    recent_tx_count = Column(Integer, default=0)
    avg_amount = Column(Float, default=0.0)
    transfer_out_ratio = Column(Float, default=0.0)
    transfer_out_time = Column(Float, default=0.0)

    # Kết quả từ pipeline đa tác nhân.
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Thấp")
    explanation = Column(Text, default="")
    flags = Column(JSON, default=list)

    campaign = relationship("Campaign", back_populates="transactions")
    alerts = relationship(
        "Alert",
        back_populates="transaction",
        cascade="all, delete-orphan",
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="New")

    transaction = relationship("Transaction", back_populates="alerts")
