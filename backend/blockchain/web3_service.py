import json
import os
from datetime import datetime
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*_args, **_kwargs):
        return False

try:
    from web3 import Web3

    WEB3_IMPORT_ERROR = None
except ImportError as exc:
    Web3 = None
    WEB3_IMPORT_ERROR = exc


BASE_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = BASE_DIR.parent
load_dotenv(BASE_DIR / ".env")

PROVIDER_URL = os.getenv("WEB3_PROVIDER_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("DONATION_CONTRACT_ADDRESS", "")
ABI_PATH = Path(
    os.getenv(
        "DONATION_CONTRACT_ABI_PATH",
        PROJECT_DIR / "blockchain" / "artifacts" / "contracts" / "DonationPlatform.sol" / "DonationPlatform.json",
    )
)


def _get_web3():
    if WEB3_IMPORT_ERROR:
        raise RuntimeError(
            "Chưa cài Web3.py. Hãy chạy: pip install -r backend/requirements.txt"
        ) from WEB3_IMPORT_ERROR
    return Web3(Web3.HTTPProvider(PROVIDER_URL))


def _load_abi():
    if not ABI_PATH.exists():
        raise FileNotFoundError(
            f"Không tìm thấy ABI tại {ABI_PATH}. Hãy chạy `npm run compile` trong thư mục blockchain."
        )
    with ABI_PATH.open("r", encoding="utf-8") as file:
        contract_data = json.load(file)
    abi = contract_data.get("abi")
    if not abi:
        raise ValueError("File ABI không hợp lệ hoặc thiếu trường abi.")
    return abi


def _get_contract():
    w3 = _get_web3()
    if not w3.is_connected():
        raise ConnectionError(
            f"Không kết nối được blockchain node tại {PROVIDER_URL}. Hãy bật Ganache hoặc Hardhat node."
        )
    if not CONTRACT_ADDRESS or CONTRACT_ADDRESS == "0x0000000000000000000000000000000000000000":
        raise ValueError("DONATION_CONTRACT_ADDRESS chưa được cấu hình trong backend/.env.")
    abi = _load_abi()
    return w3, w3.eth.contract(address=w3.to_checksum_address(CONTRACT_ADDRESS), abi=abi)


def get_campaign_count() -> int:
    _, contract = _get_contract()
    return int(contract.functions.getCampaignCount().call())


def get_campaign(campaign_id: int) -> dict:
    w3, contract = _get_contract()
    data = contract.functions.getCampaign(campaign_id).call()
    return {
        "id": int(data[0]),
        "title": data[1],
        "description": data[2],
        "receiver": data[3],
        "target_amount_eth": float(w3.from_wei(data[4], "ether")),
        "total_received_eth": float(w3.from_wei(data[5], "ether")),
        "created_at": datetime.fromtimestamp(data[6]).isoformat(),
        "active": bool(data[7]),
    }


def create_campaign(title: str, description: str, receiver: str, target_amount: float, private_key: str) -> dict:
    w3, contract = _get_contract()
    account = w3.eth.account.from_key(private_key)
    target_amount_wei = w3.to_wei(target_amount, "ether")
    nonce = w3.eth.get_transaction_count(account.address)

    tx = contract.functions.createCampaign(
        title,
        description,
        w3.to_checksum_address(receiver),
        target_amount_wei,
    ).build_transaction(
        {
            "chainId": w3.eth.chain_id,
            "from": account.address,
            "nonce": nonce,
            "gasPrice": w3.eth.gas_price,
        }
    )
    tx["gas"] = int(w3.eth.estimate_gas(tx) * 1.2)

    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return _receipt_response(tx_hash, receipt)


def donate(campaign_id: int, amount_eth: float, donor_private_key: str) -> dict:
    w3, contract = _get_contract()
    account = w3.eth.account.from_key(donor_private_key)
    value_wei = w3.to_wei(amount_eth, "ether")
    nonce = w3.eth.get_transaction_count(account.address)

    tx = contract.functions.donate(campaign_id).build_transaction(
        {
            "chainId": w3.eth.chain_id,
            "from": account.address,
            "nonce": nonce,
            "value": value_wei,
            "gasPrice": w3.eth.gas_price,
        }
    )
    tx["gas"] = int(w3.eth.estimate_gas(tx) * 1.2)

    signed_tx = w3.eth.account.sign_transaction(tx, donor_private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return _receipt_response(tx_hash, receipt)


def get_latest_donation_events(limit: int = 10) -> list[dict]:
    w3, contract = _get_contract()
    latest_block = w3.eth.block_number
    from_block = max(0, latest_block - 2000)
    event_filter = contract.events.DonationReceived.create_filter(
        fromBlock=from_block,
        toBlock=latest_block,
    )
    events = event_filter.get_all_entries()

    results = []
    for event in events[-limit:]:
        args = event["args"]
        block = w3.eth.get_block(event["blockNumber"])
        results.append(
            {
                "campaign_id": int(args["campaignId"]),
                "donor": args["donor"],
                "amount_eth": float(w3.from_wei(args["amount"], "ether")),
                "tx_hash": event["transactionHash"].hex(),
                "timestamp": datetime.fromtimestamp(block["timestamp"]).isoformat(),
            }
        )
    return results


def _receipt_response(tx_hash, receipt) -> dict:
    return {
        "status": "success" if receipt["status"] == 1 else "failed",
        "tx_hash": tx_hash.hex(),
        "block_number": receipt["blockNumber"],
        "gas_used": receipt["gasUsed"],
    }
