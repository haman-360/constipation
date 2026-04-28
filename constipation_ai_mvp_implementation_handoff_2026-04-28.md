# 2-3歳便秘AI MVP実装後 申し送り

作成日: 2026-04-28

## 現在の到達点

2-3歳便秘AIの最初のMVPとして、以下を実装済み。

- 待合アンケート入力画面
- 基本6問
- 条件付き追加質問
- 分岐ロジック
- 医師向けミニサマリー生成
- 保護者向け安全表示
- 送信JSON表示
- MVPテストケース A-H 相当のロジックテスト

実装場所:

- `constipation-ai-mvp/index.html`
- `constipation-ai-mvp/styles.css`
- `constipation-ai-mvp/src/app.js`
- `constipation-ai-mvp/src/questionnaire.js`
- `constipation-ai-mvp/tests/questionnaire.test.js`

ブラウザで開く入口:

- `file:///Users/haman14/Documents/codex-work/constipation-ai-mvp/index.html`

テスト実行:

```bash
node constipation-ai-mvp/tests/questionnaire.test.js
```

確認済み結果:

```text
8 MVP questionnaire cases passed
```

## 実装したMVPの役割

このMVPは、診療判断AIではなく、診察前の問診整理AI。

すること:

- 保護者の回答を構造化する。
- 必要な追加質問だけを表示する。
- 医師が診察前に見るミニサマリーを作る。
- 強い腹痛、嘔吐、食欲・機嫌変化がある場合、受付または医療スタッフにも伝えるよう表示する。

しないこと:

- 診断。
- 便塞栓の有無判断。
- モビコールなどの処方量変更。
- 薬の増減、中止、再開の指示。
- 治療中止可否の判断。
- 専門紹介の要否判断。

## UIの現在仕様

1問1画面。

画面構成:

1. 開始画面
2. 基本6問
3. お薬補足
4. 条件付き追加質問
5. 終了画面
6. 送信後画面

送信後画面では以下を表示する。

- 医師向けミニサマリー
- 送信JSON

送信後画面には、以下の趣旨の説明を追加済み。

```text
このミニサマリーは、診察前に医師または医療スタッフが確認するためのものです。
ChatGPTなどに追加で判断を聞くための文章ではありません。
```

## 重要な実装修正

ユーザー試用中に、以下の不整合を修正済み。

### 修正前

うんちの硬さが `やわらかい` でも、がまんが強いだけで以下のように出ていた。

```text
硬い便、痛み、がまんの組み合わせを確認。
```

### 修正後

実際に該当した理由だけを並べる。

例:

```text
がまんがあるため、出血や便が少しつく様子もあわせて確認。
```

ロジック位置:

- `constipation-ai-mvp/src/questionnaire.js`
- `aiFollowUpItems()`

## 現在の主要ロジック

ロジックは `src/questionnaire.js` に集約。

主な関数:

- `visibleFieldIds(data)`
  - 基本6問と回答に応じた追加質問IDを返す。
- `pruneHiddenAnswers(data)`
  - 回答変更で表示条件から外れた項目を送信データから除外する。
- `normalizeMultiSelection(fieldId, current, clicked)`
  - 複数選択の排他ルールを処理する。
- `hasSafetyNotice(data)`
  - 保護者向け安全表示の要否を返す。
- `aiFollowUpItems(data)`
  - AI追加確認候補を生成する。
- `generateSummary(data)`
  - 医師向けミニサマリーを生成する。

## 表示条件の概要

### 4日以上無排便

条件:

- `q1_last_bowel_movement = 4日以上前`
- または `q2_bowel_frequency = 4日以上あくことがある`

表示:

- `q9_abdominal_symptom`
- `q10_vomiting`
- `q11_appetite_mood`

### 水のような便

条件:

- `q3_stool_consistency = 水のよう`

表示:

- `q9_abdominal_symptom`
- `q10_vomiting`
- `q11_appetite_mood`

### 硬便・強い痛み・がまん

条件:

- `q3_stool_consistency = 硬い`
- または `q4_pain = 強く痛がる`
- または `q4_pain = 泣く、またはとても嫌がる`
- または `q5_withholding = ある`
- または `q5_withholding = 強くある`

表示:

- `q7_blood`
- `q8_soiling`

### 内服困難

条件:

- `q6_med_status = 飲みにくくて残る`
- または `q6_med_adherence_flags` に `飲みにくくて残る`

表示:

- `q13_med_difficulty_reason`
- `q13_med_difficulty_other` は `その他` 選択時のみ

### 少なめ・飲み忘れ・中止

条件:

- `q6_med_status = 調節してよいと言われたが、最近は少なめになっている`
- または `q6_med_status = ときどき忘れる`
- または `q6_med_status = 今は中止している`
- または `q6_med_adherence_flags` に `ときどき忘れる`

表示:

- `q14_change_after_less_med`

### 医師指示範囲内の自己調節

条件:

- `q6_med_status = 先生から調節してよいと言われていて、うんちの様子を見ながら調節している`

扱い:

- これだけでは `q14_change_after_less_med` を表示しない。
- 「最近少なめ」と誤変換しない。

## 試用で出た良いサンプル

ユーザーが試した例。

```text
最終排便: 4日以上前
最近の排便頻度: 4日以上あくことがある
うんちの硬さ: 普通
排便時痛: 少し痛がる
がまん: ない

お薬:
- 状況: 先生に言われた量で飲んでいる
- 補足: ときどき忘れる
- 少なめ・飲み忘れ・中止後の変化: 出る間隔があいた
- 飲みにくさ: 該当なし

追加確認:
- お腹の張り・腹痛: ない
- 嘔吐: ない
- 食欲・機嫌: いつも通り
- 血がつく: 未確認
- パンツやおむつに少し便がつく: 未確認

AI追加確認候補:
- 4日以上うんちが出ていない、または4日以上あくことがあるため、お腹の張り・腹痛、嘔吐、食欲・機嫌を診察で確認。
- 実際のお薬が少なめ、飲み忘れ、または中止中。以後の硬さ、間隔、痛みの変化を確認。
```

この出力はMVPとして自然で、現時点の狙いに合っている。

## 次に進むなら

ユーザーは「MVPは良い感じ。もっと先に進んで深くやりたい」と言っている。

次チャットでおすすめする方向:

### 1. 医師レビュー用プロトタイプ

目的:

- 小児科医に見せられる画面にする。
- 「このサマリーは診察前に役立つか」
- 「表現が踏み込みすぎていないか」
- 「追加確認条件が妥当か」
- 「安全表示が過不足ないか」

実装案:

- 医師レビュー用のサンプル症例切り替え
- サマリー表示
- 分岐理由表示
- AIがしないことの明示
- レビューコメント欄

### 2. 診察支援ダッシュボード

目的:

文章サマリーだけでなく、一瞬で読める診察前画面にする。

表示候補:

- 最終排便
- 排便頻度
- 便性状
- 痛み
- がまん
- 便が少しつく
- 血がつく
- お薬状況
- 飲み忘れや内服困難
- 体調確認

UI案:

- 左側: 重要項目カード
- 右側: 医師向けミニサマリー
- 下部: 送信JSONまたは院内連携データ
- 注意項目は色付きラベル

### 3. 日誌連携

目的:

1回の問診ではなく、数日から数週間の排便日誌とつなぐ。

将来価値:

- 維持期の状態把握
- 減量後の再悪化
- 飲み忘れと便性状変化の関係
- 保護者の観察負担の軽減

関連資料:

- `2-3歳モビコール導入維持期_日誌と医師サマリー設計.md`
- `2-3歳モビコール導入維持期_医師サマリー出力例.md`

## 次チャットで最初に読むとよいファイル

実装済み確認:

- `constipation-ai-mvp/src/questionnaire.js`
- `constipation-ai-mvp/src/app.js`
- `constipation-ai-mvp/tests/questionnaire.test.js`

仕様確認:

- `constipation_waiting_room_questionnaire_mvp_spec.md`
- `constipation_waiting_room_questionnaire_mvp_wireframe.md`
- `constipation_waiting_room_questionnaire_mvp_summary_test_cases.md`
- `constipation_ai_physician_review_onepager.md`

日誌連携へ進む場合:

- `2-3歳モビコール導入維持期_日誌と医師サマリー設計.md`
- `2-3歳モビコール導入維持期_医師サマリー出力例.md`

## 次チャットへのおすすめ依頼文

```text
/Users/haman14/Documents/codex-work/constipation_ai_mvp_implementation_handoff_2026-04-28.md を読んでください。
2-3歳便秘AI MVPは、待合アンケート入力、分岐ロジック、医師向けミニサマリーまで実装済みです。
次は、医師レビュー用プロトタイプと診察支援ダッシュボードに進みたいです。
まず現状コードと仕様を確認して、医師が診察前に一瞬で読める画面を実装してください。
```

