# multi-agent-ai-donation-blockchain

Local prototype hệ thống quyên góp Blockchain sử dụng đa tác nhân AI để phát hiện giao dịch bất thường, chấm điểm và giải thích rủi ro.

## 1) Backend (FastAPI + SQLite + AI agents)

```bash
cd <repo-root>
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

API chính:
- `POST /campaigns`: tạo chiến dịch
- `GET /campaigns`: danh sách chiến dịch
- `POST /donations`: ghi nhận giao dịch, chấm điểm rủi ro bởi multi-agent AI, tạo alert
- `GET /transactions`: danh sách giao dịch + risk score/explanation
- `GET /alerts`: cảnh báo rủi ro
- `GET /dashboard`: dữ liệu tổng hợp cho React dashboard

## 2) Smart contract (Solidity + Ganache + Truffle)

```bash
cd <repo-root>/contracts
npm install
# chạy Ganache local ở 127.0.0.1:8545 trước
npm run compile
npm run migrate
```

Contract: `<repo-root>/contracts/DonationCampaign.sol`

Sau khi migrate, copy ABI JSON vào:
`<repo-root>/contracts/DonationCampaign.abi.json`
và set env:
- `WEB3_PROVIDER_URL`
- `DONATION_CONTRACT_ADDRESS`
- `DONATION_CONTRACT_ABI_PATH`

`POST /donations` với `submit_onchain=true` sẽ dùng Web3.py ghi giao dịch on-chain lên Ganache.

## 3) Frontend dashboard (React)

```bash
cd <repo-root>/frontend
npm install
npm run dev
```

Dashboard hiển thị:
- campaigns
- transactions
- AI risk score
- risk explanation
- alerts

Mặc định frontend gọi backend tại `http://127.0.0.1:8000`.
Có thể đổi bằng biến `VITE_API_BASE_URL`.

## 4) Chạy test backend

```bash
cd <repo-root>
python3 -m unittest backend/tests/test_api.py -v
```
