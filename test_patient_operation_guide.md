# 実患者前テスト患者チェックリスト

## 目的

実患者データを入れる前に、GitHub Pages固定URLから、受付QR作成、患者入力、Google Sheets保存、医師側履歴確認、医師入力までをテスト患者IDで確認する。

## 使うURL

- 受付用QR作成: `https://haman-360.github.io/constipation/constipation-ai-mvp/visit-link.html`
- 患者向け問診: `https://haman-360.github.io/constipation/constipation-ai-mvp/index.html`
- 医師用履歴URL作成: `https://haman-360.github.io/constipation/constipation-ai-mvp/history-link.html`
- Google Apps Script Web App URL: デプロイ済みの `/exec` URL

## 使うテスト情報

- 患者ID: 実患者と重ならない5桁ID。例: `99999`
- 来院トークン: 受付用QR作成ページで自動生成される4文字
- 実患者を直接特定する氏名、電話番号、住所などは入力しない

## 事前確認

- [ ] GitHub Pagesの3 URLが開く
- [ ] Apps Scriptの `setupSheets()` が実行済み
- [ ] Google Sheetsに `patients` / `visits` / `prescriptions` / `toilet_training` / `diary_weekly` がある
- [ ] Apps Script Web Appの `/exec` URLが現在の保存先として使える
- [ ] `history-link.html` のWeb App URL欄は通常変更不要。URLを再デプロイで作り直した場合だけ変更する

## 受付QR作成

- [ ] `visit-link.html` を開く
- [ ] 患者IDに5桁のテストIDを入力する
- [ ] 来院トークンが表示されている
- [ ] 詳細設定の問診アプリURLがGitHub Pagesの `index.html` になっている
- [ ] QRが表示される
- [ ] iPhoneでQRを読み取り、問診画面が開く

## 患者入力

- [ ] 問診を最後まで入力できる
- [ ] 直近日誌なしのパターンを1回確認する
- [ ] 直近日誌ありのパターンを1回確認する
- [ ] 最終画面下部に `院内保存中です。このままお待ちください。` が出る
- [ ] 保存完了後に `院内保存が完了しました。画面を閉じても大丈夫です。` が出る
- [ ] 患者用メモをコピーできる
- [ ] 患者向け画面に、薬の増減や診断を指示する文言が出ていない

## Google Sheets確認

- [ ] `visits` に新しい行が追加されている
- [ ] `patient_id` がテストIDと一致する
- [ ] `visit_token` がQR作成ページの表示と一致する
- [ ] `urgency_level` が `watch` または `stable`
- [ ] `questionnaire_json` と `summary_text` が保存されている
- [ ] 同じテストIDが未登録だった場合、`patients` に1行追加されている
- [ ] 直近日誌ありの場合、`diary_weekly` に1行追加されている
- [ ] 患者問診から `prescriptions` / `toilet_training` が自動追加されていない

## 医師側履歴確認

- [ ] `history-link.html` を開く
- [ ] 同じテスト患者IDを入力する
- [ ] 医師入力URL、医師用履歴表示URL、患者履歴JSON URL、ChatGPT診察前整理URL、ChatGPT治療方針検討URLが生成される
- [ ] `医師用履歴表示を開く` で便秘履歴が表示される
- [ ] 画面上部の `診察前の確認` に直近問診、処方、トイレトレーニング、週次日誌が表示される
- [ ] 処方履歴、トイレトレーニング履歴、週次日誌が日本語ラベルで読める
- [ ] `ChatGPT診察前整理テキストをページ内で表示` とコピーが動く
- [ ] `ChatGPT治療方針検討テキストをページ内で表示` とコピーが動く

## 医師入力確認

- [ ] `医師入力を開く` で医師入力画面が開く
- [ ] 処方履歴だけ保存できる
- [ ] トイレトレーニング履歴だけ保存できる
- [ ] 両方とも保存できる
- [ ] 保存中はボタンが押せない状態になり、二重クリックしにくい
- [ ] 保存完了後、入力欄がクリアされる
- [ ] 保存後、Sheetsの `prescriptions` / `toilet_training` に日時つきで反映される
- [ ] `患者台帳を開く` で生年月日と台帳メモを保存できる
- [ ] 保存後、Sheetsの `patients.birth_date` と `patients.note` に反映される
- [ ] 便秘履歴画面に戻ると、保存した処方・トイレトレーニングが表示される
- [ ] 便秘履歴画面とChatGPT貼り付け用テキストに、生年月日ではなく年齢表示だけが出る
- [ ] `visits` に `age_profile`、`age_text_at_visit`、`questionnaire_version` が保存される

## 合格条件

- [ ] 受付QR作成からiPhone問診送信まで迷わず進められる
- [ ] Google Sheetsに患者ID、来院トークン、問診、日誌が正しく保存される
- [ ] 医師側履歴で、診察前に必要な直近情報が一目で確認できる
- [ ] 医師入力で処方履歴とトイレトレーニング履歴を追記できる
- [ ] 医師側で患者台帳の生年月日を登録し、年齢表示に反映できる
- [ ] 実患者を直接特定する情報をテスト中に入力していない

## うまくいかない場合

- QRで問診が開かない: `visit-link.html` の詳細設定で問診アプリURLがGitHub Pagesの `index.html` になっているか確認する
- 院内保存が失敗する: Apps Script Web App URL、公開範囲、Spreadsheet IDを確認する
- `visits` に追加されない: Apps Scriptの実行ログとWeb AppのデプロイURLが `/exec` か確認する
- 医師用履歴URLが出ない: `history-link.html` のWeb App URL欄に実際の `/exec` URLが入っているか確認する
- 医師入力が保存されない: Apps Scriptを最新の `apps-script/Code.gs` に貼り替え、Web Appを再デプロイしたか確認する
- 患者台帳が保存されない: Apps Scriptを最新の `apps-script/Code.gs` に貼り替え、Web Appを再デプロイしたか確認する
