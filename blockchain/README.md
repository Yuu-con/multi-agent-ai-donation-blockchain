# Blockchain Smart Contract

Thư mục này chứa smart contract `DonationPlatform` dùng cho prototype quyên góp trên blockchain local.

## Cài đặt

```bash
cd blockchain
npm install
```

## Compile

```bash
npm run compile
```

ABI sẽ được sinh tại:

```text
blockchain/artifacts/contracts/DonationPlatform.sol/DonationPlatform.json
```

`artifacts/` và `cache/` là file build local, không commit.

## Chạy blockchain local

Chọn một trong hai cách:

```bash
npx hardhat node
```

hoặc mở Ganache GUI ở `http://127.0.0.1:7545`.

## Deploy

Hardhat node:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Ganache:

```bash
copy .env.example .env
# Điền PRIVATE_KEY của tài khoản test Ganache vào blockchain/.env
npx hardhat run scripts/deploy.js --network ganache
```

Sau khi deploy, copy contract address vào `backend/.env`:

```env
DONATION_CONTRACT_ADDRESS=0x...
```

Chỉ dùng private key test local. Không commit `.env` hoặc private key thật.
