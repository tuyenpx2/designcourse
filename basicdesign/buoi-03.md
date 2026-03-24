# Buổi 3 — Thiết kế DB (Phần 2): テーブル定義書 & Index Strategy

---

## Slide 1: Mục tiêu buổi học

### Sau buổi này bạn sẽ biết
- Viết テーブル定義書 (Table Definition) đạt chuẩn Nhật Bản
- Thiết kế Index đúng chỗ — không thừa, không thiếu
- Định nghĩa Constraint, Foreign Key, Default Value
- Thiết kế bảng ENUM và Master Data
- Viết Migration Script chuẩn

### Ôn tập buổi 2
> **Quiz:** Tại sao dùng `TIMESTAMPTZ` thay vì `TIMESTAMP`?
> Khi nào dùng Soft Delete? Cho ví dụ 2 bảng không cần Soft Delete.

---

## Slide 2: テーブル定義書 — Cấu trúc chuẩn

### Mỗi bảng cần có

```
テーブル名:     equipment
論理名:        機器
説明:          社内で管理する貸出可能な機器情報を保持する
スキーマ:      public
レコード見込み: 初期500件、年間+50件
主キー:        id (UUID)
ソートデフォルト: created_at DESC
インデックス:   (別表参照)
備考:          deleted_atがNULLのものが有効レコード
```

### Format chuẩn cho mỗi column

| # | 物理名 | 論理名 | 型 | 桁数 | NULL | DEFAULT | 説明 | 備考 |
|---|--------|--------|-----|------|------|---------|------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | 主キー | PK |
| 2 | name | 機器名 | VARCHAR | 200 | NOT NULL | — | 機器の正式名称 | |

---

## Slide 3: テーブル定義書 — users

### テーブル名: users | 論理名: ユーザー

```
説明:    システムにアクセスする全ユーザー（社員）の認証情報と属性
用途:    認証、権限管理、貸出申請の申請者管理
見込み:  初期250件 → 年間+30件
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | CHECK | 説明 |
|---|--------|--------|-----|--------|------|---------|-------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | — | PK |
| 2 | email | メール | VARCHAR | 254 | NOT NULL | — | RFC5321準拠 | UNIQUE |
| 3 | name | 氏名 | VARCHAR | 100 | NOT NULL | — | — | 姓名フルネーム |
| 4 | password_hash | PW_HASH | VARCHAR | 255 | NOT NULL | — | — | bcrypt |
| 5 | role | 権限 | VARCHAR | 20 | NOT NULL | 'user' | IN ('user','admin') | |
| 6 | department_id | 部署ID | UUID | — | NULL | — | — | FK→departments |
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
idx_users_department    ON (department_id) WHERE deleted_at IS NULL
idx_users_role          ON (role) WHERE deleted_at IS NULL
```

---

## Slide 4: テーブル定義書 — equipment

### テーブル名: equipment | 論理名: 機器

```
説明:    貸出管理対象の全機器情報
用途:    機器の登録・管理・貸出可否確認
見込み:  初期500件 → 年間+50件
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | CHECK | 説明 |
|---|--------|--------|-----|--------|------|---------|-------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | — | PK |
| 2 | name | 機器名 | VARCHAR | 200 | NOT NULL | — | — | 例: MacBook Pro 14" |
| 3 | category_id | カテゴリID | UUID | — | NOT NULL | — | — | FK→categories |
| 4 | status | ステータス | VARCHAR | 20 | NOT NULL | 'AVAILABLE' | IN ('AVAILABLE','RESERVED','BORROWED','MAINTENANCE','DISPOSED') | |
| 5 | serial_no | シリアル番号 | VARCHAR | 100 | NULL | — | — | UNIQUE(論理削除除く) |
| 6 | asset_code | 資産管理番号 | VARCHAR | 50 | NULL | — | — | 社内管理番号 |
| 7 | purchase_date | 購入日 | DATE | — | NULL | — | — | |
| 8 | purchase_price | 購入金額 | NUMERIC | 12,0 | NULL | — | >=0 | 円 |
| 9 | location | 保管場所 | VARCHAR | 100 | NULL | — | — | 例: 東京オフィス3F |
| 10 | notes | 備考 | TEXT | — | NULL | — | — | 特記事項 |
| 11 | version | バージョン | INTEGER | — | NOT NULL | 0 | >=0 | 楽観ロック用 |
| 12 | created_by | 登録者ID | UUID | — | NOT NULL | — | — | FK→users |
| 13 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | — | |
| 14 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | — | |
| 15 | deleted_at | 削除日時 | TIMESTAMPTZ | — | NULL | — | — | NULL=有効 |

**INDEX:**
```
idx_equipment_category   ON (category_id, status) WHERE deleted_at IS NULL
idx_equipment_status     ON (status) WHERE deleted_at IS NULL
idx_equipment_serial     UNIQUE ON (serial_no) WHERE deleted_at IS NULL AND serial_no IS NOT NULL
```

---

## Slide 5: テーブル定義書 — applications

### テーブル名: applications | 論理名: 貸出申請

```
説明:    機器の貸出申請・承認・返却の全フロー情報
用途:    貸出ワークフロー管理、履歴管理
見込み:  月間250件 → 年間3,000件 → 5年で15,000件
注意:    物理削除なし。ステータス遷移はapplication_status_historiesに記録
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | 説明 |
|---|--------|--------|-----|--------|------|---------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | PK |
| 2 | application_no | 申請番号 | VARCHAR | 20 | NOT NULL | — | UNIQUE, 自動採番 APP-YYYYMM-XXXXX |
| 3 | user_id | 申請者ID | UUID | — | NOT NULL | — | FK→users |
| 4 | equipment_id | 機器ID | UUID | — | NOT NULL | — | FK→equipment |
| 5 | status | ステータス | VARCHAR | 20 | NOT NULL | 'PENDING' | IN('PENDING','APPROVED','REJECTED','CANCELLED','BORROWED','RETURNED') |
| 6 | start_date | 貸出開始日 | DATE | — | NOT NULL | — | |
| 7 | return_date | 返却予定日 | DATE | — | NOT NULL | — | CHECK > start_date |
| 8 | actual_return_at | 実際返却日時 | TIMESTAMPTZ | — | NULL | — | 返却確認時に設定 |
| 9 | purpose | 利用目的 | VARCHAR | 500 | NOT NULL | — | |
| 10 | approved_by | 承認者ID | UUID | — | NULL | — | FK→users |
| 11 | approved_at | 承認日時 | TIMESTAMPTZ | — | NULL | — | |
| 12 | reject_reason | 却下理由 | TEXT | — | NULL | — | |
| 13 | is_overdue | 期限超過フラグ | BOOLEAN | — | NOT NULL | FALSE | バッチで更新 |
| 14 | overdue_notified_count | 超過通知回数 | SMALLINT | — | NOT NULL | 0 | |
| 15 | created_at | 申請日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |
| 16 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |

**INDEX:**
```
idx_applications_user        ON (user_id, status)
idx_applications_equipment   ON (equipment_id, status)
idx_applications_status      ON (status, return_date) WHERE status IN ('APPROVED','BORROWED')
idx_applications_overdue     ON (is_overdue, return_date) WHERE is_overdue = TRUE
idx_applications_no          UNIQUE ON (application_no)
```

**CHECK CONSTRAINT:**
```sql
CONSTRAINT chk_return_after_start CHECK (return_date > start_date),
CONSTRAINT chk_actual_return_after_start CHECK (
  actual_return_at IS NULL OR DATE(actual_return_at) >= start_date
)
```

---

## Slide 6: テーブル定義書 — audit_logs

### テーブル名: audit_logs | 論理名: 監査ログ

```
説明:    システム上の重要操作を全て記録する監査証跡
用途:    セキュリティ監査、不正アクセス調査、コンプライアンス
見込み:  1日約100件 → 年間36,500件
保持期間: 3年（保存義務のため物理削除なし）
注意:    INSERTのみ。UPDATE/DELETEは行わない
```

| # | 物理名 | 論理名 | 型 | サイズ | NULL | 説明 |
|---|--------|--------|-----|--------|------|------|
| 1 | id | ID | UUID | — | NOT NULL | PK |
| 2 | user_id | 操作者ID | UUID | — | NULL | NULL=システム自動処理 |
| 3 | action | 操作種別 | VARCHAR | 50 | NOT NULL | LOGIN/LOGOUT/CREATE/UPDATE/DELETE/APPROVE/REJECT/RETURN |
| 4 | target_type | 対象テーブル | VARCHAR | 50 | NOT NULL | 'equipment', 'applications', etc. |
| 5 | target_id | 対象レコードID | UUID | — | NULL | 対象レコードのID |
| 6 | old_value | 変更前 | JSONB | — | NULL | UPDATE時の変更前の値 |
| 7 | new_value | 変更後 | JSONB | — | NULL | UPDATE時の変更後の値 |
| 8 | ip_address | IPアドレス | INET | — | NULL | リクエスト元IP |
| 9 | user_agent | ユーザーエージェント | VARCHAR | 500 | NULL | ブラウザ情報 |
| 10 | result | 結果 | VARCHAR | 10 | NOT NULL | 'SUCCESS', 'FAILURE' |
| 11 | error_detail | エラー詳細 | TEXT | — | NULL | FAILURE時のエラー内容 |
| 12 | created_at | 発生日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | パーティション用 |

**INDEX:**
```
idx_audit_logs_user       ON (user_id, created_at DESC)
idx_audit_logs_target     ON (target_type, target_id, created_at DESC)
idx_audit_logs_action     ON (action, created_at DESC)
idx_audit_logs_created    ON (created_at DESC)  ← パーティション用
```

**設計メモ:**
> `old_value` と `new_value` は JSONB 型。
> 例: equipment の status 変更時
> `old_value = {"status": "AVAILABLE"}`, `new_value = {"status": "RESERVED"}`
> 全フィールドではなく変更箇所のみ記録する。

---

## Slide 7: Index Strategy — いつ、どこに貼るか

### Indexを貼るべき場所

| 条件 | Index が有効 | 例 |
|------|------------|-----|
| WHERE句で頻繁に使われる | ✅ | `WHERE status = 'AVAILABLE'` |
| JOIN条件に使われる | ✅ | `ON equipment.id = applications.equipment_id` |
| ORDER BY に使われる | ✅ | `ORDER BY created_at DESC` |
| UNIQUE制約が必要 | ✅ | `email`, `serial_no` |
| 高カーディナリティ列 | ✅ | UUID, email |
| 低カーディナリティ列 | ❌ | boolean flag (2値のみ → full scan が速い場合も) |
| 更新が非常に多い列 | ❌ | 書き込みオーバーヘッドが大きい |

### Partial Index — 無効レコードを除外する

```sql
-- 論理削除されていないレコードのみインデックス
CREATE INDEX idx_equipment_status
  ON equipment (status)
  WHERE deleted_at IS NULL;

-- 貸出中・予約済みのみインデックス (overdue確認用)
CREATE INDEX idx_apps_active
  ON applications (return_date, equipment_id)
  WHERE status IN ('APPROVED', 'BORROWED');
```

> **Partial Index は強力**: 対象レコードが全体の20%以下なら使う

---

## Slide 8: 採番ルール (Application Number)

### 申請番号の自動採番

**フォーマット:** `APP-YYYYMM-XXXXX`
- 例: `APP-202603-00001`, `APP-202603-00002`

**実装方針:**
```sql
-- シーケンス（月次リセット）はアプリ層で制御
-- DBには採番関数を用意する

CREATE SEQUENCE application_seq START 1 INCREMENT 1;

-- アプリ層で生成:
-- 'APP-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(nextval('application_seq')::TEXT, 5, '0')
```

**設計書への記載方法:**
```
採番ルール: APP-[年月6桁]-[連番5桁(月リセット)]
例: APP-202603-00001
管理方式: アプリケーション層で生成
シーケンス: application_seq (月次リセット)
```

---

## Slide 9: Migration Script — 書き方の基本

### Migration とは？
> DB スキーマの変更を**バージョン管理**する仕組み
> ファイル名に番号 + 説明 → 順番に実行

### ファイル命名規則
```
V001__create_departments_table.sql
V002__create_users_table.sql
V003__create_categories_table.sql
V004__create_equipment_table.sql
V005__create_applications_table.sql
V006__create_indexes.sql
V007__insert_master_data.sql
```

### Migration Script サンプル

```sql
-- V004__create_equipment_table.sql

BEGIN;

CREATE TABLE equipment (
  id            UUID        NOT NULL DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  category_id   UUID        NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  serial_no     VARCHAR(100),
  asset_code    VARCHAR(50),
  purchase_date DATE,
  purchase_price NUMERIC(12,0) CHECK (purchase_price >= 0),
  location      VARCHAR(100),
  notes         TEXT,
  version       INTEGER     NOT NULL DEFAULT 0,
  created_by    UUID        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT pk_equipment PRIMARY KEY (id),
  CONSTRAINT fk_equipment_category FOREIGN KEY (category_id)
    REFERENCES categories(id),
  CONSTRAINT fk_equipment_created_by FOREIGN KEY (created_by)
    REFERENCES users(id),
  CONSTRAINT chk_equipment_status CHECK (
    status IN ('AVAILABLE','RESERVED','BORROWED','MAINTENANCE','DISPOSED')
  )
);

-- Partial unique index for serial_no
CREATE UNIQUE INDEX idx_equipment_serial_no
  ON equipment (serial_no)
  WHERE deleted_at IS NULL AND serial_no IS NOT NULL;

-- Auto-update updated_at trigger
CREATE TRIGGER trg_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

---

## Slide 10: Master Data Design — Categories

### テーブル名: categories | 論理名: 機器カテゴリ

| # | 物理名 | 論理名 | 型 | サイズ | NULL | DEFAULT | 説明 |
|---|--------|--------|-----|--------|------|---------|------|
| 1 | id | ID | UUID | — | NOT NULL | gen_random_uuid() | PK |
| 2 | name | カテゴリ名 | VARCHAR | 100 | NOT NULL | — | UNIQUE |
| 3 | max_days | 最大貸出日数 | SMALLINT | — | NOT NULL | 14 | CHECK > 0 |
| 4 | max_per_user | 1人最大貸出数 | SMALLINT | — | NOT NULL | 1 | CHECK > 0 |
| 5 | requires_license | 免許確認必要 | BOOLEAN | — | NOT NULL | FALSE | 社用車用 |
| 6 | icon_name | アイコン名 | VARCHAR | 50 | NULL | — | UI表示用 |
| 7 | display_order | 表示順 | SMALLINT | — | NOT NULL | 0 | |
| 8 | is_active | 有効フラグ | BOOLEAN | — | NOT NULL | TRUE | |
| 9 | created_at | 作成日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |
| 10 | updated_at | 更新日時 | TIMESTAMPTZ | — | NOT NULL | NOW() | |

**初期データ (INSERT):**
```sql
INSERT INTO categories (name, max_days, max_per_user, requires_license, icon_name, display_order) VALUES
  ('PC・ノートPC', 14, 1, FALSE, 'laptop', 1),
  ('会議室備品', 5, 3, FALSE, 'projector', 2),
  ('社用車', 3, 1, TRUE, 'car', 3),
  ('モバイルWiFi', 7, 2, FALSE, 'wifi', 4),
  ('その他備品', 30, 3, FALSE, 'box', 5);
```

---

## Slide 11: Thực hành tại lớp (30 phút)

### Bài tập — Viết テーブル定義書 cho maintenance_records

**Yêu cầu (từ Case Study):**
- Ghi nhận khi thiết bị đưa đi bảo trì
- Thông tin cần lưu: mô tả vấn đề, ngày gửi đi, ngày nhận về, chi phí, đơn vị sửa chữa
- Có thể xem lịch sử bảo trì của từng thiết bị
- Liên kết với thiết bị và người ghi nhận

**Nhiệm vụ:**
1. Viết đầy đủ テーブル定義書 theo format chuẩn (tên, kiểu, NULL, DEFAULT, CHECK)
2. Xác định INDEX cần thiết
3. Viết Migration Script CREATE TABLE
4. Quyết định: Cần Soft Delete không? Tại sao?

---

## Slide 12: Tóm tắt buổi 3 & Bài tập về nhà

### Tóm tắt
- テーブル定義書 cần đầy đủ: type, size, null, default, check, foreign key
- Đặt tên column nhất quán: snake_case, `_at` cho timestamp, `_id` cho FK
- Partial Index mạnh hơn Full Index khi có điều kiện WHERE cố định
- Migration Script phải có `BEGIN/COMMIT` và idempotent

### Bài tập về nhà
> Hoàn thiện テーブル定義書 cho tất cả 10 bảng:
>
> - Bảng đã làm tại lớp: `maintenance_records`
> - Bảng còn lại cần hoàn chỉnh: `notifications`, `equipment_status_histories`, `application_status_histories`, `equipment_images`
>
> Với mỗi bảng cần có: Column list đầy đủ + INDEX definition

### Buổi sau
**Buổi 4:** Thiết kế màn hình — Wireframe & 画面仕様書
