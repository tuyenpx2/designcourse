# Khóa học: Hướng dẫn viết tài liệu Basic Design (基本設計)

## Danh sách bài giảng

| Buổi | File | Chủ đề | Sản phẩm tạo ra |
|------|------|--------|----------------|
| 1 | [buoi-01.md](buoi-01.md) | Nền tảng — Basic Design là gì? | System Architecture + Tech Stack |
| 2 | [buoi-02.md](buoi-02.md) | Thiết kế DB (Phần 1) — ER図 | ER Diagram hoàn chỉnh |
| 3 | [buoi-03.md](buoi-03.md) | Thiết kế DB (Phần 2) — テーブル定義書 | Table Definition + Migration Script |
| 4 | [buoi-04.md](buoi-04.md) | Thiết kế màn hình — Wireframe | Wireframes 18+ màn hình |
| 5 | [buoi-05.md](buoi-05.md) | Thiết kế API & Interface | API Spec Book (30 endpoints) |
| 6 | [buoi-06.md](buoi-06.md) | Thiết kế Batch & Security & Infra | Batch + Security + Deploy Design |
| 7 | [buoi-07.md](buoi-07.md) | Case Study (Phần 1) — Tổng hợp | Traceability Matrix + Gap Analysis |
| 8 | [buoi-08.md](buoi-08.md) | Tổng kết & Bài thi tốt nghiệp | Final Basic Design Document |

## Điều kiện tiên quyết
> Đã hoàn thành khóa **Yokenteigi** (slides/) hoặc có kinh nghiệm đọc tài liệu 要件定義書

## Case Study xuyên suốt
**AI請求書自動処理システム (AI-IA)** — AI Invoice Automation System
- Client: アカウントプロ株式会社 — công ty kế toán 30 nhân viên
- Tech Stack: **Flutter** (Web+Mobile) + **Laravel 11** (PHP 8.3) + **Python FastAPI** + **LayoutLMv3-base-sroie** + **PostgreSQL** + **Redis** + **MinIO** + **Docker**
- Trọng tâm: Microservices + Async processing + Security for financial data

## Sản phẩm thiết kế được tạo ra

### DB Design (11 tables)
| Table | Mô tả |
|-------|-------|
| users | Tài khoản kế toán (accountant/reviewer/admin) |
| invoices | Hóa đơn upload — trạng thái UPLOADED→QUEUED→PROCESSING→COMPLETED/FAILED/NEEDS_REVIEW |
| invoice_extracted_data | Dữ liệu AI trích xuất (supplier, date, amount, confidence_score) |
| journal_entries | Bút toán kế toán đã phê duyệt (debit/credit account codes) |
| suppliers | Nhà cung cấp + default mã định khoản |
| account_code_mapping | Quy tắc tự động gán mã (keyword → account_code) |
| processing_batches | Batch upload metadata |
| notification_logs | Lịch sử thông báo |
| audit_logs | Nhật ký toàn bộ thao tác (tài chính — bắt buộc) |

### API Design (30+ endpoints)
- Authentication: login, logout, me (Laravel Sanctum)
- Invoices: POST /upload (202 Async), GET /{id}/status (polling), POST /{id}/approve
- Journal Entries: CRUD + export CSV/弥生会計 format
- Master Data: suppliers CRUD, account_code_mapping CRUD
- Internal: POST /ai/process (Laravel→Python ONLY — không expose cho Flutter)
- Reports: accuracy stats, processing volume, workload

### Batch Jobs (5 jobs)
| Batch | Lịch chạy | Mục đích |
|-------|----------|---------|
| BATCH-001 | Mỗi 5 phút | Re-queue hóa đơn stuck ở PROCESSING >5 phút |
| BATCH-002 | Mỗi 30 phút | Auto-retry FAILED invoices (max 3 lần) |
| BATCH-003 | Hàng tuần CN 02:00 | Xóa temp files S3/MinIO cũ |
| BATCH-004 | Hàng ngày 06:00 | Tạo báo cáo độ chính xác AI hàng ngày |
| BATCH-005 | Ngày 1 hàng tháng 01:00 | Archive completed invoices >1 năm |
