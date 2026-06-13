# Google Apps Script 接続手順

## 1. スプレッドシートを準備

1. Google Sheetsを1つ作成する。
2. URLの `/d/` と `/edit` の間にある Spreadsheet ID を控える。
3. Apps Script の `Code.gs` 先頭に設定する。

```js
const SPREADSHEET_ID = "1DhLgt58Najnhie3C5RtwgcQwZVwjMykGrRLhfRTGurM";
```

Google Sheetsから `拡張機能 > Apps Script` で開いたコンテナバインド型の場合は空でも動くことがあるが、単独Apps Scriptプロジェクトでは Spreadsheet ID が必要。

## 2. setupSheetsを実行

Apps Scriptエディタで `setupSheets` を選び、実行する。

初回作成だけでなく、`Code.gs` のシート列定義を変更した後も `setupSheets` を1回実行する。既存データは残したまま、追加列、列幅、ID列の文字列形式などを更新する。

作成されるシート:

- `patients`
- `visits`
- `prescriptions`
- `toilet_training`
- `diary_weekly`
- `DailyPIN`

`DailyPIN` は待合室掲示用の固定QRで使う本日の確認コードを管理するシート。列は `date`, `pin`, `enabled`, `form`, `note`。

- `date`: 当日の日付を `yyyy-mm-dd` で入力する。
- `pin`: 受付で案内する確認コード。
- `enabled`: 有効な行は `true` と入力する。
- `form`: `constipation`, `asthma`, `atopic_dermatitis` のいずれか。空欄なら全フォーム共通PINとして扱う。
- `note`: 任意メモ。

固定QRを使う場合は、Apps Scriptエディタで `installDailyPinTrigger` を1回実行する。これにより、毎日6時ごろに便秘フォーム用の4桁確認コードが `DailyPIN` に自動作成される。スプレッドシート上部メニューの `便秘問診 > 確認コードの毎日自動作成を有効化` からも設定できる。

当日分を手動で作りたい場合は、`generateTodayDailyPin` を実行するか、スプレッドシート上部メニューの `便秘問診 > 今日の確認コードを作成` を押す。同じ日付・同じフォームの行が既にある場合は、そのPINを維持したまま `enabled` を `true` に戻す。

## 2.1 スタッフ用PIN一覧へ自動集約

便秘問診と夜尿問診など、複数の固定QR用PINをスタッフに共有したい場合は、スタッフ用のGoogle Sheetsを1つ作り、各問診プロジェクトから同じシートへ同期する。

この方式では、スタッフ用Google Sheets側に新しいApps Scriptを作る必要はない。便秘側Apps Script、夜尿側Apps Scriptのそれぞれが、毎朝PINを作った直後にスタッフ用Google Sheetsへ1行ずつ書き込む。

スタッフ用Google Sheetsには `StaffDailyPIN` シートが自動作成される。列は `date`, `form`, `label`, `pin`, `source`, `updated_at`, `note`。

- `date`: PINの日付。
- `form`: `constipation`, `enuresis` などのフォームID。
- `label`: スタッフ向け表示名。例: `便秘`, `夜尿`。
- `pin`: スタッフが患者・保護者へ案内する本日の確認コード。
- `source`: 同期元スプレッドシート名。
- `updated_at`: 最終同期日時。
- `note`: 自動作成か既存PINの同期か。

同じ日付・同じ `form` の行がすでにある場合は上書きされる。そのため、スタッフ用一覧は「今日見るべきPINの最新版」として使える。

設定手順:

1. スタッフ用Google Sheetsを1つ新規作成する。
2. URLの `/d/` と `/edit` の間にある Spreadsheet ID を控える。
3. 便秘問診のスプレッドシートを開き、上部メニューの `便秘問診 > スタッフ用PIN一覧の連携先を設定` を押す。
4. 控えたスタッフ用Google Sheetsの Spreadsheet ID を入力する。
5. 初回確認として `便秘問診 > 今日の確認コードをスタッフ用PIN一覧へ同期` を押す。
6. スタッフ用Google Sheetsに `StaffDailyPIN` シートが作られ、便秘のPINが表示されることを確認する。

夜尿問診側でも同じ設定が必要。夜尿側Apps Scriptにも同じ同期処理を入れ、`generateTodayDailyPin` 相当の処理で `form` を `enuresis` にしてスタッフ用Google Sheetsへ同期する。スタッフ用Google Sheetsの Spreadsheet ID は便秘側と同じものを設定する。

権限の考え方:

- スタッフ用Google Sheetsは、PINを見せたいスタッフだけに共有する。
- スタッフ用Google Sheetsには患者氏名・生年月日・問診回答などは入れない。
- 同期元のApps Script実行ユーザーには、スタッフ用Google Sheetsの編集権限が必要。
- 固定QRの患者向けWeb Appに、スタッフ用PIN一覧を表示する機能は追加しない。

## 2.5 既存の日付・IDデータを一括変換

Google Sheetsへ貼り付け済みの日付が `2025/08/01` のようになっている場合や、患者IDが `1234` のように4桁以下になっている場合は、Apps Scriptエディタで `normalizeExistingFormats` を選び、実行する。

スプレッドシートを開き直すと、上部メニューの `便秘問診 > 日付・IDなどのフォーマットを一括変換` からも実行できる。

日付の対象列:

- `patients.birth_date`
- `patients.background_updated_at`
- `visits.submitted_at`
- `visits.saved_at`
- `prescriptions.date`
- `toilet_training.date`
- `diary_weekly.period_start`
- `diary_weekly.period_end`

IDの対象列:

- 各シートの `patient_id`

セル全体が日付または日時として成立する値だけを変換する。例: `2025/08/01` は `2025-08-01`、`2025/08/01 9:05` は `2025-08-01 09:05:00` になる。`patient_id` は `1234` なら `01234`、`123` なら `00123` になる。不正な日付やメモ本文はそのまま残る。

## 3. Web Appとしてデプロイ

1. Apps Script右上の `デプロイ` を開く。
2. `新しいデプロイ` を選ぶ。
3. 種類は `ウェブアプリ`。
4. 実行するユーザーは `自分`。
5. アクセスできるユーザーは、最初は `自分のみ` または院内運用に合わせた範囲を選ぶ。
6. デプロイ後に表示される Web App URL を控える。

## 4. HTMLアプリへURLを渡す

HTMLアプリを開くURLに `submit_url` を付ける。

```text
index.html?patient_id=12345&visit_token=A7K2&submit_url=WEB_APP_URL
```

`submit_url` は一度渡すとブラウザの `localStorage` に保存される。次回以降は同じ端末なら省略できる。


## 5. 患者ID・来院トークン入りURL/QRを作る

ローカル確認中は、`constipation-ai-mvp` フォルダでサーバーを起動した状態で次を開く。

```text
http://localhost:8000/visit-link.html
```

使い方:

1. `患者ID` を5桁で入力する。先頭ゼロがある場合は省略しない。
2. `来院トークン` は自動生成される。必要なら `生成` で作り直す。
3. `問診アプリURL` はローカル確認なら `http://localhost:8000/index.html`、公開後は実際の問診アプリURLにする。
4. `URLコピー` または `印刷` で、患者に渡すURL/QRを作る。

作成されるURL例:

```text
http://localhost:8000/index.html?patient_id=12345&visit_token=A7K2
```

## 5.5 疾患固定QRを掲示する

患者ごとに印刷するQRとは別に、待合室や受付に掲示する固定QRを使える。

便秘フォームの固定QR URL例:

```text
https://haman-360.github.io/constipation/constipation-ai-mvp/index.html?mode=fixed&form=constipation
```

固定QRでは最初に本人確認画面が出る。患者または保護者は `診察券番号` と `本日の確認コード` を入力する。

`patients` シートにその診察券番号の患者台帳があり、生年月日も登録済みなら、そのまま問診へ進む。初診などで患者台帳がない場合、または台帳に生年月日が未登録の場合は、続けて生年月日入力画面を出す。入力された生年月日は `patients.birth_date` に保存し、そのまま問診へ進む。

認証に使う確認コードは `DailyPIN` シートで管理する。当日の日付に一致し、`enabled` が `true` のPINだけが有効。`form` が空欄のPINは全フォーム共通、`constipation` のPINは便秘フォーム専用として扱う。

確認コードは、`installDailyPinTrigger` を1回実行しておけば毎日6時ごろに自動作成される。必要なときは `便秘問診 > 今日の確認コードを作成` で当日分を手動作成できる。

認証に失敗した場合は、PIN・診察券番号・生年月日のどれが違うかを区別せず、受付へ案内する同一メッセージを表示する。

喘息・アトピー用のURL受け口は `form=asthma`, `form=atopic_dermatitis` の形にしているが、初期実装では便秘フォームのみ有効。

注意: `127.0.0.1` は開いている端末自身を指すため、iPhoneで読むQRには使えない。iPhoneからMac上のローカルサーバーを開く場合は、MacとiPhoneを同じWi-Fiに接続し、問診アプリURLを `http://MacのIPアドレス:8001/index.html` の形にする。例: `http://192.168.11.3:8001/index.html`。

## 6. 電子カルテ貼り付け用テキスト

医師用履歴画面の `電子カルテ貼り付け用` から、最新のQR問診と直近日誌を短文にしたテキストをコピーできる。

必要に応じて、その場で医師メモを追記してからコピーする。電子カルテ側に当日の処方が残る前提のため、処方履歴はこのテキストには含めない。

GitHub Pagesで公開した後は、固定URLの `visit-link.html` を開く。受付ページをGitHub Pages上で開くと、詳細設定の問診アプリURLは同じGitHub Pages上の `index.html` になる。

```text
https://haman-360.github.io/constipation/constipation-ai-mvp/visit-link.html
https://haman-360.github.io/constipation/constipation-ai-mvp/index.html
```

`submit_url` は長いため、QRには基本的に含めない。現在のHTMLアプリにはWeb App URLを既定値として設定しているため、`patient_id` と `visit_token` だけのURLでもSheets保存を試行する。院内運用前には、Web App URLと公開範囲を確認する。

## 6. テスト送信

1. テスト用URLでHTMLアプリを開く。
2. 問診を最後まで入力する。
3. 送信完了画面の `院内保存` に成功表示が出るか確認する。
4. Google Sheetsの `visits` に1行追加されているか確認する。
5. 同じ患者IDが `patients` に未登録だった場合、`patients` に1行追加されているか確認する。
6. 直近日誌を入力した場合、`diary_weekly` に1行追加されているか確認する。

`prescriptions` と `toilet_training` は患者問診からは自動入力しない。処方履歴とトイレトレーニング状況は、医師側で確認した内容を別途入力・管理する。

## 7. 医師側履歴確認URLを作る

`visit-link.html` と同じサーバーで、次を開く。

```text
http://localhost:8000/history-link.html
```

使い方:

1. `患者ID` に5桁のテスト患者IDを入力する。先頭ゼロがある場合は省略しない。
2. `Google Apps Script Web App URL` は通常変更不要。Web Appを再作成してURLが変わった場合だけ、デプロイ済みの `/exec` URLを入力する。
3. `医師入力を開く` で処方履歴とトイレトレーニング履歴を必要時に追記する。
   - 処方履歴とトイレトレーニング履歴は同じ患者に両方保存できる。
   - 両方を入力した場合は `両方とも保存`、片方だけの場合は個別保存ボタンを使う。
   - 処方履歴とトイレトレーニング履歴の `date` は日時（`yyyy-MM-dd HH:mm:ss`）で保存される。
   - 保存後は医師入力画面に戻る。ブラウザ更新で同じ内容が再送信されないことを確認する。
4. `患者台帳を開く` で、生年月日と台帳メモを必要時に登録する。
   - 生年月日は `patients.birth_date` に保存される。
   - 生年月日は患者向けURL、QR、ChatGPT貼り付け用テキストには直接含めない。
   - 便秘履歴とChatGPT貼り付け用テキストでは、直近受診日を基準にした年齢表示だけを使う。
   - 問診送信後の `visits` には、受診時点の `age_profile`、`age_text_at_visit`、`questionnaire_version` が保存される。
   - 患者問診ページは、開始時に `patientProfileData` を照会し、0-1歳、2-3歳、4歳以降の質問セットを切り替える。
5. `医師用履歴表示を開く` で診察前に見やすい履歴画面を確認する。
   - 画面内の `ChatGPT診察前整理テキストをページ内で表示` から診察前整理モードを確認できる。
   - 画面内の `ChatGPT治療方針検討テキストをページ内で表示` から医師向け治療方針検討モードを確認できる。
6. `患者履歴JSONを開く` で `patientHistory` の応答を確認する。
7. `診察前整理テキストを開く` と `治療方針検討テキストを開く` で `chatGPTContext` の2モード出力を確認する。

作成されるURL例:

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=doctorEntry&patient_id=99999&limit=5
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=patientProfile&patient_id=99999&limit=5
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=doctorHistory&patient_id=99999&limit=5
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=patientHistory&patient_id=99999&limit=5
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=chatGPTContext&patient_id=99999&limit=5
```

実患者データ投入前は、必ずテスト患者IDで保存済みデータを作ってから確認する。

## 8. 失敗時の確認

- `院内保存URLが未設定` と出る: `submit_url` が渡っていない。
- `Spreadsheet is not bound` と出る: `SPREADSHEET_ID` が未設定、または間違っている。
- 権限エラーが出る: Web Appのデプロイ権限、またはGoogle Sheetsへのアクセス権限を確認する。
- ブラウザから送信できない: Web App URLが `/exec` で終わるデプロイURLか確認する。`/dev` URLでは外部ページから使いにくい場合がある。

## 9. 運用上の注意

- 実患者データを入れる前に、テスト患者IDで保存、履歴取得、ChatGPT貼り付け用テキストを確認する。
- 患者IDだけで個人を直接特定できる情報を入れない。
- Web Appの公開範囲は院内運用に合わせて最小限にする。
