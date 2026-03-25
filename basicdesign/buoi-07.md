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
- Review đặc biệt: async state coverage, AI timeout, security cho file tài chính

### Agenda
```
0:00 - 0:20  宿題レビュー (Batch + Security + Docker)
0:20 - 0:50  トレーサビリティ確認 (機能要件の網羅性)
0:50 - 1:20  設計書の統合 & ギャップ分析
1:20 - 1:45  相互レビュー (AI-IA特有の観点)
```

---

## Slide 2: Lỗi phổ biến từ bài nộp buổi 6

### Lỗi 1: Batch thiếu Idempotency — retry logic

**❌ Thiếu:**
```
STEP 3: retry_count を +1 する
```

**✅ Đầy đủ — cần đảm bảo không retry trùng:**
```
STEP 3: CAS更新で排他制御する
  UPDATE invoices
  SET status = 'QUEUED', retry_count = retry_count + 1
  WHERE id = {invoice_id}
    AND status = 'FAILED'       ← 現在のステータスを条件に
    AND retry_count < 3;        ← カウント上限チェック

  → affected rows = 0 なら既に他のプロセスが処理済み → スキップ
  → 同じバッチが2回実行されても2回リトライしない
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

AI-IA 特有のルール:
  POST /invoices/upload : 10リクエスト/分/ユーザー (AI処理コスト考慮)
  POST /auth/login      : 5リクエスト/分/IP
  GET  /invoices        : 60リクエスト/分/ユーザー
```

---

### Lỗi 3: Security — AI Timeout 未設計

**Phần hay bị bỏ quên:**
```
Python AI Service がタイムアウトした場合の設計:

設計:
  Laravel Worker → Python AI Service 呼び出し
  タイムアウト設定: 30秒 (1件のAI処理上限)

  タイムアウト発生時:
  → invoices.status = 'FAILED'
  → error_message = 'AI処理タイムアウト (30秒超過)'
  → retry_count + 1 (自動リトライ対象に)
  → BATCH-002 で自動リトライ

  Python AI Service のヘルスチェック:
  GET /health (Laravel → Python, 1分ごと)
  → 応答なし: 管理者アラート + 新規キュー追加を一時停止
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

### Traceability Matrix — AI-IA System

| 機能ID | 機能名 | DB Table | API | 画面 | Batch | 備考 |
|--------|--------|---------|-----|------|-------|------|
| F001 | ログイン | users | POST /auth/login | S001 | — | ✅ |
| F002 | ログアウト | personal_access_tokens | POST /auth/logout | — | — | ✅ |
| F003 | PW変更 | users | PUT /auth/password | S002 | — | ✅ |
| F004 | ユーザー管理 | users | GET/POST/PUT /admin/users | S100 | — | ✅ |
| F010 | 請求書アップロード | invoices | POST /invoices/upload (202) | S030 | — | ✅ |
| F011 | バッチアップロード | invoices, processing_batches | POST /invoices/upload | S030 | — | ✅ |
| F012 | アップロード状態確認 | invoices | GET /invoices/{id}/status | S011, S031 | — | ✅ |
| F013 | バッチ進捗確認 | processing_batches | GET /batches/{id}/status | S031 | — | ✅ |
| F020 | AI処理（自動）| invoices, invoice_extracted_data | (内部: /ai/process) | — | BATCH-001 | ✅ |
| F021 | 自動リトライ | invoices | — | — | BATCH-002 | ✅ |
| F022 | 請求書一覧 | invoices | GET /invoices | S010 | — | ✅ |
| F023 | 請求書詳細 | invoices, invoice_extracted_data | GET /invoices/{id} | S011 | — | ✅ |
| F030 | AI抽出結果レビュー | invoice_extracted_data | GET /invoices/{id} | S020 | — | ✅ |
| F031 | 仕訳確認・修正 | journal_entries | PUT /journal-entries/{id} | S020, S021 | — | ✅ |
| F032 | 仕訳承認 | journal_entries | POST /invoices/{id}/approve | S020 | — | ✅ |
| F033 | 仕訳一覧 | journal_entries | GET /journal-entries | S040 | — | ✅ |
| F040 | 仕入先マスタ管理 | suppliers | GET/POST/PUT /admin/suppliers | S110 | — | ✅ |
| F041 | 勘定科目マッピング管理 | account_code_mapping | GET/POST/PUT /admin/account-codes | S111 | — | ✅ |
| F050 | 日次レポート | ai_daily_reports | GET /admin/reports | S120 | BATCH-004 | ✅ |
| F051 | アーカイブ | invoices_archive | — | — | BATCH-005 | ✅ |
| F060 | アップロード失敗通知 | notification_logs | (イベント) | — | — | ✅ |
| F061 | バッチ完了通知 | notification_logs | (イベント) | — | — | ✅ |
| F070 | OCR精度ダッシュボード | invoice_extracted_data | GET /admin/reports/ai-accuracy | S120 | BATCH-004 | ⚠️ APIパラメータ未定義 |
| F071 | 仕入先別統計 | invoices, suppliers | GET /admin/reports/by-supplier | S120 | — | ⚠️ API未定義 |
| F072 | 請求書削除 | invoices | DELETE /invoices/{id} | S010 | — | ⚠️ 削除条件未定義 |

**⚠️ Gap発見 3件 → 今日中に設計を補完する**

---

## Slide 4: Gap分析 — 見つかったGapを埋める

### Gap 1: OCR精度ダッシュボードAPI (F070) パラメータ未定義

**追加する:**
```
GET /api/v1/admin/reports/ai-accuracy

Query Parameters:
  from        : date, default=過去30日
  to          : date
  group_by    : 'day' | 'week' | 'month', default='day'
  model_version: string, optional (特定モデルでフィルター)

Response:
{
  "data": [
    {
      "date": "2026-03-24",
      "model_version": "layoutlmv3-base-sroie-v1.2",
      "total_processed": 45,
      "completed_count": 38,
      "needs_review_count": 5,
      "failed_count": 2,
      "avg_confidence_score": 0.8734,
      "success_rate": 0.844
    }
  ],
  "meta": { "total": 30 }
}
```

### Gap 2: 仕入先別統計API (F071) が未定義

**追加する:**
```
GET /api/v1/admin/reports/by-supplier

Query Parameters:
  from, to    : date range
  page, per   : pagination

Response:
  仕入先ごとに: 請求書件数, 合計金額, 平均confidence, NEEDS_REVIEW率
```

### Gap 3: 請求書削除の条件 (F072) が未定義

**追加する:**
```
DELETE /api/v1/invoices/{id}

削除可能条件:
  - status = 'FAILED' または 'UPLOADED'
  - invoices.user_id = リクエスト者のID (または Admin)
  - journal_entries が存在しないこと

削除不可の場合:
  422 ERR-INV-422 "承認済みの仕訳が存在するため削除できません"

実装: Soft Delete (deleted_at = NOW())
     物理削除は禁止 (7年保持義務)
```

---

## Slide 5: 基本設計書 全体構成 — 最終版

### 目次 (Table of Contents)

```
基本設計書 v1.0
AI請求書自動処理システム (AI-IA)
アカウントプロ株式会社

1. 文書概要
   1.1 目的・適用範囲
   1.2 改訂履歴
   1.3 用語定義 (AI-IA特有: confidence_score, NEEDS_REVIEW等)

2. システム構成設計
   2.1 システム構成図 (Flutter + Laravel + Python AI + Redis + MinIO)
   2.2 技術スタック選定理由 (特にMicroservices採用理由)
   2.3 環境構成 (本番/ステージング/開発)
   2.4 AI Processing State Machine (UPLOADED→QUEUED→PROCESSING→...)

3. 機能設計
   3.1 機能一覧と要件対応表 (トレーサビリティマトリックス)
   3.2 モジュール構成 (Laravel + Python の責任分担)

4. DB設計
   4.1 ER図
   4.2 テーブル定義書 (9テーブル)
   4.3 インデックス一覧 (大量データ対策)
   4.4 マスタデータ (account_code_mapping初期データ)

5. 画面設計
   5.1 画面一覧
   5.2 画面遷移図
   5.3 画面仕様書 (16画面)
   5.4 Split View レビュー画面仕様 (核心画面)

6. API設計
   6.1 API一覧
   6.2 API仕様書 (25エンドポイント)
   6.3 エラーコード一覧
   6.4 Internal API仕様 (Laravel↔Python AI Service)

7. バッチ設計
   7.1 バッチ一覧
   7.2 バッチ詳細仕様 (5バッチ)

8. セキュリティ設計
   8.1 認証・認可設計 (Sanctum RBAC)
   8.2 AI API Key管理 (最重要)
   8.3 ファイルセキュリティ (MinIO Signed URL + ClamAV)
   8.4 入力値検証 (OWASP対応)
   8.5 監査ログ設計 (7年保持)

9. インフラ・環境設計
   9.1 Docker Compose構成 (6サービス)
   9.2 デプロイ設計 (Blue-Green)
   9.3 監視設計
   9.4 バックアップ設計

10. 非機能設計
    10.1 性能設計 (AI処理5秒以内、バッチ10分以内)
    10.2 可用性設計

付録A: Migration Script 一覧 (V001〜V011)
付録B: エラーコード一覧 (ERR-AUTH/INV/JNL/AI/UPLOAD)
付録C: Docker Compose 設定ファイル
```

---

## Slide 6: 設計書品質チェックリスト

### DB設計チェック
- [ ] 全テーブルにPK (UUID)、created_at、updated_atがある
- [ ] Soft Deleteが必要なテーブルにdeleted_atがある
- [ ] invoicesテーブルに (status, created_at) 複合インデックスがある
- [ ] confidence_scoreがNUMERIC(5,4)で定義されている (FLOAT禁止)
- [ ] FK制約が全て定義されている
- [ ] AI Processing 6ステータスがCHECK制約で定義されている
- [ ] journal_entriesに物理削除なし (会計帳簿)

### API設計チェック
- [ ] POST /invoices/upload が 202 Accepted を返す (201ではない)
- [ ] GET /invoices/{id}/status に `is_terminal` フラグがある
- [ ] POST /ai/process が Internal専用であることが明記されている
- [ ] 全ListエンドポイントにPaginationがある
- [ ] AI Service API KeyがAPIレスポンスに含まれていない
- [ ] エラーレスポンスのフォーマットが統一されている

### 画面設計チェック
- [ ] Split View レビュー画面の左右ペイン仕様が明記されている
- [ ] 6ステータス全てが画面で表現されている
- [ ] Signed URLの取得方法が定義されている
- [ ] Polling の停止条件 (is_terminal) が定義されている
- [ ] バッチ処理状態画面のポーリング間隔が定義されている

### セキュリティチェック
- [ ] AI API Key は Laravel .env のみに存在することが明記されている
- [ ] Python AI Service は Nginx に expose しないことが設計図に反映されている
- [ ] ファイルアップロード: MIMEタイプ+マジックバイト両方チェック
- [ ] ClamAV スキャンが設計に含まれている
- [ ] Signed URL の有効期限が定義されている (30分)
- [ ] バリデーション: Laravel = security、Flutter = UX のみ

---

## Slide 7: 設計レビュー — AI-IA特有の指摘事項

### レビュー観点 1: 非同期処理の状態カバレッジ

**指摘:** 全6ステータスが設計に反映されているか

```
UPLOADED     → バッチ処理開始前のチェックに含まれているか?
QUEUED       → Redis Queue監視の設計があるか?
PROCESSING   → Worker クラッシュ時の BATCH-001 で対応しているか?
COMPLETED    → Flutter のポーリング停止条件に含まれているか?
FAILED       → retry_count < 3 のリトライ、= 3 のエスカレーションがあるか?
NEEDS_REVIEW → confidence_score の閾値 (0.85) が設計に明記されているか?
```

### レビュー観点 2: AI タイムアウト処理

**指摘:** Python AI Service がタイムアウトした場合の設計

```
問題: LayoutLMv3 の処理が30秒を超えた場合、Laravel Worker はどうなる?

設計での決定事項:
  1. Laravel Worker のタイムアウト: 30秒
  2. タイムアウト発生:
     → invoices.status = 'FAILED'
     → invoices.error_message = 'AI処理タイムアウト (30秒超過)'
     → audit_logs に記録
  3. BATCH-002 が15分後に自動リトライ
  4. 3回タイムアウト: 管理者アラート + 手動対応

テーブル設計への反映:
  invoices.error_message TEXT NULL ← タイムアウト内容を保存
  invoices.retry_count SMALLINT    ← リトライ回数を追跡
```

### レビュー観点 3: 財務ファイルのセキュリティ

**指摘:** Signed URL の設計が不完全

```
問題: Signed URL が漏れた場合 (30分以内) のリスク

追加設計:
  1. Signed URL 生成ログ: audit_logs に記録
     action = 'SIGNED_URL_GENERATED', target_id = invoice_id
  2. 同一 invoice_id への Signed URL 生成: 10回/時間 に制限
  3. Signed URL のドメインを社内ネットワークに限定
     → MinIO の presigned URL に IP 制限を追加検討
  4. 異常なアクセスパターン検知:
     → 同一 URL への 5回以上アクセス → アラート
```

---

## Slide 8: 相互レビュー実習 (30分)

### ペアレビュー形式

**ペア分け:** 2名1組
**役割:** レビュアー(1名) + 著者(1名) → 15分後に交代

**レビュー対象:** 相手の DB設計書 (invoices + invoice_extracted_data)

**レビュー観点 — AI-IA 5点チェック:**

1. **AI Processing State Machine の完全性**
   - 6ステータス全てが CHECK 制約に含まれているか
   - NEEDS_REVIEW への遷移条件 (confidence_score < 0.85) が設計書に明記されているか

2. **インデックスの大量データ対策**
   - (status, created_at) 複合インデックスがあるか
   - (user_id, status) インデックスがあるか
   - NEEDS_REVIEW 専用 Partial Index があるか

3. **財務データの制約**
   - total_amount, tax_amount が NUMERIC (FLOATではない) か
   - confidence_score が NUMERIC(5,4) か
   - journal_entries に soft delete または delete 禁止の注記があるか

4. **AI抽出データの設計**
   - raw_extraction JSONB で AI 生出力を保存しているか (デバッグ用)
   - ai_model_version が記録されているか (精度追跡用)
   - reviewed_by / reviewed_at があるか

5. **セキュリティ関連カラム**
   - users に login_failure_count と locked_until があるか
   - audit_logs の保持期間 (7年) が設計書に明記されているか

**フィードバック形式:**
```
良かった点: 〇〇の設計が明確でした
改善提案 1: invoicesテーブルのインデックスが不足では？
改善提案 2: confidence_scoreの閾値が設計書に明記されていない
質問: NEEDS_REVIEWからCOMPLETEDへの遷移はどのAPIで行われる?
```

---

## Slide 9: 模範解答 — 見落としがちな設計ポイント

### ポイント 1: NEEDS_REVIEW → COMPLETED への遷移

**よくある問題:**
```
POST /invoices/{id}/approve で status を COMPLETED に変える、
と書いているが、NEEDS_REVIEW の場合も同じAPIか?
```

**設計での決定事項:**
```
POST /api/v1/invoices/{id}/approve の処理:
  - status が COMPLETED の場合: 仕訳を承認して完了 (すでに信頼度高い)
  - status が NEEDS_REVIEW の場合: レビュー後に承認して COMPLETED へ
  → 両方とも同じ approve エンドポイントで処理可能

テーブル変更:
  invoices.status: NEEDS_REVIEW → COMPLETED
  invoice_extracted_data.reviewed_by = request.user_id
  invoice_extracted_data.reviewed_at = NOW()
  journal_entries: AI提案仕訳を登録 + approved_by 設定

audit_logs に記録: action = 'INVOICE_APPROVED'
```

### ポイント 2: 複数仕訳の更新整合性

**問題:** approve 時に journal_entries を複数行 INSERT するが、トランザクション内か?

**設計での決定事項:**
```
POST /invoices/{id}/approve の処理は全てトランザクション内:

BEGIN:
  1. invoice_extracted_data を UPDATE (修正内容で上書き)
  2. 既存の journal_entries を DELETE (AIが先に作成していた場合)
  3. 新しい journal_entries を INSERT (approved_by付き)
  4. invoices.status を COMPLETED に UPDATE
  5. audit_logs INSERT
COMMIT;

いずれかが失敗した場合: ROLLBACK
→ 部分的な承認は発生しない
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
3. 画面ワイヤーフレーム (最低5画面 — Split View含む)
4. API仕様書 (最低10エンドポイント — 非同期含む)
5. トレーサビリティマトリックス

評価基準:
│ DB設計の完全性      │ 30点 │ テーブル定義・Index・AI State Machine │
│ API設計の一貫性     │ 25点 │ 202 Async・Polling・Internal API設計  │
│ トレーサビリティ    │ 20点 │ 全機能にDesignが対応                  │
│ セキュリティ設計    │ 15点 │ AI Key管理・Signed URL・OWASP対応     │
│ 文書品質            │ 10点 │ 用語統一・バージョン管理              │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 今週の宿題
> Traceability Matrixの⚠️ Gap 3件を全て補完する:
> - F070 OCR精度ダッシュボードAPIの完全な仕様書
> - F071 仕入先別統計APIの仕様書
> - F072 請求書削除の条件と削除APIの完全な仕様書

### 次回
**第8回（最終回）:** 卒業課題レビュー & 総まとめ — 設計書の品質を上げる実践
