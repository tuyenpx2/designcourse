# Khóa học: Hướng dẫn viết tài liệu Yokenteigi (要件定義)

## Danh sách bài giảng

| Buổi | File | Chủ đề | Thời lượng |
|------|------|--------|-----------|
| 1 | [buoi-01.md](buoi-01.md) | Nền tảng — Yokenteigi là gì? | ~2.5 tiết |
| 2 | [buoi-02.md](buoi-02.md) | Cấu trúc tài liệu Yokenteigi | ~2.5 tiết |
| 3 | [buoi-03.md](buoi-03.md) | Kỹ thuật viết: 業務フロー & 機能詳細 | ~2.5 tiết |
| 4 | [buoi-04.md](buoi-04.md) | Kỹ thuật viết: 非機能要件, 画面遷移図 | ~2.5 tiết |
| 5 | [buoi-05.md](buoi-05.md) | Kỹ năng thu thập & làm rõ yêu cầu | ~2.5 tiết |
| 6 | [buoi-06.md](buoi-06.md) | Case Study (Phần 1): Hệ thống Quản lý & Mượn thiết bị — Xây dựng từ đầu | ~2.5 tiết |
| 7 | [buoi-07.md](buoi-07.md) | Case Study (Phần 2): Hoàn thiện 非機能要件, 画面遷移図 & Review | ~2.5 tiết |
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
**Buổi 6-7:** Hệ thống Quản lý & Mượn thiết bị văn phòng (社内機器管理・貸出システム)
- Công ty IT 250 nhân viên, 3 văn phòng, ~500 thiết bị
- Thiết bị: PC, thiết bị phòng họp, xe công ty, mobile WiFi
- Phân quyền 2 cấp: User (mượn) và Admin (duyệt + quản lý master data)
- Từ yêu cầu thô → tài liệu Yokenteigi hoàn chỉnh (15 chương)

## Các chức năng chính trong Case Study
| Nhóm | Chức năng |
|------|-----------|
| 認証・アカウント | Login, phân quyền User/Admin, quản lý account |
| 機器マスタ | CRUD thiết bị, phân loại, trạng thái (Admin only) |
| 貸出申請 | Tìm kiếm → Gửi yêu cầu → Admin phê duyệt |
| 返却 | Trả thiết bị → Admin xác nhận |
| 通知 | Thông báo tự động: duyệt, gần hạn, quá hạn |
| 履歴・レポート | Lịch sử mượn, báo cáo tỷ lệ sử dụng |
