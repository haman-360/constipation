# constipation フォルダ構成レビュー

作成日: 2026-05-31

## 目的

現在の `constipation` フォルダには、小児便秘問診システムの実行コード、Google Apps Script、設計メモ、運用メモ、サンプル、スクリーンショットが混在している。

今後、別プロジェクトとして小児夜尿症問診システム `enuresis` を作る前に、現状の構成を整理し、何を共通基盤として流用できるか、何を便秘専用として分けるべきかを確認する。

この文書ではレビューのみを行う。既存ファイルの移動、削除、改名、内容変更は行っていない。

---

## 1. 現在のフォルダ構成の概要

現在のルート直下は、以下の種類のファイル・フォルダが同じ階層に並んでいる。

```text
constipation/
├── constipation-ai-mvp/        # 患者向けHTML/JS/CSS、QR作成、履歴リンク作成、テスト
├── apps-script/                # Google Apps Script本体と設定
├── bulk-import/                # Google Sheetsへ過去記録を一括登録するテンプレート類
├── Archive/                    # 2026-04-28頃の古い設計・申し送り・仕様メモ
├── screen_captures/            # スクリーンショット画像
├── docs/                       # 今回追加したレビュー文書置き場
├── *.md                        # 設計メモ、運用メモ、レビュー資料、サンプルケース
├── *.txt                       # URL、ID、サンプル、ガイドライン文字起こし等
├── .gitignore
├── .nojekyll
└── .git/
```

大きく見ると、次の5分類が混在している。

- 実行コード: `constipation-ai-mvp/`, `apps-script/`
- 運用補助: `bulk-import/`, `github_pages_setup_guide.md`, `google_apps_script_setup_guide.md`, `test_patient_operation_guide.md`
- 設計資料: `PROJECT.md`, `age_profile_*.md`, `google_sheets_history_integration_design.md` など
- 医療レビュー・サンプル: `constipation_ai_physician_review_onepager.md`, `chatgpt_treatment_review_sample_cases.md`, サンプルファイルなど
- 古い仕様・申し送り: `Archive/`

現状でも動作に必要なファイルは概ねまとまっているが、ルート直下のMarkdownとテキストが増えており、新しい `enuresis` プロジェクトを同居させるには見通しが悪くなりやすい。

---

## 2. 実行中の便秘プログラムに必要そうなファイル・フォルダ

### 患者向け・受付向け・医師リンク作成画面

`constipation-ai-mvp/` は、静的HTMLとして公開される便秘問診MVP本体である。

必要そうなファイル:

- `constipation-ai-mvp/index.html`
- `constipation-ai-mvp/styles.css`
- `constipation-ai-mvp/src/app.js`
- `constipation-ai-mvp/src/questionnaire.js`
- `constipation-ai-mvp/visit-link.html`
- `constipation-ai-mvp/src/visit-link.js`
- `constipation-ai-mvp/history-link.html`
- `constipation-ai-mvp/src/history-link.js`

役割:

- 患者・保護者向け問診画面
- 質問定義、条件分岐、回答整形
- 医師向けサマリー生成
- 患者用メモ生成
- Google Apps Scriptへの保存送信
- 患者ID・来院トークン入りURL/QR作成
- 医師用履歴・ChatGPT相談用URL作成

### テスト

- `constipation-ai-mvp/tests/questionnaire.test.js`

実行時に患者画面から直接読み込まれるものではないが、質問ロジックやサマリー生成の変更時に重要。`enuresis` へ流用する場合も、疾患別ロジックのテストとして同等の仕組みを残す価値が高い。

### Google Apps Script

`apps-script/` は、Google Sheets保存、履歴表示、医師画面、固定QR認証を担う。

必要そうなファイル:

- `apps-script/Code.gs`
- `apps-script/appsscript.json`
- `apps-script/.clasp.json`

役割:

- 患者問診保存
- 患者台帳保存
- 受診履歴取得
- 医師用入力・履歴画面
- ChatGPT相談用テキスト生成
- 固定QR用の当日確認コード認証
- Google Sheetsのシート作成・ヘッダー管理

注意:

- `.clasp.json` はApps Scriptプロジェクトとの紐付け情報を含む可能性がある。
- `script ID.txt`, `spredsheet ID.txt`, `ウェブアプリURL.txt` は運用上は必要になりうるが、公開・共有時には機密寄りの接続情報として扱うべき。

### GitHub Pages公開に関係するファイル

- `.nojekyll`
- `.gitignore`
- `github_pages_setup_guide.md`
- `deployment_operation_decision.md`

`.nojekyll` はGitHub Pages公開時に静的ファイルをそのまま配信するための補助として残すべき。

### 過去記録一括登録

`bulk-import/` は便秘システムの通常実行には必須ではないが、既存患者の過去記録をGoogle Sheetsへ入れる運用では重要。

含まれるもの:

- `bulk-import/README.md`
- `bulk-import/bulk_import_input_template.tsv`
- `bulk-import/patients_template.tsv`
- `bulk-import/prescriptions_template.tsv`
- `bulk-import/toilet_training_template.tsv`
- `bulk-import/diary_weekly_template.tsv`
- `bulk-import/visits_summary_template.tsv`
- `bulk-import/date-format-converter.html`
- `bulk-import/date-format-converter.js`

便秘固有のテンプレートが多いため、夜尿症では別テンプレートに分ける方がよい。

---

## 3. 設計メモとして残すべきファイル

以下は、現在の実装意図や今後の横展開に関係するため、設計メモとして残す価値が高い。

### 横展開・全体設計

- `PROJECT.md`
- `current_system_for_chatgpt.md`
- `google_sheets_history_integration_design.md`
- `deployment_operation_decision.md`

理由:

- 慢性疾患問診システムとしての共通設計がまとまっている
- 患者入力、医師確認、Google Sheets保存、ChatGPT相談用テキスト生成の役割分担が分かる
- 夜尿症プロジェクトの設計にも直接参照できる

### 年齢プロファイル・質問切り替え

- `age_profile_expansion_design.md`
- `age_profile_questionnaire_switch_design.md`
- `age_profile_chatgpt_prompt_design.md`
- `age_profile_review_summary.md`
- `infant_questionnaire_prototype.md`
- `child_questionnaire_prototype.md`

理由:

- 年齢層ごとの質問セット切り替えは、夜尿症でも重要になる可能性が高い
- 便秘固有の内容は多いが、プロファイル設計の考え方は流用できる

### 医療安全・レビュー資料

- `medical_review_request_checklist.md`
- `constipation_ai_physician_review_onepager.md`
- `constipation_red_flags_review_draft.md`
- `background_flags_glossary_draft.md`
- `chatgpt_treatment_review_sample_cases.md`

理由:

- 「診断・処方判断を自動化しない」「医師の確認材料に留める」という安全設計が残っている
- 夜尿症でも患者向け出力と医師向け整理を分ける際の参考になる

### 運用手順

- `google_apps_script_setup_guide.md`
- `github_pages_setup_guide.md`
- `test_patient_operation_guide.md`
- `DEVLOG.md`
- `TODO.md`

理由:

- 実運用・テスト患者確認・公開手順の文脈が残っている
- `enuresis` 立ち上げ時に同様のチェックリストを作れる

### 便秘固有だが保存価値がある資料

- `2-3歳モビコール導入維持期_日誌と医師サマリー設計.md`
- `2-3歳モビコール導入維持期_医師サマリー出力例.md`
- `小児慢性機能性便秘症診療ガイドライン_まとめ_最終版.txt`
- `小児慢性機能性便秘症診療ガイドライン_全文文字起こし.txt`

理由:

- 便秘問診の医学的根拠や出力設計に関わる
- 夜尿症へ直接は流用しないが、便秘プロジェクトを保守するなら参照価値がある

---

## 4. archive に移動してよさそうな古いメモ・サンプル

以下は、既に `Archive/` に入っているため、そのまま古い設計資料として扱ってよい。

- `Archive/constipation_ai_handoff_2026-04-28.md`
- `Archive/constipation_ai_implementation_handoff_2026-04-28.md`
- `Archive/constipation_ai_mvp_implementation_handoff_2026-04-28.md`
- `Archive/constipation_ai_physician_dashboard_handoff_2026-04-28.md`
- `Archive/constipation_diary_missing_items_addendum.md`
- `Archive/constipation_waiting_room_questionnaire_design.md`
- `Archive/constipation_waiting_room_questionnaire_mvp_spec.md`
- `Archive/constipation_waiting_room_questionnaire_mvp_summary_test_cases.md`
- `Archive/constipation_waiting_room_questionnaire_mvp_wireframe.md`
- `Archive/constipation_waiting_room_questionnaire_v1.md`
- `Archive/constipation_waiting_room_questionnaire_v2.md`
- `Archive/constipation_waiting_room_questionnaire_v2_implementation_spec.md`
- `Archive/constipation_waiting_room_questionnaire_v2_parent_facing_copy.md`
- `Archive/constipation_waiting_room_questionnaire_v2_revision_notes.md`
- `Archive/constipation_waiting_room_questionnaire_v2_screen_flow_examples.md`
- `Archive/constipation_waiting_room_questionnaire_v2_summary_logic.md`
- `Archive/constipation_waiting_room_questionnaire_v2_summary_test_cases.md`

ルート直下に残っているファイルのうち、今後 `archive` または `samples` に移動してよさそうな候補は以下。

### 古いサンプル・一時確認用に見えるもの

- `sample 1.txt`
- `sample 2.txt`
- `sample 3.txt`
- `screen_captures/01.png`

理由:

- ファイル名だけでは用途が分かりにくい
- 実行コードから参照されていない
- スクリーンショットは `.gitignore` 対象で、ローカル確認用の可能性が高い

### 便秘固有のサンプル・レビュー資料として別管理したいもの

- `chatgpt_treatment_review_sample_cases.md`
- `2-3歳モビコール導入維持期_医師サマリー出力例.md`
- `constipation_ai_physician_review_onepager.md`
- `constipation_red_flags_review_draft.md`

理由:

- 残す価値はあるが、実行コードや共通設計と同じ階層にあると、夜尿症プロジェクト作成時に混乱しやすい
- `docs/constipation/review/` や `docs/constipation/samples/` などへ分ける候補

### 接続情報・個別環境情報として隔離したいもの

- `script ID.txt`
- `spredsheet ID.txt`
- `ウェブアプリURL.txt`

理由:

- 実装理解には不要
- 外部共有やテンプレート化の際に混入リスクがある
- ファイル名から見て、個別環境の接続情報である可能性が高い

注意:

- 今回は移動しない。
- 実際に移動する前に、Git管理対象か、外部公開してよい内容か、現行運用で参照していないかを確認する必要がある。

---

## 5. 夜尿症プロジェクトへ流用できる部分

夜尿症 `enuresis` へ流用しやすいのは、疾患固有の医学内容ではなく、問診システムとしての骨格である。

### そのまま設計思想を流用できる部分

- QRコードまたはURLから事前問診を開く
- 患者IDと来院トークンで受診単位を区別する
- 固定QR + 当日確認コードの運用
- 患者台帳から年齢・背景情報を取得する
- 回答に応じて追加質問を出す
- 非表示になった条件分岐回答は保存しない
- 患者向けメモと医師向けサマリーを分ける
- 診断・処方・専門紹介判断を自動化しない
- Google Sheetsに `patients` と `visits` を共通基盤として保存する
- Apps Scriptで履歴表示・医師入力・ChatGPT相談用テキストを生成する
- 保存中、保存完了、保存失敗を患者画面で明示する

### コード構造として流用できる部分

- `index.html` の画面枠
- `styles.css` の基本UI
- `app.js` の画面遷移、URLパラメータ処理、保存処理
- `visit-link.js` のQRコード生成
- `history-link.js` の医師用URL生成
- `Code.gs` のWeb App入口、Sheets操作、患者ID正規化、履歴取得の基本形
- `questionnaire.test.js` のようなロジックテストの置き方

### 夜尿症向けに設計を置き換える例

便秘の年齢プロファイルは、夜尿症では以下のような切り替えに置き換えられる。

- 未就学 / 小学生低学年 / 小学生高学年以降
- 夜尿のみ / 昼間症状あり / 便秘併存あり
- 初診 / 再診
- 生活指導中 / アラーム療法中 / 薬物療法中 / 経過観察中

便秘の直近日誌は、夜尿症では以下に置き換えられる。

- 夜尿日数
- 連続して濡れなかった日数
- 夜間尿量またはおむつ重量
- 就寝前水分
- 便秘・排便状況
- 昼間尿失禁
- 尿意切迫
- 排尿回数
- 薬・アラーム実施状況

---

## 6. 夜尿症プロジェクトでは別フォルダに分けるべき部分

以下は便秘固有性が強いため、`enuresis` ではコピーして編集するより、別フォルダで新規に定義した方がよい。

### 質問定義・条件分岐

便秘側:

- `constipation-ai-mvp/src/questionnaire.js`

理由:

- 質問文、選択肢、条件分岐、サマリー生成が便秘に密結合している
- 夜尿症では、排尿症状、夜尿頻度、昼間症状、便秘併存、睡眠、生活リズム、治療状況などが中心になる

推奨:

- `enuresis/src/questionnaire.js` として別定義にする
- 共通化するなら、先に `shared/` へ汎用部品を抜き出してから参照する

### Apps Scriptの疾患固有部分

便秘側:

- `apps-script/Code.gs`

分けるべき部分:

- シート名
- ヘッダー
- 医師画面の項目
- 処方プリセット
- トイレトレーニング履歴
- 週次日誌カラム
- ChatGPT相談用プロンプト
- 電子カルテ貼り付け文

推奨:

- 夜尿症用の `apps-script` を別に作る
- または `apps-script/constipation/` と `apps-script/enuresis/` に分ける
- 共通関数だけ `apps-script/shared/` に分離する

### Google Sheetsテンプレート

便秘側:

- `bulk-import/*.tsv`

理由:

- `toilet_training`, `diary_weekly`, `prescriptions` の項目が便秘向け
- 夜尿症では排尿日誌・夜尿日誌・昼間症状・アラーム・薬物療法などのシートが必要

推奨:

- `bulk-import/constipation/`
- `bulk-import/enuresis/`

### 設計資料

便秘固有:

- 便秘ガイドライン文字起こし
- モビコール関連設計
- 便秘red flags
- 便秘医師レビュー資料

推奨:

- `docs/constipation/` にまとめる
- 夜尿症は `docs/enuresis/` に新規作成する

---

## 7. ファイル移動や改名を行う場合のリスク

### GitHub PagesのURLが変わる

`constipation-ai-mvp/index.html`, `visit-link.html`, `history-link.html` の場所を変えると、既に印刷・共有したQRコードやURLが使えなくなる可能性がある。

特に患者向けURLは、相対パスや公開URLに依存しているため、移動時はリダイレクトまたは旧URL維持が必要。

### HTMLから読み込むJS/CSSの相対パスが壊れる

`index.html` は以下のように相対パスでCSS/JSを読み込んでいる。

- `./styles.css`
- `./src/questionnaire.js`
- `./src/app.js`

フォルダ移動時は、HTML内の参照パスを更新しないと画面が動かなくなる。

### Apps Scriptのプロジェクト紐付けが壊れる

`apps-script/.clasp.json` はApps Scriptプロジェクトとの紐付けに関係する可能性がある。フォルダ構成を変える場合、`clasp` 操作やデプロイ手順に影響する。

### Google Apps Script Web App URLが固定されている

`app.js`, `visit-link.js`, `history-link.js` には既定のWeb App URLが入っている。別疾患へコピーする場合、誤って便秘用のWeb Appへ送信するリスクがある。

夜尿症では、Web App URL、スプレッドシートID、Apps Scriptプロジェクトを明確に分けるべき。

### Google Sheetsのシート名・ヘッダーに依存している

`Code.gs` は以下のようなシート名・ヘッダーに強く依存している。

- `patients`
- `visits`
- `prescriptions`
- `toilet_training`
- `diary_weekly`
- `DailyPIN`

移動・改名だけでなく、夜尿症用にシート構成を変える場合は、保存・履歴表示・医師画面・ChatGPTコンテキスト生成まで同時に確認が必要。

### 文書内リンクや申し送りの参照が古くなる

設計メモにはファイル名を直接書いているものがある。ファイル移動後に参照が古くなると、後で設計意図を追いにくくなる。

### 接続情報の誤共有

`script ID.txt`, `spredsheet ID.txt`, `ウェブアプリURL.txt` のようなファイルは、別プロジェクトへコピーすると誤接続の原因になる。

夜尿症用に新規作成する場合は、便秘用の接続情報をコピーしない運用が必要。

### スクリーンショットやサンプルの混入

`screen_captures/` は `.gitignore` 対象で、Git管理外のローカル資料と考えられる。フォルダ整理時に必要な記録か一時ファイルかを確認しないまま削除・移動すると、レビュー用の証跡を失う可能性がある。

---

## 8. 推奨する今後のフォルダ構成案

夜尿症を別プロジェクトとして作るなら、最初から疾患別フォルダと共通資料を分けるのがよい。

### 案A: 現リポジトリ内に疾患別フォルダを並べる

```text
constipation/
├── apps/
│   ├── constipation/
│   │   ├── index.html
│   │   ├── visit-link.html
│   │   ├── history-link.html
│   │   ├── styles.css
│   │   ├── src/
│   │   └── tests/
│   └── enuresis/
│       ├── index.html
│       ├── visit-link.html
│       ├── history-link.html
│       ├── styles.css
│       ├── src/
│       └── tests/
├── apps-script/
│   ├── constipation/
│   │   ├── Code.gs
│   │   └── appsscript.json
│   ├── enuresis/
│   │   ├── Code.gs
│   │   └── appsscript.json
│   └── shared/
├── bulk-import/
│   ├── constipation/
│   └── enuresis/
├── docs/
│   ├── shared/
│   ├── constipation/
│   └── enuresis/
├── archive/
│   └── constipation/
└── local-private/
```

利点:

- 便秘と夜尿症を同じ基盤で比較しやすい
- 共通化候補を見つけやすい
- GitHub Pagesで複数アプリを同時に公開しやすい

欠点:

- 既存URLを維持するには移行計画が必要
- 既存 `constipation-ai-mvp/` をすぐ動かすなら、急に移動しない方がよい

### 案B: 便秘リポジトリと夜尿症リポジトリを分ける

```text
constipation/
├── app/
├── apps-script/
├── docs/
└── bulk-import/

enuresis/
├── app/
├── apps-script/
├── docs/
└── bulk-import/
```

利点:

- 疾患ごとの公開URL、Apps Script、スプレッドシートを分離しやすい
- 便秘用接続情報を夜尿症へ誤って流用するリスクが下がる
- 医療レビュー資料が混ざりにくい

欠点:

- 共通部品を共有しにくい
- QR生成や保存処理の改善を両方に反映する手間が増える

### 現時点の推奨

現段階では、すぐに既存ファイルを移動せず、以下の順番が安全。

1. `docs/` を作り、レビュー文書・今後の整理案を置く
2. `enuresis/` を新規フォルダとして作る
3. 便秘の実行中フォルダ `constipation-ai-mvp/` は当面そのまま残す
4. 夜尿症では、便秘コードを丸ごとコピーするのではなく、共通化できる部分と疾患固有部分を分けながら作る
5. 便秘側のURL運用が落ち着いてから、`apps/constipation/` などへの移動を検討する

短期的な推奨構成:

```text
constipation/
├── constipation-ai-mvp/          # 既存便秘アプリ。当面そのまま
├── apps-script/                  # 既存便秘Apps Script。当面そのまま
├── enuresis/                     # 新規夜尿症プロジェクト
│   ├── app/
│   ├── apps-script/
│   ├── docs/
│   └── bulk-import/
├── docs/
│   ├── constipation-folder-review.md
│   ├── shared/
│   ├── constipation/
│   └── enuresis/
├── bulk-import/                  # 既存便秘用。当面そのまま
└── Archive/                      # 既存便秘アーカイブ。当面そのまま
```

この形なら、既存便秘システムのURLやApps Script連携を壊さずに、夜尿症プロジェクトを別枠で開始できる。

---

## 補足: 今回確認した注意点

- `current_system_for_chatgpt.md` は現時点でGit未追跡のファイルとして存在している。
- `screen_captures/` は `.gitignore` 対象だが、ローカルには `01.png` がある。
- `spredsheet ID.txt` はファイル名が `spreadsheet` ではなく `spredsheet` になっている。
- ルート直下のMarkdownが増えているため、今後は新規文書を原則 `docs/` 配下に置くとよい。
