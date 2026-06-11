class ExplanationAgent:
    def __init__(self):
        self.name = "Explanation Agent"

    def analyze(self, level: str, score: float, reasons: list[str]) -> dict:
        """Tạo giải thích tiếng Việt theo hướng cảnh báo, không kết luận gian lận."""
        if not reasons:
            explanation = (
                f"Giao dịch được đánh giá rủi ro {level.lower()} với điểm {score:.0f}/100. "
                "Hệ thống chưa phát hiện dấu hiệu bất thường nổi bật."
            )
        else:
            reason_text = ", ".join(reasons)
            explanation = (
                f"Giao dịch được đánh giá rủi ro {level.lower()} với điểm {score:.0f}/100 "
                f"vì {reason_text}. Đây là cảnh báo hỗ trợ quản trị viên kiểm tra thêm, "
                "không phải kết luận chắc chắn gian lận."
            )

        return {"agent": self.name, "explanation": explanation}
