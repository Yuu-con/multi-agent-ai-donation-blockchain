from agents.anomaly_detection_agent import AnomalyDetectionAgent
from agents.explanation_agent import ExplanationAgent
from agents.risk_scoring_agent import RiskScoringAgent
from agents.transaction_monitoring_agent import TransactionMonitoringAgent
from agents.wallet_risk_analysis_agent import WalletRiskAnalysisAgent


class AgentPipeline:
    def __init__(self):
        self.monitor = TransactionMonitoringAgent()
        self.wallet = WalletRiskAnalysisAgent()
        self.anomaly = AnomalyDetectionAgent()
        self.scoring = RiskScoringAgent()
        self.explanation = ExplanationAgent()

    def process_transaction(self, tx_data: dict) -> dict:
        monitor_result = self.monitor.analyze(tx_data)
        wallet_result = self.wallet.analyze(tx_data)
        anomaly_result = self.anomaly.analyze(tx_data)
        scoring_result = self.scoring.analyze(tx_data)

        flags = monitor_result["flags"] + wallet_result["flags"]
        reasons = list(scoring_result["reasons"])
        final_score = float(scoring_result["score"])

        if anomaly_result.get("is_anomaly"):
            flags.append("Mẫu giao dịch lệch chuẩn so với dữ liệu nền")
            reasons.append("mẫu giao dịch lệch chuẩn")
            final_score = min(final_score + 15.0, 100.0)

        final_level = self.scoring.classify(final_score)
        explanation = self.explanation.analyze(final_level, final_score, reasons)

        return {
            "risk_score": final_score,
            "risk_level": final_level,
            "explanation": explanation["explanation"],
            "flags": flags,
            "agent_results": {
                "transaction_monitoring": monitor_result,
                "wallet_risk_analysis": wallet_result,
                "anomaly_detection": anomaly_result,
                "risk_scoring": scoring_result,
                "explanation": explanation,
            },
        }
