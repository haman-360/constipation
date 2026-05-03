# 問診HTML公開方法とWeb App公開範囲の運用判断

## 現時点の推奨

MVPから実患者前テストの段階では、問診HTMLは院内端末から配信するローカル運用を基本にする。

- 受付または医師用Macで `constipation-ai-mvp` を配信する。
- 患者スマートフォンは同じ院内Wi-FiからMacのLAN内IPアドレスへアクセスする。
- QR作成ページでは、問診アプリURLに `http://MacのLAN内IP:8001/index.html` を使う。
- Google Sheets保存は、Google Apps Script Web App経由で行う。

## この判断の理由

- GitHub Pages等で公開する前に、実患者前テストの動線を院内だけで確認できる。
- 問診HTML内にGoogle Apps Script Web App URLが入るため、広く公開する前にアクセス制御と保存ログを確認できる。
- 患者IDと来院トークンだけのURLで運用でき、長い `submit_url` をQRに含めずに済む。
- iPhoneでQR読み取りからSheets保存まで、すでにローカル配信で成功している。

## 当面の運用URL

受付用QR作成:

```text
http://MacのLAN内IP:8001/visit-link.html
```

患者向け問診:

```text
http://MacのLAN内IP:8001/index.html?patient_id=99999&visit_token=A7K2
```

医師用履歴URL作成:

```text
http://MacのLAN内IP:8001/history-link.html
```

## Web App公開範囲

患者スマートフォンから直接Google Sheetsへ保存するには、Apps Script Web Appが患者端末から到達できる必要がある。

実患者前テストでは、次の条件で確認する。

- 実行するユーザー: 自分
- アクセスできるユーザー: 院内運用で患者端末から送信できる最小範囲
- テスト患者IDのみで保存確認する
- 実患者を直接特定する氏名、電話番号、住所などは入力しない

`アクセスできるユーザー: 全員` は患者スマートフォンからの送信確認には使いやすいが、Web App URLを知っている端末からPOSTできる状態になる。実患者運用前に、以下を確認する。

- Web App URLを院内関係者以外へ共有しない。
- Google Sheetsの共有権限を最小限にする。
- `visits` に不正または重複したテスト行が混ざらないか確認する。
- 必要なら、来院トークン形式や日付付き `visit_id` で保存対象を絞る。

## GitHub Pages等へ進む条件

以下を満たしてから、GitHub Pagesなどの静的ホスティングを検討する。

- 医師側履歴確認URLがテスト患者IDで動作確認済み。
- `chatGPTContext` が実データで期待通りに出力される。
- Web App公開範囲と保存権限の院内ルールが決まっている。
- 医療者レビュー後の表現修正が反映済み。
- 患者向け画面が薬の自己判断を促さないことを再確認済み。

## 判断保留にする選択肢

### GitHub Pages

問診HTMLの配布は楽になるが、HTMLとWeb App URLの露出範囲が広がる。実患者前テストが終わるまでは保留する。

### Apps Script HTML化

Google側に寄せられるが、既存のHTML/CSS/JavaScript構成から移植・確認が必要になる。現段階では優先しない。

### 完全院内端末入力

患者スマートフォンを使わず、院内端末で入力する方式。アクセス制御はしやすいが、受付端末の台数と消毒・入力補助の運用が必要になる。
