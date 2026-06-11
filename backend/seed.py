from datetime import datetime, timedelta, timezone
import sys

import models
from agents.agent_pipeline import AgentPipeline
from database import SessionLocal, engine

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def seed_db():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    pipeline = AgentPipeline()
    try:
        campaign1 = models.Campaign(
            blockchain_campaign_id=1,
            title="Cứu trợ đồng bào miền Trung",
            description="Quyên góp hỗ trợ người dân khắc phục hậu quả thiên tai.",
            receiver_wallet="0x1111111111111111111111111111111111111111",
            target_amount=10.0,
            active=True,
        )
        campaign2 = models.Campaign(
            blockchain_campaign_id=2,
            title="Quỹ khuyến học vùng cao",
            description="Quyên góp sách vở và học bổng cho học sinh khó khăn.",
            receiver_wallet="0x2222222222222222222222222222222222222222",
            target_amount=5.0,
            active=True,
        )
        db.add_all([campaign1, campaign2])
        db.commit()
        db.refresh(campaign1)
        db.refresh(campaign2)

        samples = [
            {
                "tx_hash": "0xseednormal01",
                "campaign_id": campaign1.id,
                "sender_wallet": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "receiver_wallet": campaign1.receiver_wallet,
                "amount": 0.4,
                "timestamp": _utcnow() - timedelta(hours=3),
                "wallet_age_days": 120,
                "receiver_verified": True,
                "recent_tx_count": 1,
                "avg_amount": 0.35,
                "transfer_out_ratio": 0.1,
                "transfer_out_time": 12.0,
            },
            {
                "tx_hash": "0xseedrisky01",
                "campaign_id": campaign2.id,
                "sender_wallet": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                "receiver_wallet": campaign2.receiver_wallet,
                "amount": 6.5,
                "timestamp": _utcnow() - timedelta(minutes=20),
                "wallet_age_days": 2,
                "receiver_verified": False,
                "recent_tx_count": 10,
                "avg_amount": 0.4,
                "transfer_out_ratio": 0.95,
                "transfer_out_time": 0.2,
            },
        ]

        for sample in samples:
            result = pipeline.process_transaction(sample)
            tx = models.Transaction(
                **sample,
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                explanation=result["explanation"],
                flags=result["flags"],
            )
            db.add(tx)
            campaign = db.query(models.Campaign).filter(models.Campaign.id == sample["campaign_id"]).first()
            campaign.total_received += sample["amount"]
            db.commit()
            db.refresh(tx)

            if tx.risk_level in ["Cao", "Rất cao"]:
                db.add(
                    models.Alert(
                        transaction_id=tx.id,
                        risk_score=tx.risk_score,
                        risk_level=tx.risk_level,
                        message=f"Cảnh báo demo: giao dịch {tx.tx_hash} có mức rủi ro {tx.risk_level}.",
                        status="New",
                    )
                )
                db.commit()

        print("Seed dữ liệu mẫu thành công.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
