# Buổi 1 — Nền tảng: Hiểu Yokenteigi là gì

---

## Slide 1: Giới thiệu khóa học

### Mục tiêu khóa học
- Hiểu rõ Yokenteigi là gì và vai trò của nó
- Biết cấu trúc và nội dung của một tài liệu Yokenteigi chuẩn
- Tự viết được tài liệu Yokenteigi hoàn chỉnh

### Kết quả sau khóa học
> Học viên có thể nhận yêu cầu thô từ khách hàng Nhật và sản xuất tài liệu Yokenteigi đạt chuẩn

### Về giảng viên
- [Tên giảng viên]
- [Kinh nghiệm thực tế]

---

## Slide 2: Yokenteigi là gì?

### 要件定義 (Yokenteigi)
**Định nghĩa Yêu cầu Hệ thống**

| Kanji | Đọc | Nghĩa |
|-------|-----|-------|
| 要件 | Yōken | Yêu cầu |
| 定義 | Teigi | Định nghĩa |

### Mục đích
- Xác định **chính xác** hệ thống cần làm gì
- Là **hợp đồng kỹ thuật** giữa khách hàng và team phát triển
- Là **đầu vào** cho toàn bộ quá trình thiết kế và lập trình

> **Nguyên tắc vàng:** Nếu không có trong Yokenteigi → không làm

---

## Slide 3: Vị trí trong vòng đời phát triển phần mềm

```
┌─────────────┐
│  企画・提案   │  ← Đề xuất dự án, lập kế hoạch kinh doanh
│ (Kikaku)    │
└──────┬──────┘
       │
┌──────▼──────┐
│  要件定義    │  ← CHÚNG TA ĐANG Ở ĐÂY
│(Yokenteigi) │
└──────┬──────┘
       │
┌──────▼──────┐
│  基本設計    │  ← Thiết kế tổng thể (DB, API, màn hình)
│(Kihon Sekkei)│
└──────┬──────┘
       │
┌──────▼──────┐
│  詳細設計    │  ← Thiết kế chi tiết (logic từng function)
│(Shousai Sekkei)│
└──────┬──────┘
       │
┌──────▼──────┐
│  製造・実装  │  ← Lập trình
│  (Seizou)   │
└──────┬──────┘
       │
┌──────▼──────┐
│  テスト      │  ← Kiểm thử
│  (Test)     │
└──────┬──────┘
       │
┌──────▼──────┐
│  リリース    │  ← Triển khai
│  (Release)  │
└─────────────┘
```

---

## Slide 4: Phân biệt các tài liệu dễ nhầm lẫn

| Tài liệu | Tiếng Nhật | Ai tạo | Nội dung chính | Độ chi tiết |
|----------|-----------|--------|----------------|------------|
| Yêu cầu từ KH | 要求書 (Youkyuusho) | Khách hàng | Mong muốn nghiệp vụ | Thấp |
| **Yokenteigi** | **要件定義書** | **BA/SE** | **Yêu cầu hệ thống** | **Trung** |
| Thiết kế tổng thể | 基本設計書 | SE/Architect | Cấu trúc hệ thống | Cao |
| Thiết kế chi tiết | 詳細設計書 | SE/Dev | Logic từng màn hình | Rất cao |

### Điểm khác biệt quan trọng
- **Youkyuusho** = Khách hàng nói họ *muốn gì*
- **Yokenteigi** = Team IT xác định hệ thống *sẽ làm gì*
- **Kihon Sekkei** = Team IT xác định hệ thống *được xây dựng như thế nào*

---

## Slide 5: Ai làm gì trong quá trình Yokenteigi?

```
Khách hàng (顧客)
    │
    │ Cung cấp yêu cầu nghiệp vụ
    │ Phê duyệt tài liệu
    ▼
Business Analyst / PM
    │
    │ Thu thập yêu cầu (ヒアリング)
    │ Phân tích và cấu trúc hóa
    │ Viết tài liệu Yokenteigi
    ▼
System Engineer / Lead Dev
    │
    │ Review tính khả thi kỹ thuật
    │ Bổ sung yêu cầu phi chức năng
    ▼
Khách hàng + PM
    │
    │ Review chung
    │ Ký duyệt (承認)
    ▼
→ Chuyển sang 基本設計
```

---

## Slide 6: Tư duy người Nhật trong tài liệu

### Nguyên tắc 1: 明確化 (Meikakulka) — Minh bạch tuyệt đối
- ❌ "Xử lý nhanh" → ✅ "Phản hồi trong vòng 3 giây"
- ❌ "Hiển thị thông báo lỗi" → ✅ "Hiển thị thông báo lỗi màu đỏ, font 12px, nội dung: [メッセージID: ERR-001]"
- ❌ "Dữ liệu phải đúng" → ✅ "Số điện thoại gồm 10-11 chữ số, chỉ nhận ký tự số"

### Nguyên tắc 2: MECE — Mutually Exclusive, Collectively Exhaustive
- Liệt kê đủ, không thiếu, không trùng
- Mỗi trường hợp chỉ thuộc 1 nhóm duy nhất

### Nguyên tắc 3: トレーサビリティ (Traceability)
- Mọi yêu cầu đều có thể truy nguyên từ nguồn gốc
- Yêu cầu → Màn hình → Test Case → Code

---

## Slide 7: Phân loại yêu cầu — Bức tranh toàn cảnh

```
                    Yêu cầu hệ thống
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    機能要件        非機能要件         業務要件
 (Functional)   (Non-functional)   (Business)
          │              │              │
    - Đăng nhập    - Hiệu năng     - Quy trình
    - Tìm kiếm     - Bảo mật       - Phân quyền
    - Đặt hàng     - Khả dụng      - Nghiệp vụ
    - Thanh toán   - Khả năng mở   - Báo cáo
                     rộng
                         │
                   制約条件
                 (Constraints)
                         │
                  - Công nghệ
                  - Ngân sách
                  - Thời gian
                  - Pháp lý
```

---

## Slide 8: 機能要件 (Functional Requirements)

### Định nghĩa
> Hệ thống **phải làm gì** — hành vi và chức năng cụ thể

### Ví dụ thực tế — Hệ thống EC (mua sắm online)

| Nhóm | Ví dụ chức năng |
|------|----------------|
| 認証 (Xác thực) | Đăng nhập, đăng xuất, đổi mật khẩu |
| 商品 (Sản phẩm) | Tìm kiếm, xem chi tiết, lọc danh mục |
| カート (Giỏ hàng) | Thêm/xóa sản phẩm, cập nhật số lượng |
| 注文 (Đặt hàng) | Xác nhận đơn, nhập địa chỉ, chọn thanh toán |
| 決済 (Thanh toán) | Thanh toán thẻ, COD, ví điện tử |
| 管理 (Quản trị) | Quản lý sản phẩm, đơn hàng, người dùng |

### Ví dụ khác — Hệ thống xử lý hóa đơn bằng AI (AI-IA)

Dự án thực tế của khóa học: **AI請求書自動処理システム** — phần mềm giúp công ty kế toán tự động đọc hóa đơn và gợi ý bút toán (仕訳).

| Nhóm | Ví dụ chức năng |
|------|----------------|
| アップロード (Tải lên) | Upload hóa đơn (PDF/ảnh), upload hàng loạt |
| AI処理 (Xử lý AI) | Trích xuất dữ liệu hóa đơn, gợi ý mã tài khoản kế toán |
| レビュー (Xem xét) | Nhân viên xem kết quả AI, chỉnh sửa và phê duyệt |
| 検索 (Tìm kiếm) | Tìm kiếm hóa đơn theo nhà cung cấp, ngày, trạng thái |
| 管理 (Quản trị) | Quản lý mã tài khoản kế toán, nhà cung cấp, người dùng |

> **Điểm đặc biệt:** Không chỉ là OCR — hệ thống **map sang mã tài khoản kế toán** (điện EVN → mã 627, taxi Grab → mã 6421). Đây là 機能要件 cốt lõi mà tài liệu Yokenteigi phải mô tả rõ.

---

## Slide 9: 非機能要件 (Non-functional Requirements)

### Định nghĩa
> Hệ thống **hoạt động như thế nào** — chất lượng và ràng buộc

### Các hạng mục chính

| Hạng mục | Tiếng Nhật | Ví dụ |
|----------|-----------|-------|
| Hiệu năng | 性能要件 | 1000 người dùng đồng thời, response < 2s |
| Khả dụng | 可用性 | Uptime 99.9%, bảo trì < 4h/tháng |
| Bảo mật | セキュリティ | Mã hóa SSL, chống SQL injection |
| Mở rộng | 拡張性 | Scale ngang khi tải tăng gấp 10 |
| Sao lưu | バックアップ | Backup hàng ngày, giữ 30 ngày |
| Khôi phục | 復旧 | RTO < 4h, RPO < 1h |

---

## Slide 10: 業務要件 và 制約条件

### 業務要件 (Business Requirements)
Quy trình nghiệp vụ mà hệ thống phải hỗ trợ

**Ví dụ:**
- Quy trình phê duyệt đơn hàng: Nhân viên → Trưởng phòng → Giám đốc
- Chính sách giảm giá: Thành viên VIP giảm 10%, đơn > 1 triệu giảm thêm 5%
- Quy tắc kinh doanh: Không bán rượu cho người dưới 20 tuổi

### 制約条件 (Constraints)
Ràng buộc không thể thay đổi

**Ví dụ:**
- Kỹ thuật: "Phải sử dụng PostgreSQL vì đã có hệ thống cũ"
- Pháp lý: "Tuân thủ GDPR, Luật bảo vệ dữ liệu cá nhân Nhật Bản"
- Thời gian: "Go-live trước 31/03 — deadline tài chính năm"
- Ngân sách: "Chi phí vận hành AWS không quá 500 USD/tháng"

---

## Slide 11: Sự khác biệt giữa tài liệu Việt Nam và Nhật Bản

| Tiêu chí | Phong cách Việt Nam | Phong cách Nhật Bản |
|----------|--------------------|--------------------|
| Độ chi tiết | Trung bình, có thể mơ hồ | Rất chi tiết, không mơ hồ |
| Định lượng | Thường định tính | Bắt buộc định lượng |
| Trường hợp ngoại lệ | Ít đề cập | Liệt kê đầy đủ |
| Review | 1-2 vòng | 3-5 vòng (iterative) |
| Ngôn ngữ | Linh hoạt | Chính xác, nhất quán |
| Truy nguyên | Không bắt buộc | Bắt buộc (ID hóa) |

### Ví dụ minh họa
- **VN:** "Người dùng nhập thông tin và hệ thống lưu lại"
- **JP:** "Người dùng nhập [họ tên] (必須, tối đa 50 ký tự), [email] (必須, định dạng RFC 5321), nhấn [登録] → Hệ thống validate → Nếu hợp lệ: lưu DB và gửi email xác nhận trong 3 phút"

---

## Slide 12: Tóm tắt buổi 1 & Bài tập về nhà

### Tóm tắt
- Yokenteigi = tài liệu định nghĩa yêu cầu hệ thống
- Nằm giữa Youkyuusho (yêu cầu KH) và Kihon Sekkei (thiết kế)
- 3 loại yêu cầu chính: 機能 / 非機能 / 業務 + 制約条件
- Người Nhật yêu cầu tài liệu: minh bạch, định lượng, MECE, có thể truy nguyên

### Bài tập về nhà
> Dựa trên hệ thống **AI請求書自動処理システム (AI-IA)** — phần mềm giúp công ty kế toán アカウントプロ株式会社 (30 kế toán viên) tự động xử lý hóa đơn thay vì nhập tay 4-6 giờ/ngày:
>
> 1. Liệt kê **5 機能要件** — hệ thống cần làm gì? (Ví dụ: upload hóa đơn, AI nhận diện, phê duyệt kết quả... hãy cụ thể hơn và thêm 2 chức năng khác bạn nghĩ là cần thiết)
> 2. Liệt kê **3 非機能要件** — hệ thống phải đáp ứng yêu cầu gì về hiệu năng, bảo mật, khả dụng? (Gợi ý: AI xử lý hóa đơn mất bao lâu là chấp nhận được? Dữ liệu hóa đơn cần bảo mật như thế nào?)
>
> Viết theo format: **[ID] — [Tên yêu cầu] — [Mô tả chi tiết, có số liệu cụ thể]**

### Buổi sau
**Buổi 2:** Cấu trúc hoàn chỉnh của tài liệu Yokenteigi — điền template thực tế
