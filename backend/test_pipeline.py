from datetime import datetime
import sys

from agents.agent_pipeline import AgentPipeline

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def test_pipeline():
    pipeline = AgentPipeline()

    normal_tx = {
        "amount": 0.2,
        "avg_amount": 0.25,
        "recent_tx_count": 1,
        "wallet_age_days": 120,
        "receiver_verified": True,
        "transfer_out_ratio": 0.1,
        "transfer_out_time": 2.5,
        "timestamp": datetime.now(),
    }

    risky_tx = {
        "amount": 6.0,
        "avg_amount": 0.5,
        "recent_tx_count": 9,
        "wallet_age_days": 2,
        "receiver_verified": False,
        "transfer_out_ratio": 0.95,
        "transfer_out_time": 0.2,
        "timestamp": datetime.now(),
    }

    for label, payload in [("Giao dịch bình thường", normal_tx), ("Giao dịch bất thường", risky_tx)]:
        result = pipeline.process_transaction(payload)
        print(f"\n{label}")
        print("Risk score:", result["risk_score"])
        print("Risk level:", result["risk_level"])
        print("Explanation:", result["explanation"])
        print("Flags:", result["flags"])


if __name__ == "__main__":
    test_pipeline()
