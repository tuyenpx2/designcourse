# Buổi 7 — Case Study (Phần 1): Tổng hợp thành Basic Design Document

---

## Slide 1: Mục tiêu buổi học

### Buổi 7-8 — Tổng hợp thực hành
> Kết hợp tất cả kiến thức từ buổi 1-6 thành một tài liệu 基本設計書 hoàn chỉnh

### Buổi 7 tập trung vào
- Review bài nộp từ buổi 6 (lỗi phổ biến)
- Tích hợp tất cả phần thành 1 tài liệu
- Kiểm tra traceability: Yokenteigi → Basic Design
- Phát hiện và lấp đầy các gap còn thiếu

### Agenda
```
0:00 - 0:20  宿題レビュー (Batch + Security)
0:20 - 0:50  トレーサビリティ確認 (機能要件の網羅性)
0:50 - 1:20  設計書の統合 & ギャップ分析
1:20 - 1:45  相互レビュー
```

---

## Slide 2: Lỗi phổ biến từ bài nộp buổi 6

### Lỗi 1: Batch thiếu Idempotency

**❌ Thiếu:**
```
STEP 3: overdue_notified_count を +1 する
```

**✅ Đầy đủ — cần đảm bảo không gửi trùng:**
```
STEP 3: 通知ルールに基づきカウントが更新される場合のみ送信
  条件: 超過日数 ∈ {1, 3, 7} AND overdue_notified_count < 目標回数
  → 同じ超過日数で2回実行されても、2回目は送信しない
  実装: overdue_notified_count の値と超過日数のマッピングで判断
```

---

### Lỗi 2: Rate Limiting — Lưu state sai chỗ

**❌ Thiếu — lưu trong memory:**
```
Rate limit: 1リクエスト/秒 をメモリに保存
```

**❌ Vấn đề:** Server restart → mất state. Multi-instance → không đồng bộ.

**✅ Đúng:**
```
Rate Limit の状態は Redis に保存する:
  Key: rate_limit:{ip}:{endpoint}
  Value: リクエスト回数
  TTL:  ウィンドウ時間 (60秒)

実装例 (Sliding Window):
  INCR key → 回数を加算
  EXPIRE key 60 → 60秒後に自動リセット
  回数 > 閾値 → 429 Too Many Requests を返す
```

---

### Lỗi 3: Security — Thiếu CORS設定

**Phần hay bị bỏ quên:**
```
CORS設定 (Cross-Origin Resource Sharing):

社内システムのため、外部オリジンからのアクセスは禁止

設定:
  Access-Control-Allow-Origin: https://internal.company.co.jp
  Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Allow-Credentials: true
  Access-Control-Max-Age: 86400

※ wildcard (*) は絶対に使わない
```

---

## Slide 3: Traceability Check — Yokenteigi → Basic Design

### Mục đích
> Đảm bảo mọi yêu cầu trong Yokenteigi đều được phản ánh trong Basic Design

### Cách kiểm tra

| Step | Hành động |
|------|---------|
| 1 | Mở 機能一覧 từ Yokenteigi |
| 2 | Với mỗi 機能ID, xác nhận có đối ứng trong Basic Design |
| 3 | Đánh dấu phần đã có / chưa có |
| 4 | Lấp đầy gap |

---

### Traceability Matrix — Hệ thống thiết bị

| 機能ID | 機能名 | DB Table | API | 画面 | Batch | 備考 |
|--------|--------|---------|-----|------|-------|------|
| F001 | ログイン | users | POST /auth/login | S001 | — | ✅ |
| F002 | ログアウト | — | POST /auth/logout | — | — | ✅ |
| F003 | PW変更 | users | PUT /auth/password | S002 | — | ✅ |
| F004 | アカウント管理 | users, departments | GET/POST/PUT /admin/users | S120 | — | ✅ |
| F010 | 機器登録 | equipment | POST /admin/equipment | S101 | — | ✅ |
| F011 | 機器編集 | equipment | PUT /admin/equipment/{id} | S101 | — | ✅ |
| F012 | 機器廃棄 | equipment (soft) | DELETE /admin/equipment/{id} | S100 | — | ✅ |
| F013 | カテゴリ管理 | categories | GET/POST/PUT /admin/categories | S121 | — | ⚠️ S121未定義 |
| F014 | ステータス手動変更 | equipment | PATCH /admin/equipment/{id}/status | S101 | — | ✅ |
| F015 | CSV一括インポート | equipment | POST /admin/equipment/import | S102 | — | ✅ |
| F020 | 機器一覧 | equipment | GET /equipment | S020 | — | ✅ |
| F021 | 機器詳細 | equipment | GET /equipment/{id} | S021 | — | ✅ |
| F022 | 空き確認 | applications | (GET /equipmentに含む) | S020 | — | ✅ |
| F030 | 貸出申請 | applications | POST /applications | S030-S032 | — | ✅ |
| F031 | 申請一覧(自分) | applications | GET /my/applications | S040 | — | ✅ |
| F032 | 申請キャンセル | applications | DELETE /my/applications/{id} | S041 | — | ✅ |
| F033 | 申請一覧(全体) | applications | GET /admin/applications | S110 | — | ✅ |
| F034 | 申請承認 | applications, equipment | POST .../approve | S111 | — | ✅ |
| F035 | 申請却下 | applications | POST .../reject | S111 | — | ✅ |
| F040 | 返却申請 | applications | POST .../return | S042 | — | ✅ |
| F041 | 返却確認 | applications, equipment | POST .../confirm-return | S111 | — | ✅ |
| F042 | 返却期限延長申請 | applications | POST .../extend | S041 | — | ⚠️ API未定義 |
| F043 | 延長承認 | applications | POST .../approve-extend | S111 | — | ⚠️ API未定義 |
| F050 | 申請受付通知 | notifications | (イベント) | — | — | ✅ |
| F051 | 承認/却下通知 | notifications | (イベント) | — | — | ✅ |
| F052 | 返却期限前通知 | notifications | — | — | BATCH-001 | ✅ |
| F053 | 返却期限超過通知 | notifications | — | — | BATCH-001 | ✅ |
| F060 | 貸出履歴(機器別) | applications | GET /admin/equipment/{id}/history | S100 | — | ⚠️ API未定義 |
| F061 | 貸出履歴(社員別) | applications | GET /admin/users/{id}/history | S120 | — | ⚠️ API未定義 |
| F062 | 利用率レポート | applications | GET /admin/reports/utilization | S130 | BATCH-005 | ✅ |
| F063 | 超過履歴レポート | applications | GET /admin/reports/overdue | S130 | — | ⚠️ API未定義 |

**⚠️ Gap発見 5件 → 今日中に設計を補完する**

---

## Slide 4: Gap分析 — 見つかったGapを埋める

### Gap 1: カテゴリ管理画面 (S121) が未定義

**追加する:**
```
画面ID: S121
画面名: カテゴリ管理
URL:   /admin/categories
権限:  Admin
機能:  カテゴリの一覧表示・新規追加・編集

表示項目: カテゴリ名, 最大貸出日数, 1人最大数, 有効/無効
操作: [追加] [編集] [有効/無効切替]
```

### Gap 2: 延長申請 API (F042, F043) が未定義

**追加する:**
```
POST /my/applications/{id}/extend
  Body: { "new_return_date": "2026-05-01" }
  Validation: new_return_date > 現在のreturn_date,
              かつカテゴリmax_days以内

POST /admin/applications/{id}/approve-extend
  処理: applications.return_date を更新
```

### Gap 3: 履歴API (F060, F061, F063) が未定義

**追加する:**
```
GET /admin/equipment/{id}/history?page=1&per=20
GET /admin/users/{id}/applications?page=1&per=20
GET /admin/reports/overdue?from=2026-01-01&to=2026-03-31
```

---

## Slide 5: 基本設計書 全体構成 — 最終版

### 目次 (Table of Contents)

```
基本設計書 v1.0
社内機器管理・貸出システム

1. 文書概要
   1.1 目的・適用範囲
   1.2 改訂履歴
   1.3 用語定義

2. システム構成設計
   2.1 システム構成図
   2.2 技術スタック選定理由
   2.3 環境構成 (本番/ステージング/開発)

3. 機能設計
   3.1 機能一覧と要件対応表 (トレーサビリティマトリックス)
   3.2 モジュール構成

4. DB設計
   4.1 ER図
   4.2 テーブル定義書 (10テーブル)
   4.3 インデックス一覧
   4.4 マスタデータ (初期データ)

5. 画面設計
   5.1 画面一覧
   5.2 画面遷移図
   5.3 画面仕様書 (19画面)

6. API設計
   6.1 API一覧
   6.2 API仕様書 (30エンドポイント)
   6.3 エラーコード一覧

7. バッチ設計
   7.1 バッチ一覧
   7.2 バッチ詳細仕様 (5バッチ)

8. セキュリティ設計
   8.1 認証・認可設計
   8.2 通信セキュリティ
   8.3 入力値検証
   8.4 監査ログ設計

9. インフラ・環境設計
   9.1 システム構成図
   9.2 デプロイ設計 (Blue-Green)
   9.3 監視設計
   9.4 バックアップ設計

10. 非機能設計
    10.1 性能設計
    10.2 可用性設計

付録A: Migration Script 一覧
付録B: エラーコード一覧
付録C: メールテンプレート一覧
```

---

## Slide 6: 設計書品質チェックリスト

### DB設計チェック
- [ ] 全テーブルにPK (UUID)、created_at、updated_atがある
- [ ] Soft Deleteが必要なテーブルにdeleted_atがある
- [ ] StatusがあるテーブルにStatus History テーブルがある
- [ ] FK制約が全て定義されている
- [ ] 全IndexのWHERE条件が適切か
- [ ] ENUM値がCHECK制約で定義されている
- [ ] 楽観ロックが必要なテーブルにversionカラムがある

### API設計チェック
- [ ] 全機能にAPIが対応している (トレーサビリティ確認)
- [ ] 全ListエンドポイントにPaginationがある
- [ ] エラーレスポンスのフォーマットが統一されている
- [ ] 認証が不要なエンドポイントが意図通りか
- [ ] Admin専用エンドポイントに /admin prefix がある
- [ ] HTTPメソッドが適切か (GET=参照, POST=作成, etc.)

### 画面設計チェック
- [ ] 全API呼び出しが画面仕様書に記載されている
- [ ] Empty/Loading/Errorの3状態が全画面で定義されている
- [ ] 権限による表示差異が定義されている
- [ ] バリデーションエラーの表示箇所が定義されている

### セキュリティチェック
- [ ] 全APIにAuthenticationチェックがある (公開APIを除く)
- [ ] Admin専用操作にAuthorizationチェックがある
- [ ] ユーザーが他人のデータにアクセスできないチェックがある
- [ ] SQLインジェクション対策の実装方針が記載されている
- [ ] XSS対策の実装方針が記載されている

---

## Slide 7: 設計レビュー — よくある指摘事項

### DB設計でのレビュー指摘

**指摘 1: N+1 Query を誘発する設計**
```
問題: applications テーブルから equipment_id を取得し、
      ループの中で equipment を1件ずつ取得

対策: APIのDB Queryで必要なJOINを事前に設計書に明記する
例:
  GET /my/applications の場合:
  SELECT a.*, e.name as equipment_name, e.status as equipment_status,
         c.name as category_name
  FROM applications a
  JOIN equipment e ON a.equipment_id = e.id
  JOIN categories c ON e.category_id = c.id
  WHERE a.user_id = $1
  ORDER BY a.created_at DESC
  LIMIT $2 OFFSET $3;
```

**指摘 2: 削除時の参照整合性**
```
問題: categories テーブルを削除したとき、
      equipment.category_id が孤立する

設計での決定:
  1. Hard Delete禁止 → Soft Delete (deleted_at) のみ
  2. FK は ON DELETE RESTRICT (デフォルト) を使用
  3. カテゴリは「機器が1件でも紐づいていれば削除不可」のバリデーション
```

---

## Slide 8: 相互レビュー実習 (30分)

### ペアレビュー形式

**ペア分け:** 2名1組
**役割:** レビュアー(1名) + 著者(1名) → 15分後に交代

**レビュー対象:** 相手の DB設計書 (テーブル定義書)

**レビュー観点 (5点チェック):**

1. **必須カラム確認**
   - UUID PK, created_at, updated_at は全テーブルにあるか

2. **NULL/NOT NULL 妥当性**
   - "任意入力" の項目だけNULL許容になっているか

3. **Index 過不足**
   - WHERE句に使うカラムにIndexがあるか
   - 不要なIndexがないか

4. **FK と Soft Delete の整合性**
   - FK があるのに参照先テーブルがHard Deleteされる設計になっていないか

5. **楽観ロック対象**
   - 競合が起きうるリソースに `version` カラムがあるか

**フィードバック形式:**
```
良かった点: 〇〇の設計が明確でした
改善提案 1: 〇〇テーブルの〇〇カラムにNOT NULLが必要では？
改善提案 2: 〇〇のIndexはWHERE条件が不完全では？
質問: 〇〇のステータスがENUMではなくVARCHARの理由は？
```

---

## Slide 9: 模範解答 — 見落としがちな設計ポイント

### ポイント 1: 申請番号の採番ルール

**よくある問題:**
```
application_no は AUTO INCREMENT で自動採番
```

**問題点:**
- 複数インスタンス起動時にシーケンス競合の可能性
- 月次リセットが難しい

**推奨設計:**
```
PostgreSQL のシーケンスを使用:
CREATE SEQUENCE application_seq START 1 INCREMENT 1 CACHE 1;

採番ロジック (アプリ層):
'APP-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Tokyo', 'YYYYMM')
       || '-'
       || LPAD(nextval('application_seq')::TEXT, 5, '0')

月次リセット: pg_cron で月初にシーケンスをリセット
SELECT setval('application_seq', 1);
```

---

### ポイント 2: 削除済みユーザーの申請

**問題:** users.deleted_at が設定されたとき、
そのユーザーの `applications` はどうなる?

**設計での決定事項:**
```
1. 申請レコードは削除しない (履歴として保持)
2. APIのレスポンスで申請者情報を表示する際:
   - users.deleted_at IS NOT NULL の場合 → "退職済みユーザー" と表示
   - 氏名・メールは引き続き表示 (管理目的)
3. 退職済みユーザーは新規申請不可 (is_active = FALSE でブロック)

テーブル設計への反映:
  applications.user_id の FK は ON DELETE RESTRICT
  (users を物理削除しようとするとエラー → Soft Deleteのみ許可)
```

---

## Slide 10: 宿題 (卒業課題の準備)

### 最終課題の説明

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
卒業課題: 基本設計書 完成版の提出

提出物:
1. 基本設計書 (本文) — 全10章
2. ER図 (dbdiagram.io または draw.io)
3. 画面ワイヤーフレーム (最低5画面)
4. API仕様書 (最低10エンドポイント)
5. トレーサビリティマトリックス

評価基準:
│ DB設計の完全性     │ 30点 │ テーブル定義・Index・制約 │
│ API設計の一貫性    │ 25点 │ Naming・Error Code統一   │
│ トレーサビリティ   │ 20点 │ 全機能にDesignが対応      │
│ セキュリティ設計   │ 15点 │ Auth・OWASP対応          │
│ 文書品質           │ 10点 │ 用語統一・バージョン管理  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 今週の宿題
> Traceability Matrixの⚠️ Gap 5件を全て補完する:
> - S121 カテゴリ管理画面の 画面仕様書
> - F042/F043 延長申請 の API仕様書
> - F060/F061/F063 の API仕様書

### 次回
**第8回（最終回）:** 卒業課題レビュー & 総まとめ — 設計書の品質を上げる実践
