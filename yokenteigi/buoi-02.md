# Buổi 2 — Cấu trúc tài liệu Yokenteigi

---

## Slide 1: Mục tiêu buổi học

### Sau buổi này bạn sẽ biết
- Cấu trúc chuẩn của một tài liệu Yokenteigi
- Mục đích và nội dung từng phần
- Cách điền template với dữ liệu thực tế
- Cách quản lý version và lịch sử thay đổi

### Ôn tập buổi 1
- Yokenteigi là gì?
- 3 loại yêu cầu chính là gì?
- Tại sao tài liệu Nhật cần định lượng?

---

## Slide 2: Bộ khung chuẩn — Nhìn tổng thể

```
要件定義書
│
├── 1. 文書概要          ← Meta thông tin về tài liệu
├── 2. システム概要       ← Giới thiệu hệ thống
├── 3. 業務フロー         ← Quy trình nghiệp vụ
├── 4. 機能要件           ← Yêu cầu chức năng (phần lớn nhất)
│   ├── 4.1 機能一覧
│   └── 4.2 機能詳細 (×N)
├── 5. 非機能要件         ← Yêu cầu phi chức năng
├── 6. 画面一覧・遷移図   ← Danh sách màn hình
├── 7. データ要件         ← Dữ liệu và DB
├── 8. 外部IF要件         ← Kết nối hệ thống ngoài
├── 9. 制約・前提条件     ← Ràng buộc
└── 10. 課題・未決事項    ← Vấn đề chưa giải quyết
```

---

## Slide 3: Phần 1 — 文書概要 (Document Overview)

### Mục đích
> Cho người đọc biết: tài liệu này là gì, dùng cho gì, phạm vi nào

### Nội dung cần có

**1.1 目的 (Mục đích)**
```
本文書は、○○システムの開発にあたり、
顧客が求める要件を明確に定義することを目的とする。
```

**1.2 適用範囲 (Phạm vi áp dụng)**
```
本文書は、○○システムのVersion 1.0に適用する。
対象外: モバイルアプリ版（次フェーズで対応予定）
```

**1.3 用語定義 (Định nghĩa thuật ngữ)**

| 用語 | 定義 |
|------|------|
| ユーザー | システムを利用するエンドユーザー |
| 管理者 | システムを管理・運用する担当者 |
| 注文 | 商品購入の申し込み行為 |

**1.4 参考文書 (Tài liệu tham chiếu)**

| No | 文書名 | バージョン | 備考 |
|----|--------|-----------|------|
| 1 | 要求仕様書 | v1.2 | 顧客提供 |
| 2 | 現行システム仕様書 | v3.0 | 社内文書 |

---

## Slide 4: Phần 1 — 改訂履歴 (Revision History)

### Bắt buộc có trong mọi tài liệu Nhật Bản

| バージョン | 改訂日 | 改訂者 | 改訂内容 |
|-----------|--------|--------|---------|
| 1.0 | 2026/03/01 | 山田太郎 | 初版作成 |
| 1.1 | 2026/03/10 | 山田太郎 | 第3章の業務フローを修正 |
| 1.2 | 2026/03/20 | 鈴木花子 | 非機能要件（5章）を追加 |
| 2.0 | 2026/04/01 | 山田太郎 | 顧客レビュー反映、全面改訂 |

### Quy tắc đặt version
- **x.0** = Thay đổi lớn (cấu trúc, phạm vi)
- **x.y** = Bổ sung, sửa nội dung
- **Draft** = Chưa được khách hàng approve

### Quy tắc đặt tên file
```
[ProjectCode]_要件定義書_v1.2_20260320.xlsx
EC001_要件定義書_v2.0_20260401.docx
```

---

## Slide 5: Phần 2 — システム概要 (System Overview)

### 2.1 システムの背景・目的
> Tại sao hệ thống này được xây dựng?

**Ví dụ:**
```
現状、受注管理は手作業で行っており、
月間XX件の受注処理に対して平均YY時間を要している。
本システムの導入により、処理時間をZZ%削減し、
入力ミスによるクレームをゼロにすることを目指す。
```

### 2.2 システム全体構成図
```
[ユーザー] ─── HTTPS ───> [Webサーバー]
                                │
                           [APサーバー]
                                │
                    ┌───────────┴──────────┐
               [DBサーバー]          [外部決済API]
               (PostgreSQL)          (Stripe)
```

### 2.3 利用者・ステークホルダー

| 区分 | 名称 | 人数 | 主な利用機能 |
|------|------|------|------------|
| エンドユーザー | 一般会員 | 約10,000人 | 商品検索、購入 |
| 社内ユーザー | 営業担当 | 50人 | 受注管理、顧客管理 |
| 管理者 | システム管理者 | 3人 | 全機能 |

---

## Slide 6: Phần 3 — 業務フロー (Business Flow)

### Tại sao cần vẽ 2 loại flow?

**現状業務フロー (As-Is)** = Quy trình hiện tại đang làm tay/hệ thống cũ
→ Giúp hiểu vấn đề, điểm đau

**新業務フロー (To-Be)** = Quy trình sau khi có hệ thống mới
→ Giúp xác định chính xác hệ thống cần hỗ trợ gì

### Ví dụ: Quy trình đặt hàng

**As-Is (hiện tại):**
```
Khách gọi điện → Nhân viên ghi tay → Nhập Excel →
→ Email cho kho → Kho xác nhận → Nhân viên gọi lại KH
(Thời gian: 30-60 phút)
```

**To-Be (sau hệ thống):**
```
Khách đặt online → Hệ thống validate → Gửi email KH + Kho →
→ Kho confirm → Hệ thống notify KH tự động
(Thời gian: < 5 phút)
```

---

## Slide 7: Cách vẽ 業務フロー chuẩn Nhật

### Ký hiệu chuẩn

| Ký hiệu | Hình | Ý nghĩa |
|---------|------|---------|
| Start/End | ○ (oval) | Bắt đầu / Kết thúc |
| Process | □ (rectangle) | Hành động, xử lý |
| Decision | ◇ (diamond) | Điều kiện rẽ nhánh |
| Document | 📄 | Tài liệu, form |
| Database | 🗄️ | Lưu trữ dữ liệu |
| Arrow | → | Luồng xử lý |

### Swimlane format (chuẩn Nhật)
```
│ 顧客          │ 営業担当       │ システム       │
│               │               │               │
│ [注文入力]─────────────────────>[受信・保存]   │
│               │               │      │        │
│               │          [通知]<──────┘        │
│               │      [在庫確認]                │
│               │           │                   │
│ [確認メール]<──────────────┘                   │
```

---

## Slide 8: Phần 4 — 機能要件 (Functional Requirements)

### 4.1 機能一覧 (Function List) — Bảng tổng hợp

| 機能ID | 機能名 | 概要 | 優先度 | 対象ユーザー | 画面ID | 備考 |
|--------|--------|------|--------|------------|--------|------|
| F001 | ログイン | IDとパスワードでの認証 | 必須 | 全ユーザー | S001 | |
| F002 | パスワードリセット | メール経由でPW再設定 | 必須 | 全ユーザー | S002 | |
| F003 | 商品検索 | キーワード・カテゴリ検索 | 必須 | 一般会員 | S010 | |
| F004 | お気に入り登録 | 商品をお気に入りに追加 | 推奨 | 一般会員 | S011 | |
| F005 | レビュー投稿 | 購入後にレビュー投稿 | 任意 | 一般会員 | S012 | 次フェーズ検討 |

### Quy tắc 優先度 (Priority)
- **必須 (Hisshu):** Bắt buộc có, không có thì không go-live
- **推奨 (Suishou):** Nên có, nhưng có thể trì hoãn
- **任意 (Nini):** Nice-to-have, làm nếu còn thời gian

---

## Slide 9: Phần 4.2 — 機能詳細 (Function Detail)

### Cấu trúc 1 trang mô tả chức năng

```
機能ID:  F003
機能名:  商品検索
概要:    ユーザーがキーワードまたはカテゴリで商品を検索する

【前提条件】
- ユーザーはシステムにアクセスできる状態であること
- 商品データがDBに登録されていること

【基本フロー】(Happy Path)
1. ユーザーが検索キーワードを入力する
2. ユーザーが「検索」ボタンをクリックする
3. システムがDBを検索する（応答時間：2秒以内）
4. システムが検索結果を一覧表示する（最大100件）
5. ユーザーが商品を選択して詳細画面へ遷移する

【代替フロー】(Alternative)
2a. ユーザーがカテゴリから選択する場合
    → 2a-1. カテゴリ一覧を表示
    → 2a-2. カテゴリ選択 → 手順3へ

【例外フロー】(Exception)
3a. 検索結果が0件の場合
    → 「該当する商品が見つかりませんでした」を表示
    → 関連キーワードを提案する
3b. DB接続エラーの場合
    → エラーメッセージ[ERR-DB-001]を表示
    → システム管理者にアラート送信

【入力条件】
- キーワード：文字列、1〜50文字、必須ではない

【出力】
- 商品一覧（商品名、価格、画像、評価）
- 件数表示「XX件の商品が見つかりました」

【バリデーション】
- 特殊文字（<>'"）は自動エスケープ
```

---

## Slide 10: Phần 5 — 非機能要件

### Template chuẩn

**5.1 性能要件 (Performance)**

| 項目 | 要件 | 測定条件 |
|------|------|---------|
| レスポンスタイム | 通常画面：3秒以内 | 同時接続100ユーザー時 |
| スループット | 100リクエスト/秒 | ピーク時 |
| 同時接続数 | 最大1,000ユーザー | — |
| バッチ処理 | 10万件/時間 | 夜間バッチ |

**5.2 可用性 (Availability)**

| 項目 | 要件 |
|------|------|
| 稼働率 | 99.9%以上（月次） |
| 計画停止 | 月1回、深夜2〜4時、事前通知あり |
| 障害復旧時間 | RTO：4時間以内、RPO：1時間以内 |

**5.3 セキュリティ (Security)**

| 項目 | 要件 |
|------|------|
| 通信暗号化 | TLS 1.2以上 |
| パスワード | bcryptハッシュ化、8文字以上、英数字記号混在 |
| セッション | 30分無操作でタイムアウト |
| 脆弱性 | OWASP Top10対策必須 |

---

## Slide 11: Phần 6-8 — Màn hình, Dữ liệu, Kết nối ngoài

### 6. 画面一覧 (Screen List)

| 画面ID | 画面名 | URL | 対象ユーザー | 関連機能 |
|--------|--------|-----|------------|---------|
| S001 | ログイン画面 | /login | 全員 | F001 |
| S010 | 商品検索画面 | /search | 会員 | F003 |
| S020 | 商品詳細画面 | /product/{id} | 会員 | F010 |

### 7. データ要件

| データ名 | 保持期間 | 件数見込み | 備考 |
|---------|---------|----------|------|
| 会員情報 | 退会後5年 | 初年度10,000件 | 個人情報 |
| 注文履歴 | 7年 | 年間50,000件 | 法的要件 |
| ログ | 90日 | — | セキュリティ監査用 |

### 8. 外部インターフェース要件

| 連携先 | 方式 | 方向 | 頻度 | 備考 |
|--------|------|------|------|------|
| Stripe（決済） | REST API | 送信 | 都度 | HTTPS |
| 配送会社API | REST API | 送受信 | 都度 | 要認証 |
| メールサーバー | SMTP | 送信 | イベント時 | — |

---

## Slide 12: Phần 9-10 — Ràng buộc và Vấn đề mở

### 9. 制約・前提条件

**制約条件 (Constraints)**
- 既存の基幹システム（SAP）との連携は本プロジェクト対象外
- データベースはPostgreSQLを使用すること（既存インフラの制約）
- 開発期間：2026年3月〜8月（6ヶ月）

**前提条件 (Assumptions)**
- 本番サーバーはAWSを使用する（顧客選定済み）
- 既存データの移行は別途移行計画書で定義する
- 外部API（Stripe）の仕様は変更されないと仮定する

### 10. 課題・未決事項管理表

| No | 課題内容 | 担当 | 期限 | 優先度 | ステータス |
|----|----------|------|------|--------|-----------|
| 1 | 同時接続数の上限（1000か2000か） | 山田 | 3/31 | 高 | 確認中 |
| 2 | モバイル対応の有無 | PM | 4/15 | 中 | 未着手 |
| 3 | ポイント機能の仕様詳細 | 鈴木 | 4/10 | 高 | 顧客回答待ち |

---

## Slide 13: Thực hành — Điền template

### Bài tập tại lớp (30 phút)

**Scenario:** Bạn là BA của dự án xây dựng hệ thống đặt lịch cắt tóc online.

**Khách hàng cung cấp:**
> "Tôi muốn có app để khách đặt lịch online, thợ cắt tóc xem được lịch, và tôi quản lý được doanh thu"

**Nhiệm vụ:**
1. Điền phần **1.2 適用範囲** — Xác định phạm vi hệ thống
2. Điền **2.3 利用者** — Liệt kê các loại người dùng
3. Viết **機能一覧** — Ít nhất 8 chức năng với ID, tên, mô tả, priority

---

## Slide 14: Tóm tắt buổi 2 & Bài tập về nhà

### Tóm tắt
- Tài liệu Yokenteigi có 10 phần chính, mỗi phần có mục đích riêng
- 改訂履歴 là bắt buộc — quản lý version nghiêm túc
- 機能詳細 cần có: 前提条件, 基本フロー, 代替フロー, 例外フロー
- 非機能要件 phải định lượng, có số liệu cụ thể

### Bài tập về nhà
> Tiếp tục với app đặt lịch cắt tóc từ bài tập tại lớp.
> Hoàn thiện:
> - 業務フロー: Vẽ As-Is (đặt lịch qua điện thoại) và To-Be (đặt lịch qua app)
> - 非機能要件: Điền đầy đủ 性能, 可用性, セキュリティ với số liệu cụ thể

### Buổi sau
**Buổi 3-4:** Kỹ thuật viết từng phần chi tiết — 業務フロー, 機能詳細, 非機能要件
