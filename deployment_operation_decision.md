# 問診HTML公開方法とWeb App公開範囲の運用判断

## 現時点の推奨

MVPから実患者前テストの段階では、問診HTMLはGitHub Pagesの固定URLで配信する。

- 受付または医師用端末で、GitHub Pages上の `visit-link.html` を開く。
- 患者スマートフォンはQRからGitHub Pages上の `index.html` を開く。
- 医師はGitHub Pages上の `history-link.html` から履歴表示、医師入力、ChatGPT貼り付け用テキストを開く。
- Google Sheets保存は、Google Apps Script Web App経由で行う。
- 患者問診ページはWeb Appへ患者台帳を照会し、年齢プロファイルに応じて質問セットを切り替える。通信失敗、年齢未登録、年齢不明時は2-3歳向けMVP質問セットで続行する。

現在は、GitHub Pages固定URLで問診送信、Sheets保存、履歴表示、医師入力、患者台帳まで確認できている。

## この判断の理由

- MacのLAN内IPアドレスに依存せず、受付・患者・医師の画面を固定URLで開ける。
- 問診HTML内にGoogle Apps Script Web App URLが入るため、URL露出の前提と保存ログ確認の運用を明確にする。
- 患者IDと来院トークンだけのURLで運用でき、長い `submit_url` をQRに含めずに済む。
- iPhoneでQR読み取りからSheets保存まで、GitHub Pages配信で成功している。

## 当面の運用URL

受付用QR作成:

```text
https://haman-360.github.io/constipation/constipation-ai-mvp/visit-link.html
```

患者向け問診:

```text
https://haman-360.github.io/constipation/constipation-ai-mvp/index.html?patient_id=99999&visit_token=A7K2
```

医師用履歴URL作成:

```text
https://haman-360.github.io/constipation/constipation-ai-mvp/history-link.html
```

## Web App公開範囲

患者スマートフォンから直接Google Sheetsへ保存するには、Apps Script Web Appが患者端末から到達できる必要がある。

現在の実患者前テストでは、次の条件で確認する。

- 実行するユーザー: 自分
- アクセスできるユーザー: 院内運用で患者端末から送信できる最小範囲
- テスト患者IDのみで保存確認する
- 実患者を直接特定する氏名、電話番号、住所などは入力しない

`アクセスできるユーザー: 全員` は患者スマートフォンからの送信確認には使いやすいが、Web App URLを知っている端末からPOSTできる状態になる。実患者運用前に、以下を確認する。

- Web App URLを院内関係者以外へ共有しない。
- Google Sheetsの共有権限を最小限にする。
- `visits` に不正または重複したテスト行が混ざらないか確認する。
- 必要なら、来院トークン形式や日付付き `visit_id` で保存対象を絞る。

## Web App URL露出の扱い

GitHub Pagesで公開するHTMLは、ブラウザで開ける静的ファイルである。そのため、HTMLやJavaScript内に既定値として入れたGoogle Apps Script Web App URLは、技術的には閲覧可能な情報として扱う。

Web App URLはパスワードや秘密鍵として扱わない。一方で、URLを知っていれば保存APIへ送信できる可能性があるため、次の運用ルールを置く。

- Web App URLを院内関係者以外へ直接共有しない。
- GitHub Pagesの問診URLには、患者氏名、電話番号、住所、生年月日などの直接識別情報を含めない。
- QRに含めるのは、5桁の患者IDと来院トークンまでにする。
- 患者IDは院内台帳上のIDとして扱い、URL単独で患者氏名が分からないようにする。
- Google Sheetsの共有権限は最小限にする。
- 実患者運用開始後は、定期的に `visits` / `patients` / `diary_weekly` の不自然な保存行や重複行を確認する。
- Web App URLが意図せず広く共有された可能性がある場合は、Apps Scriptを新しいデプロイとして作り直し、HTML側の既定URLを更新する。
- 将来的に運用規模が広がる場合は、来院トークンの有効期限確認、受付で発行したトークンのみ保存許可、簡易レート制限などを検討する。

## GitHub Pages等へ進む条件

以下は完了済み。

- 医師側履歴確認URLがテスト患者IDで動作確認済み。
- `chatGPTContext` が実データで期待通りに出力される。
- 医師入力から `prescriptions` と `toilet_training` を保存できる。
- Web App公開範囲と保存権限の院内ルールが決まっている。
- 医療者レビュー後の表現修正が反映済み。
- 患者向け画面が薬の自己判断を促さないことを再確認済み。

## 採用した選択肢

### GitHub Pages

問診HTMLの配布は楽になる。MacのLAN内IPアドレスではなく、固定URLで以下を開けるようになる。

```text
https://<GitHubユーザー名>.github.io/<リポジトリ名>/constipation-ai-mvp/visit-link.html
https://<GitHubユーザー名>.github.io/<リポジトリ名>/constipation-ai-mvp/index.html
https://<GitHubユーザー名>.github.io/<リポジトリ名>/constipation-ai-mvp/history-link.html
```

注意点:

- HTMLとGoogle Apps Script Web App URLの露出範囲が広がる。
- 公開URL自体には患者氏名、電話番号、住所などを含めない。
- QRに含めるのは患者IDと来院トークンまでにする。
- GitHub Pages公開後も、保存先はGoogle Apps Script Web AppとGoogle Sheetsである。

確認済み:

1. GitHub Pagesで `constipation-ai-mvp` を公開する。
2. 固定URLの `visit-link.html` を開く。
3. 問診アプリURLに固定URLの `index.html` が入ることを確認する。
4. テスト患者IDでQRを作成し、iPhoneから問診送信する。
5. `visits` / `patients` / `diary_weekly` に保存されることを確認する。
6. 固定URLの `history-link.html` から便秘履歴と医師入力を確認する。

具体的な設定手順は `github_pages_setup_guide.md` を参照する。

## 判断保留にする選択肢

### Apps Script HTML化

Google側に寄せられるが、既存のHTML/CSS/JavaScript構成から移植・確認が必要になる。現段階では優先しない。

### 完全院内端末入力

患者スマートフォンを使わず、院内端末で入力する方式。アクセス制御はしやすいが、受付端末の台数と消毒・入力補助の運用が必要になる。
