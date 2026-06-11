class RiskScoringAgent:
    def __init__(self):
        self.name = "Risk Scoring Agent"

    def analyze(self, tx_data: dict) -> dict:
        """Tính điểm rủi ro theo luật đã định trong đề tài."""
        score = 0.0
        reasons = []

        receiver_verified = bool(tx_data.get("receiver_verified", False))
        wallet_age_days = int(tx_data.get("wallet_age_days") or 0)
        amount = float(tx_data.get("amount") or 0.0)
        avg_amount = float(tx_data.get("avg_amount") or 0.0)
        recent_tx_count = int(tx_data.get("recent_tx_count") or 0)
        transfer_out_ratio = float(tx_data.get("transfer_out_ratio") or 0.0)
        transfer_out_time = float(tx_data.get("transfer_out_time") or 24.0)

        if not receiver_verified:
            score += 15
            reasons.append("ví nhận chưa xác minh")

        if wallet_age_days < 7:
            score += 20
            reasons.append("ví gửi mới tạo dưới 7 ngày")

        if avg_amount > 0 and amount > 5 * avg_amount:
            score += 25
            reasons.append("số tiền cao hơn 5 lần trung bình")

        if recent_tx_count > 5:
            score += 15
            reasons.append("nhiều giao dịch trong thời gian ngắn")

        if transfer_out_ratio > 0.7 and transfer_out_time <= 0.5:
            score += 25
            reasons.append("chuyển hơn 70% tiền đi trong 30 phút")

        score = min(score, 100.0)
        return {
            "agent": self.name,
            "score": score,
            "level": self.classify(score),
            "reasons": reasons,
        }

    @staticmethod
    def classify(score: float) -> str:
        if score <= 30:
            return "Thấp"
        if score <= 60:
            return "Trung bình"
        if score <= 80:
            return "Cao"
        return "Rất cao"
