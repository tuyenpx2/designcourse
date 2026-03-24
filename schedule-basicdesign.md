# スケジュール — 基本設計書 作成実践コース

**期間:** 2026年5月4日 〜 5月25日（全4週・8回）
**頻度:** 週1回（月曜日）
**時間:** 各回 2コマ連続（18:00〜19:00、休憩なし）
**形式:** オンライン / オフライン
**前提:** 要件定義書コース修了 または 同等知識

---

## カレンダービュー

```
          MAY 2026
Mo  Tu  We  Th  Fr  Sa  Su
                 1   2   3
 4   5   6   7   8   9  10   ← 第1週: Buổi 1 + 2
11  12  13  14  15  16  17   ← 第2週: Buổi 3 + 4
18  19  20  21  22  23  24   ← 第3週: Buổi 5 + 6
25  26  27  28  29  30  31   ← 第4週: Buổi 7 + 8
```

---

## 詳細スケジュール

| 週 | 日程 | 時間 | 回 | テーマ | 内容 | 宿題期限 |
|----|------|------|-----|--------|------|---------|
| 1週目 | 5/4 (月) | 18:00〜18:30 | **Buổi 1** | 🟦 Nền tảng: Kihon Sekkei là gì | ・Kihon Sekkei vs Yokenteigi vs Shousai Sekkei<br>・Quy trình 6 bước thiết kế<br>・Cấu trúc tài liệu chuẩn<br>・Tech stack quyết định: PostgreSQL, Docker, JWT | — |
| | | 18:30〜19:00 | **Buổi 2** | 🟦 ER図 設計 (Phần 1) | ・Trích xuất Entity từ 機能一覧<br>・Vẽ ER図 Crow's Foot<br>・Soft Delete & Optimistic Locking<br>・AI tools: Claude + dbdiagram.io DBML | ✏️ Hạn 5/10: Bài tập Buổi 1+2 |
| 2週目 | 5/11 (月) | 18:00〜18:30 | **Buổi 3** | 🟩 テーブル定義書 | ・Cấu trúc テーブル定義書 chuẩn<br>・10 bảng: users, equipment, applications, categories...<br>・Index strategy & Migration Scripts<br>・Status history tables | — |
| | | 18:30〜19:00 | **Buổi 4** | 🟩 画面設計 & Wireframe | ・画面一覧 & 画面遷移図<br>・Wireframe: S020/S021/S030/S131<br>・Empty/Loading/Error states<br>・AI tools: v0.dev, Whimsical AI, draw.io | ✏️ Hạn 5/17: Bài tập Buổi 3+4 |
| 3週目 | 5/18 (月) | 18:00〜18:30 | **Buổi 5** | 🟨 API設計 | ・RESTful naming conventions<br>・30 endpoints — API一覧<br>・API仕様書 chi tiết<br>・JWT flow, Error codes, Pagination<br>・AI tools: Swagger Editor, Mermaid sequenceDiagram | — |
| | | 18:30〜19:00 | **Buổi 6** | 🟧 Batch & Security & Infra | ・5 Batch jobs (pg_cron, idempotency)<br>・Security: XSS/SQLi/CORS/RBAC<br>・Infrastructure: on-premise Docker<br>・Monitoring & Blue-Green Deploy<br>・AI tools: Eraser.io, PlantUML | ✏️ Hạn 5/24: Bài tập Buổi 5+6 |
| 4週目 | 5/25 (月) | 18:00〜18:30 | **Buổi 7** | 🟧 Traceability Matrix & Review | ・Map toàn bộ F001-F063 → DB/API/Screen/Batch<br>・Gap analysis (phát hiện thiếu sót)<br>・Review chéo theo checklist<br>・Cấu trúc tài liệu hoàn chỉnh | — |
| | | 18:30〜19:00 | **Buổi 8** | 🏆 Tổng kết & Tốt nghiệp | ・10 bài học thực chiến<br>・12 golden rules 基本設計<br>・Bridge to 詳細設計<br>・Phát biểu bài tốt nghiệp & 修了証授与 | 📋 **Nộp bài TN trước 5/23** |

---

## Mốc quan trọng

```
5/04 ──[Khai giảng]
        │
5/11 ──[Review bài Buổi 1+2]──────────── Deadline nộp bài: 5/10
        │
5/18 ──[Review bài Buổi 3+4]──────────── Deadline nộp bài: 5/17
        │
5/23 ──────────────────────────────────── ⚠️ Deadline nộp bài TN
        │
5/24 ──[Review bài Buổi 5+6]──────────── Deadline nộp bài: 5/24
        │
5/25 ──[Phát biểu tốt nghiệp]─────────── 修了証授与
```

---

## Chuẩn bị mỗi buổi học

| Cần chuẩn bị | Chi tiết |
|-------------|---------|
| 📁 Tài liệu | Slide buổi học + Tài liệu 要件定義書 (từ khóa học trước) |
| 💻 Laptop | dbdiagram.io, draw.io / Whimsical, Swagger Editor |
| 📝 Template | Bộ template 基本設計書 (phát tại buổi 1) |
| 🤖 AI Tools | Tài khoản Claude.ai (hoặc ChatGPT) để tạo prompt |
| 📖 Case Study | Hệ thống Quản lý & Mượn thiết bị văn phòng (xuyên suốt) |

---

## Thông tin buổi học

| Mục | Thông tin |
|-----|---------|
| Nền tảng | Zoom / Google Meet |
| Ghi hình | Có (xem lại trong 7 ngày) |
| Bài tập | Nộp qua [Google Classroom / Slack] |
| Hỗ trợ | Q&A channel trên Slack |
| Ngôn ngữ | Tiếng Việt (thuật ngữ Nhật song song) |

---

## Bài tập tốt nghiệp

> **Đề bài:** Dựa trên Yokenteigi đã viết ở khóa trước, tạo 基本設計書 hoàn chỉnh cho 1 trong 3 hệ thống:
> - A. Hệ thống đặt lịch phòng họp nội bộ *(nối tiếp bài TN Yokenteigi topic A)*
> - B. Hệ thống quản lý tài sản văn phòng *(mở rộng Case Study)*
> - C. Hệ thống theo dõi OKR / KPI nội bộ *(nối tiếp bài TN Yokenteigi topic C)*
>
> **Nộp:**
> 1. ER図 (dbdiagram.io export hoặc draw.io)
> 2. テーブル定義書 (Excel/Markdown — tối thiểu 5 bảng)
> 3. API一覧 + 2 API仕様書 chi tiết
> 4. 画面遷移図 (tối thiểu 5 màn hình)
> 5. Traceability Matrix (tối thiểu 10 functions)
>
> **Deadline:** 5/23 (Thứ 7) — 23:59

---

## Lộ trình học tập 2 khóa

```
[Yokenteigi Course]          [Basic Design Course]
4/06 Buổi 1: Nền tảng   →   5/04 Buổi 1: Nền tảng + ER
4/06 Buổi 2: Cấu trúc   →   5/04 Buổi 2: ER diagram
4/13 Buổi 3: 業務フロー  →   5/11 Buổi 3: テーブル定義書
4/13 Buổi 4: 非機能要件  →   5/11 Buổi 4: 画面設計
4/20 Buổi 5: ヒアリング  →   5/18 Buổi 5: API設計
4/20 Buổi 6: Case Study1 →   5/18 Buổi 6: Batch/Security
4/27 Buổi 7: Case Study2 →   5/25 Buổi 7: Traceability
4/27 Buổi 8: 卒業式      →   5/25 Buổi 8: 卒業式
        ↓                            ↓
  修了証 (要件定義)           修了証 (基本設計)
```
