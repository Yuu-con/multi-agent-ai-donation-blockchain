# Nội dung thuyết trình code

## 1. Giới thiệu bài toán

Đề tài của em là “Mô hình hệ thống đa tác nhân AI hỗ trợ phát hiện giao dịch bất thường và giải thích rủi ro trong nền tảng quyên góp Blockchain”. Bài toán xuất phát từ nhu cầu minh bạch trong quyên góp, đồng thời cần có công cụ hỗ trợ quản trị viên phát hiện các giao dịch có dấu hiệu bất thường.

## 2. Vì sao dùng Blockchain

Blockchain phù hợp vì mỗi giao dịch quyên góp được ghi nhận minh bạch, khó chỉnh sửa và có thể truy vết. Trong prototype này, em dùng Solidity, Hardhat và Ganache để mô phỏng môi trường local, không dùng tiền thật.

## 3. Vì sao dùng mô hình đa tác nhân AI

Thay vì chỉ dùng một hàm kiểm tra đơn giản, hệ thống chia việc cho nhiều agent. Mỗi agent nhìn giao dịch ở một góc độ khác nhau: số tiền, tần suất, ví, bất thường dữ liệu, điểm rủi ro và giải thích. Cách này giúp phần phân tích dễ mở rộng và dễ trình bày hơn.

## 4. Kiến trúc hệ thống

Hệ thống có ba phần chính. Phần blockchain chứa smart contract `DonationPlatform`. Phần backend dùng FastAPI, SQLite, Web3.py và các AI agent. Phần frontend dùng React, Bootstrap và Recharts để hiển thị dashboard, transactions, alerts và demo flow.

## 5. Luồng xử lý giao dịch

Luồng demo là: người dùng quyên góp, blockchain ghi nhận event, backend nhận giao dịch và lưu vào SQLite, pipeline AI agents phân tích, hệ thống tính risk score, Explanation Agent tạo lời giải thích, sau đó dashboard hiển thị cảnh báo nếu rủi ro cao.

## 6. Giải thích từng agent

Transaction Monitoring Agent kiểm tra số tiền, tần suất và thời điểm giao dịch. Wallet Risk Analysis Agent kiểm tra ví nhận đã xác minh chưa và tuổi ví gửi. Anomaly Detection Agent kiểm tra mẫu lệch chuẩn. Risk Scoring Agent cộng điểm theo luật. Explanation Agent chuyển các lý do thành lời giải thích tiếng Việt.

## 7. Cách tính điểm rủi ro

Ví nhận chưa xác minh cộng 15 điểm. Ví mới tạo dưới 7 ngày cộng 20 điểm. Số tiền lớn hơn 5 lần trung bình cộng 25 điểm. Nhiều giao dịch trong thời gian ngắn cộng 15 điểm. Chuyển hơn 70% tiền đi trong 30 phút cộng 25 điểm. Điểm được phân loại thành Thấp, Trung bình, Cao và Rất cao.

## 8. Demo giao dịch bình thường

Ở demo giao dịch bình thường, em tạo một giao dịch số tiền nhỏ, ví có lịch sử lâu hơn, receiver đã xác minh và không có hành vi chuyển tiền nhanh. Hệ thống trả về risk score thấp và explanation cho biết chưa có dấu hiệu bất thường nổi bật.

## 9. Demo giao dịch bất thường

Ở demo giao dịch bất thường, em tạo giao dịch có số tiền lớn, ví mới tạo, receiver chưa xác minh, tần suất cao và chuyển tiền nhanh. Hệ thống trả risk score cao hoặc rất cao, sinh flags và tự tạo alert để quản trị viên kiểm tra thêm.

## 10. Hạn chế và hướng phát triển

Hạn chế là prototype chạy local, dữ liệu demo còn nhỏ và phần AI chủ yếu rule-based. Hướng phát triển là đồng bộ blockchain event định kỳ, bổ sung dữ liệu thực tế để huấn luyện mô hình tốt hơn, thêm xác thực admin và test tự động.

## Đoạn nói ngắn khoảng 2 phút

Đề tài của em xây dựng một prototype hệ thống quyên góp trên Blockchain kết hợp mô hình đa tác nhân AI để hỗ trợ phát hiện giao dịch bất thường. Blockchain được dùng để ghi nhận chiến dịch và giao dịch quyên góp một cách minh bạch. Backend FastAPI lấy dữ liệu giao dịch, lưu vào SQLite và đưa qua pipeline gồm nhiều agent. Mỗi agent phụ trách một nhiệm vụ như kiểm tra số tiền, tần suất, tuổi ví, ví nhận đã xác minh chưa, phát hiện mẫu lệch chuẩn, tính điểm rủi ro và tạo lời giải thích. Frontend React hiển thị dashboard, danh sách giao dịch, cảnh báo và trang Demo Flow. Hệ thống không kết luận giao dịch chắc chắn gian lận, mà chỉ đưa ra cảnh báo rủi ro để quản trị viên kiểm tra thêm.

## Đoạn nói chi tiết khoảng 5-7 phút

Trong project này, em chia hệ thống thành ba lớp. Lớp blockchain dùng smart contract `DonationPlatform` để tạo campaign và nhận donation. Khi có người quyên góp, contract phát event `DonationReceived`. Lớp backend dùng FastAPI để cung cấp API cho frontend, SQLAlchemy để làm việc với SQLite, và Web3.py để kết nối smart contract local. Khi backend nhận giao dịch, dữ liệu được đưa qua pipeline đa tác nhân. Transaction Monitoring Agent kiểm tra số tiền có lớn bất thường không, tần suất giao dịch có cao không và thời điểm giao dịch có đáng chú ý không. Wallet Risk Analysis Agent kiểm tra ví nhận và tuổi ví gửi. Anomaly Detection Agent dùng rule-based hoặc Isolation Forest nếu có đủ thư viện. Risk Scoring Agent cộng điểm theo các luật đã định. Cuối cùng Explanation Agent tạo câu giải thích bằng tiếng Việt. Trên frontend, Dashboard hiển thị tổng số campaign, số giao dịch, tổng tiền quyên góp, số cảnh báo và biểu đồ rủi ro. Trang Demo Flow giúp em trình bày rõ luồng xử lý từ giao dịch bình thường đến giao dịch bất thường. Điểm quan trọng là hệ thống chỉ hỗ trợ phát hiện dấu hiệu bất thường, không thay thế quyết định của quản trị viên.

## Link repo

https://github.com/Yuu-con/multi-agent-ai-donation-blockchain.git

## GIT COMMIT & PUSH CHO GIAI ĐOẠN NÀY

```bash
git status
git add docs/presentation_script.md
git commit -m "add presentation script and demo explanation"
git push origin main
```
