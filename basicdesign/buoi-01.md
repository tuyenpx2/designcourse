# Buổi 1 — Nền tảng: Hiểu Basic Design (基本設計) là gì

---

## Slide 1: Giới thiệu khóa học

### Mục tiêu khóa học
- Hiểu rõ Basic Design là gì và vai trò trong SDLC
- Nắm vững cấu trúc và từng phần của tài liệu 基本設計書
- Tự viết được Basic Design hoàn chỉnh đạt chuẩn Nhật Bản

### Điều kiện tiên quyết
> Học viên đã hoàn thành khóa **Yokenteigi** hoặc có kinh nghiệm đọc tài liệu要件定義書

### Case Study xuyên suốt khóa học
> **AI請求書自動処理システム (AI-IA)**
> Hệ thống Tự động xử lý Hóa đơn bằng AI
> (Công ty kế toán アカウントプロ株式会社, 30 nhân viên)

---

## Slide 2: Basic Design là gì?

### 基本設計 (Kihon Sekkei) — Thiết kế tổng thể

| Kanji | Đọc | Nghĩa |
|-------|-----|-------|
| 基本 | Kihon | Cơ bản, tổng thể |
| 設計 | Sekkei | Thiết kế |

### Mục đích
- Trả lời câu hỏi: Hệ thống **được xây dựng như thế nào**?
- Là **bản vẽ kỹ thuật** để dev team triển khai
- Là **cầu nối** giữa Yokenteigi và code thực tế

### Sản phẩm đầu ra
```
要件定義書 (Yokenteigi)
        │
        │  "What to build"
        ▼
基本設計書 (Kihon Sekkei)   ← CHÚNG TA ĐANG Ở ĐÂY
        │
        │  "How to build (big picture)"
        ▼
詳細設計書 (Shousai Sekkei)
        │
        │  "How to build (detailed)"
        ▼
    Source Code
```

---

## Slide 3: Vị trí trong vòng đời dự án

```
Phase         | Tài liệu chính    | Người thực hiện  | Reviewer
──────────────────────────────────────────────────────────────
企画           | 提案書・WBS       | PM               | Stakeholder
要件定義       | 要件定義書        | BA               | KH + PM
【基本設計】   | 基本設計書        | SE / Architect   | BA + KH + PM
詳細設計       | 詳細設計書        | SE               | Lead Dev
製造           | Source Code       | Dev              | SE
単体テスト     | UT仕様書・結果    | Dev              | SE
結合テスト     | IT仕様書・結果    | SE               | BA
総合テスト     | ST仕様書・結果    | QA               | KH
リリース       | リリース手順書    | Infra/DevOps     | PM
```

### Thời gian tương đối
> Dự án 6 tháng: Yokenteigi 1 tháng → **Basic Design 1.5 tháng** → Detailed Design 1 tháng → Dev 2.5 tháng

---

## Slide 4: Basic Design vs Yokenteigi vs Detailed Design

| Tiêu chí | 要件定義 | **基本設計** | 詳細設計 |
|---------|---------|------------|---------|
| Trả lời câu hỏi | What? | How? (tổng) | How? (chi tiết) |
| Đối tượng đọc | KH + BA + PM + SE | SE + BA + KH | Dev + SE |
| DB | Không đề cập | ER図 + テーブル定義 | カラム詳細, index |
| Màn hình | Danh sách màn hình | Wireframe + 遷移 | HTML/CSS spec |
| API | Không đề cập | IF一覧 | Request/Response JSON |
| Logic | Flowchart nghiệp vụ | Xử lý cấp module | Pseudocode / logic chi tiết |
| Kỹ thuật | Không quan tâm | Framework, DB, cloud | Thư viện, hàm cụ thể |

---

## Slide 5: Cấu trúc tài liệu 基本設計書 — Nhìn tổng thể

```
基本設計書
│
├── 1. 文書概要                ← Meta thông tin
│
├── 2. システム構成設計         ← Kiến trúc hệ thống
│   ├── 2.1 システム構成図
│   ├── 2.2 技術スタック
│   └── 2.3 デプロイ構成
│
├── 3. 機能設計                ← Thiết kế chức năng
│   ├── 3.1 機能一覧（要件との対応）
│   └── 3.2 モジュール構成
│
├── 4. 画面設計                ← Thiết kế màn hình
│   ├── 4.1 画面一覧
│   ├── 4.2 画面遷移図
│   └── 4.3 画面ワイヤーフレーム (×N)
│
├── 5. DB設計                  ← Thiết kế cơ sở dữ liệu
│   ├── 5.1 ER図
│   └── 5.2 テーブル定義書 (×N)
│
├── 6. インターフェース設計     ← Thiết kế giao tiếp
│   ├── 6.1 API一覧
│   ├── 6.2 API詳細仕様
│   └── 6.3 外部IF設計
│
├── 7. バッチ設計              ← Thiết kế xử lý batch
│
├── 8. セキュリティ設計         ← Thiết kế bảo mật
│
├── 9. インフラ・環境設計       ← Thiết kế hạ tầng
│
└── 10. 非機能設計              ← Triển khai yêu cầu phi chức năng
```

---

## Slide 6: Điểm khác biệt then chốt — Basic Design cần QUYẾT ĐỊNH kỹ thuật

### Những quyết định phải đưa ra trong Basic Design

**Kiến trúc:**
- Monolith hay Microservices?
- SSR (Server Side Render) hay SPA?
- REST API hay GraphQL?

**Database:**
- PostgreSQL, MySQL hay Oracle?
- Chiến lược index nào?
- Soft delete hay hard delete?

**Infrastructure:**
- AWS, GCP hay Azure?
- Docker/Kubernetes hay bare metal?
- Cấu hình HA (High Availability) như thế nào?

**Security:**
- JWT hay Session-based authentication?
- Lưu trữ file ở đâu? (S3, MinIO, local?)
- Rate limiting ở tầng nào?

> **Nguyên tắc:** Mọi quyết định kỹ thuật ảnh hưởng đến nhiều module phải được ghi lại trong Basic Design — không được để mỗi dev tự quyết.

---

## Slide 7: Ví dụ thực tế — Quyết định kỹ thuật trong Case Study

### AI請求書自動処理システム (AI-IA) — アカウントプロ株式会社

**Quyết định 1: Kiến trúc**
```
❓ Câu hỏi: Monolith hay Microservices?
✅ Quyết định: Microservices (Laravel + Python FastAPI tách biệt)
   Lý do: AI processing (LayoutLMv3) cần Python runtime riêng,
          scale độc lập, fault isolation — nếu AI service down
          thì Laravel vẫn hoạt động để upload & quản lý hóa đơn
```

**Quyết định 2: Tech Stack**
```
❓ Câu hỏi: Frontend framework nào? Backend gì?
✅ Quyết định:
   Frontend : Flutter (Web + Mobile) — 1 codebase, 2 platform
   Backend  : Laravel 11 (PHP 8.3) — orchestration + business logic
   AI Service: Python 3.10 + FastAPI — AI processing only (stateless)
   Lý do: Flutter đạt yêu cầu mobile scan; Laravel mature cho
          financial workflow; Python là ngôn ngữ số 1 cho AI/ML
```

**Quyết định 3: Xử lý AI bất đồng bộ (非同期処理)**
```
❓ Câu hỏi: Gọi AI service đồng bộ hay bất đồng bộ?
✅ Quyết định: Bất đồng bộ qua Redis Queue
   Lý do: AI processing có thể mất 3-5 giây/hóa đơn,
          batch 50 hóa đơn không thể block HTTP request.
          Laravel đẩy job vào Redis → Worker xử lý nền →
          Flutter polling GET /invoices/{id}/status
```

**Quyết định 4: Lưu trữ file hóa đơn**
```
❓ Câu hỏi: Lưu file scan/PDF ở đâu?
✅ Quyết định: MinIO (S3-compatible, on-premise) + Signed URL (30 phút)
   Lý do: Hóa đơn là tài liệu tài chính nhạy cảm — không public URL.
          Signed URL hết hạn sau 30 phút → file không bị leak.
          MinIO on-premise đáp ứng yêu cầu bảo mật của công ty kế toán.
```

---

## Slide 8: Quy trình làm Basic Design — 6 bước

```
Bước 1: Đọc kỹ Yokenteigi
        → Hiểu 100% yêu cầu trước khi thiết kế
        → Đánh dấu các điểm kỹ thuật cần quyết định

Bước 2: Quyết định kiến trúc & tech stack
        → Thảo luận với Lead Dev / Architect
        → Cân nhắc: team skill, timeline, scale

Bước 3: Thiết kế DB (ER図 + テーブル定義)
        → Quan trọng nhất — ảnh hưởng toàn bộ hệ thống
        → Review kỹ trước khi tiếp tục

Bước 4: Thiết kế màn hình (Wireframe)
        → Từ màn hình → xác định dữ liệu cần thiết
        → Loop ngược lại Bước 3 nếu thiếu field

Bước 5: Thiết kế API & Interface
        → Từ màn hình + DB → xác định API cần thiết
        → Định nghĩa request/response (cấp field)

Bước 6: Thiết kế Batch, Security, Infra
        → Bổ sung các phần còn lại
        → Review toàn bộ tài liệu
```

---

## Slide 9: Cấu trúc thực tế của khóa học này

| Buổi | Chủ đề | Sản phẩm tạo ra |
|------|--------|----------------|
| 1 | Nền tảng, Kiến trúc hệ thống | Cấu trúc tài liệu, System Architecture |
| 2 | Thiết kế DB (Phần 1) — ER図 | ER Diagram hoàn chỉnh |
| 3 | Thiết kế DB (Phần 2) — テーブル定義 | Table Definition Book |
| 4 | Thiết kế màn hình — Wireframe | Wireframes các màn hình AI-IA |
| 5 | Thiết kế API & Interface | API Spec Book |
| 6 | Thiết kế Batch & Security | Batch Design + Security Design |
| 7 | Case Study (Phần 1) — Tổng hợp | Draft Basic Design Document |
| 8 | Case Study (Phần 2) — Review & Hoàn thiện | Final Basic Design |

---

## Slide 10: Giới thiệu Case Study

### AI請求書自動処理システム (AI-IA)

**Bối cảnh:**
- Công ty kế toán アカウントプロ株式会社, 30 kế toán viên
- Nhận hóa đơn từ khách hàng dưới dạng: scan giấy, PDF, ảnh smartphone
- Hiện tại: nhập tay từng hóa đơn vào phần mềm kế toán → mất 30 phút/hóa đơn
- Mục tiêu: AI trích xuất dữ liệu + gợi ý 仕訳 (journal entry) → kế toán viên chỉ cần review & approve

**Yêu cầu đã xác định (từ Yokenteigi):**
- 3 cấp phân quyền: accountant / reviewer / admin
- Accountant: upload hóa đơn, review kết quả AI, approve journal entry
- Reviewer: phê duyệt journal entry có giá trị cao
- Admin: quản lý user, cấu hình account code mapping, xem báo cáo
- Xử lý batch: upload 50 hóa đơn cùng lúc, xử lý nền

**Constraints kỹ thuật:**
- Dữ liệu tài chính: không được lưu trên cloud nước ngoài
- AES-256 encryption at rest cho tất cả dữ liệu tài chính
- OWASP Top 10 compliance

**Tech Stack quyết định trước:**
```
Frontend:   Flutter (Web + Mobile)
Backend:    Laravel 11 (PHP 8.3) + Redis Queue
AI Service: Python 3.10 + FastAPI + LayoutLMv3-base-sroie (MICROSERVICE)
Database:   PostgreSQL 15
File Storage: MinIO (S3-compatible, on-premise)
Message Queue: Redis 7
Deploy:     Docker + Nginx (on-premise + cloud option)
```

---

## Slide 11: Tài liệu đầu vào và đầu ra

### Đầu vào (Input) của Basic Design

| Tài liệu | Nội dung sử dụng |
|---------|----------------|
| 要件定義書 | Toàn bộ — đặc biệt 機能一覧, 非機能要件, 制約条件 |
| 議事録 | Các quyết định đã được KH xác nhận |
| 課題管理表 | Các vấn đề mở cần giải quyết trong thiết kế |
| 現行システム仕様書 | Hệ thống cũ (nếu có) để tham khảo |

### Đầu ra (Output)

| Tài liệu | Format |
|---------|--------|
| システム構成図 | draw.io / Cacoo |
| ER図 | draw.io / dbdiagram.io |
| テーブル定義書 | Excel / Markdown |
| 画面ワイヤーフレーム | Figma / draw.io |
| API仕様書 | OpenAPI (Swagger) / Markdown |
| バッチ設計書 | Excel / Markdown |
| セキュリティ設計書 | Word / Markdown |

---

## Slide 12: Lỗi phổ biến khi mới làm Basic Design

### Lỗi 1: Thiết kế DB trước khi hiểu rõ Business Flow
> DB phải phản ánh nghiệp vụ, không phải ngược lại.
> Ví dụ: Không hiểu flow "UPLOADED → QUEUED → PROCESSING → COMPLETED" thì sẽ thiết kế thiếu cột `status` trong bảng `invoices`.

### Lỗi 2: Bỏ qua Soft Delete
> Trong hệ thống tài chính, hóa đơn không bao giờ được xóa vĩnh viễn (audit trail).
> Table nào cần `deleted_at`? Phải quyết định trong Basic Design.

### Lỗi 3: Không định nghĩa Error Code
> Mỗi lỗi phải có code duy nhất → dev, BA, KH có chung ngôn ngữ.
> Ví dụ: `ERR-INV-001` = "Định dạng file hóa đơn không được hỗ trợ"

### Lỗi 4: API thiếu Pagination
> List API journal entries không có pagination → 100,000 records → frontend đứng.
> Phải thiết kế pagination ngay từ đầu.

### Lỗi 5: Viết Basic Design như Detailed Design
> Basic Design = Big picture. Không cần pseudocode, không cần SQL query.
> Tập trung vào **structure** không phải **implementation**.

---

## Slide 12b: AI活用ガイド — このコースでのAIツール全体マップ

> 基本設計書の各パートをAIで効率的に作成するための全体像を把握しておきましょう

---

### 設計書の各パート × AIツール対応表

| 設計パート | 推奨AIツール | 出力 | 使う回 |
|-----------|------------|------|------|
| ER図 | **Claude → DBML → dbdiagram.io** | ER図PNG | 第2回 |
| テーブル定義書 | **Claude → Markdown表** | テーブル仕様 | 第3回 |
| Migration Script | **Claude → SQL** | .sqlファイル | 第3回 |
| Wireframe | **v0.dev / Whimsical AI** | UI画像 | 第4回 |
| 画面遷移図 | **Claude → Mermaid flowchart** | 遷移図 | 第4回 |
| API仕様書 | **Claude → Markdown / OpenAPI YAML** | API Spec | 第5回 |
| Sequence Diagram | **Claude → Mermaid sequenceDiagram** | シーケンス図 | 第5回 |
| System Architecture図 | **Eraser.io AI / Claude → Mermaid** | 構成図 | 第6回 |
| Batch Flowchart | **Claude → Mermaid flowchart** | フロー図 | 第6回 |

---

### AIツール紹介 — 無料で使えるものだけ

**① Claude (claude.ai)**
```
用途: テキスト→コード変換、設計レビュー、ドラフト作成
得意: DBML, Mermaid, OpenAPI, SQL, Markdown表の生成
料金: 無料プランあり (claude.ai)
使い方: このコースのプロンプトテンプレートをそのまま使う
```

**② dbdiagram.io**
```
用途: ER図の描画
入力: DBML (Database Markup Language) テキスト
料金: 無料
URL: https://dbdiagram.io
→ ClaudeにDBMLを生成させて貼り付けるだけ
```

**③ Eraser.io**
```
用途: Architecture図, Flowchart, Sequence Diagram
入力: 自然言語プロンプト
料金: Free tier あり
URL: https://www.eraser.io
→ 「システム構成を書いて」と入力するだけで図が生成される
```

**④ v0.dev (Vercel)**
```
用途: Wireframe (React/HTML生成)
入力: 日本語/英語でUI説明
料金: 無料 (月20クレジットまで)
URL: https://v0.dev
→ 画面の説明を書くとクリック可能なUIが生成される
```

**⑤ Mermaid Live Editor**
```
用途: Mermaid図のリアルタイムプレビュー
入力: Mermaid記法のテキスト
料金: 完全無料
URL: https://mermaid.live
→ ClaudeのMermaidコードをここに貼るとすぐ確認できる
```

**⑥ Swagger Editor**
```
用途: OpenAPI仕様書のプレビュー
入力: OpenAPI YAML
料金: 完全無料
URL: https://editor.swagger.io
→ ClaudeのOpenAPI YAMLをここに貼るとSwagger UIが表示される
```

---

### 基本的な使い方の流れ (毎回共通)

```
Step 1: 要件定義書 (Yokenteigi) の該当部分を読む
          ↓
Step 2: このコースの「プロンプトテンプレート」をコピー
          ↓
Step 3: テンプレートの[  ]部分に実際の情報を入れる
          ↓
Step 4: Claude に送る
          ↓
Step 5: 生成されたコードを対応ツールに貼り付ける
          ↓
Step 6: 必ず人間がレビュー・修正する ← ここが最重要
          ↓
Step 7: 設計書に組み込む
```

> **⚠️ 重要:** AIはドラフト作成ツールです。
> 生成物をそのまま使わず、必ずビジネスロジックとの整合性を人間が確認してください。

---

## Slide 13: Tóm tắt buổi 1 & Bài tập về nhà

### Tóm tắt
- Basic Design = Trả lời "How to build" ở cấp tổng thể
- Phải đưa ra quyết định kỹ thuật rõ ràng, có lý do
- 10 phần chính: Kiến trúc → DB → Màn hình → API → Batch → Security → Infra
- Đọc kỹ Yokenteigi **trước** khi bắt đầu thiết kế

### Bài tập về nhà
> Đọc lại Yokenteigi của hệ thống AI-IA.
> Trả lời 5 câu hỏi kỹ thuật sau (không cần giải thích dài, chỉ cần quyết định + lý do 1-2 câu):
>
> 1. Microservices (Laravel + Python tách biệt) hay Monolith? Tại sao phù hợp với AI-IA?
> 2. Laravel Sanctum (Bearer token) hay JWT tự quản lý? Tại sao?
> 3. Lưu file hóa đơn (PDF/ảnh) ở đâu? MinIO signed URL hay public URL? Tại sao quan trọng với tài liệu tài chính?
> 4. Soft delete hay Hard delete cho bảng `invoices`? Ảnh hưởng đến audit trail như thế nào?
> 5. Flutter polling `GET /invoices/{id}/status` hay WebSocket để theo dõi trạng thái xử lý AI? Ưu nhược điểm mỗi cách?

### Buổi sau
**Buổi 2:** Thiết kế DB (Phần 1) — Vẽ ER図 hoàn chỉnh cho hệ thống AI-IA
