# 小児便秘AIプロジェクト

## 1. 目的

まずは2-3歳の慢性機能性便秘症の患児に対し、
保護者が入力した日誌・問診データを医師が診察前に即座に把握できる形に整理する。

本システムは診療判断を行うAIではなく、
「診察前情報整理・診察支援ツール」として設計する。

将来的には、0-1歳、3歳以降にも拡張し、年齢層ごとの便秘診療支援ツールとして育てる。

---

## 2. 対象

### 現MVP

- 2-3歳の小児慢性機能性便秘症
- モビコール（PEG製剤）導入期・維持期

### 将来拡張

- 0-1歳
- 3歳以降
- 年齢層ごとに、問診項目、注意すべき背景疾患、トイレトレーニング、薬剤・用量の考え方、保護者説明を分ける。

---

## 3. システムの役割

### すること

- 保護者入力データの構造化
- 必要な追加質問の動的表示
- 医師用サマリーの生成
- 診察支援ダッシュボードの表示
- 医師診察で確認する安全・追加確認項目の整理
- 医師向けChatGPT相談用テキストの生成
- 医師向けに、ガイドラインや一般的診療原則と矛盾しにくい治療方針候補を整理するための相談プロンプトを提供する

### しないこと（重要）

- 診断
- 便塞栓の有無判断
- 患者・保護者へ直接、処方量変更、薬の増減・中止・再開を指示すること
- 患者・保護者へ直接、治療終了や専門紹介の判断を伝えること
- 医師の最終判断を代替すること

医師専用の治療方針検討モードでは、診断や処方の最終決定は医師が行う前提で、方針候補、推奨度、避けたい選択肢、保護者説明案を整理する。

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
- 医師側の患者台帳UI（生年月日、台帳メモ）

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
4. 必要時、過去3-5回分の経過を医師がChatGPTに貼り付け、目的に応じて以下のどちらかを使う。

### ChatGPT相談モード

1. 診察前整理モード
   - 変化点、不足情報、矛盾点、診察で追加確認すべきことだけを整理する。
   - 患者・保護者に見せても危険が少ない安全側の出力とする。
2. 医師向け治療方針検討モード
   - 医師が使うことを前提に、ガイドラインや一般的診療原則と矛盾しにくい方針候補を整理する。
   - 出力は、現在の状態評価、方針候補、推奨度、理由、避けたい方針、再診間隔の考え方、追加確認事項、保護者説明案とする。
   - 最終的な処方量、減量、中止、再開、治療終了、専門紹介は医師が決定する。

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
- `chatgpt_treatment_review_sample_cases.md`
- `age_profile_expansion_design.md`
- `age_profile_chatgpt_prompt_design.md`
- `age_profile_questionnaire_switch_design.md`
- `age_profile_review_summary.md`
- `infant_questionnaire_prototype.md`
- `child_questionnaire_prototype.md`

---

## 10. 設計原則（最重要）

- AIは医師の判断を代替しない
- 出力は「医師が使える形」に限定
- 保護者には安心を優先
- 情報は構造化する
- UIは直感的に
- 入力負担は最小限
- 患者向け出力は、薬の自己判断を促さず、記録と相談準備に限定する
- 医師向け出力では、方針候補や推奨度を出してもよいが、根拠、前提、不確実性、追加確認事項を必ず併記する
- 患者・保護者向け文面と医師向け検討文面を明確に分ける

---

## 10.1 年齢層拡張方針

今の2-3歳MVPを土台に拡張する。0から別アプリを作り直すのではなく、共通基盤と年齢別ロジックを分ける。

### 共通で使う部分

- 患者ID・来院トークン入りQR作成
- 問診送信
- Google Sheets保存
- 便秘履歴表示
- 医師入力台帳
- ChatGPT貼り付け用テキスト生成
- 患者向け保存メモ

### 年齢層ごとに分ける部分

- 問診項目
- 条件分岐
- 便性状・排便頻度の解釈
- トイレトレーニング関連項目
- 薬剤・用量検討に必要な情報
- 医師向け注意点
- 保護者向け説明文

### 想定する年齢プロファイル

| 年齢層  | 位置づけ                                         | 主な追加検討                                                         |
| ------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| 0-1歳   | 乳児便秘・離乳食・先天性疾患の見落とし回避が重要 | 胎便排泄、哺乳、体重増加、嘔吐、腹部膨満、離乳食、肛門周囲所見の扱い |
| 2-3歳   | 現MVPの主対象                                    | 便性状、痛み、がまん、薬の飲み方、トイレトレーニング                 |
| 4歳以降 | 園・学校生活、排便回避、自己申告、生活習慣が重要 | 園・学校での排便、腹痛、便失禁、トイレ回避、服薬自己管理、生活指導   |

拡張時は、`patients.birth_date` と受診日から年齢プロファイルを自動判定し、その年齢層に応じて質問セット、追加質問、ChatGPT相談プロンプトを切り替える。

患者画面に年齢入力欄は置かない。初診で年齢が未登録の場合は、現MVPの2-3歳向け質問セットを既定として使い、医師側に年齢未確認として表示する。

詳細設計：

- `age_profile_expansion_design.md`
- `age_profile_questionnaire_switch_design.md`

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

- このファイルは既存として扱う。 const SPREADSHEET_ID = '1DhLgt58Najnhie3C5RtwgcQwZVwjMykGrRLhfRTGurM';
- `setupSheets()` で台帳シート作成済み。
- Web App URL経由でHTMLアプリから `doPost` 保存成功。
- `visits` シートにテスト患者データ保存確認済み。
- Web Appはテスト時に「アクセスできるユーザー: 全員」で動作確認。
- `Code.gs` は単独Apps Scriptでも動くよう `SPREADSHEET_ID` 指定に対応。
- Sheets表示改善として列幅、折り返し、固定列、JSON列非表示を追加。
- 患者IDは `00100` から `99999` の5桁として扱い、先頭ゼロを省略しない。
- `patients.background_history` に、基礎疾患・既往歴・周産期/新生児期情報を医師側台帳で登録できる。例: 重症新生児仮死、NICU入院歴、極低出生体重児、出生時からの便秘など。
- `patients.background_flags` / `background_status` / `background_updated_at` で、夜尿症、発達相談、他院通院、周産期歴などを構造化して管理できる。患者問診では登録済み背景を表示し、変更時だけ補足入力する。
- Google Sheetsの `patient_id` / `visit_id` / `visit_token` 等のID列は文字列形式に固定する。
- `submitVisit` 保存時に、未登録患者IDを `patients` へ自動追加し、直近日誌入力がある場合は `diary_weekly` へ自動保存する。
- `patients.birth_date` に生年月日を入力しておくと、便秘履歴とChatGPT貼り付け用テキストでは直近受診日を基準に年齢を自動計算する。
- 患者画面では年齢を入力させない。初診後に医師が `patients.birth_date` を1回入力し、再診時は患者IDと受診日から年齢を算出する。
- `patientProfile` で、医師側から `patients.birth_date`、基礎疾患・既往歴、併存相談チェック、台帳メモを登録できる。
- 初診時のみ受付または医師側で `patients.birth_date` を登録し、再診時は患者IDと受診日から年齢を自動計算する。
- 医師側履歴、患者台帳、ChatGPT貼り付け用テキストでは、`patients.birth_date` と直近受診日から `infant` / `toddler` / `child` / `unknown` の年齢プロファイルを表示する。
- 患者問診ページは、URLの患者IDを使ってWeb Appへ患者台帳を照会し、`infant` / `toddler` / `child` の質問セットを切り替える。照会失敗、年齢未登録、年齢不明時は `toddler-mvp-v1` で続行する。
- `visits` には、受診時点の `age_profile`、`age_text_at_visit`、実際に使った `questionnaire_version` を保存する。
- 生年月日はGitHub PagesのURL、QRコード、患者向けメモ、ChatGPT貼り付け用テキストには直接含めない。ChatGPTには年齢表示のみを渡す。
- QR読み込み直後の患者画面に年齢を自動表示するには、問診開始前にWeb Appへ患者台帳を照会する必要があるため、現MVPでは搭載しない。年齢は医師側履歴とChatGPT貼り付け用テキストで確認する。
- Sheets上で患者IDが `1234` のように見えていても、履歴取得時は `01234` と同じ5桁IDとして扱う。`setupSheets()` または `formatExistingSheets()` 実行でID列を文字列形式に整える。
- `prescriptions` と `toilet_training` は、患者回答から自動推測せず、医師側で入力・管理する台帳として扱う。
- `visit-link.html` で、患者ID・来院トークン入りの問診URLとQRを作成可能。
- `history-link.html` で、医師用履歴表示、患者履歴JSON、ChatGPT診察前整理テキスト、ChatGPT治療方針検討テキストの確認URLを作成可能。
- Apps Scriptの `doctorEntry` で、医師が `prescriptions` と `toilet_training` を手入力で追記可能。
- Apps Scriptの `patientProfile` で、医師が `patients.birth_date` と台帳メモを編集可能。
- `doctorEntry` は処方履歴だけ、トイレトレーニング履歴だけ、両方同時保存の3操作に対応する。
- `prescriptions.date` と `toilet_training.date` は診察前確認で時系列を追えるよう日時（`yyyy-MM-dd HH:mm:ss`）で保存する。
- 医師入力の保存後は入力画面へ戻し、ブラウザ更新で同じPOSTが再送信されにくい運用にする。
- 便秘履歴ページとChatGPT貼り付け用テキストでは、`prescriptions` / `toilet_training` / `diary_weekly` を日本語ラベルで表示する。
- 便秘履歴ページ上部に「診察前の確認」を置き、直近問診・直近処方・直近トイレトレーニング・直近週次日誌をまとめて表示する。
- 便秘履歴ページ内のChatGPT貼り付け用テキストは、診察前整理モードと医師向け治療方針検討モードを分けてページ内表示・コピーできる。
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

実患者前テストでは、問診HTMLはGitHub Pages固定URLで配信する。

- 受付用QR作成: `https://haman-360.github.io/constipation/constipation-ai-mvp/visit-link.html`
- 問診アプリURL: `https://haman-360.github.io/constipation/constipation-ai-mvp/index.html`
- 医師用履歴URL作成: `https://haman-360.github.io/constipation/constipation-ai-mvp/history-link.html`

GitHub Pages固定URLで、受付QR作成、iPhone問診、Sheets保存、便秘履歴表示、医師入力まで確認済み。

GitHub Pages運用時の注意:

- HTML内または設定値として使うGoogle Apps Script Web App URLは、秘密鍵ではなく閲覧される可能性があるURLとして扱う。
- Web App URLを院内関係者以外へ直接共有しない。
- GitHub Pagesで公開されるURLに、患者氏名、電話番号、住所、生年月日などの直接識別情報を含めない。
- QRに含めるのは5桁の患者IDと来院トークンまでにする。
- Google Sheetsの共有権限は最小限にする。
- 実患者運用開始後は、不自然な保存行や重複行がないか確認する。
- Web App URLが意図せず広がった可能性がある場合は、Apps Scriptを新しいデプロイとして作り直し、HTML側の既定URLを更新する。

GitHub Pages固定URLテストの具体手順は `github_pages_setup_guide.md` にまとめる。

Web App公開範囲とURL露出の運用判断は `deployment_operation_decision.md` にまとめる。

## 14. 次回再開時の作業順

次回は、実患者前テストへ向けた仕上げとして以下の順で進める。

1. GitHub Pages版の設定を確定する。
   - `history-link.html` のWeb App URL既定値修正をGitHubへpushする。完了。
   - 固定URL版で、受付QR作成、iPhone問診、Sheets保存、履歴表示、医師入力をテスト患者IDで再確認する。完了。
   - Web App URL露出と公開範囲の運用メモを整理する。完了。
2. 医師入力のUXを改善する。
   - 両方保存時の待ち時間対策として、保存中表示を目立たせる。完了。
   - 二重クリック防止を強める。完了。
   - 保存完了後に入力欄をクリアする。完了。
3. テスト運用チェックリストを最終化する。
   - 実患者前にテスト患者IDで確認する項目を1枚に整理する。完了。
   - GitHub Pages固定URL運用を前提に、受付、患者入力、Sheets、医師履歴、医師入力の確認順を明確化する。完了。
4. 医療者レビュー用資料を更新する。
   - 現在の完成形に合わせて、レビュー依頼資料とワンページ資料を最新化する。完了。
