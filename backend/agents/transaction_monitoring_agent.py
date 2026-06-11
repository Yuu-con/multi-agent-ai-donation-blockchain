from datetime import datetime


class TransactionMonitoringAgent:
    def __init__(self):
        self.name = "Transaction Monitoring Agent"

    def analyze(self, tx_data: dict) -> dict:
        """Giám sát số tiền, tần suất và thời điểm giao dịch."""
        flags = []
        amount = float(tx_data.get("amount") or 0.0)
        avg_amount = float(tx_data.get("avg_amount") or 0.0)
        recent_tx_count = int(tx_data.get("recent_tx_count") or 0)
        timestamp = tx_data.get("timestamp")

        if avg_amount > 0 and amount > 5 * avg_amount:
            flags.append("Số tiền giao dịch cao hơn 5 lần mức trung bình")
        elif amount > 5.0:
            flags.append("Số tiền giao dịch lớn đột biến")

        if recent_tx_count > 5:
            flags.append("Nhiều giao dịch phát sinh trong thời gian ngắn")

        dt = self._parse_datetime(timestamp)
        if dt and 0 <= dt.hour <= 5:
            flags.append("Giao dịch diễn ra trong khung giờ khuya")

        return {"agent": self.name, "flags": flags}

    @staticmethod
    def _parse_datetime(value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return None
        return None
