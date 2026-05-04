# GitHub Pages 固定URL公開テスト手順

## 目的

MacのLAN内IPアドレス（例: `192.168.0.27`）ではなく、GitHub Pagesの固定URLで問診アプリ、受付用QR作成ページ、医師用履歴URL作成ページを開けるようにする。

## 想定URL

このリポジトリでは、GitHub Pages公開後のURLは次の形になる。

```text
https://haman-360.github.io/constipation/constipation-ai-mvp/visit-link.html
https://haman-360.github.io/constipation/constipation-ai-mvp/index.html
https://haman-360.github.io/constipation/constipation-ai-mvp/history-link.html
```

## GitHub Pagesを有効にする

1. GitHubで `haman-360/constipation` リポジトリを開く。
2. `Settings` を開く。
3. 左メニューの `Pages` を開く。
4. `Build and deployment` の `Source` で `Deploy from a branch` を選ぶ。
5. `Branch` は `main`、フォルダは `/ (root)` を選ぶ。
6. `Save` を押す。
7. 数分待って、Pages URLが表示されることを確認する。

## 受付用QR作成ページで確認する

1. GitHub Pagesの `visit-link.html` を開く。
2. 患者IDにテスト用の5桁IDを入力する。
3. 来院トークンは4文字のまま使う。
4. 詳細設定の問診アプリURLが、GitHub Pagesの `index.html` になっていることを確認する。
5. QRをiPhoneで読み取る。
6. 問診を送信し、Google Sheetsの `visits` / `patients` / 必要時 `diary_weekly` に保存されることを確認する。

## 医師用履歴URL作成ページで確認する

1. GitHub Pagesの `history-link.html` を開く。
2. 患者IDに同じテスト患者IDを入力する。
3. Google Apps Script Web App URLにデプロイ済みの `/exec` URLを入力する。
4. `医師用履歴表示を開く` で便秘履歴が表示されることを確認する。
5. `医師入力を開く` で処方履歴とトイレトレーニング履歴を保存できることを確認する。

## QR URLの長さに関する注意

現在のQR生成は、GitHub Pagesの標準URLと4文字の来院トークンなら収まる。

```text
https://haman-360.github.io/constipation/constipation-ai-mvp/index.html?patient_id=12345&visit_token=A7K2
```

ただし、次の場合はQRが長すぎる可能性がある。

- 来院トークンを長くする
- `submit_url` をQRに含める
- GitHub Pages以外の長いURLを問診アプリURLに使う

そのため、QRに含めるのは基本的に `patient_id` と `visit_token` までにする。

## 公開範囲の注意

GitHub Pagesで公開すると、HTMLファイルは固定URLで開けるようになる。保存先は引き続きGoogle Apps Script Web AppとGoogle Sheetsである。

実患者運用前に確認すること:

- Web App URLの公開範囲が院内運用として許容できる。
- Google Sheetsの共有権限が最小限になっている。
- URLに患者氏名、電話番号、住所などを含めない。
- テスト患者IDで一連の保存と履歴表示を確認する。
