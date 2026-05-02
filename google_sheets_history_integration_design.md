# Google Sheets 履歴連携設計

## 目的

待合で保護者が入力した便秘問診・直近日誌を、医師側で読み込み、Google Sheets上の過去履歴と合わせて診察前に確認できるようにする。

電子カルテへの直接連携は目標にしない。Google Sheetsは、院内で便秘診療の経過を整理するための補助台帳として使う。

## 全体方針

### 患者側

- 待合でHTMLアプリを開き、問診を入力する。
- 入力後、患者には専門的判断を含まない簡易メモを表示・保存できるようにする。
- 患者向け画面では、診断、薬の増減、中止、治療終了判断は行わない。

### 医師側

- 保護者入力を医師側HTMLまたはGoogle Apps Script経由で読み込む。
- Google Sheetsに、問診、日誌、処方、トイレトレーニング、過去受診履歴を保存する。
- 必要時、過去3-5回分の経過をテキスト化し、医師がChatGPTへ貼り付ける。
- ChatGPTは薬の調節判断を行わず、医師が確認すべき材料を整理する。

## 想定フロー

### フローA: 患者スマホから直接送信

1. スタッフが患者IDまたは来院用URLを案内する。
2. 患者が待合で問診HTMLを開く。
3. 患者が問診・直近日誌を入力する。
4. 送信ボタンでGoogle Apps Script Web AppへPOSTする。
5. Google Sheetsに1回分の問診履歴として保存する。
6. 医師側はGoogle Sheetsまたは医師用HTMLで履歴を確認する。

利点:

- QRコードに長い回答データを入れなくてよい。
- 入力後すぐSheetsに保存できる。

注意:

- Apps Script Web Appの公開範囲、アクセス制御、個人情報の扱いを決める必要がある。

### フローB: 回答後QRを医師側で読み取る

1. 患者が待合で問診HTMLを開く。
2. 入力完了後、患者スマホに回答QRコードを表示する。
3. スタッフまたは医師側端末でQRコードを読み取る。
4. 医師側HTMLに回答データを読み込む。
5. 医師側HTMLからGoogle Apps Scriptへ登録する。

利点:

- 患者スマホから直接インターネット送信しない運用も可能。
- 医師側で確認してから保存できる。

注意:

- QRコードに入る情報量には限界がある。
- 長文メモやJSON全体を入れると読み取りづらくなる。
- 実運用では、質問番号と回答番号の短い形式に圧縮する必要がある。

## 推奨MVP

最初はフローAを基本にする。

ただし、院内運用上、患者スマホから直接送信しにくい場合に備えて、フローBの「短縮QR」も後から追加できる構造にする。

## 患者ID

### 基本

- 患者IDは最大5桁の数字とする。
- 例: `12345`

### 取り違え対策

5桁IDだけでは誤入力のリスクがあるため、来院ごとの識別子を併用する。

推奨:

- `patient_id`: 最大5桁
- `visit_id`: 来院ごとのID
- `visit_token`: 当日発行の短い確認用文字列

例:

```json
{
  "patient_id": "12345",
  "visit_id": "20260503-12345-01",
  "visit_token": "A7K2"
}
```

## Google Sheets構成

1つのシートに全部を入れず、用途別に分ける。

### patients

患者の基本情報。個人情報を最小限にする。

| column | 内容 |
|---|---|
| patient_id | 最大5桁の患者ID |
| age_years | 年齢 |
| age_months | 月齢 |
| created_at | 初回登録日時 |
| note | 医師用メモ |

### visits

受診・問診1回ごとの記録。

| column | 内容 |
|---|---|
| visit_id | 来院ID |
| patient_id | 患者ID |
| submitted_at | 問診送信日時 |
| urgency_level | alert / watch / stable |
| urgency_label | 受付・スタッフ共有 / 診察で確認 / 通常確認 |
| headline | 医師向け概要 |
| questionnaire_json | 問診JSON |
| diary_json | 直近日誌JSON |
| summary_text | 医師向けサマリー |
| facility_share_text | 院内共有用テキスト |
| patient_memo_text | 患者保存用メモ |
| reviewed_by_doctor | 医師確認済み |
| doctor_note | 医師メモ |

### prescriptions

処方と量の履歴。AIではなく医師が入力・管理する。

| column | 内容 |
|---|---|
| prescription_id | 処方ID |
| patient_id | 患者ID |
| date | 処方日 |
| medicine_name | 薬剤名 |
| dose | 量 |
| instruction | 指示内容 |
| doctor_note | 医師メモ |

### toilet_training

トイレトレーニング状況の履歴。

| column | 内容 |
|---|---|
| patient_id | 患者ID |
| date | 記録日 |
| training_status | 未開始 / 開始中 / 中断中 / 不明 |
| diaper_status | おむつ / パンツ / 併用 / 不明 |
| toilet_refusal | なし / あり / 強い / 不明 |
| note | 補足 |

### diary_weekly

直近日誌または週次集計。

| column | 内容 |
|---|---|
| patient_id | 患者ID |
| period_start | 集計開始日 |
| period_end | 集計終了日 |
| recorded_days | 記録日数 |
| bowel_days | 排便あり日数 |
| longest_no_bowel_days | 最長無排便日数 |
| hard_days | 硬い便の日数 |
| pain_days | 痛みの日数 |
| withholding_days | がまんの日数 |
| soiling_days | 便付着・便失禁の日数 |
| med_taken_days | 内服できた日数 |
| note | 補足 |

## Apps Script API

### POST /submitVisit

患者問診または医師側HTMLから1回分の問診を登録する。

入力例:

```json
{
  "patient_id": "12345",
  "visit_id": "20260503-12345-01",
  "visit_token": "A7K2",
  "submitted_at": "2026-05-03T10:15:00+09:00",
  "questionnaire": {
    "q1_last_bowel_movement": "昨日",
    "q2_bowel_frequency": "2-3日に1回くらい"
  },
  "diary": {
    "diary_days_recorded": 7,
    "diary_bowel_days": 5
  },
  "outputs": {
    "urgency_level": "watch",
    "urgency_label": "診察で確認",
    "headline": "4日以上の無排便または排便間隔のあきがあります。",
    "summary_text": "...",
    "facility_share_text": "...",
    "patient_memo_text": "..."
  }
}
```

出力例:

```json
{
  "ok": true,
  "visit_id": "20260503-12345-01",
  "saved_at": "2026-05-03T10:15:05+09:00"
}
```

### GET /patientHistory

患者IDから過去履歴を取得する。

入力:

```text
patient_id=12345&limit=5
```

出力例:

```json
{
  "ok": true,
  "patient_id": "12345",
  "visits": [],
  "prescriptions": [],
  "toilet_training": [],
  "diary_weekly": []
}
```

### GET /chatGPTContext

医師がChatGPTへ貼り付けるためのテキストを生成する。

入力:

```text
patient_id=12345&limit=5
```

出力:

```text
これは医師が診察前に確認するための便秘経過サマリーです。
診断、処方量変更、治療中止、専門紹介の判断は行わないでください。
過去経過から、医師が確認すべき変化点、追加で聞くべきこと、注意して見るべき矛盾点だけを整理してください。

患者ID: 12345
過去受診: 5回
...
```

## ChatGPT貼り付け用テキスト

### 固定の安全ルール

ChatGPTに貼り付ける文頭に必ず入れる。

```text
これは医師が診察前に確認するための便秘経過サマリーです。
診断、処方量変更、治療中止、専門紹介の判断は行わないでください。
薬を増やす、減らす、やめる、再開するなどの指示は出さないでください。
過去経過から、医師が確認すべき変化点、追加で聞くべきこと、注意して見るべき矛盾点だけを整理してください。
```

### ChatGPTに期待する出力

- 前回から改善した点
- 前回から悪化した点
- 薬の飲み忘れ、少なめ、中止、飲みにくさと便性状の関係
- トイレトレーニング状況と痛み・がまんの関係
- 医師が確認すべき追加質問
- 矛盾または不足している情報

### ChatGPTに期待しない出力

- 診断
- 処方量変更
- 薬の中止指示
- 治療終了判断
- 専門紹介判断
- 緊急受診判断の確定

## 患者向け保存メモ

患者にも入力結果を保存できるようにする。

目的は、薬の自己判断を促すことではなく、不安時に記録を見て診察で相談する方向へ戻すこと。

患者向けメモに含める内容:

- 今日のうんちの様子
- 痛み・がまんの有無
- お薬の飲み方
- 次回診察で相談すること
- 自分で薬の量を決めないこと
- 不安なときは日誌とこのメモを見て、相談内容を整理すること

患者向けメモに含めない内容:

- 薬を増やす
- 薬を減らす
- 薬をやめる
- 薬を再開する
- 便秘が治った、治っていないという判断

## QRコード設計

### 患者が最初に読み込むQR

URLに患者IDと来院トークンを含める。

```text
https://example.com/constipation.html?patient_id=12345&visit_token=A7K2
```

### 回答後に表示するQR

短縮形式にする。

例:

```text
v1|pid=12345|q1=2|q2=3|q3=1|q4=0|q5=0|q6=1|d=7,5,3,2,1,7
```

方針:

- QRは短い回答だけに使う。
- 長文メモや全JSONはApps Script送信を基本にする。
- QRで読み込んだ内容は、医師側HTMLで復元し、確認後にGoogle Sheetsへ保存する。

## セキュリティ・運用上の注意

- 患者IDだけで個人を特定できる運用にしない。
- 5桁IDの誤入力対策として来院トークンを併用する。
- Google Sheetsの共有権限は最小限にする。
- Apps Script Web Appの公開範囲を院内運用に合わせて設定する。
- 患者スマホに表示する内容には医療判断を書かない。
- ChatGPTへ貼る内容は、個人を直接特定できる情報を避ける。
- 処方量変更や治療方針は、医師が別途判断・記録する。

## 実装順序

1. 患者向け保存メモ生成
2. `patient_id` / `visit_id` / `visit_token` のpayload追加
3. Google Sheets用payload生成
4. Apps Scriptの`submitVisit`作成
5. Google Sheetsの各シート作成
6. 医師側で患者履歴を読む画面または関数作成
7. ChatGPT貼り付け用テキスト生成
8. 回答後QRの短縮形式を追加
