# Buổi 3 — Thiết kế DB (Phần 2): テーブル定義書 & Index Strategy

---

## Slide 1: Mục tiêu buổi học

### Sau buổi này bạn sẽ biết
- Viết テーブル定義書 (Table Definition) đạt chuẩn Nhật Bản
- Thiết kế Index đúng chỗ cho hệ thống 100,000+ hóa đơn — không thừa, không thiếu
- Định nghĩa Constraint, Foreign Key, Default Value
- Thiết kế bảng Master Data (suppliers, account_code_mapping)
- Viết Migration Script chuẩn

### Ôn tập buổi 2
> **Quiz:** Tại sao dùng `TIMESTAMPTZ` thay vì `TIMESTAMP`?
> Khi nào hóa đơn chuyển sang trạng thái `NEEDS_REVIEW` thay vì `COMPLETED`?

---

## Slide 2: テーブル定義書 — Cấu trúc chuẩn

### Mỗi bảng cần có

```
テーブル名:     invoices
論理名:        請求書
説明:          アップロードされた請求書ファイルのメタデータとAI処理状態を保持する
スキーマ:      public
レコード見込み: 月間500件、年間6,000件 → 5年で30,000件以上
主キー:        id (UUID)
ソートデフォルト: created_at DESC
インデックス:   (status, created_at), (user_id, status)
備考:          deleted_atがNULLのものが有効レコード。ステータスは6種類。
```

### Format chuẩn cho mỗi column

| # | 物理名 | 論理名 | 型 | 桁数 | NULL | DEFAULT | 説明 | 備考 |
|---|--------|--------|-----|------|------|---------|------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | 主キー | PK |
| 2 | status | ステータス | VARCHAR | 20 | NOT NULL | 'UPLOADED' | AI処理状態 | 6値 |

---

## Slide 3: テーブル定義書 — users

### テーブル名: users | 論理名: ユーザー

```
説明:    システムにアクセスする全ユーザー（会計士・レビュアー・管理者）の認証情報と属性
用途:    認証、権限管理、請求書アップロード者の管理
見込み:  初期30件 → 年間+5件
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | CHECK | 説明 |
|---|--------|--------|-----|--------|------|---------|-------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | — | PK |
| 2 | email | メール | VARCHAR | 254 | NOT NULL | — | RFC5321準拠 | UNIQUE |
| 3 | name | 氏名 | VARCHAR | 100 | NOT NULL | — | — | 姓名フルネーム |
| 4 | password_hash | PW_HASH | VARCHAR | 255 | NOT NULL | — | — | bcrypt |
| 5 | role | 権限 | VARCHAR | 20 | NOT NULL | 'accountant' | IN ('accountant','reviewer','admin') | |
| 6 | department | 部署 | VARCHAR | 100 | NULL | — | — | 部署名 |
| 7 | is_active | 有効フラグ | BOOLEAN | — | NOT NULL | TRUE | — | FALSE=退職 |
| 8 | login_failure_count | ログイン失敗数 | SMALLINT | — | NOT NULL | 0 | >=0 | 5回でロック |
| 9 | locked_until | ロック解除日時 | TIMESTAMPTZ | — | NULL | — | — | NULL=ロックなし |
| 10 | last_login_at | 最終ログイン | TIMESTAMPTZ | — | NULL | — | — | |
| 11 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | — | |
| 12 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | — | 自動更新 |
| 13 | deleted_at | 削除日時 | TIMESTAMPTZ | — | NULL | — | — | NULL=有効 |

**INDEX:**
```
idx_users_email         UNIQUE ON (email) WHERE deleted_at IS NULL
idx_users_role          ON (role) WHERE deleted_at IS NULL AND is_active = TRUE
```

---

## Slide 4: テーブル定義書 — invoices

### テーブル名: invoices | 論理名: 請求書

```
説明:    アップロードされた請求書ファイルのメタデータとAI処理状態
用途:    請求書の登録・AI処理追跡・ステータス管理
見込み:  月間500件 → 年間6,000件 → 5年で30,000件以上
注意:    MinIOにファイル本体を保存、このテーブルはメタデータのみ
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | CHECK | 説明 |
|---|--------|--------|-----|--------|------|---------|-------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | — | PK |
| 2 | user_id | アップロード者ID | UUID | — | NOT NULL | — | — | FK→users |
| 3 | batch_id | バッチID | UUID | — | NULL | — | — | FK→processing_batches |
| 4 | file_path | ファイルパス | VARCHAR | 500 | NOT NULL | — | — | MinIOオブジェクトキー |
| 5 | file_type | ファイル種別 | VARCHAR | 10 | NOT NULL | — | IN('IMAGE','PDF') | |
| 6 | original_filename | 元ファイル名 | VARCHAR | 255 | NOT NULL | — | — | 表示用のみ |
| 7 | file_size_bytes | ファイルサイズ | INTEGER | — | NOT NULL | — | >0 | バイト単位 |
| 8 | status | ステータス | VARCHAR | 20 | NOT NULL | 'UPLOADED' | IN('UPLOADED','QUEUED','PROCESSING','COMPLETED','FAILED','NEEDS_REVIEW') | AI処理状態 |
| 9 | retry_count | リトライ回数 | SMALLINT | — | NOT NULL | 0 | >=0 AND <=3 | 最大3回 |
| 10 | error_message | エラー内容 | TEXT | — | NULL | — | — | FAILED時のみ |
| 11 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | — | |
| 12 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | — | |
| 13 | deleted_at | 削除日時 | TIMESTAMPTZ | — | NULL | — | — | NULL=有効 |

**INDEX — 大量データへの対策:**
```
idx_invoices_status_created   ON (status, created_at DESC)
                              → ステータス別一覧、処理待ち件数確認
idx_invoices_user_status      ON (user_id, status)
                              → 自分の請求書一覧
idx_invoices_batch            ON (batch_id) WHERE batch_id IS NOT NULL
                              → バッチ進捗確認
```

> **先生の強調点 (大量データ):** 100,000件超えた時に `WHERE status = 'NEEDS_REVIEW'` が遅くなる。
> `(status, created_at)` の複合インデックスは必須。単独の `status` インデックスより効率的。

---

## Slide 5: テーブル定義書 — invoice_extracted_data

### テーブル名: invoice_extracted_data | 論理名: 請求書抽出データ

```
説明:    AIが請求書から抽出したデータと信頼スコア
用途:    AI結果の確認・修正・会計仕訳への入力
見込み:  invoicesと1:1 (COMPLETED/NEEDS_REVIEWのみ存在)
注意:    物理削除なし。confidence_scoreによりステータス分岐。
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | 説明 |
|---|--------|--------|-----|--------|------|---------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | PK |
| 2 | invoice_id | 請求書ID | UUID | — | NOT NULL | — | FK→invoices UNIQUE |
| 3 | supplier_name | 仕入先名 | VARCHAR | 255 | NULL | — | AI抽出値 |
| 4 | supplier_id | 仕入先ID | UUID | — | NULL | — | FK→suppliers マッチング後 |
| 5 | invoice_date | 請求書日付 | DATE | — | NULL | — | AI抽出値 |
| 6 | invoice_number | 請求書番号 | VARCHAR | 100 | NULL | — | AI抽出値 |
| 7 | total_amount | 合計金額 | NUMERIC | 15,2 | NULL | — | AI抽出値 |
| 8 | tax_amount | 消費税額 | NUMERIC | 15,2 | NULL | — | AI抽出値 |
| 9 | currency | 通貨 | VARCHAR | 3 | NOT NULL | 'JPY' | ISO 4217 |
| 10 | confidence_score | 信頼スコア | NUMERIC | 5,4 | NOT NULL | — | 0.0000〜1.0000 |
| 11 | ai_model_version | AIモデルバージョン | VARCHAR | 50 | NOT NULL | — | 例: layoutlmv3-v1.2 |
| 12 | raw_extraction | 生抽出データ | JSONB | — | NULL | — | AI生出力を保存 |
| 13 | reviewed_by | レビュー者ID | UUID | — | NULL | — | FK→users |
| 14 | reviewed_at | レビュー日時 | TIMESTAMPTZ | — | NULL | — | |
| 15 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |
| 16 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |

**INDEX:**
```
idx_extracted_invoice     UNIQUE ON (invoice_id)
idx_extracted_confidence  ON (confidence_score) WHERE confidence_score < 0.85
                          → NEEDS_REVIEW一覧の高速取得
idx_extracted_supplier    ON (supplier_id) WHERE supplier_id IS NOT NULL
```

**CHECK CONSTRAINT:**
```sql
CONSTRAINT chk_confidence_range CHECK (confidence_score >= 0 AND confidence_score <= 1),
CONSTRAINT chk_tax_not_exceed CHECK (tax_amount IS NULL OR total_amount IS NULL
  OR tax_amount <= total_amount)
```

---

## Slide 6: テーブル定義書 — journal_entries

### テーブル名: journal_entries | 論理名: 仕訳

```
説明:    AIが提案した仕訳（借方・貸方の会計仕訳）と承認情報
用途:    仕訳の確認・修正・承認・会計ソフト連携
見込み:  請求書1枚あたり1〜3件、月間500〜1,500件
注意:    物理削除なし。会計帳簿として永久保存。
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | 説明 |
|---|--------|--------|-----|--------|------|---------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | PK |
| 2 | invoice_id | 請求書ID | UUID | — | NOT NULL | — | FK→invoices |
| 3 | debit_account_code | 借方勘定科目 | VARCHAR | 10 | NOT NULL | — | 例: '5101' |
| 4 | debit_account_name | 借方科目名 | VARCHAR | 100 | NOT NULL | — | 例: '仕入高' |
| 5 | credit_account_code | 貸方勘定科目 | VARCHAR | 10 | NOT NULL | — | 例: '2101' |
| 6 | credit_account_name | 貸方科目名 | VARCHAR | 100 | NOT NULL | — | 例: '買掛金' |
| 7 | amount | 金額 | NUMERIC | 15,2 | NOT NULL | — | CHECK > 0 |
| 8 | description | 摘要 | VARCHAR | 500 | NULL | — | 取引内容 |
| 9 | is_ai_suggested | AI提案フラグ | BOOLEAN | — | NOT NULL | TRUE | FALSE=手動入力 |
| 10 | approved_by | 承認者ID | UUID | — | NULL | — | FK→users |
| 11 | approved_at | 承認日時 | TIMESTAMPTZ | — | NULL | — | |
| 12 | created_by | 作成者ID | UUID | — | NOT NULL | — | FK→users |
| 13 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |
| 14 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |

**INDEX:**
```
idx_journal_invoice       ON (invoice_id)
idx_journal_approved      ON (approved_by, approved_at DESC) WHERE approved_by IS NOT NULL
idx_journal_unapproved    ON (created_at DESC) WHERE approved_by IS NULL
                          → 未承認仕訳の一覧取得
```

---

## Slide 7: テーブル定義書 — audit_logs

### テーブル名: audit_logs | 論理名: 監査ログ

```
説明:    システム上の重要操作を全て記録する監査証跡（財務システム必須）
用途:    セキュリティ監査、不正アクセス調査、コンプライアンス
見込み:  1日約200件 → 年間73,000件
保持期間: 7年（税務調査対応のため物理削除なし）
注意:    INSERTのみ。UPDATE/DELETEは行わない
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | 説明 |
|---|--------|--------|-----|--------|------|------|
| 1 | id | ID | UUID | — | NOT NULL | PK |
| 2 | user_id | 操作者ID | UUID | — | NULL | NULL=システム自動処理(AI Worker) |
| 3 | action | 操作種別 | VARCHAR | 50 | NOT NULL | UPLOAD/APPROVE/REJECT/MODIFY/LOGIN/LOGOUT等 |
| 4 | target_type | 対象テーブル | VARCHAR | 50 | NOT NULL | 'invoices', 'journal_entries', etc. |
| 5 | target_id | 対象レコードID | UUID | — | NULL | 対象レコードのID |
| 6 | old_value | 変更前 | JSONB | — | NULL | UPDATE時の変更前の値 |
| 7 | new_value | 変更後 | JSONB | — | NULL | UPDATE時の変更後の値 |
| 8 | ip_address | IPアドレス | INET | — | NULL | リクエスト元IP |
| 9 | user_agent | ユーザーエージェント | VARCHAR | 500 | NULL | Flutterアプリ情報 |
| 10 | result | 結果 | VARCHAR | 10 | NOT NULL | 'SUCCESS', 'FAILURE' |
| 11 | error_detail | エラー詳細 | TEXT | — | NULL | FAILURE時のエラー内容 |
| 12 | created_at | 発生日時 | TIMESTAMPTZ | — | NOT NULL | NOW() |

**INDEX:**
```
idx_audit_user       ON (user_id, created_at DESC)
idx_audit_target     ON (target_type, target_id, created_at DESC)
idx_audit_action     ON (action, created_at DESC)
idx_audit_created    ON (created_at DESC)  ← パーティション検討用
```

**設計メモ:**
> 財務システムのため監査ログは7年保持義務。
> `old_value`と`new_value`はJSONB型で変更箇所のみ記録。
> 例: invoiceのstatus変更時
> `old_value = {"status": "QUEUED"}`, `new_value = {"status": "PROCESSING"}`

---

## Slide 8: テーブル定義書 — suppliers (Master Data)

### テーブル名: suppliers | 論理名: 仕入先マスタ

```
説明:    取引先（請求書発行元）のマスタデータ。AIが仕入先を特定した際に照合。
用途:    AI抽出結果の仕入先マッチング、デフォルト勘定科目の自動設定
見込み:  初期100件 → 年間+20件
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | 説明 |
|---|--------|--------|-----|--------|------|---------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | PK |
| 2 | name | 仕入先名 | VARCHAR | 255 | NOT NULL | — | UNIQUE |
| 3 | tax_id | 法人番号/インボイス番号 | VARCHAR | 20 | NULL | — | UNIQUE WHERE NOT NULL |
| 4 | default_debit_code | デフォルト借方科目 | VARCHAR | 10 | NULL | — | 例: '5101' |
| 5 | default_credit_code | デフォルト貸方科目 | VARCHAR | 10 | NULL | — | 例: '2101' |
| 6 | name_aliases | 名称エイリアス | TEXT[] | — | NULL | — | AI照合用の別名リスト |
| 7 | is_active | 有効フラグ | BOOLEAN | — | NOT NULL | TRUE | |
| 8 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |
| 9 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |
| 10 | deleted_at | 削除日時 | TIMESTAMPTZ | — | NULL | — | NULL=有効 |

**INDEX:**
```
idx_suppliers_name     UNIQUE ON (name) WHERE deleted_at IS NULL
idx_suppliers_tax_id   UNIQUE ON (tax_id) WHERE deleted_at IS NULL AND tax_id IS NOT NULL
```

---

## Slide 9: Index Strategy — いつ、どこに貼るか (大量データ対策)

### Indexを貼るべき場所

| 条件 | Index が有効 | 例 |
|------|------------|-----|
| WHERE句で頻繁に使われる | ✅ | `WHERE status = 'NEEDS_REVIEW'` |
| JOIN条件に使われる | ✅ | `ON invoices.id = invoice_extracted_data.invoice_id` |
| ORDER BY に使われる | ✅ | `ORDER BY created_at DESC` |
| UNIQUE制約が必要 | ✅ | `email`, `invoice_id`(1:1) |
| 高カーディナリティ列 | ✅ | UUID, email |
| 低カーディナリティ列 | ❌ | boolean flag (2値のみ → full scan が速い場合も) |
| 更新が非常に多い列 | ❌ | `retry_count` (頻繁にUPDATE) |

### AI-IA 特有の重要インデックス設計

```sql
-- 最重要: ステータス別件数確認 + ページネーション
-- 100,000件超の invoices テーブルで必須
CREATE INDEX idx_invoices_status_created
  ON invoices (status, created_at DESC)
  WHERE deleted_at IS NULL;

-- ユーザー別請求書一覧 (Flutter アプリのメイン画面)
CREATE INDEX idx_invoices_user_status
  ON invoices (user_id, status)
  WHERE deleted_at IS NULL;

-- NEEDS_REVIEW 専用: レビュー待ち件数の高速取得
CREATE INDEX idx_extracted_needs_review
  ON invoice_extracted_data (confidence_score)
  WHERE confidence_score < 0.85;

-- 未承認仕訳の一覧 (Reviewerのダッシュボード)
CREATE INDEX idx_journal_pending_approval
  ON journal_entries (created_at DESC)
  WHERE approved_by IS NULL;
```

### Partial Index — 無効レコードを除外する

```sql
-- 論理削除されていないレコードのみインデックス
CREATE INDEX idx_invoices_active
  ON invoices (status, user_id)
  WHERE deleted_at IS NULL;
```

> **先生の強調点 (大量データ):** 5年後に30,000件を超えたとき、
> `(status, created_at)` の複合インデックスがないと
> ダッシュボードの「処理待ち件数」表示が秒単位で遅延する。
> **インデックスは最初から設計に入れること。**

---

## Slide 10: Migration Script — 書き方の基本

### Migration とは？
> DB スキーマの変更を**バージョン管理**する仕組み
> ファイル名に番号 + 説明 → 順番に実行

### ファイル命名規則
```
V001__create_users_table.sql
V002__create_suppliers_table.sql
V003__create_account_code_mapping_table.sql
V004__create_processing_batches_table.sql
V005__create_invoices_table.sql
V006__create_invoice_extracted_data_table.sql
V007__create_journal_entries_table.sql
V008__create_audit_logs_table.sql
V009__create_notification_logs_table.sql
V010__create_indexes.sql
V011__insert_master_data.sql
```

### Migration Script サンプル

```sql
-- V005__create_invoices_table.sql

BEGIN;

CREATE TABLE invoices (
  id               UUID         NOT NULL DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL,
  batch_id         UUID,
  file_path        VARCHAR(500) NOT NULL,
  file_type        VARCHAR(10)  NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size_bytes  INTEGER      NOT NULL CHECK (file_size_bytes > 0),
  status           VARCHAR(20)  NOT NULL DEFAULT 'UPLOADED',
  retry_count      SMALLINT     NOT NULL DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 3),
  error_message    TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,

  CONSTRAINT pk_invoices PRIMARY KEY (id),
  CONSTRAINT fk_invoices_user FOREIGN KEY (user_id)
    REFERENCES users(id),
  CONSTRAINT fk_invoices_batch FOREIGN KEY (batch_id)
    REFERENCES processing_batches(id),
  CONSTRAINT chk_invoices_file_type CHECK (
    file_type IN ('IMAGE', 'PDF')
  ),
  CONSTRAINT chk_invoices_status CHECK (
    status IN ('UPLOADED','QUEUED','PROCESSING','COMPLETED','FAILED','NEEDS_REVIEW')
  )
);

-- 複合インデックス (大量データ対策 — 必須)
CREATE INDEX idx_invoices_status_created
  ON invoices (status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_user_status
  ON invoices (user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_batch
  ON invoices (batch_id)
  WHERE batch_id IS NOT NULL;

-- Auto-update updated_at trigger
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## Slide 11: Master Data Design — account_code_mapping

### テーブル名: account_code_mapping | 論理名: 勘定科目マッピング

```
説明:    キーワードから勘定科目コードへのマッピング。AIが仕訳を提案する際に使用。
用途:    AI仕訳提案の精度向上、会社固有のルールを反映
見込み:  初期50件 → 年間+10件
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | 説明 |
|---|--------|--------|-----|--------|------|---------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | PK |
| 2 | keyword | キーワード | VARCHAR | 100 | NOT NULL | — | 例: '電気代', '通信費' |
| 3 | account_code | 勘定科目コード | VARCHAR | 10 | NOT NULL | — | 例: '6100' |
| 4 | account_name | 勘定科目名 | VARCHAR | 100 | NOT NULL | — | 例: '水道光熱費' |
| 5 | account_type | 科目種別 | VARCHAR | 10 | NOT NULL | — | 'debit' or 'credit' |
| 6 | priority | 優先順位 | SMALLINT | — | NOT NULL | 0 | 低い値が高優先 |
| 7 | is_active | 有効フラグ | BOOLEAN | — | NOT NULL | TRUE | |
| 8 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |
| 9 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |

**初期データ (INSERT):**
```sql
INSERT INTO account_code_mapping (keyword, account_code, account_name, account_type, priority) VALUES
  ('電気代', '6100', '水道光熱費', 'debit', 1),
  ('水道代', '6100', '水道光熱費', 'debit', 1),
  ('ガス代', '6100', '水道光熱費', 'debit', 1),
  ('通信費', '6200', '通信費', 'debit', 1),
  ('インターネット', '6200', '通信費', 'debit', 2),
  ('交通費', '6300', '旅費交通費', 'debit', 1),
  ('消耗品', '6400', '消耗品費', 'debit', 1),
  ('買掛金', '2101', '買掛金', 'credit', 1);
```

---

## Slide 12: Thực hành tại lớp (30 phút)

### Bài tập — Viết テーブル定義書 cho processing_batches

**Yêu cầu (từ Case Study):**
- Kế toán viên có thể upload nhiều hóa đơn cùng lúc (batch upload)
- Cần theo dõi tiến trình: đã xử lý bao nhiêu, lỗi bao nhiêu
- Hiển thị thanh tiến trình trên Flutter app
- Liên kết với user tạo batch và với từng invoice trong batch

**Nhiệm vụ:**
1. Viết đầy đủ テーブル定義書 theo format chuẩn
2. Xác định INDEX cần thiết
3. Viết Migration Script CREATE TABLE
4. Quyết định: Cần Soft Delete không? Tại sao?
5. Tính phần trăm hoàn thành: `completed_count / total_count` — lưu trong DB hay tính runtime?

---

## Slide 13: Tóm tắt buổi 3 & Bài tập về nhà

### Tóm tắt
- テーブル定義書 cần đầy đủ: type, size, null, default, check, foreign key
- Đặt tên column nhất quán: snake_case, `_at` cho timestamp, `_id` cho FK
- **Index quan trọng nhất cho AI-IA:** `(status, created_at)` composite index trên bảng `invoices`
- `confidence_score` dùng NUMERIC(5,4) — không dùng FLOAT (lỗi làm tròn)
- Migration Script phải có `BEGIN/COMMIT` và idempotent

### Bài tập về nhà
> Hoàn thiện テーブル定義書 cho tất cả 9 bảng:
>
> - Bảng đã làm tại lớp: `processing_batches`
> - Bảng còn lại cần hoàn chỉnh: `notification_logs`, `suppliers` (với `name_aliases` TEXT[]), `account_code_mapping`
> - Viết Migration Script cho `invoice_extracted_data` với đầy đủ constraint
>
> Với mỗi bảng cần có: Column list đầy đủ + INDEX definition

### Buổi sau
**Buổi 4:** Thiết kế màn hình — Wireframe & 画面仕様書
