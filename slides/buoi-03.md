# Buổi 3 — Kỹ thuật viết: 業務フロー & 機能詳細

---

## Slide 1: Mục tiêu buổi học

### Sau buổi này bạn sẽ biết
- Vẽ 業務フロー (Business Flow) đúng chuẩn Nhật
- Phân biệt As-Is và To-Be flow
- Viết 機能詳細 (Function Detail) đầy đủ
- Xử lý exception flow — phần hay bị bỏ sót nhất

### Ôn tập buổi 2
> **Quiz nhanh:** Tài liệu Yokenteigi có mấy phần chính? Kể tên 5 phần bạn nhớ nhất?

---

## Slide 2: Tại sao 業務フロー quan trọng?

### Sai lầm phổ biến của người mới
❌ Viết chức năng mà không hiểu quy trình nghiệp vụ
→ Kết quả: hệ thống đúng về kỹ thuật nhưng **không dùng được** trong thực tế

### Ví dụ thực tế
**Tình huống:** Hệ thống quản lý đơn hàng của công ty thương mại

Nếu không vẽ 業務フロー, BA có thể bỏ sót:
- Đơn hàng cần qua 3 cấp phê duyệt trước khi xử lý
- Trưởng phòng chỉ phê duyệt đơn < 10 triệu, lớn hơn cần Giám đốc
- Khi hàng hết kho, cần tạo đơn đặt hàng nhà cung cấp tự động

### Kết luận
> 業務フロー = Bản đồ giúp bạn **không bỏ sót** yêu cầu ẩn

---

## Slide 3: Quy trình vẽ 業務フロー — 5 bước

```
Bước 1: Xác định phạm vi
        ↓
Bước 2: Liệt kê tác nhân (Swimlane)
        ↓
Bước 3: Vẽ As-Is Flow
        ↓
Bước 4: Phân tích điểm đau (Pain Points)
        ↓
Bước 5: Vẽ To-Be Flow
```

### Bước 1: Xác định phạm vi
- Flow này bắt đầu từ đâu? Kết thúc ở đâu?
- **Ví dụ:** "Từ khi khách đặt hàng → đến khi khách nhận hàng"
- Ghi rõ: 対象範囲: ○○から△△まで

### Bước 2: Liệt kê tác nhân (Swimlane)
- Ai tham gia vào quy trình? → Mỗi người/hệ thống = 1 lane
- **Ví dụ:** Khách hàng | Nhân viên bán hàng | Kho | Kế toán | Hệ thống

---

## Slide 4: Vẽ As-Is Flow — Quy trình hiện tại

### Ví dụ: Quy trình đặt hàng (As-Is — thủ công)

```
┌───────────┬───────────────┬───────────┬───────────┐
│  顧客      │  営業担当      │   倉庫     │   経理     │
├───────────┼───────────────┼───────────┼───────────┤
│           │               │           │           │
│ [電話/FAX] │               │           │           │
│ 注文連絡   │               │           │           │
│     │     │               │           │           │
│     └────>│ [手書きで]     │           │           │
│           │ 受注票作成     │           │           │
│           │     │         │           │           │
│           │     └────────>│ [在庫確認] │           │
│           │               │     │     │           │
│           │               │ あり│なし  │           │
│           │     ┌─────────│─────┘     │           │
│           │<────┘ 在庫あり │           │           │
│           │ 確認連絡       │ [発注書]   │           │
│     ┌─────│<──────────────│ 作成・送付 │           │
│ 納期確認  │               │           │           │
│     │     │               │           │           │
│     └────>│ [Excelで]     │           │           │
│           │ 売上記録       │           │           │
│           │     │         │           │           │
│           │     └─────────────────────>│[請求書]  │
│           │               │           │ 作成      │
└───────────┴───────────────┴───────────┴───────────┘

課題点:
- 電話・FAX → 聞き間違いのリスク
- 手書き → 転記ミス
- Excel管理 → バージョン管理困難
- 所要時間: 平均45分/件
```

---

## Slide 5: Phân tích Pain Points

### Kỹ thuật phân tích As-Is Flow

**Các câu hỏi cần đặt ra:**

| Câu hỏi | Mục đích |
|---------|---------|
| Bước nào mất nhiều thời gian nhất? | Tìm bottleneck |
| Bước nào hay xảy ra lỗi? | Tìm risk point |
| Bước nào làm thủ công nhưng có thể tự động? | Cơ hội cải tiến |
| Bước nào cần chờ người khác? | Phụ thuộc, delay |
| Thông tin nào bị nhập nhiều lần? | Dư thừa |

### Kết quả phân tích ví dụ trên

| Pain Point | Tác động | Giải pháp To-Be |
|-----------|---------|----------------|
| Nhập tay từ điện thoại | Sai thông tin, mất 10 phút | Form đặt hàng online |
| Kiểm tra tồn kho thủ công | Delay 15 phút | Tự động check tồn kho real-time |
| Excel rời rạc | Không có báo cáo tổng hợp | DB tập trung, báo cáo tự động |

---

## Slide 6: Vẽ To-Be Flow — Quy trình mới

### Ví dụ: Quy trình đặt hàng (To-Be — có hệ thống)

```
┌───────────┬───────────────┬───────────┬───────────┐
│  顧客      │  システム      │   倉庫     │   経理     │
├───────────┼───────────────┼───────────┼───────────┤
│           │               │           │           │
│ [Web画面]  │               │           │           │
│ 注文入力   │               │           │           │
│     │     │               │           │           │
│     └────>│ [自動]         │           │           │
│           │ バリデーション  │           │           │
│           │ 在庫確認       │           │           │
│           │     │         │           │           │
│           │ 在庫あり       │ 在庫なし   │           │
│     ┌─────│<──────        │ [自動]通知>│           │
│ 注文確認  │               │ 発注処理   │           │
│ メール受信│               │           │           │
│           │               │           │           │
│           │ [翌日自動]     │           │           │
│           │ 売上計上───────────────────>│[自動]    │
│           │               │           │ 請求書生成 │
└───────────┴───────────────┴───────────┴───────────┘

改善効果:
- 処理時間: 45分 → 5分以内
- 入力ミス: ゼロ（バリデーション）
- 在庫確認: リアルタイム
```

---

## Slide 7: Công cụ vẽ 業務フロー

### Lựa chọn phổ biến

| Tool | Ưu điểm | Nhược điểm | Dùng khi |
|------|---------|-----------|---------|
| draw.io (diagrams.net) | Miễn phí, nhiều template | Không real-time collab | Solo hoặc offline |
| Cacoo | Chuẩn Nhật, collab tốt | Trả phí | Team có budget |
| Visio | Chuẩn doanh nghiệp | Đắt, chỉ Windows | Công ty lớn |
| Miro | Collab real-time | Không chuyên dụng | Workshop, brainstorm |
| PowerPoint | Sẵn có, dễ dùng | Không chuyên nghiệp | Nội bộ, draft |

### Lời khuyên thực tế
> Khi làm với khách hàng Nhật: **draw.io** hoặc **Cacoo** được chấp nhận rộng rãi.
> Export ra PNG/PDF kèm vào Word/Excel khi submit tài liệu.

---

## Slide 8: Kỹ thuật viết 機能詳細 — Phần quan trọng nhất

### Tại sao 機能詳細 hay bị viết thiếu?

**Người mới thường chỉ viết Happy Path:**
```
1. Người dùng nhập thông tin
2. Nhấn Đăng ký
3. Hệ thống lưu và chuyển trang thành công
```

**Nhưng thực tế cần:**
- 8 trường hợp validation
- 3 alternative flow
- 5 exception flow
- Email confirmation flow
- Rollback khi DB lỗi giữa chừng

---

## Slide 9: Template 機能詳細 — Chi tiết

```markdown
## 機能ID: F001 — ユーザー登録

### 基本情報
| 項目 | 内容 |
|------|------|
| 機能ID | F001 |
| 機能名 | ユーザー登録 |
| 対象ユーザー | 未登録の一般ユーザー |
| 関連画面 | S001（登録画面）、S002（登録完了画面） |
| 優先度 | 必須 |

### 前提条件
- ユーザーがシステムにアクセスできる状態
- メールアドレスが未登録であること

### 事後条件（成功時）
- ユーザーアカウントがDBに登録されている
- 確認メールがユーザーのアドレスに送信されている

---

### 基本フロー
1. ユーザーが登録画面にアクセスする
2. ユーザーが以下の情報を入力する
   - メールアドレス（必須）
   - パスワード（必須）
   - パスワード確認（必須）
   - 氏名（必須）
   - 生年月日（任意）
3. ユーザーが「利用規約」に同意するチェックボックスをONにする
4. ユーザーが「登録」ボタンをクリックする
5. システムが入力値をバリデーションする（→ バリデーション仕様参照）
6. システムがDBにユーザー情報を登録する
7. システムが確認メールを送信する（送信時間：60秒以内）
8. システムが登録完了画面（S002）に遷移する

---

### 代替フロー
**2a. SNSログインで登録する場合**
→ 2a-1. [Google/Facebookでログイン]ボタンをクリック
→ 2a-2. 外部認証画面に遷移
→ 2a-3. 認証成功後、氏名・生年月日のみ入力を促す
→ 2a-4. 手順3へ戻る

---

### 例外フロー
**5a. バリデーションエラーの場合**
- エラー箇所を赤枠で強調表示
- エラーメッセージをフィールド直下に表示
- ページ上部にエラーサマリーを表示
- 入力済み内容は保持する（パスワード以外）

**6a. メールアドレスが既に登録済みの場合**
- エラーメッセージ：「このメールアドレスはすでに登録されています」
- 「パスワードを忘れた方はこちら」リンクを表示

**7a. メール送信失敗の場合**
- DB登録は維持する（ロールバックしない）
- エラーログを記録する
- 登録完了画面に「メール送信に失敗しました。再送信はこちら」を表示

**6b. DB接続エラーの場合**
- トランザクションをロールバック
- エラーメッセージ[ERR-DB-001]を表示
- システム管理者にアラートメール送信

---

### バリデーション仕様

| フィールド | 必須 | 型 | 最大長 | 形式 | エラーメッセージ |
|-----------|------|-----|--------|------|----------------|
| メール | ✓ | String | 254文字 | RFC 5321準拠 | 「有効なメールアドレスを入力してください」 |
| PW | ✓ | String | 128文字 | 8文字以上、英数字記号混在 | 「パスワードは8文字以上で英数字を含めてください」 |
| PW確認 | ✓ | String | — | PWと一致 | 「パスワードが一致しません」 |
| 氏名 | ✓ | String | 50文字 | — | 「氏名を入力してください」 |
| 生年月日 | — | Date | — | YYYY/MM/DD | 「有効な日付を入力してください」 |
```

---

## Slide 10: Lỗi phổ biến khi viết 機能詳細

### Lỗi 1: Chỉ viết Happy Path
❌ Bỏ qua 代替フロー và 例外フロー
✅ Rule: Mỗi bước có thể rẽ nhánh đều phải có alternative/exception

### Lỗi 2: Mô tả không định lượng
❌ "Hệ thống gửi email xác nhận"
✅ "Hệ thống gửi email xác nhận trong vòng 60 giây"

### Lỗi 3: Không xác định hành vi khi lỗi
❌ "Nếu lỗi DB, hiển thị thông báo lỗi"
✅ "Nếu lỗi DB: rollback transaction → hiển thị ERR-DB-001 → gửi alert email tới admin@company.com"

### Lỗi 4: Trộn lẫn UI và logic
❌ "Nút Đăng ký màu xanh, kích thước 120x40px"
→ Chi tiết UI để ở tài liệu Kihon Sekkei
✅ "Khi nhấn [登録] button → kích hoạt luồng đăng ký"

### Lỗi 5: Không xác định scope
❌ "Xác thực email" — Xác thực client-side hay server-side?
✅ "Hệ thống validate format email phía server theo RFC 5321"

---

## Slide 11: Thực hành tại lớp (30 phút)

### Bài tập

**Scenario:** Chức năng Đặt lịch cắt tóc (F003 — 予約登録)

**Thông tin có sẵn:**
- Người dùng chọn thợ cắt tóc, ngày giờ, dịch vụ
- Hệ thống kiểm tra lịch trống của thợ
- Gửi SMS xác nhận cho khách

**Nhiệm vụ:**
1. Xác định **前提条件** và **事後条件**
2. Viết đầy đủ **基本フロー** (ít nhất 6 bước)
3. Liệt kê ít nhất **3 例外フロー** có thể xảy ra
4. Thiết kế **バリデーション** cho form đặt lịch

**Thời gian:** 20 phút viết + 10 phút thảo luận nhóm

---

## Slide 12: Tóm tắt buổi 3 & Bài tập về nhà

### Tóm tắt
- 業務フロー: vẽ As-Is để hiểu vấn đề → phân tích pain points → vẽ To-Be
- 機能詳細 bắt buộc có: 前提条件, 基本フロー, 代替フロー, 例外フロー, バリデーション
- Không bao giờ chỉ viết Happy Path
- Luôn định lượng thời gian, số lượng, giới hạn

### Bài tập về nhà
> Với chức năng **Hủy lịch đặt cắt tóc** (F004 — 予約キャンセル):
>
> Viết 機能詳細 hoàn chỉnh bao gồm:
> - Quy tắc: Hủy trước 24h không mất phí / Hủy trong 24h mất 30% phí
> - Happy path, 代替フロー, 例外フロー
> - バリデーション

### Buổi sau
**Buổi 4:** Kỹ thuật viết 非機能要件, 画面遷移図, và データ要件
