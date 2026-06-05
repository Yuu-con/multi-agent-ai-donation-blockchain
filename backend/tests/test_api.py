import os
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient


class DonationApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        os.environ["DONATION_DB_PATH"] = str(Path(self.temp_dir.name) / "test.db")

        from backend.main import app
        from backend.database import init_db

        init_db()
        self.client = TestClient(app)

    def tearDown(self):
        self.temp_dir.cleanup()
        os.environ.pop("DONATION_DB_PATH", None)

    def test_creates_campaign_and_generates_high_risk_alert(self):
        campaign = self.client.post(
            "/campaigns",
            json={
                "title": "Relief Fund",
                "description": "Emergency support",
                "target_amount": 1000,
                "wallet_address": "0xabc",
            },
        )
        self.assertEqual(campaign.status_code, 200)
        campaign_id = campaign.json()["id"]

        donation = self.client.post(
            "/donations",
            json={
                "campaign_id": campaign_id,
                "donor_wallet": "0xDonor1",
                "amount": 1200,
                "submit_onchain": False,
            },
        )
        self.assertEqual(donation.status_code, 200)
        payload = donation.json()
        self.assertEqual(payload["risk"]["level"], "high")

        alerts = self.client.get("/alerts")
        self.assertEqual(alerts.status_code, 200)
        self.assertGreaterEqual(len(alerts.json()), 1)

    def test_missing_campaign_returns_404(self):
        donation = self.client.post(
            "/donations",
            json={
                "campaign_id": 999,
                "donor_wallet": "0xDonor2",
                "amount": 10,
            },
        )
        self.assertEqual(donation.status_code, 404)


if __name__ == "__main__":
    unittest.main()
