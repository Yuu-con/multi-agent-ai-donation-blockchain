try:
    import pandas as pd
    from sklearn.ensemble import IsolationForest

    HAS_ML = True
except ImportError:
    HAS_ML = False


class AnomalyDetectionAgent:
    def __init__(self):
        self.name = "Anomaly Detection Agent"
        self.model = None
        if HAS_ML:
            self.model = IsolationForest(contamination=0.08, random_state=42)
            self._fit_baseline_model()

    def _fit_baseline_model(self):
        baseline = pd.DataFrame(
            [
                [0.10, 0.12, 1, 0.05, 24.0],
                [0.20, 0.18, 2, 0.10, 12.0],
                [0.35, 0.30, 2, 0.20, 8.0],
                [0.50, 0.40, 3, 0.15, 6.0],
                [0.15, 0.20, 1, 0.05, 48.0],
                [6.00, 0.40, 9, 0.95, 0.2],
                [4.50, 0.30, 12, 0.80, 0.4],
            ],
            columns=[
                "amount",
                "avg_amount",
                "recent_tx_count",
                "transfer_out_ratio",
                "transfer_out_time",
            ],
        )
        self.model.fit(baseline)

    def analyze(self, tx_data: dict) -> dict:
        """Phát hiện lệch chuẩn bằng Isolation Forest nếu có, fallback bằng luật."""
        amount = float(tx_data.get("amount") or 0.0)
        avg_amount = float(tx_data.get("avg_amount") or 0.0)
        recent_tx_count = int(tx_data.get("recent_tx_count") or 0)
        transfer_out_ratio = float(tx_data.get("transfer_out_ratio") or 0.0)
        transfer_out_time = float(tx_data.get("transfer_out_time") or 24.0)

        if self.model is not None:
            try:
                features = pd.DataFrame(
                    [
                        {
                            "amount": amount,
                            "avg_amount": avg_amount,
                            "recent_tx_count": recent_tx_count,
                            "transfer_out_ratio": transfer_out_ratio,
                            "transfer_out_time": transfer_out_time,
                        }
                    ]
                )
                prediction = self.model.predict(features)[0]
                decision = self.model.decision_function(features)[0]
                is_anomaly = bool(prediction == -1)
                anomaly_score = min(100.0, max(0.0, abs(decision) * 250 if is_anomaly else 0.0))
                return {
                    "agent": self.name,
                    "is_anomaly": is_anomaly,
                    "anomaly_score": round(anomaly_score, 2),
                }
            except Exception:
                pass

        score = 0
        if avg_amount > 0 and amount > 4 * avg_amount:
            score += 35
        if recent_tx_count > 6:
            score += 25
        if transfer_out_ratio > 0.8 and transfer_out_time <= 1.0:
            score += 40

        return {
            "agent": self.name,
            "is_anomaly": score >= 50,
            "anomaly_score": float(min(score, 100)),
        }
