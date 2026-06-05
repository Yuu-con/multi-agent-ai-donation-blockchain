from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional


class Web3DonationClient:
    def __init__(self, provider_url: str, contract_address: str, abi_path: str):
        self.provider_url = provider_url
        self.contract_address = contract_address
        self.abi_path = Path(abi_path)
        self.web3 = None
        self.contract = None

        try:
            from web3 import Web3

            self.web3 = Web3(Web3.HTTPProvider(provider_url))
            if self.web3.is_connected() and self.abi_path.exists():
                abi = json.loads(self.abi_path.read_text())
                self.contract = self.web3.eth.contract(
                    address=Web3.to_checksum_address(contract_address), abi=abi
                )
        except Exception:
            self.web3 = None
            self.contract = None

    @property
    def is_ready(self) -> bool:
        return self.web3 is not None and self.contract is not None

    def record_donation(
        self,
        campaign_id: int,
        donor_wallet: str,
        amount_eth: float,
        private_key: Optional[str] = None,
    ) -> str:
        if not self.is_ready:
            return "simulated-offchain-tx"

        if private_key is None:
            raise ValueError("private_key is required for on-chain transactions")

        from web3 import Web3

        account = self.web3.eth.account.from_key(private_key)
        nonce = self.web3.eth.get_transaction_count(account.address)
        donation_call = self.contract.functions.donate(campaign_id)
        gas_limit = int(
            donation_call.estimate_gas(
                {
                    "from": account.address,
                    "value": Web3.to_wei(amount_eth, "ether"),
                }
            )
            * 1.2
        )
        tx = donation_call.build_transaction(
            {
                "from": account.address,
                "nonce": nonce,
                "value": Web3.to_wei(amount_eth, "ether"),
                "gas": gas_limit,
                "gasPrice": self.web3.eth.gas_price,
            }
        )
        signed = account.sign_transaction(tx)
        tx_hash = self.web3.eth.send_raw_transaction(signed.rawTransaction)
        return self.web3.to_hex(tx_hash)
