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

注意: `127.0.0.1` は開いている端末自身を指すため、iPhoneで読むQRには使えない。iPhoneからMac上のローカルサーバーを開く場合は、MacとiPhoneを同じWi-Fiに接続し、問診アプリURLを `http://MacのIPアドレス:8001/index.html` の形にする。例: `http://192.168.11.3:8001/index.html`。

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
