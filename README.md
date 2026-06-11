# Mô hình hệ thống đa tác nhân AI hỗ trợ phát hiện giao dịch bất thường trong nền tảng quyên góp Blockchain

Repo GitHub: https://github.com/Yuu-con/multi-agent-ai-donation-blockchain.git

## 1. Mô tả hệ thống

Project là prototype chạy local cho nền tảng quyên góp Blockchain. Smart contract ghi nhận chiến dịch và giao dịch quyên góp trên blockchain local. Backend FastAPI lưu dữ liệu vào SQLite, chạy pipeline nhiều AI agent để phát hiện dấu hiệu bất thường, tính điểm rủi ro và giải thích bằng tiếng Việt. Frontend React hiển thị dashboard, giao dịch, cảnh báo và trang demo flow để thuyết trình.

Hệ thống chỉ hỗ trợ cảnh báo rủi ro để quản trị viên kiểm tra thêm, không kết luận chắc chắn giao dịch gian lận.

## 2. Công nghệ sử dụng

- Frontend: ReactJS, Vite, Bootstrap, Axios, Recharts, React Router
- Backend: Python FastAPI, SQLAlchemy, SQLite
- Blockchain: Solidity, Hardhat, Ganache hoặc Hardhat node
- Kết nối blockchain: Web3.py
- AI/ML: rule-based scoring, scikit-learn Isolation Forest nếu môi trường đã cài

## 3. Kiến trúc hệ thống

```text
frontend/      React dashboard cho quản trị viên
backend/       FastAPI, SQLite, AI agents, Web3 service
blockchain/    Solidity contract, Hardhat config, deploy script
```

Luồng xử lý:

```text
Người dùng quyên góp
-> Smart contract phát event DonationReceived
-> Backend nhận/lưu giao dịch
-> Multi-agent pipeline phân tích rủi ro
-> Risk score + risk level + explanation
-> Dashboard hiển thị giao dịch và cảnh báo
```

## 4. AI agents

- Transaction Monitoring Agent: kiểm tra số tiền, tần suất và thời điểm giao dịch.
- Wallet Risk Analysis Agent: kiểm tra ví nhận đã xác minh chưa và tuổi ví gửi.
- Anomaly Detection Agent: phát hiện mẫu lệch chuẩn bằng Isolation Forest hoặc rule-based fallback.
- Risk Scoring Agent: tính điểm rủi ro theo luật.
- Explanation Agent: tạo giải thích tiếng Việt dễ hiểu.

## 5. Cách tính điểm rủi ro

- Ví nhận chưa xác minh: +15
- Ví mới tạo dưới 7 ngày: +20
- Số tiền lớn hơn 5 lần trung bình: +25
- Nhiều giao dịch trong thời gian ngắn: +15
- Chuyển hơn 70% tiền đi trong 30 phút: +25

Phân loại:

- 0-30: Thấp
- 31-60: Trung bình
- 61-80: Cao
- 81-100: Rất cao

## 6. Cài đặt backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn main:app --reload
```

Swagger UI: http://127.0.0.1:8000/docs

Test nhanh:

```bash
python test_pipeline.py
python -m compileall .
```

## 7. Cài đặt frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend mặc định gọi API tại `http://127.0.0.1:8000`.

## 8. Chạy Ganache/Hardhat và deploy smart contract

```bash
cd blockchain
npm install
npm run compile
```

Chạy local blockchain bằng Hardhat:

```bash
npx hardhat node
```

Mở terminal khác:

```bash
cd blockchain
npm run deploy:localhost
```

Nếu dùng Ganache GUI:

```bash
cd blockchain
copy .env.example .env
# Điền PRIVATE_KEY của tài khoản test Ganache vào blockchain/.env
npm run deploy:ganache
```

Sau khi deploy, copy contract address vào `backend/.env`:

```env
DONATION_CONTRACT_ADDRESS=0x...
WEB3_PROVIDER_URL=http://127.0.0.1:8545
```

ABI được tạo tại:

```text
blockchain/artifacts/contracts/DonationPlatform.sol/DonationPlatform.json
```

## 9. Tạo dữ liệu giả lập

```bash
cd backend
venv\Scripts\activate
python scripts/generate_fake_data.py
```

Script tạo khoảng 100 giao dịch mẫu gồm cả giao dịch bình thường và bất thường, lưu vào SQLite local và export CSV demo tại `backend/scripts/fake_donations.csv`.

## 10. API endpoints chính

- `GET /`
- `GET /campaigns`
- `POST /campaigns`
- `GET /transactions`
- `POST /transactions`
- `POST /transactions/demo-normal`
- `POST /transactions/demo-risky`
- `GET /alerts`
- `PUT /alerts/{alert_id}/status`
- `GET /dashboard/summary`
- `POST /blockchain/campaigns`
- `POST /blockchain/donate`
- `GET /blockchain/campaigns/{id}`
- `GET /blockchain/events/donations`

## 11. Cách chạy demo bảo vệ

1. Chạy backend FastAPI.
2. Chạy frontend Vite.
3. Mở trang Dashboard để xem tổng quan.
4. Mở Demo Flow.
5. Bấm “Chạy demo giao dịch bình thường” để xem risk score thấp.
6. Bấm “Chạy demo giao dịch bất thường” để xem risk score cao, flags và explanation.
7. Mở Alerts để chứng minh giao dịch rủi ro cao tự tạo cảnh báo.

## 12. Ảnh màn hình nên chụp cho báo cáo

- Dashboard tổng quan.
- Biểu đồ phân bố mức rủi ro.
- Danh sách transactions có màu risk level.
- Trang transaction detail có explanation và flags.
- Trang alerts có trạng thái xử lý.
- Trang Demo Flow sau khi chạy giao dịch bất thường.
- Terminal deploy smart contract và Swagger UI.

## 13. Hạn chế và hướng phát triển

Hạn chế:

- Prototype chạy local, chưa dùng dữ liệu blockchain thật.
- Risk scoring hiện chủ yếu rule-based.
- Chưa có xác thực người dùng và phân quyền quản trị.
- Chưa có cơ chế đồng bộ event blockchain tự động theo lịch.

Hướng phát triển:

- Thêm job đồng bộ event định kỳ.
- Bổ sung dữ liệu lịch sử để huấn luyện mô hình anomaly tốt hơn.
- Thêm xác thực admin.
- Tách config theo môi trường dev/test/prod.
- Thêm unit test và integration test đầy đủ hơn.

## 14. Lưu ý bảo mật

- Không commit `.env`.
- Không commit token, private key, secret key.
- Không commit `venv`, `node_modules`, database SQLite local, `artifacts`, `cache`.
- Chỉ dùng Ganache/Hardhat local cho demo, không dùng tiền thật.

## 15. GIT COMMIT & PUSH CHO GIAI ĐOẠN NÀY

Kiểm tra trước khi commit:

```bash
git status --short --ignored
git status
git add .
git commit -m "add project readme and setup guide"
git push origin main
```
