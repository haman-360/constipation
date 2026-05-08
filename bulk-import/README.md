# 既存患者 過去記録一括登録テンプレート

## 目的

既存患者さんの過去経過を、Google Sheetsへまとめて登録しやすくするための入力テンプレートです。

まずは過去記録を完璧に再現するより、診察前に役立つ情報を優先します。

- 直近3-5回の処方・診察経過
- 現在の処方と内服状況
- トイレトレーニング状況
- 直近1-4週の日誌または聞き取り要約
- 生年月日と医師用メモ

## ファイル

- `bulk_import_input_template.tsv`
  - 1枚の表として入力するための統合テンプレートです。
  - まずここに過去記録を入力すると、あとで各シートへ分けやすくなります。
- `patients_template.tsv`
  - Google Sheetsの `patients` タブへ貼り付ける形式です。
- `prescriptions_template.tsv`
  - Google Sheetsの `prescriptions` タブへ貼り付ける形式です。
- `toilet_training_template.tsv`
  - Google Sheetsの `toilet_training` タブへ貼り付ける形式です。
- `diary_weekly_template.tsv`
  - Google Sheetsの `diary_weekly` タブへ貼り付ける形式です。
- `visits_summary_template.tsv`
  - 過去受診の要約だけを `visits` タブへ入れたい場合の簡易テンプレートです。

## 推奨運用

1. `bulk_import_input_template.tsv` をGoogle Sheetsへ貼り付けます。
2. 患者ID、日付、記録種別、内容を入力します。
3. 必要な行だけ、各シート別テンプレートの列に合わせて転記します。
4. 既存の `patients` / `prescriptions` / `toilet_training` / `diary_weekly` / `visits` に貼り付けます。
5. `history-link.html` から患者IDを開き、履歴表示とChatGPT貼り付け用テキストに反映されるか確認します。

## 入力ルール

- `patient_id` は必ず5桁で入力します。例: `00123`
- 氏名、住所、電話番号など、患者さんを直接特定できる情報は入れません。
- 日付は `YYYY-MM-DD` を基本にします。時刻が必要な場合は `YYYY-MM-DD HH:MM` で入力します。
- 処方量や指示内容は医師が後から見て分かる表現にします。
- 不明な項目は空欄で構いません。

## 最小入力セット

既存患者さんを短時間で登録する場合は、最低限これだけで十分実用になります。

- `patients`: `patient_id`, `birth_date`, `note`
- `prescriptions`: `patient_id`, `date`, `medicine_name`, `dose`, `instruction`, `doctor_note`
- `toilet_training`: `patient_id`, `date`, `training_status`, `diaper_status`, `toilet_refusal`, `note`
- `diary_weekly`: `patient_id`, `period_start`, `period_end`, `bowel_days`, `longest_no_bowel_days`, `hard_days`, `pain_days`, `withholding_days`, `med_taken_days`, `note`

## 注意

このテンプレートは診察前情報整理のための補助台帳です。診断、処方量変更、中止、再開、治療終了、専門紹介などの判断を自動化するものではありません。
