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
**社内機器管理・貸出システム** — Hệ thống Quản lý & Mượn thiết bị văn phòng
- Công ty IT 250 nhân viên, 3 văn phòng, ~500 thiết bị
- Tech Stack: Node.js + Vue.js 3 + PostgreSQL + Redis + Docker

## Sản phẩm thiết kế được tạo ra

### DB Design (10 tables)
| Table | Mô tả |
|-------|-------|
| users | Tài khoản nhân viên |
| departments | Phòng ban |
| categories | Danh mục thiết bị |
| equipment | Thiết bị |
| equipment_images | Ảnh thiết bị |
| equipment_status_histories | Lịch sử trạng thái thiết bị |
| applications | Đơn mượn thiết bị |
| application_status_histories | Lịch sử trạng thái đơn |
| notifications | Lịch sử thông báo |
| audit_logs | Nhật ký thao tác |

### API Design (30+ endpoints)
- Authentication: login, logout, me, change password
- Equipment (User): list, detail
- Equipment (Admin): CRUD, status change, CSV import
- Applications (User): create, list, cancel, return request
- Applications (Admin): list, approve, reject, confirm return
- Reports: utilization, overdue

### Batch Jobs (5 jobs)
| Batch | Lịch chạy | Mục đích |
|-------|----------|---------|
| BATCH-001 | Hàng ngày 08:00 | Kiểm tra quá hạn, gửi thông báo |
| BATCH-002 | Hàng ngày 07:00 | RESERVED → BORROWED khi đến ngày |
| BATCH-003 | Hàng tuần CN 02:00 | Xóa notification cũ |
| BATCH-004 | Ngày 1 hàng tháng 01:00 | Archive audit log |
| BATCH-005 | Ngày 1 hàng tháng 03:00 | Tạo báo cáo tháng |
