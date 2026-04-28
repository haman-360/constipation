# 2-3歳便秘AI 待合アンケート v2 サマリー生成ロジック

作成日: 2026-04-28

参照:

- `constipation_waiting_room_questionnaire_v2.md`
- `constipation_waiting_room_questionnaire_v2_implementation_spec.md`
- `constipation_waiting_room_questionnaire_v2_parent_facing_copy.md`
- `constipation_waiting_room_questionnaire_v2_screen_flow_examples.md`

目的:

- 待合アンケート回答から、医師向けの診察前サマリーを生成するルールを定義する。
- AIが診断、処方変更、治療中止判断をしないよう、出力文を観察情報と確認候補に限定する。
- 「未確認」「不明」「該当なし」の扱いをそろえる。

## 1. 出力の基本構造

```text
【診察前 便秘サマリー】

最終排便:
最近の排便頻度:
便性状:
排便時痛:
排便がまん:
出血:
便失禁・下着汚れ:
腹痛・腹部膨満:
嘔吐:
食欲・機嫌:

便秘薬の内服:
- 状況:
- 医師から調節可の説明:
- 実際の内服:
- 最近少なめになっている:
- 飲み忘れ・中止・少なめ後の変化:
- 飲みにくさ:

大量便:
- 1回量:
- トイレ詰まり:

園・外出先での排便困難:

背景情報:
- 周産期・新生児期:
- 基礎疾患・通院中の病気:
- 発達・行動面:
- 定期内服薬:
- 家族歴:

AI追加確認候補:
-

AIが判断していないこと:
- 診断
- 便塞栓の有無
- モビコールなどの処方量変更
- 治療中止可否
- 専門紹介の要否
```

## 2. 値の表示ルール

### 未確認

表示条件:

- 画面分岐により、その質問を表示していない。
- 回答データが存在しない。

表示:

```text
未確認
```

使いどころ:

- 医師が「聞いていないだけ」と分かる方がよい項目。
- 例: 腹痛・腹部膨満、嘔吐、食欲・機嫌、トイレ詰まり。

### わからない

表示条件:

- 保護者が「わからない」を選んだ。

表示:

```text
わからない
```

使いどころ:

- 保護者が確認できなかったことをそのまま示す。

### 該当なし

表示条件:

- その児には質問自体が当てはまらない。
- 例: トイレでうんちをしていない場合のトイレ詰まり。

表示:

```text
該当なし
```

または文脈に応じて:

```text
トイレ排便なし
```

### 省略してよい項目

短いサマリーを優先する場合、以下は正常または未確認なら省略してよい。

- 園・外出先での排便困難
- 背景情報の詳細
- 大量便欄

ただし、v2の標準出力では、情報の欠落を避けるため主要項目は残す。

## 3. 基本項目のマッピング

| サマリー項目 | 入力フィールド | 表示ルール |
|---|---|---|
| 最終排便 | q1_last_bowel_movement | 回答値をそのまま表示 |
| 最近の排便頻度 | q2_bowel_frequency | 回答値をそのまま表示 |
| 便性状 | q3_stool_consistency | 回答値をそのまま表示 |
| 排便時痛 | q4_pain | 回答値をそのまま表示 |
| 排便がまん | q5_withholding | 回答値をそのまま表示 |
| 出血 | q7_blood | 未回答なら未確認 |
| 便失禁・下着汚れ | q8_soiling | 未回答なら未確認 |
| 腹痛・腹部膨満 | q9_abdominal_symptom | 未回答なら未確認 |
| 嘔吐 | q10_vomiting | 未回答なら未確認 |
| 食欲・機嫌 | q11_appetite_mood | 未回答なら未確認 |
| 1回量 | q12_stool_amount | 未回答なら未確認 |
| トイレ詰まり | q15_toilet_clogging | 未回答なら未確認、トイレ排便なしならトイレ排便なし |
| 園・外出先での排便困難 | q16_nursery_outing | 未回答なら未確認 |

## 4. 便秘薬の内服ロジック

### q6_med_statusからの標準変換

| q6_med_status | 状況 | 医師から調節可の説明 | 実際の内服 | 最近少なめ |
|---|---|---|---|---|
| 先生に言われた量で飲んでいる | 先生に言われた量で飲んでいる | なし | 医師指示量 | なし |
| 先生から調節してよいと言われていて、うんちの様子を見ながら調節している | 医師指示範囲内で自己調節 | あり | 医師指示範囲内で調節 | なしまたは不明 |
| 調節してよいと言われたが、最近は少なめになっている | 調節可と説明あり、最近は少なめ | あり | 最近少なめ | あり |
| ときどき忘れる | 飲み忘れあり | 不明 | 飲み忘れあり | 不明 |
| 飲みにくくて残る | 内服困難あり | 不明 | 内服困難あり | 不明 |
| 今は中止している | 中止中 | 不明 | 中止中 | 不明 |
| 便秘のお薬は使っていない | 便秘薬なし | なし | 便秘薬なし | なし |
| わからない | 不明 | 不明 | 不明 | 不明 |

### q6_med_adherence_flagsの反映

q6_med_adherence_flagsに追加チェックがある場合、q6_med_statusに上書きせず、追記する。

例:

```text
便秘薬の内服:
- 状況: 医師指示範囲内で自己調節
- 医師から調節可の説明: あり
- 実際の内服: 医師指示範囲内で調節
- 最近少なめになっている: なし
- 補足: ときどき忘れる、飲みにくくて残る
```

### q14_change_after_less_medの反映

q14の回答は以下へ出力する。

```text
- 飲み忘れ・中止・少なめ後の変化:
```

表示ルール:

- 複数選択は読点で連結する。
- 「変わらない」と他の変化が同時に選ばれた場合は、他の変化を優先し、「変わらない」は除外する。
- 「まだわからない」と「わからない」は、他の具体的変化がなければそのまま表示する。

### q13_med_difficulty_reasonの反映

q13の回答は以下へ出力する。

```text
- 飲みにくさ:
```

表示ルール:

- 複数選択は読点で連結する。
- 「その他」がある場合は、q13_med_difficulty_otherを括弧内に追記する。

例:

```text
- 飲みにくさ: 味が苦手、量が多い、その他（冷たい飲み物に混ぜても嫌がる）
```

## 5. 背景情報の出力ロジック

### B1 周産期・新生児期

入力:

- b1_neonatal_followup
- b1_neonatal_detail

出力:

```text
周産期・新生児期:
- 生後に産婦人科/新生児科通院歴: あり / なし / わからない
- 詳細: 小さく生まれた、早く生まれた、NICUに入院した、その他、わからない
```

表示ルール:

- b1_neonatal_followupが「なし」の場合、詳細は省略してよい。
- b1_neonatal_followupが「ある」で詳細未回答なら「詳細未確認」と表示する。
- 目的は周産期・新生児期に通常と異なる経過があったかの把握であり、AIは先天性疾患の有無を判断しない。

### B2-B4

| サマリー項目 | 入力 | 表示ルール |
|---|---|---|
| 基礎疾患・通院中の病気 | b2_comorbidity, b2_comorbidity_detail | ありなら詳細を追記 |
| 発達・行動面 | b3_development_behavior | 複数選択を読点で連結 |
| 定期内服薬 | b4_regular_meds, b4_regular_meds_detail | ありなら薬剤名を追記 |
| 家族歴 | q20_family_history | 複数選択を読点で連結 |

## 6. AI追加確認候補の生成ルール

AI追加確認候補は、診断名ではなく「診察で確認するとよい観察情報」として出す。

### 4日以上うんちが出ていない

条件:

- q1_last_bowel_movement = 4日以上前
- または q2_bowel_frequency = 4日以上あくことがある

出力:

```text
- 4日以上うんちが出ていない、または4日以上あくことがあるとの回答です。
```

同時に硬便、痛み、がまん、便汚れ、腹部症状があれば追記する。

### 硬便 + 痛み

条件:

- q3_stool_consistency = 硬い
- かつ q4_pain = 少し痛がる / 強く痛がる / 泣く、またはとても嫌がる

出力:

```text
- 硬いうんちと排便時痛があります。
```

### 硬便 + 出血

条件:

- q3_stool_consistency = 硬い
- かつ q7_blood = 紙やおしりふきに少しつく / うんちに混じる

出力:

```text
- 硬いうんちに加えて、血がつくとの回答です。
```

注:

- 「裂肛疑い」とは書かない。

### がまんあり

条件:

- q5_withholding = ある / 強くある

出力:

```text
- うんちをがまんする様子があります。
```

### 便失禁・下着汚れあり

条件:

- q8_soiling = ときどきある / よくある

出力:

```text
- パンツやおむつに少しうんちがつくことがあります。
```

注:

- 「便塞栓疑い」とは断定しない。
- 必要に応じて「便塞栓の有無は医師診察で確認が必要です」と書く。

### 強い腹痛・腹部膨満

条件:

- q9_abdominal_symptom = 強い

出力:

```text
- お腹の張りや腹痛が強いとの回答です。
```

### 嘔吐あり

条件:

- q10_vomiting = ある

出力:

```text
- 最近吐いたことがあるとの回答です。
```

### 食欲・機嫌の変化

条件:

- q11_appetite_mood = 食欲が少ない / 機嫌が悪い / 食欲も機嫌も気になる

出力:

```text
- 食欲や機嫌の変化があります。
```

### 最近少なめ・飲み忘れ・中止後の変化

条件:

- q6_med_status = 調節してよいと言われたが、最近は少なめになっている
- または q6_med_status = ときどき忘れる
- または q6_med_status = 今は中止している
- かつ q14_change_after_less_med に「硬くなった」「出る間隔があいた」「痛がるようになった」のいずれかがある

出力:

```text
- お薬が少なめ、飲み忘れ、または中止のあとに、硬便、排便間隔延長、痛みの変化があります。
```

### 内服困難

条件:

- q6_med_status = 飲みにくくて残る
- または q6_med_adherence_flagsに「飲みにくくて残る」が含まれる

出力:

```text
- お薬が飲みにくくて残るとの回答です。
```

q13があれば理由を追記する。

## 7. 早めにスタッフへ伝える表示

これは診断や緊急度判定ではなく、待合で見落とさないための案内表示。

条件:

- q9_abdominal_symptom = 強い
- または q10_vomiting = ある
- または q11_appetite_mood = 食欲が少ない / 機嫌が悪い / 食欲も機嫌も気になる

保護者向け終了画面:

```text
お腹の強い症状や吐き気、食欲・機嫌の変化がある場合は、受付または医療スタッフにもお伝えください。
```

医師サマリー:

```text
AI追加確認候補:
- お腹の症状、嘔吐、食欲・機嫌の変化について診察時に確認してください。
```

## 8. サマリー生成の擬似コード

```pseudo
summary = {}

summary.basic.last_bowel_movement = value_or_unknown(q1_last_bowel_movement)
summary.basic.frequency = value_or_unknown(q2_bowel_frequency)
summary.basic.consistency = value_or_unknown(q3_stool_consistency)
summary.basic.pain = value_or_unknown(q4_pain)
summary.basic.withholding = value_or_unknown(q5_withholding)

summary.symptoms.blood = value_or_unchecked(q7_blood)
summary.symptoms.soiling = value_or_unchecked(q8_soiling)
summary.symptoms.abdominal = value_or_unchecked(q9_abdominal_symptom)
summary.symptoms.vomiting = value_or_unchecked(q10_vomiting)
summary.symptoms.appetite_mood = value_or_unchecked(q11_appetite_mood)

summary.medication = map_medication_status(q6_med_status)
summary.medication.flags = q6_med_adherence_flags
summary.medication.change_after_less_med = normalize_multi_select(q14_change_after_less_med)
summary.medication.difficulty = normalize_med_difficulty(q13_med_difficulty_reason, q13_med_difficulty_other)

summary.large_stool.amount = value_or_unchecked(q12_stool_amount)
summary.large_stool.toilet_clogging = value_or_unchecked_or_not_applicable(q15_toilet_clogging)

summary.background.neonatal = map_neonatal(b1_neonatal_followup, b1_neonatal_detail)
summary.background.comorbidity = map_detail(b2_comorbidity, b2_comorbidity_detail)
summary.background.development = normalize_multi_select(b3_development_behavior)
summary.background.regular_meds = map_detail(b4_regular_meds, b4_regular_meds_detail)
summary.background.family_history = normalize_multi_select(q20_family_history)

alerts = []

if q1_last_bowel_movement == "4日以上前" or q2_bowel_frequency == "4日以上あくことがある":
    alerts.append("4日以上うんちが出ていない、または4日以上あくことがあるとの回答です。")

if q3_stool_consistency == "硬い" and q4_pain in ["少し痛がる", "強く痛がる", "泣く、またはとても嫌がる"]:
    alerts.append("硬いうんちと排便時痛があります。")

if q3_stool_consistency == "硬い" and q7_blood in ["紙やおしりふきに少しつく", "うんちに混じる"]:
    alerts.append("硬いうんちに加えて、血がつくとの回答です。")

if q5_withholding in ["ある", "強くある"]:
    alerts.append("うんちをがまんする様子があります。")

if q8_soiling in ["ときどきある", "よくある"]:
    alerts.append("パンツやおむつに少しうんちがつくことがあります。")

if q9_abdominal_symptom == "強い":
    alerts.append("お腹の張りや腹痛が強いとの回答です。")

if q10_vomiting == "ある":
    alerts.append("最近吐いたことがあるとの回答です。")

if q11_appetite_mood in ["食欲が少ない", "機嫌が悪い", "食欲も機嫌も気になる"]:
    alerts.append("食欲や機嫌の変化があります。")

if medication_reduced_forgotten_or_stopped(q6_med_status) and has_specific_worsening(q14_change_after_less_med):
    alerts.append("お薬が少なめ、飲み忘れ、または中止のあとに、硬便、排便間隔延長、痛みの変化があります。")

if medication_difficult(q6_med_status, q6_med_adherence_flags):
    alerts.append("お薬が飲みにくくて残るとの回答です。")

summary.ai_confirmation_points = alerts
summary.ai_not_judging = [
  "診断",
  "便塞栓の有無",
  "モビコールなどの処方量変更",
  "治療中止可否",
  "専門紹介の要否"
]

return render(summary)
```

## 9. 実装時の注意

- サマリー文は医師向けなので「便塞栓」「排便時痛」「腹部膨満」などの医療者向け表現を使ってよい。
- 保護者画面では同じ内容を「うんちがつく」「お腹の張り」などに言い換える。
- q6_med_statusの主状態とq6_med_adherence_flagsの追加チェックは、上書きせず併記する。
- AI追加確認候補は多くなりすぎる場合、重要度順に最大5項目程度へ圧縮してよい。
- 強い腹痛、嘔吐、食欲・機嫌の変化は、診断せずに「スタッフにも伝えてください」と案内する。
- 「薬を増やす」「薬を減らす」「中止してよい」は出力しない。
