from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class AlertBase(BaseModel):
    transaction_id: int
    risk_score: float
    risk_level: str
    message: str
    status: str = "New"


class AlertCreate(AlertBase):
    pass


class Alert(AlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    tx_hash: str
    campaign_id: int
    sender_wallet: str
    receiver_wallet: str
    amount: float
    timestamp: Optional[datetime] = None
    wallet_age_days: Optional[int] = 30
    receiver_verified: Optional[bool] = False
    recent_tx_count: Optional[int] = 0
    avg_amount: Optional[float] = 0.0
    transfer_out_ratio: Optional[float] = 0.0
    transfer_out_time: Optional[float] = 0.0
    risk_score: Optional[float] = 0.0
    risk_level: Optional[str] = "Thấp"
    explanation: Optional[str] = ""
    flags: List[str] = []


class TransactionCreate(TransactionBase):
    pass


class DemoTransactionCreate(BaseModel):
    tx_hash: Optional[str] = None
    campaign_id: Optional[int] = None
    sender_wallet: Optional[str] = None
    receiver_wallet: Optional[str] = None
    amount: float = 0.2
    timestamp: Optional[datetime] = None
    wallet_age_days: int = 180
    receiver_verified: bool = True
    recent_tx_count: int = 1
    avg_amount: float = 0.25
    transfer_out_ratio: float = 0.05
    transfer_out_time: float = 12.0


class Transaction(TransactionBase):
    id: int
    timestamp: datetime
    alerts: List[Alert] = []

    class Config:
        from_attributes = True


class CampaignBase(BaseModel):
    blockchain_campaign_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    receiver_wallet: str
    target_amount: float
    total_received: float = 0.0
    active: bool = True


class CampaignCreate(CampaignBase):
    pass


class Campaign(CampaignBase):
    id: int
    created_at: datetime
    transactions: List[Transaction] = []

    class Config:
        from_attributes = True


class RiskDistributionItem(BaseModel):
    risk_level: str
    count: int


class TransactionTimelineItem(BaseModel):
    date: str
    count: int
    total_amount: float


class DashboardSummary(BaseModel):
    total_campaigns: int
    total_donations_eth: float
    total_transactions: int
    active_alerts: int
    avg_risk_score: float
    high_risk_count: int
    risk_distribution: List[RiskDistributionItem]
    transactions_over_time: List[TransactionTimelineItem]


class AlertStatusUpdate(BaseModel):
    status: str


class DemoTransactionResult(BaseModel):
    transaction: Transaction
    agents: List[str]
    flags: List[str]
