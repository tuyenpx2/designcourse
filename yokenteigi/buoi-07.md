# Buổi 7 — Case Study thực hành (Phần 2): AI-IA 要件定義書を完成させる

---

## Slide 1: Mục tiêu buổi học & Agenda

### Buổi 7 — Hoàn thiện tài liệu AI-IA

- Review bài nộp: F040 AI結果レビュー + F072 AI処理失敗通知
- Hoàn chỉnh 非機能要件 (đặc thù của AI system)
- Xây dựng 画面一覧 & 画面遷移図
- Định nghĩa データ要件 + 外部インターフェース要件
- Thực hành 相互レビュー theo checklist đặc thù AI

### Agenda
```
0:00 - 0:25  宿題レビュー: F040 / F072 — よくある間違い
0:25 - 0:55  非機能要件の作成（AIシステム特有）
0:55 - 1:15  画面一覧 & 画面遷移図
1:15 - 1:30  データ要件 & 外部IF要件
1:30 - 1:45  相互レビュー & フィードバック
1:45 - 2:00  まとめ・卒業課題説明
```

---

## Slide 2: 宿題レビュー — よくあった間違い

### Lỗi phổ biến: F040 AI結果レビュー

**❌ Thiếu: Không xử lý State Transition đầy đủ**
```
【基本フロー】
1. レビュー画面を開く
2. AIの結果を確認する
3. 「承認」ボタンをクリック
4. 仕訳が保存される
```

**❌ Thiếu: Không đề cập Signed URL (security)**
```
【基本フロー】
3. 画面左に証憑画像を表示する  ← どうやって表示する？
                               ← S3のURLを直接フロントに渡す？
                               ← それはセキュリティ問題！
```

**❌ Thiếu: Không xử lý khi invoice đã bị người khác approve (競合)**
```
→ 2人が同時に同じ invoice を開いたらどうなる？
→ 楽観ロックまたは排他ロックの設計が必要
```

**✅ Đầy đủ — những điểm bắt buộc phải có trong F040:**
```
1. 前提条件: invoice.status = NEEDS_REVIEW であること
2. Signed URL生成: Laravelバックエンドが一時URLを発行（有効期限15分）
3. 信頼度表示: 各フィールドの confidence スコアを色で表示
   ・85%以上 → 緑
   ・60〜85% → 黄
   ・60%未満 → 赤（要注意）
4. 承認フロー:
   a. バックエンドで invoice.status を NEEDS_REVIEW か確認
   b. COMPLETED な場合 → 「この請求書はすでに承認済みです」
   c. journal_entry レコード作成
   d. invoice.status → COMPLETED
5. 却下フロー: 理由入力必須 → invoice.status → FAILED
```

### Lỗi phổ biến: F072 AI処理失敗通知

**❌ Thiếu: Không định nghĩa điều kiện trigger rõ ràng**
```
AIが失敗したらメールを送る
→ 何回失敗したら？リトライ中も毎回送る？
→ 誰に送る？アップロードした人だけ？Managerも？
```

**✅ Đúng — cần định nghĩa đầy đủ:**
```
【トリガー条件】
・1回目・2回目の失敗: 通知しない（リトライ自動実行）
・3回目（最終）失敗確定: アップロード者 + Manager にメール送信

【通知内容必須要素】
・ファイル名・請求書ID
・失敗時刻・失敗理由（ERRコード）
・手動リトライへのリンク（F032）
・テクニカルサポート連絡先

【通知失敗時の処理】
・通知送信失敗 → ログに記録、30分後に再送（最大3回）
・通知失敗は invoice の処理ステータスとは独立
```

---

## Slide 3: 機能詳細 — F040 AI結果レビュー (モデル解答)

```
機能ID:  F040
機能名:  AI結果レビュー
優先度:  必須
対象:    ログイン済み Accountant / Manager / Admin

【概要】
AIが抽出した請求書データをスタッフが確認・修正・承認するための
分割画面（左: 証憑画像、右: データフォーム）。承認により仕訳
レコードが作成され、請求書ステータスがCOMPLETEDになる。

【前提条件】
・ユーザーがログイン済みであること
・対象 invoice のステータスが NEEDS_REVIEW であること
・アクセス権: アップロード者本人 / Manager / Admin

【画面構成】
┌─────────────────────────────────────────────────┐
│ 左ペイン (60%)          │ 右ペイン (40%)          │
│ 証憑画像表示             │ 抽出データフォーム       │
│ （ピンチズーム対応）      │                         │
│                         │ 取引先名: [______] 92%  │
│                         │ 日付:     [______] 88%  │
│                         │ 金額:     [______] 95%  │
│                         │ 税額:     [______] 91%  │
│                         │                         │
│                         │ 借方: [水道光熱費 627]   │
│                         │       (自動マッピング)   │
│                         │ 貸方: [買掛金      201]  │
│                         │                         │
│                         │ [承認] [却下] [保留]     │
└─────────────────────────────────────────────────┘

【基本フロー】
1.  ユーザーが通知リンクまたは処理一覧からレビュー画面を開く
2.  システムがバックエンドで invoice.status = NEEDS_REVIEW を確認
3.  システムが S3 Signed URL を生成（有効期限: 15分）
    → URLはフロントエンドに渡すが、S3は直接公開しない
4.  左ペインに証憑画像を表示（Signed URL経由）
5.  右ペインにAI抽出フィールドを表示:
    - supplier_name（取引先名）+ confidence %
    - invoice_date（日付）+ confidence %
    - total_amount（合計金額）+ confidence %
    - tax_amount（消費税額）+ confidence %
    - 信頼度に応じた色分け（緑/黄/赤）
6.  システムがSmart Mappingの提案を表示:
    - 借方勘定科目（コード + 科目名）
    - 貸方勘定科目（コード + 科目名）
    - マッピングソース: 「自動マッチ」or「手動設定済み」
7.  ユーザーが必要に応じてフィールドを修正する
8.  ユーザーが「承認」ボタンをクリック
9.  システムがバックエンドでバリデーション実行（下記参照）
10. バリデーション通過後、システムが処理:
    a. journal_entry レコードを作成（借方・貸方・金額・証憑リンク）
    b. invoice.status → COMPLETED
    c. approved_by / approved_at を記録
    d. 監査ログに記録（F055の監査要件）
11. 「承認しました。仕訳を作成しました」を表示
12. 次のNEEDS_REVIEW件があれば自動で次へ遷移するか確認

【代替フロー】
8a. ユーザーが「却下」ボタンをクリック
→ 却下理由入力フィールドを表示（必須、最大500文字）
→ 確認ダイアログを表示
→ ユーザーが確認
→ invoice.status → FAILED
→ rejected_by / rejected_at / rejection_reason を記録
→ アップロード者に却下通知を送信（F072経由）
→ 処理一覧に戻る

8b. ユーザーが「保留」ボタンをクリック
→ invoice.status は NEEDS_REVIEW のまま維持
→ コメントを追加できる（オプション）
→ 24時間後にリマインド通知（F074）

7a. 勘定科目コードを変更した場合
→ マッピングソースを「手動」に変更
→ 「このマッピングをルールとして保存しますか？」を確認
→ 「はい」の場合: account_code_mapping に新規ルールを追加（Admin確認後有効化）

【例外フロー】
EX-1: 画面表示時に既に COMPLETED or FAILED だった場合
→ 「この請求書はすでに処理済みです（ステータス: XX）」
→ 読み取り専用モードで表示（編集・承認ボタン非表示）

EX-2: Signed URL の有効期限切れ（15分超過）
→ 画像エリアに「画像の表示期限が切れました」
→ 「再読み込み」ボタンを表示
→ クリックで新しいSigned URLを取得（バックエンド経由）

EX-3: 2名が同時に同じ invoice を承認しようとした場合（楽観ロック）
→ 後から「承認」した側: 「この請求書は他のスタッフによって処理されました」
→ 最初に承認した処理が有効
→ エラーコード: ERR-REVIEW-002

EX-4: DB保存エラー（journal_entry作成失敗）
→ トランザクションロールバック（journal_entry + ステータス変更を取り消し）
→ invoice.status は NEEDS_REVIEW のまま維持
→ エラーメッセージ [ERR-REVIEW-001] を表示

【バリデーション（バックエンド）】
| 項目 | ルール | エラー |
|------|--------|--------|
| supplier_name | 1文字以上、500文字以内 | ERR-REVIEW-010 |
| invoice_date | YYYY-MM-DD形式、未来日不可 | ERR-REVIEW-011 |
| total_amount | 正の数値、小数点2桁まで | ERR-REVIEW-012 |
| tax_amount | 0以上、total_amount以下 | ERR-REVIEW-013 |
| debit_account_code | 勘定科目マスタに存在すること | ERR-REVIEW-014 |
| credit_account_code | 勘定科目マスタに存在すること | ERR-REVIEW-015 |
| invoice.status | NEEDS_REVIEW であること | ERR-REVIEW-002 |

【関連機能】
・F031: 処理状況リアルタイム更新（ステータス変化の反映）
・F044: 却下（F040内に統合）
・F050: 仕訳一覧（承認後の確認）
・F062: マッピングルール管理（新ルール提案）
・F072: AI処理失敗通知（却下時の通知）
```

---

## Slide 4: このシステム特有の非機能特性

### AI処理システムだからこその特性

| システム特性 | 影響する非機能要件 | 設計上の考慮点 |
|------------|----------------|-------------|
| **AI処理が同期ではない** | 性能・可用性 | 処理時間の上限定義、タイムアウト設計 |
| **AI精度が100%ではない** | 品質・信頼性 | 精度指標の定義、accuracy SLA |
| **月間8,000件の財務データ** | 性能・スケール | インデックス設計、ページネーション必須 |
| **財務データ = 機密情報** | セキュリティ | API key保護、Signed URL、暗号化 |
| **外部AIサービス依存** | 可用性・冗長性 | AIサービスダウン時のフォールバック |
| **会計事務所 = 規制対象** | 監査・コンプライアンス | 監査ログ、操作履歴の完全保持 |
| **30名が同時利用** | 性能 | 同時接続数、バッチ処理の競合制御 |

### ⚠️ 非機能要件に必ず数値を入れること

```
❌ 悪い例: 「AIの処理は速く完了すること」

✅ 良い例: 「1枚の請求書のAI処理は、
           ジョブキュー投入から5秒以内に完了すること
           （LayoutLMv3-base-sroi処理時間 + Smart Mapping時間含む）
           ※ 前提: Python FastAPIサーバー 4vCPU, 8GB RAM環境」
```

---

## Slide 5: 非機能要件 — 性能・可用性

### 5.1 性能要件

```
5.1 性能要件

【測定条件】
・同時利用ユーザー数: 最大30名（業務時間内ピーク）
・月間処理件数: 8,000件（ピーク時: 500件/日）
・データ量: 3年後見込み 約300,000件（インデックス必須）

【AI処理性能】
・1件のAI処理時間: 5秒以内（ジョブキュー投入〜COMPLETED/NEEDS_REVIEW）
  内訳: FastAPI呼び出し 1秒 + LayoutLMv3推論 3秒 + Smart Mapping 1秒
・バッチ処理スループット: 最大200件/時間
・同時処理可能ジョブ数: 最大10並列（Worker数に依存）

【画面レスポンスタイム（95パーセンタイル）】
・処理状況一覧（100件表示）: 2秒以内
・AI結果レビュー画面表示: 3秒以内（Signed URL取得含む）
・仕訳一覧（1000件以上、フィルタあり）: 3秒以内
・CSVエクスポート（1000件）: 10秒以内
・レポート・統計画面: 5秒以内

【バッチ処理】
・未処理リマインダー: 毎日 09:00 実行、10分以内に完了
・対象件数: 最大500件/バッチ
```

### 5.2 可用性・信頼性

```
5.2 可用性・信頼性

【稼働率目標】
・Webアプリケーション: 99.5%以上（月次）
  = 月間ダウンタイム許容: 約3.65時間
・AIサービス (Python FastAPI): 99.0%以上（月次）
・業務時間（月〜金 8:00〜20:00）は特に優先

【計画停止】
・実施時間: 土日または祝日 22:00〜翌6:00
・事前通知: 3日前にシステム内バナー + Manager/Adminメール

【障害時目標】
・RTO（目標復旧時間）: 2時間以内
・RPO（目標復旧時点）: 1時間以内（増分バックアップ1時間毎）

【AIサービスダウン時のフォールバック】
・AIサービスが応答なし（タイムアウト: 30秒）の場合:
  → invoice.status を FAILED に設定
  → エラーメッセージ [ERR-AI-001] を記録
  → Worker は他のジョブ処理を継続
  → 自動リトライ: 5分後・15分後・30分後（計3回）
  → 3回失敗でエスカレーション通知（Admin宛）

【Redisキュー耐障害性】
・Redis接続断: ジョブは喪失しない（Laravelのfailed_jobsテーブルに退避）
・Queue監視: 5分以上ジョブが停滞 → Admin通知

【バックアップ】
・DBフルバックアップ: 毎日 00:00（別リージョンS3へ）
・増分バックアップ: 1時間毎
・S3ファイルバックアップ: 別バケットにクロスリージョンレプリケーション
・保存期間: DB 1年、ファイル 7年（会計帳簿保存義務に準拠）
```

---

## Slide 6: 非機能要件 — セキュリティ・監査

### 5.3 セキュリティ要件

```
5.3 セキュリティ要件

【認証・認可】
・パスワード: 12文字以上、大文字・小文字・数字・記号混在
・ハッシュ: bcrypt（コストファクター12）
・ログイン失敗: 5回連続でアカウントロック（Admin解除）
・セッション: JWT（有効期限: 8時間）
  → リフレッシュトークン: 30日
・多要素認証 (MFA): Phase 2（本プロジェクトでは任意）

【API・フロントエンドセキュリティ — 最重要】
・AIサービスのAPIキーはLaravelバックエンドのみに保持
  → Flutterフロントエンドには絶対に渡さない
  → 環境変数（.env）で管理、Gitにコミットしない
  → AWS Secrets Manager / HashiCorp Vault を推奨
・全てのAPIエンドポイント: JWTトークン必須
・フロントエンドからS3へのファイルアクセス:
  → 直接アクセス禁止（S3バケットはプライベート設定）
  → LaravelバックエンドがSigned URL（有効期限: 15分）を発行
  → URLをフロントに渡してブラウザが取得

【通信セキュリティ】
・全通信: HTTPS（TLS 1.2以上）
・HSTS（HTTP Strict Transport Security）を有効化
・APIレートリミット: 認証API 10回/分、通常API 60回/分

【財務データ保護】
・DBの金額・個人情報カラム: AES-256暗号化
・CSVエクスポートは Accountant以上のみ（監査ログに記録）
・S3ストレージ: サーバーサイド暗号化（SSE-S3 or SSE-KMS）
・ユーザーは他ユーザーの証憑画像・仕訳データにアクセス不可
  （Laravelミドルウェアで所有者チェック）

【脆弱性対策】
・SQLインジェクション: LaravelのEloquent ORM使用（プレースホルダ）
・XSS: Flutter Web は自動エスケープ、テキスト表示は全サニタイズ
・CSRF: LaravelのCSRFトークン有効化（全POST/PUT/DELETE）
・ファイルアップロード: サーバー側でMIMEタイプ検証
  （Contentタイプ偽装への対策）

【アクセス制御】
・Accountant は自分がアップロードした invoice のみアクセス可
・URLの直打ちアクセス（例: /invoices/{他人のID}）→ 403エラー
・Admin機能URL（/admin/*）: Admin以外 → 403エラー
```

### 5.4 監査・コンプライアンス

```
5.4 監査・コンプライアンス

【監査ログ必須記録】
以下の全操作を audit_logs テーブルに記録:
・ログイン・ログアウト（成功・失敗、IPアドレス含む）
・ファイルアップロード（ファイル名・サイズ・IPアドレス）
・AI処理開始・完了・失敗
・仕訳データの作成・編集・削除
・承認・却下（誰が・いつ・理由）
・CSVエクスポート（誰が・いつ・件数）
・マスタデータの変更
・アカウント管理操作（作成・無効化・ロール変更）

【監査ログ形式】
| フィールド | 内容 |
|----------|------|
| id | UUID |
| user_id | 操作者ID |
| action | CREATE/UPDATE/DELETE/APPROVE/REJECT/EXPORT など |
| resource_type | invoice / journal_entry / user など |
| resource_id | 対象レコードID |
| old_value | 変更前の値 (JSON) |
| new_value | 変更後の値 (JSON) |
| ip_address | クライアントIPアドレス |
| created_at | 操作日時 |

【保存期間】
・監査ログ: 7年（会計帳簿保存義務に準拠）
・ファイル（証憑画像）: 7年
・仕訳データ: 7年
・通知ログ: 1年
・アプリログ: 90日
```

---

## Slide 7: 画面一覧 (完全版)

### 共通・認証画面

| 画面ID | 画面名 | Flutter Route | 権限 |
|--------|--------|--------------|------|
| S001 | ログイン | /login | 不要 |
| S002 | パスワード変更 | /password/change | 全員 |
| S003 | パスワードリセット申請 | /password/reset | 不要 |

### Accountant向け — アップロード・処理確認

| 画面ID | 画面名 | Flutter Route | 権限 |
|--------|--------|--------------|------|
| S010 | ダッシュボード | /dashboard | Accountant+ |
| S020 | 単票アップロード | /upload/single | Accountant+ |
| S021 | カメラ撮影アップロード | /upload/camera | Accountant+ |
| S022 | 一括アップロード | /upload/batch | Accountant+ |
| S023 | アップロード進捗確認 | /upload/batch/{id}/progress | Accountant+ |
| S030 | 処理状況一覧 | /invoices | Accountant+ |
| S031 | 処理状況詳細 | /invoices/{id} | Accountant+ |
| S040 | AI結果レビュー | /invoices/{id}/review | Accountant+ |
| S041 | 却下確認ダイアログ | (modal) | Accountant+ |

### Accountant向け — 仕訳・エクスポート

| 画面ID | 画面名 | Flutter Route | 権限 |
|--------|--------|--------------|------|
| S050 | 仕訳一覧 | /journal-entries | Accountant+ |
| S051 | 仕訳詳細 | /journal-entries/{id} | Accountant+ |
| S052 | CSVエクスポート設定 | /journal-entries/export | Accountant+ |

### Manager向け

| 画面ID | 画面名 | Flutter Route | 権限 |
|--------|--------|--------------|------|
| S060 | 全体処理状況ダッシュボード | /manager/dashboard | Manager+ |
| S061 | 一括承認画面 | /manager/bulk-approve | Manager+ |
| S080 | 処理統計レポート | /reports/processing | Manager+ |
| S081 | AI精度レポート | /reports/accuracy | Manager+ |
| S082 | 担当者別作業量レポート | /reports/workload | Manager+ |

### Admin向け — マスタ管理

| 画面ID | 画面名 | Flutter Route | 権限 |
|--------|--------|--------------|------|
| S100 | 管理者ダッシュボード | /admin/dashboard | Admin |
| S110 | 取引先マスタ一覧 | /admin/suppliers | Admin |
| S111 | 取引先マスタ登録/編集 | /admin/suppliers/{id}/edit | Admin |
| S120 | 勘定科目マスタ一覧 | /admin/account-codes | Admin |
| S121 | 勘定科目マスタ登録/編集 | /admin/account-codes/{id}/edit | Admin |
| S130 | マッピングルール一覧 | /admin/mapping-rules | Admin |
| S131 | マッピングルール登録/編集 | /admin/mapping-rules/{id}/edit | Admin |
| S140 | アカウント管理一覧 | /admin/users | Admin |
| S141 | アカウント登録/編集 | /admin/users/{id}/edit | Admin |
| S150 | システム設定 | /admin/settings | Admin |
| S151 | AI設定（信頼度閾値等） | /admin/settings/ai | Admin |

---

## Slide 8: 画面遷移図 — アップロードフロー（Accountant）

```
[ログイン後]

S010 ダッシュボード
    │
    ├──[単票アップロード]──> S020 単票アップロード
    │                           │
    │                   [ファイル選択 or ドラッグ]
    │                           │
    │                   [種別選択 (任意)]
    │                           │
    │                   [アップロード]
    │                           │
    │                   バックグラウンド処理開始
    │                           │
    │                   S030 処理状況一覧
    │                   （「処理中です」表示）
    │
    ├──[カメラ撮影]──────> S021 カメラ撮影
    │                           │
    │                   [撮影] or [ギャラリーから選択]
    │                           │
    │                   [プレビュー確認]
    │                           │
    │               [使用する]  │  [撮り直す]
    │                   │       └──────> S021
    │                   ▼
    │               アップロード処理
    │                   │
    │               S030 処理状況一覧
    │
    └──[一括アップロード]──> S022 一括アップロード
                                │
                        [複数ファイル選択]
                        [ドラッグ＆ドロップ]
                                │
                        [プレビューリスト表示]
                        ・ファイル名・サイズ
                        ・エラーファイルを赤表示
                                │
                    [アップロード開始]
                                │
                        S023 バッチ進捗画面
                        ・プログレスバー
                        ・完了数 / 全体数
                        ・失敗ファイル一覧
                                │
                    [完了] or [部分失敗]
                                │
                        S030 処理状況一覧
```

---

## Slide 9: 画面遷移図 — レビュー・承認フロー（Accountant）

```
S030 処理状況一覧
（ステータス: NEEDS_REVIEW / PROCESSING / FAILED / COMPLETED）
    │
    ├──[NEEDS_REVIEW の件を選択]
    │       │
    │   S040 AI結果レビュー画面
    │   ┌──────────────────────────────────────┐
    │   │ 左: 証憑画像 (Signed URL)            │
    │   │ 右: 抽出データ + 信頼度 + 提案仕訳   │
    │   └──────────────────────────────────────┘
    │       │
    │   ┌───┴──────────────────────────┐
    │   │              │               │
    │ [承認]         [却下]          [保留]
    │   │              │               │
    │ バックエンド   却下理由入力     NEEDS_REVIEWのまま
    │ バリデーション  (S041 modal)    コメント追加可
    │   │              │               │
    │ journal_entry  invoice.status   S030へ戻る
    │ 作成           → FAILED
    │   │              │
    │ invoice.status  アップロード者
    │ → COMPLETED    に通知
    │   │              │
    │ S030へ         S030へ
    │ (次の件を自動表示するか確認)
    │
    ├──[FAILEDの件を選択]
    │       │
    │   S031 処理状況詳細
    │   ・エラー詳細表示
    │   ・失敗回数・理由表示
    │       │
    │   [リトライ] or [キャンセル（削除）]
    │       │
    │   QUEUED に再投入
    │   S030へ戻る
    │
    └──[COMPLETEDの件を選択]
            │
        S051 仕訳詳細（読み取り専用）
        証憑画像リンク付き
```

---

## Slide 10: データ要件

### 主要テーブル定義

| テーブル名 | 論理名 | 主なカラム | 件数見込み | 保持期間 |
|-----------|--------|----------|----------|---------|
| users | ユーザー | id, name, email, role, department, is_active | 50件以下 | 退職後7年 |
| invoices | 請求書 | id, user_id, file_path, status, retry_count, batch_id, doc_type | 年間8,000件 | 7年 |
| invoice_items | 抽出データ | id, invoice_id, field_name, raw_value, corrected_value, confidence | 年間40,000件 | 7年 |
| journal_entries | 仕訳 | id, invoice_id, debit_account, credit_account, amount, tax_amount, approved_by, approved_at | 年間7,500件 | 7年 |
| invoice_batches | 一括処理バッチ | id, user_id, status, total_count, success_count, failed_count | 年間2,000件 | 1年 |
| suppliers | 取引先マスタ | id, name, name_aliases, default_account_code, doc_type | 1,000件以下 | 永続 |
| account_codes | 勘定科目マスタ | id, code, name, category, is_active | 200件以下 | 永続 |
| account_code_mapping | マッピングルール | id, supplier_id, doc_type, debit_account_code, credit_account_code, priority | 2,000件以下 | 永続 |
| processing_logs | 処理ログ | id, invoice_id, status_from, status_to, duration_ms, error_message, created_at | 年間50,000件 | 90日 |
| audit_logs | 監査ログ | id, user_id, action, resource_type, resource_id, old_value, new_value, ip_address, created_at | 年間100,000件 | 7年 |
| notifications | 通知ログ | id, user_id, type, content, sent_at, is_read, channel | 年間30,000件 | 1年 |

### インデックス設計 — 大量データ対応

```
【重要: 100,000件超のテーブルは必ずインデックスを設計すること】

invoices テーブル:
  INDEX idx_invoices_user_status    (user_id, status)
  INDEX idx_invoices_status_created (status, created_at)
  INDEX idx_invoices_batch_id       (batch_id)

journal_entries テーブル:
  INDEX idx_je_invoice_id           (invoice_id)
  INDEX idx_je_approved_at          (approved_at)
  INDEX idx_je_debit_account        (debit_account_code)

audit_logs テーブル:
  INDEX idx_audit_user_created      (user_id, created_at)
  INDEX idx_audit_resource          (resource_type, resource_id)

【ページネーション必須】
・全一覧画面: 20件/ページ（最大100件/ページ）
・大量データのカーソルページネーション（OFFSET問題を避ける）
```

### 請求書ステータス遷移（DB管理）

| ステータスコード | 日本語 | 次に遷移可能なステータス |
|--------------|--------|---------------------|
| UPLOADED | アップロード済み | QUEUED |
| QUEUED | 処理待ち | PROCESSING, CANCELLED |
| PROCESSING | AI処理中 | COMPLETED, NEEDS_REVIEW, FAILED |
| COMPLETED | 完了 | なし（終端） |
| NEEDS_REVIEW | 要レビュー | COMPLETED（承認）, FAILED（却下） |
| FAILED | 失敗 | QUEUED（リトライ、最大3回）|
| CANCELLED | キャンセル済み | なし（終端） |

---

## Slide 11: 外部インターフェース要件

### 8.1 AIサービス（Python FastAPI）

```
8.1 AIサービス連携

連携方式: REST API（HTTP POST）
通信方向: Laravel → Python FastAPI
認証方式: API Key（X-API-Key ヘッダー）
          ※ API KeyはLaravelの.envのみに保存

【リクエスト形式】
POST http://ai-service:8000/api/v1/extract
Content-Type: application/json
X-API-Key: {INTERNAL_AI_API_KEY}

Body:
{
  "invoice_id": "uuid",
  "file_url": "s3-presigned-url（有効期限5分）",
  "doc_type_hint": "DOC001"  // 任意
}

【レスポンス形式（成功時）】
{
  "status": "success",
  "confidence": 0.91,
  "extracted": {
    "supplier_name":  { "value": "EVN河内電力公司", "confidence": 0.95 },
    "invoice_date":   { "value": "2026-03-15",     "confidence": 0.88 },
    "total_amount":   { "value": 1250000,           "confidence": 0.97 },
    "tax_amount":     { "value": 113636,            "confidence": 0.89 },
    "invoice_type":   { "value": "電気代",          "confidence": 0.92 }
  },
  "suggested_account": "627",
  "processing_time_ms": 2340
}

【タイムアウト設定】
・接続タイムアウト: 5秒
・読み取りタイムアウト: 30秒
・タイムアウト時: ERR-AI-001 を記録、リトライキューに投入

【エラーコード】
・ERR-AI-001: AIサービス接続不可 / タイムアウト
・ERR-AI-002: AIサービス内部エラー（500エラー）
・ERR-AI-003: 画像品質不足（解像度低、ぼかしあり）
・ERR-AI-004: 対応外ファイル形式
```

### 8.2 S3/MinIO（ファイルストレージ）

```
8.2 S3/MinIO 連携

利用目的: 証憑ファイル（画像・PDF）の保存
連携方式: AWS SDK（Laravel側） / Dart AWS SDK（Flutter側は使用しない）
バケット構成:
  ・メインバケット: ai-ia-invoices-prod（プライベート）
  ・バックアップ: ai-ia-invoices-backup（別リージョン）
ファイルパス構成: {year}/{month}/{user_id}/{invoice_id}/{filename}

【Signed URL仕様】
・発行者: Laravelバックエンドのみ
・有効期限: 閲覧用 15分 / AI処理用 5分
・用途別に異なる有効期限を設定
・URLにIPアドレス制限は設けない（モバイル対応のため）

【ファイル保存時の処理】
1. Flutterがファイルを Laravel APIにPOST
2. LaravelがS3へアップロード
3. S3 URLをDBに保存（フルURLではなくキーのみ）
4. フロントへはSigned URLを都度発行
```

### 8.3 通知（メール/プッシュ通知）

```
8.3 通知サービス

【メール通知】
連携方式: SMTP（SendGrid or SES）
送信タイミング: イベント発生時（非同期）
テンプレート管理: コード内テンプレート（Phase 2でDB管理）

【プッシュ通知（Flutter）】
連携方式: Firebase Cloud Messaging (FCM)
対応デバイス: Web (PWA) + iOS + Android
デバイストークン: ログイン時に登録、ログアウト時に削除
通知カテゴリ:
  ・PROCESSING_COMPLETE: NEEDS_REVIEW になった時
  ・PROCESSING_FAILED:   FAILED確定時
  ・BATCH_COMPLETE:      バッチ全体完了時
  ・REMINDER:            NEEDS_REVIEW放置24時間後

【通知失敗ハンドリング】
・メール送信失敗: リトライ3回（30分間隔）、失敗でログ記録
・プッシュ通知失敗: メールにフォールバック
```

### 8.4 会計ソフト連携（エクスポート）

```
8.4 エクスポート仕様

【弥生会計 CSV形式】
出力列: 取引日, 借方科目コード, 借方金額, 貸方科目コード,
        貸方金額, 消費税額, 摘要（取引先名+メモ）
文字コード: Shift-JIS（弥生会計の要件）
改行コード: CRLF
ヘッダー行: あり

【汎用Excel形式】
出力列: 上記 + 証憑ファイル名, 処理日時, 担当者名
文字コード: UTF-8（BOM付き）
```

---

## Slide 12: 制約・前提条件 & 課題管理表

### 9. 制約・前提条件

**制約条件**
- 利用環境: インターネット経由（VPN不要、Flutterモバイルアプリ対応のため）
- AIモデル: LayoutLMv3-base-sroie を使用（モデル変更はPhase 2）
- DB: PostgreSQL（JSONBカラムで抽出データの柔軟なスキーマに対応）
- 開発期間: 4ヶ月（スプリント4回 × 2週間）
- ファイル形式: JPG/PNG/PDF のみ対応（Phase 2でTIFF, HEIC追加予定）
- バッチ上限: 50ファイル/回（インフラコスト管理のため）

**前提条件**
- Flutterアプリはモバイルも動作対象（App Store/Google Play配布は Phase 2）
- 弥生会計へのリアルタイムAPI連携は Phase 2
- 電子帳簿保存法への完全対応は Phase 2（要法律確認）
- AIモデルの精度: ベトナム語・日本語混在領収書で 85%以上（要実証）
- 初期マスタデータ（取引先・勘定科目・マッピングルール）: 開発開始前に顧客提供

### 10. 課題・未決事項管理表

| No | 課題ID | 課題内容 | 分類 | 担当 | 期限 | 優先度 | ステータス |
|----|--------|---------|------|------|------|--------|-----------|
| 1 | Q-001 | AIの信頼度閾値を何%に設定するか（デフォルト値） | AI設定 | Admin+顧客 | — | 高 | 顧客確認待ち |
| 2 | Q-002 | ベトナム語の領収書（VND表記）の処理精度は担保できるか | AI精度 | AI開発チーム | — | 高 | 検証中 |
| 3 | Q-003 | 電子帳簿保存法への対応は今回のスコープに含めるか | スコープ | PM+顧客 | — | 高 | 法律確認待ち |
| 4 | Q-004 | AI処理が全て失敗した場合の手動入力フォールバックは必要か | 機能 | BA+顧客 | — | 中 | 確認中 |
| 5 | Q-005 | 弥生会計のCSV形式は顧客の弥生バージョンに合わせる必要があるか | IF | 顧客 | — | 中 | 顧客確認待ち |
| 6 | Q-006 | マッピングルールの自動学習（ユーザー修正データからの学習）は必要か | AI機能 | PM | Phase 2 | 低 | Phase 2確定 |
| 7 | Q-007 | 処理ログ・監査ログの保持期間: 7年で法的要件を満たすか | 法律 | 顧客+弁護士 | — | 高 | 確認中 |
| 8 | Q-008 | 同じ請求書を2回アップロードした場合の重複検知は必要か | 機能 | BA | — | 中 | 検討中 |

---

## Slide 13: 相互レビュー — チェックポイント

### このシステム特有の確認ポイント

**AIシステム特有チェック**
- [ ] AI処理ステータスの全遷移パターンが定義されているか（7パターン全て）
- [ ] 信頼度閾値の設定方法と、閾値以下の場合の動作が定義されているか
- [ ] AIサービスがダウンした場合のフォールバック処理が定義されているか
- [ ] AIの精度定義（何をもって「正解」とするか）が明記されているか

**非同期処理チェック**
- [ ] UPLOADED → QUEUED → PROCESSING の各遷移条件が明確か
- [ ] リトライ回数・間隔・上限が定義されているか（最大3回など）
- [ ] バッチ処理で1件失敗した場合に他件を継続する設計か
- [ ] FAILED_CRITICALの定義（50%超など）と通知先が明確か

**セキュリティチェック（財務データ特有）**
- [ ] AIサービスのAPIキーがフロントエンドに渡らない設計か
- [ ] S3ファイルの直接公開URLを使用していないか（Signed URL使用か）
- [ ] 他ユーザーの証憑ファイルにアクセスできないよう制御されているか
- [ ] 監査ログに金額・承認操作が記録されるか

**大量データ対応チェック**
- [ ] invoices テーブルのインデックスが設計されているか
- [ ] 一覧画面にページネーションが定義されているか
- [ ] CSVエクスポートで大件数（1万件以上）の場合の処理が考慮されているか

**業務フロー・機能チェック**
- [ ] Human-in-the-loop（AIが提案→人間が確認）のフローが明確か
- [ ] 仕訳データと証憑ファイルのリンクが管理されているか
- [ ] 弥生会計CSVの文字コード・形式仕様が定義されているか

---

## Slide 14: 全体ドキュメント完成度

```
AI請求書自動処理システム(AI-IA) 要件定義書 完成度

 1. 文書概要・改訂履歴          ████████████████████ 100%
 2. システム概要（背景・目的）   ████████████████████ 100%
 3. 権限マトリックス（3ロール）  ████████████████████ 100%
 4. 書類種別マスタ              ████████████████████ 100%
 5. 請求書ステータス遷移図      ████████████████████ 100%
 6. 業務フロー As-Is            ████████████████████ 100%
 7. 業務フロー To-Be（非同期）   ████████████████████ 100%
 8. 機能一覧 F001〜F092         ████████████████████ 100%
 9. 機能詳細 F025 一括UL        ████████████████████ 100%
10. 機能詳細 F040 AIレビュー    ████████████████████ 100%
11. 機能詳細 残り機能           ██████████░░░░░░░░░░  50%
12. 非機能要件（性能・可用性）   ████████████████████ 100%
13. 非機能要件（セキュリティ）   ████████████████████ 100%
14. 非機能要件（監査）          ████████████████████ 100%
15. 画面一覧                   ████████████████████ 100%
16. 画面遷移図                 ████████████████████ 100%
17. データ要件（テーブル・IX）   ████████████████████ 100%
18. 外部IF要件                 ████████████████████ 100%
19. 制約・前提条件              ████████████████████ 100%
20. 課題管理表                 ████████████████████ 100%

全体完成度                     ████████████████████  93%
（残り: 機能詳細 残り機能の記述）
```

---

## Slide 15: まとめと卒業課題

### まとめ
- **非同期処理のState管理**は設計の核心 — 全遷移パターンを漏れなく定義する
- **大量データ対応**はインデックス設計から始まる — 後から追加するとコストが高い
- **セキュリティは設計に組み込む** — API keyとSigned URLは妥協しない
- AI精度の定義（何%が「合格」か）はビジネス要件 — 技術チームだけで決めない
- 課題管理表は「追いかける」姿勢が大事 — Q-007（監査ログ期間）のような法律系は早期に解決

### 卒業課題

> **Part 1: 残りの機能詳細を完成させる（全5件）**
>
> - **F032 失敗リトライ** — リトライ制御ロジック（最大3回、インターバル）の全State
> - **F053 CSVエクスポート** — 弥生会計形式の出力仕様、大件数の分割処理
> - **F071 バッチ完了サマリー通知** — バッチ完了時のサマリーメール仕様
> - **F081 AI精度レポート** — 精度計算ロジック（正解率の定義含む）
> - **F090 AI信頼度閾値設定** — 閾値変更時の既存未処理データへの影響

> **Part 2: 新機能を1つ自分で考えて追加する**
>
> 現在のAI-IAには含まれていない機能を1つ考え、
> 機能詳細（前提条件・基本フロー・代替フロー・例外フロー・バリデーション）を
> 完全に書いてください。
>
> ヒント（例）:
> - 重複検知機能（同じ請求書を2回アップロードした場合）
> - 請求書の月次集計機能（取引先別・科目別）
> - AI精度フィードバック学習機能（修正データをモデル改善に活用）
> - WhatsApp/LINE通知連携（ベトナム人スタッフ向け）
>
> ⚠️ 次回（最終回）は**卒業課題発表**です。
> 作成した要件定義書を5分間でプレゼンしてください。

### 次回
**第8回（最終回）:** 卒業課題発表 & 総まとめ — 実務での活かし方・BA黄金ルール
