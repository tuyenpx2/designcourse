# Khóa học: Hướng dẫn viết tài liệu Yokenteigi (要件定義)

## Danh sách bài giảng

| Buổi | File | Chủ đề | Thời lượng |
|------|------|--------|-----------|
| 1 | [buoi-01.md](buoi-01.md) | Nền tảng — Yokenteigi là gì? | ~2.5 tiết |
| 2 | [buoi-02.md](buoi-02.md) | Cấu trúc tài liệu Yokenteigi | ~2.5 tiết |
| 3 | [buoi-03.md](buoi-03.md) | Kỹ thuật viết: 業務フロー & 機能詳細 | ~2.5 tiết |
| 4 | [buoi-04.md](buoi-04.md) | Kỹ thuật viết: 非機能要件, 画面遷移図 | ~2.5 tiết |
| 5 | [buoi-05.md](buoi-05.md) | Kỹ năng thu thập & làm rõ yêu cầu | ~2.5 tiết |
| 6 | [buoi-06.md](buoi-06.md) | Case Study (Phần 1): AI請求書自動処理システム — Phân tích yêu cầu, scope, 機能一覧 | ~2.5 tiết |
| 7 | [buoi-07.md](buoi-07.md) | Case Study (Phần 2): Hoàn thiện 非機能要件, 画面遷移図, async state design & Review | ~2.5 tiết |
| 8 | [buoi-08.md](buoi-08.md) | Tổng kết & Bài thi tốt nghiệp | ~2.5 tiết |

## Cấu trúc từng buổi

Mỗi file slide bao gồm:
- Slides lý thuyết (có ví dụ minh họa thực tế)
- Bài tập tại lớp (thực hành ngay trong buổi học)
- Bài tập về nhà
- Tóm tắt & Preview buổi tiếp theo

## Đối tượng học viên
BA, SE, PL, PM làm việc với khách hàng Nhật hoặc môi trường công ty Nhật

## Case Study xuyên suốt
**Buổi 6-7:** AI請求書自動処理システム (AI Invoice Automation System — "AI-IA")
- Client: アカウントプロ株式会社 — công ty kế toán 30 nhân viên
- Vấn đề: Nhập liệu thủ công hóa đơn 4-6 giờ/ngày, lỗi ~50 lần/tháng
- Giải pháp: Flutter + Laravel + Python/FastAPI + LayoutLMv3-base-sroie — đọc hóa đơn (giấy/PDF/ảnh) → gợi ý mã định khoản (仕訳)
- Trọng tâm thiết kế: **非同期処理のState管理**, **大量データ対応**, **セキュリティ**
- Từ yêu cầu thô → tài liệu Yokenteigi hoàn chỉnh

## Các chức năng chính trong Case Study
| Nhóm | Chức năng |
|------|-----------|
| 認証・アカウント | Login, phân quyền Accountant / Reviewer / Admin |
| アップロード | Chụp ảnh camera, upload PDF/image, batch upload (tối đa 50 file) |
| AI処理管理 | Theo dõi trạng thái async: UPLOADED→QUEUED→PROCESSING→COMPLETED/FAILED/NEEDS_REVIEW |
| レビュー・承認 | Split-view: ảnh hóa đơn + form AI trích xuất, sửa mã định khoản, phê duyệt |
| 仕訳データ | Quản lý journal entries, export CSV / 弥生会計 format |
| マスタ管理 | Nhà cung cấp, mã tài khoản kế toán, quy tắc mapping tự động |
| 通知・レポート | Thông báo xử lý xong, thống kê độ chính xác AI, workload report |
