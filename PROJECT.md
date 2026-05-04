# 小児便秘AI（2-3歳）プロジェクト

## 1. 目的

2-3歳の慢性機能性便秘症の患児に対し、
保護者が入力した日誌・問診データを医師が診察前に即座に把握できる形に整理する。

本システムは診療判断を行うAIではなく、
「診察前情報整理・診察支援ツール」として設計する。

---

## 2. 対象

- 2-3歳の小児慢性機能性便秘症
- モビコール（PEG製剤）導入期・維持期

---

## 3. システムの役割

### すること

- 保護者入力データの構造化
- 必要な追加質問の動的表示
- 医師用サマリーの生成
- 診察支援ダッシュボードの表示
- 医師診察で確認する安全・追加確認項目の整理

### しないこと（重要）

- 診断
- 便塞栓の有無判断
- 処方量変更
- 薬の増減・中止指示
- 治療終了判断
- 専門紹介判断

---

## 4. 現在の機能（実装済み）

### 問診機能

- 基本6問
- 条件分岐による追加質問
- 医療者監修後の保護者向け文言調整

### 出力

- 医師向けミニサマリー（テキスト）
- JSONデータ出力
- 院内共有用テキスト
- PDF/印刷用ダッシュボード
- 患者向け保存メモ
- 患者ID・来院トークン入り問診URL/QR作成ページ

### 診察支援ダッシュボード（最新）

以下の順で表示：

1. 緊急度/確認優先度
2. 排便スナップショット
3. 安全・追加確認
4. 便秘薬の状況
5. 診察で見るポイント
6. AIが判断していないこと
7. JSON

---

## 5. 判定ロジック

### urgency分類

- watch（診察で確認）
- stable（通常確認）

医療者監修により、受付・スタッフ共有の分類は廃止し、追加確認が必要な項目はすべて医師が診察で確認する運用に変更。

主な評価要素：

- 無排便期間
- 便性状
- 排便時痛
- がまん行動
- 嘔吐・腹痛
- 食欲・機嫌
- 内服状況
- 直近日誌・週次サマリー

---

## 6. 履歴連携方針

Google Sheetsを、電子カルテ連携ではなく便秘診療の補助台帳として使う。

想定する流れ：

1. 患者が待合でHTMLアプリに入力する。
2. 入力結果をGoogle Apps Script経由でGoogle Sheetsに保存する。
3. 同じ患者IDの過去受診、処方、トイレトレーニング、日誌、便性状の変化を医師側で確認する。
4. 必要時、過去3-5回分の経過を医師がChatGPTに貼り付け、確認すべき変化点や不足情報を整理する。

ChatGPTは、診断、処方量変更、薬の中止・再開、治療終了、専門紹介を判断しない。

詳細設計：

- `google_sheets_history_integration_design.md`

---

## 7. 医師向け価値

- 診察前に「一目で状態把握」
- 聴取時間の短縮
- 見落とし防止（安全確認）
- 診察の質の均一化

---

## 8. 保護者向け価値

- 入力の負担を最小化
- 安心感の提供
- 医師への相談準備
- 入力結果を簡易メモとして保存し、不安時に自己判断ではなく相談準備へ戻れる

---

## 9. 現在の技術構成

- HTML / CSS / JavaScript
- Node.js（テスト実行）
- ローカルブラウザ実行
- Google Sheets / Google Apps Script（履歴連携・保存動作確認済み）

主要ファイル：

- `constipation-ai-mvp/index.html`
- `constipation-ai-mvp/visit-link.html`
- `constipation-ai-mvp/history-link.html`
- `constipation-ai-mvp/src/app.js`
- `constipation-ai-mvp/src/questionnaire.js`
- `constipation-ai-mvp/tests/`
- `apps-script/Code.gs`
- `google_sheets_history_integration_design.md`
- `google_apps_script_setup_guide.md`
- `github_pages_setup_guide.md`
- `test_patient_operation_guide.md`
- `deployment_operation_decision.md`

---

## 10. 設計原則（最重要）

- AIは医療判断をしない
- 出力は「医師が使える形」に限定
- 保護者には安心を優先
- 情報は構造化する
- UIは直感的に
- 入力負担は最小限
- 患者向け出力は、薬の自己判断を促さず、記録と相談準備に限定する

---

## 11. 現在の到達フェーズ

MVP → Google Sheets連携の動作確認済み段階

- UI完成度：中〜高
- ロジック完成度：中〜高
- 医療妥当性：初回監修コメント反映済み
- Google Apps Script連携：テスト患者で `visits` 保存確認済み
- 次段階：問診HTMLの公開方法決定、運用UI整理、履歴参照の実運用確認

---

## 12. Google Apps Script接続状況

- `setupSheets()` で台帳シート作成済み。
- Web App URL経由でHTMLアプリから `doPost` 保存成功。
- `visits` シートにテスト患者データ保存確認済み。
- Web Appはテスト時に「アクセスできるユーザー: 全員」で動作確認。
- `Code.gs` は単独Apps Scriptでも動くよう `SPREADSHEET_ID` 指定に対応。
- Sheets表示改善として列幅、折り返し、固定列、JSON列非表示を追加。
- 患者IDは `00100` から `99999` の5桁として扱い、先頭ゼロを省略しない。
- Google Sheetsの `patient_id` / `visit_id` / `visit_token` 等のID列は文字列形式に固定する。
- `submitVisit` 保存時に、未登録患者IDを `patients` へ自動追加し、直近日誌入力がある場合は `diary_weekly` へ自動保存する。
- `prescriptions` と `toilet_training` は、患者回答から自動推測せず、医師側で入力・管理する台帳として扱う。
- `visit-link.html` で、患者ID・来院トークン入りの問診URLとQRを作成可能。
- `history-link.html` で、医師用履歴表示、患者履歴JSON、ChatGPT貼り付け用テキストの確認URLを作成可能。
- Apps Scriptの `doctorEntry` で、医師が `prescriptions` と `toilet_training` を手入力で追記可能。
- `doctorEntry` は処方履歴だけ、トイレトレーニング履歴だけ、両方同時保存の3操作に対応する。
- `prescriptions.date` と `toilet_training.date` は診察前確認で時系列を追えるよう日時（`yyyy-MM-dd HH:mm:ss`）で保存する。
- 医師入力の保存後は入力画面へ戻し、ブラウザ更新で同じPOSTが再送信されにくい運用にする。
- 便秘履歴ページとChatGPT貼り付け用テキストでは、`prescriptions` / `toilet_training` / `diary_weekly` を日本語ラベルで表示する。
- 便秘履歴ページ上部に「診察前の確認」を置き、直近問診・直近処方・直近トイレトレーニング・直近週次日誌をまとめて表示する。
- 便秘履歴ページ内のChatGPT貼り付け用テキストは、ページ内表示から1クリックでコピーできる。
- 患者向け最終画面では、院内保存中・保存完了・保存失敗を画面下部に固定表示し、保存完了までは閉じないよう案内する。
- Macからの患者ID入りURL入力、iPhoneでのQR読み取りの双方で `visits` 保存成功を確認。
- テスト患者の `patientHistory` と `chatGPTContext` の実データ出力確認済み。
- ローカルテストでは `127.0.0.1` は端末自身を指すため、iPhone読み取り用QRにはMacのLAN内IPアドレス（例: `192.168.11.3`）を使う。
- `index.html` を患者ID・来院トークンなしで直接開いた場合は、Sheets保存対象外として扱う。


---

## 13. 現時点の運用メモ

ローカル検証では、Mac上でHTMLサーバーを起動し、同じWi-Fi上のiPhoneからMacのLAN内IPアドレスへアクセスする。

- URL/QR作成ページ: `http://MacのLAN内IP:8001/visit-link.html`
- 問診アプリURL: `http://MacのLAN内IP:8001/index.html`
- 患者に渡す実URL: `index.html?patient_id=...&visit_token=...`

実患者前テストの初期確認では、問診HTMLは院内端末から配信するローカル運用を基本にする。

ローカル運用で、履歴確認URL、`chatGPTContext`、医師入力、Google Sheets保存が動作確認できたため、次の運用改善候補はGitHub Pages等の静的ホスティングである。これにより、毎回 `192.168.x.x` のようなMacのLAN内IPアドレスを使わず、固定URLから `visit-link.html` / `index.html` / `history-link.html` を開けるようにする。

GitHub Pagesへ進む前に確認すること:

- HTML内または設定値として使うGoogle Apps Script Web App URLの露出範囲
- Web Appの公開範囲と保存権限
- GitHub Pagesで公開されるURLに実患者を直接特定する情報を含めないこと
- テスト患者IDで、QR作成、問診送信、Sheets保存、便秘履歴表示、医師入力が一通り動くこと

GitHub Pages固定URLテストの具体手順は `github_pages_setup_guide.md` にまとめる。

## 14. 次回再開時の作業順

次回は、実患者前テストへ向けた仕上げとして以下の順で進める。

1. GitHub Pages版の設定を確定する。
   - `history-link.html` のWeb App URL既定値修正をGitHubへpushする。
   - 固定URL版で、受付QR作成、iPhone問診、Sheets保存、履歴表示、医師入力をテスト患者IDで再確認する。
2. 医師入力のUXを改善する。
   - 両方保存時の待ち時間対策として、保存中表示を目立たせる。完了。
   - 二重クリック防止を強める。完了。
   - 保存完了後に入力欄をクリアする。完了。
3. テスト運用チェックリストを最終化する。
   - 実患者前にテスト患者IDで確認する項目を1枚に整理する。完了。
   - GitHub Pages固定URL運用を前提に、受付、患者入力、Sheets、医師履歴、医師入力の確認順を明確化する。完了。
4. 医療者レビュー用資料を更新する。
   - 現在の完成形に合わせて、レビュー依頼資料とワンページ資料を最新化する。完了。
