class WalletRiskAnalysisAgent:
    def __init__(self):
        self.name = "Wallet Risk Analysis Agent"

    def analyze(self, tx_data: dict) -> dict:
        """Phân tích rủi ro ví nhận và tuổi ví gửi."""
        flags = []
        receiver_verified = bool(tx_data.get("receiver_verified", False))
        wallet_age_days = int(tx_data.get("wallet_age_days") or 0)

        if not receiver_verified:
            flags.append("Ví nhận chưa được xác minh")

        if wallet_age_days < 7:
            flags.append("Ví gửi mới tạo dưới 7 ngày")

        return {"agent": self.name, "flags": flags}
