"""Đồng bộ event DonationReceived từ blockchain local vào SQLite.

Script này dùng cho demo thủ công sau khi đã deploy contract và cấu hình
DONATION_CONTRACT_ADDRESS trong backend/.env.
"""

from datetime import datetime

import models
from agents.agent_pipeline import AgentPipeline
from blockchain.web3_service import get_latest_donation_events
from database import SessionLocal


def sync_latest_donations(limit: int = 20):
    db = SessionLocal()
    pipeline = AgentPipeline()
    try:
        events = get_latest_donation_events(limit=limit)
        created = 0
        for event in events:
            exists = db.query(models.Transaction).filter(models.Transaction.tx_hash == event["tx_hash"]).first()
            if exists:
                continue

            campaign = (
                db.query(models.Campaign)
                .filter(models.Campaign.blockchain_campaign_id == event["campaign_id"])
                .first()
            )
            if not campaign:
                continue

            payload = {
                "amount": event["amount_eth"],
                "avg_amount": event["amount_eth"],
                "recent_tx_count": 1,
                "wallet_age_days": 30,
                "receiver_verified": True,
                "transfer_out_ratio": 0.0,
                "transfer_out_time": 24.0,
                "timestamp": datetime.fromisoformat(event["timestamp"]),
            }
            result = pipeline.process_transaction(payload)

            tx = models.Transaction(
                tx_hash=event["tx_hash"],
                campaign_id=campaign.id,
                sender_wallet=event["donor"],
                receiver_wallet=campaign.receiver_wallet,
                amount=event["amount_eth"],
                timestamp=datetime.fromisoformat(event["timestamp"]),
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                explanation=result["explanation"],
                flags=result["flags"],
            )
            db.add(tx)
            campaign.total_received += event["amount_eth"]
            created += 1
        db.commit()
        print(f"Đã đồng bộ {created} giao dịch mới từ blockchain.")
    finally:
        db.close()


if __name__ == "__main__":
    sync_latest_donations()
