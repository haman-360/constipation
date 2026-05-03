# TODO

## 優先度：高（すぐやる）

- [x] 医師レビュー用ワンページ資料の更新
- [x] watch / stable 表現の調整
- [x] 「受付・スタッフ共有」の条件精査
- [x] 医療安全表現の最終調整

---

## 優先度：中（UX改善）

- [x] JSON折りたたみ表示
- [x] コピー機能分離（サマリー / JSON）
- [x] 印刷レイアウト対応
- [x] スマホ表示最適化
- [x] ダッシュボード簡略表示モード

---

## 優先度：中（ロジック強化）

- [x] urgency判定テスト追加
- [x] headline生成ロジック精度向上
- [x] 薬関連ロジック改善
- [x] 再燃パターンの精緻化

---

## 優先度：中（テスト）

- [x] 旧alert相当ケースのwatch化テスト
- [x] watchケース網羅
- [x] stableケース網羅
- [x] 境界値テスト（3日 vs 4日無排便）
- [x] 内服関連テスト

---

## 優先度：低（拡張）

- [x] 日誌連携機能
- [x] 週次サマリー自動生成
- [x] PDF出力
- [x] 医療機関向け共有機能

---

## 履歴連携・Google Sheets

- [x] Google Sheets履歴連携設計
- [x] 患者向け保存メモ生成
- [x] patient_id / visit_id / visit_token のpayload追加
- [x] Google Sheets保存用payload生成
- [x] Apps Script submitVisit API設計・実装
- [x] Google Sheetsテンプレート作成
- [x] 医師側履歴読み込み画面または関数
- [x] ChatGPT貼り付け用テキスト生成
- [x] 回答後QRの短縮形式検討
- [x] HTMLからApps ScriptへのPOST送信
- [x] テスト患者データのvisits保存確認
- [x] Sheets表示改善（列幅・折り返し・固定列・JSON列非表示）

---

## 医療者監修が必要

- [x] レッドフラッグ定義（監修用たたき台）
- [x] 受診基準（緊急 / 通常）
- [x] 表現の適切性（保護者向け）
- [x] 便性状分類の最終仕様

---

## GitHub化対応

- [x] リポジトリ作成
- [x] README整備
- [x] 不要ファイル整理
- [x] ディレクトリ構造整理
- [x] 初回commit

---

## 次に検討

- [ ] 医師側履歴確認URLの動作テスト
- [ ] `chatGPTContext` 出力の実データ確認
- [x] 医師側履歴確認URL作成ページ
- [x] 患者ID・visit_token入りURL/QR作成ページ
- [x] iPhoneのQR読み取りからSheets保存成功確認
- [x] Macの患者ID入りURLからSheets保存成功確認
- [x] 患者IDなしURLでは保存しない表示へ調整
- [x] URL/QR作成ページの問診アプリURL欄を詳細設定化または非表示化
- [x] 問診HTMLの公開方法を決める（院内端末のみ / GitHub Pages等 / Apps Script HTML化）
- [x] Web App公開範囲の院内運用検討
- [ ] 追加の医療者レビュー後修正


---

## 休憩後に再開するなら

- [x] URL/QR作成ページを受付用に簡略化する（患者ID入力とQR表示を中心にする）
- [x] 問診HTMLの置き場所を決める
- [x] 実患者データを入れる前のテスト患者運用手順を1枚にまとめる
- [x] GitHubへ今回の変更をcommitする
