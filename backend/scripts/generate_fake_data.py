import csv
import os
import random
import secrets
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import models
from agents.agent_pipeline import AgentPipeline
from database import SessionLocal, engine


def wallet():
    return f"0x{secrets.token_hex(20)}"


def tx_hash():
    return f"0x{secrets.token_hex(32)}"


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def generate_data(total: int = 100):
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    pipeline = AgentPipeline()
    csv_rows = []

    try:
        campaigns = [
            models.Campaign(
                blockchain_campaign_id=1,
                title="Cứu trợ thiên tai miền Trung",
                description="Hỗ trợ người dân sau bão lũ.",
                receiver_wallet=wallet(),
                target_amount=15.0,
                active=True,
            ),
            models.Campaign(
                blockchain_campaign_id=2,
                title="Nhà tình thương vùng xa",
                description="Xây nhà cho hộ gia đình khó khăn.",
                receiver_wallet=wallet(),
                target_amount=10.0,
                active=True,
            ),
            models.Campaign(
                blockchain_campaign_id=3,
                title="Quỹ phẫu thuật nụ cười",
                description="Hỗ trợ phẫu thuật cho trẻ em khó khăn.",
                receiver_wallet=wallet(),
                target_amount=8.0,
                active=True,
            ),
        ]
        db.add_all(campaigns)
        db.commit()
        for campaign in campaigns:
            db.refresh(campaign)

        donor_wallets = [wallet() for _ in range(40)]
        suspicious_receiver = campaigns[1]

        for i in range(1, total + 1):
            campaign = random.choice(campaigns)
            sender_wallet = random.choice(donor_wallets)
            timestamp = _utcnow() - timedelta(hours=random.randint(1, 24 * 30))
            amount = round(random.uniform(0.05, 0.45), 3)
            avg_amount = round(random.uniform(0.08, 0.35), 3)
            wallet_age_days = random.randint(20, 720)
            receiver_verified = campaign.id != suspicious_receiver.id
            recent_tx_count = random.randint(1, 3)
            transfer_out_ratio = round(random.uniform(0.0, 0.25), 2)
            transfer_out_time = round(random.uniform(4.0, 48.0), 1)

            scenario = None
            if i > int(total * 0.8):
                scenario = (i - int(total * 0.8)) % 6
                if scenario == 0:
                    campaign = suspicious_receiver
                    receiver_verified = False
                    amount = 0.6
                elif scenario == 1:
                    sender_wallet = wallet()
                    wallet_age_days = random.randint(1, 6)
                    amount = 0.7
                elif scenario == 2:
                    avg_amount = 0.1
                    amount = 0.9
                elif scenario == 3:
                    recent_tx_count = random.randint(8, 15)
                elif scenario == 4:
                    transfer_out_ratio = 0.95
                    transfer_out_time = 0.2
                    amount = 0.8
                elif scenario == 5:
                    campaign = suspicious_receiver
                    sender_wallet = wallet()
                    receiver_verified = False
                    amount = 1.2

            payload = {
                "amount": amount,
                "avg_amount": avg_amount,
                "recent_tx_count": recent_tx_count,
                "wallet_age_days": wallet_age_days,
                "receiver_verified": receiver_verified,
                "transfer_out_ratio": transfer_out_ratio,
                "transfer_out_time": transfer_out_time,
                "timestamp": timestamp,
            }
            result = pipeline.process_transaction(payload)

            transaction = models.Transaction(
                tx_hash=tx_hash(),
                campaign_id=campaign.id,
                sender_wallet=sender_wallet,
                receiver_wallet=campaign.receiver_wallet,
                amount=amount,
                timestamp=timestamp,
                wallet_age_days=wallet_age_days,
                receiver_verified=receiver_verified,
                recent_tx_count=recent_tx_count,
                avg_amount=avg_amount,
                transfer_out_ratio=transfer_out_ratio,
                transfer_out_time=transfer_out_time,
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                explanation=result["explanation"],
                flags=result["flags"],
            )
            db.add(transaction)
            campaign.total_received += amount
            db.commit()
            db.refresh(transaction)

            if transaction.risk_level in ["Cao", "Rất cao"]:
                db.add(
                    models.Alert(
                        transaction_id=transaction.id,
                        risk_score=transaction.risk_score,
                        risk_level=transaction.risk_level,
                        message=(
                            f"Cảnh báo: giao dịch {transaction.tx_hash[:12]}... "
                            f"có mức rủi ro {transaction.risk_level}."
                        ),
                        status="New",
                    )
                )
                db.commit()

            csv_rows.append(
                {
                    "transaction_id": transaction.id,
                    "tx_hash": transaction.tx_hash,
                    "sender_wallet": transaction.sender_wallet,
                    "receiver_wallet": transaction.receiver_wallet,
                    "amount": transaction.amount,
                    "timestamp": transaction.timestamp.isoformat(),
                    "campaign_id": transaction.campaign_id,
                    "wallet_age_days": transaction.wallet_age_days,
                    "receiver_verified": transaction.receiver_verified,
                    "recent_tx_count": transaction.recent_tx_count,
                    "avg_amount": transaction.avg_amount,
                    "transfer_out_ratio": transaction.transfer_out_ratio,
                    "transfer_out_time": transaction.transfer_out_time,
                    "risk_score": transaction.risk_score,
                    "risk_level": transaction.risk_level,
                    "explanation": transaction.explanation,
                    "flags": "; ".join(transaction.flags or []),
                    "scenario": scenario if scenario is not None else "normal",
                }
            )

        csv_path = Path(__file__).resolve().parent / "fake_donations.csv"
        with csv_path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=list(csv_rows[0].keys()))
            writer.writeheader()
            writer.writerows(csv_rows)

        print(f"Đã sinh {total} giao dịch và export CSV: {csv_path}")
    finally:
        db.close()


if __name__ == "__main__":
    count = int(os.getenv("FAKE_TRANSACTION_COUNT", "100"))
    generate_data(count)
