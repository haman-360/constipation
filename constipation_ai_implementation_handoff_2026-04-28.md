# 未就学児便秘AI MVP実装 申し送り

作成日: 2026-04-28

## 次チャットでやりたいこと

2-3歳便秘AIの待合アンケートについて、設計フェーズはいったん十分に進んだ。  
次は実装に入る。

まず作るべきものは、**MVP版の待合アンケート入力画面 + 分岐ロジック + 医師向けミニサマリー生成**。

実装対象は、詳細版v2の全20問ではなく、MVP仕様に限定する。

## 最初に読むべきファイル

### 1. MVP仕様

- `constipation_waiting_room_questionnaire_mvp_spec.md`

実装の中心資料。  
基本6問、追加質問、フィールドID、表示条件、JSON Schema風データ構造、医師向けミニサマリー、安全表示条件が入っている。

### 2. MVP UIワイヤーフレーム

- `constipation_waiting_room_questionnaire_mvp_wireframe.md`

保護者が実際に入力する画面順。  
1問1画面、開始画面、基本6問、お薬補足、追加確認、終了画面、進捗表示、バリデーション、排他ルールが入っている。

### 3. MVPサマリー生成テストケース

- `constipation_waiting_room_questionnaire_mvp_summary_test_cases.md`

実装後の確認用。  
入力JSON、期待サマリー、安全表示の有無、禁止出力、表示条件チェックを含む。  
MVP-TC-AからMVP-TC-Hまである。

### 4. 医師レビュー用要約

- `constipation_ai_physician_review_onepager.md`

実装の安全境界を確認したいときに読む。  
このAIがすること、しないこと、医師レビューで確認したい点がまとまっている。

## 参考資料

詳細版の設計や背景を確認したい場合のみ読む。

- `constipation_waiting_room_questionnaire_v2.md`
- `constipation_waiting_room_questionnaire_v2_implementation_spec.md`
- `constipation_waiting_room_questionnaire_v2_summary_logic.md`
- `constipation_waiting_room_questionnaire_v2_parent_facing_copy.md`
- `constipation_waiting_room_questionnaire_v2_screen_flow_examples.md`
- `constipation_waiting_room_questionnaire_v2_summary_test_cases.md`

前回までの全体申し送り:

- `constipation_ai_handoff_2026-04-28.md`

## MVPで実装する範囲

### 基本6問

必ず表示する。

| ID | 内容 |
|---|---|
| `q1_last_bowel_movement` | 最後にうんちが出たのはいつか |
| `q2_bowel_frequency` | 最近のうんちの間隔 |
| `q3_stool_consistency` | 最近のうんちの硬さ |
| `q4_pain` | うんちのとき痛がるか |
| `q5_withholding` | うんちをがまんしている様子 |
| `q6_med_status` | 便秘薬を今どう飲んでいるか |

### お薬補足

条件付きで表示。

| ID | 内容 |
|---|---|
| `q6_med_adherence_flags` | ときどき忘れる / 飲みにくくて残る |

表示条件:

- `q6_med_status` が `便秘のお薬は使っていない` 以外。
- `q6_med_status` が `わからない` 以外。

未選択でも進める。

### 追加質問

| ID | 内容 | 表示条件 |
|---|---|---|
| `q9_abdominal_symptom` | お腹の張りや腹痛 | 4日以上無排便、または水のような便 |
| `q10_vomiting` | 吐いたこと | 4日以上無排便、強い腹痛・お腹の張り、水のような便 |
| `q11_appetite_mood` | 食欲・機嫌 | 4日以上無排便、嘔吐あり、水のような便、強い腹痛・お腹の張り |
| `q7_blood` | 血がつくこと | 硬い便、強い痛み、泣く・とても嫌がる |
| `q8_soiling` | パンツやおむつに少し便がつくこと | がまんあり、強い痛み、医師が確認したい設定 |
| `q13_med_difficulty_reason` | お薬が飲みにくい理由 | 飲みにくくて残る、または追加チェックで飲みにくさあり |
| `q13_med_difficulty_other` | その他理由 | `q13` でその他 |
| `q14_change_after_less_med` | 少なめ・飲み忘れ・中止後の変化 | 最近少なめ、飲み忘れ、中止中、または追加チェックで飲み忘れあり |

## 重要な表示条件

### 4日以上無排便

条件:

- `q1_last_bowel_movement = 4日以上前`
- または `q2_bowel_frequency = 4日以上あくことがある`

表示:

- `q9_abdominal_symptom`
- `q10_vomiting`
- `q11_appetite_mood`

### 硬便・痛み・がまん

条件:

- `q3_stool_consistency = 硬い`
- または `q4_pain = 強く痛がる`
- または `q4_pain = 泣く、またはとても嫌がる`
- または `q5_withholding = ある`
- または `q5_withholding = 強くある`

表示:

- `q7_blood`
- `q8_soiling`

### 水のような便

条件:

- `q3_stool_consistency = 水のよう`

表示:

- `q9_abdominal_symptom`
- `q10_vomiting`
- `q11_appetite_mood`

### 内服困難

条件:

- `q6_med_status = 飲みにくくて残る`
- または `q6_med_adherence_flags` に `飲みにくくて残る` が含まれる

表示:

- `q13_med_difficulty_reason`

### 少なめ・飲み忘れ・中止

条件:

- `q6_med_status = 調節してよいと言われたが、最近は少なめになっている`
- または `q6_med_status = ときどき忘れる`
- または `q6_med_status = 今は中止している`
- または `q6_med_adherence_flags` に `ときどき忘れる` が含まれる

表示:

- `q14_change_after_less_med`

### 医師指示範囲内の自己調節

条件:

- `q6_med_status = 先生から調節してよいと言われていて、うんちの様子を見ながら調節している`

扱い:

- これだけでは `q14_change_after_less_med` を必須表示しない。
- 「最近少なめ」と誤変換しない。
- 医師指示範囲内で自己調節している、という状態として扱う。

## UIの実装方針

MVPでは1問1画面を基本にする。

画面順:

1. 開始画面。
2. 基本6問。
3. お薬補足。
4. 追加確認: 体調。
5. 追加確認: 硬便・痛み・がまん。
6. 追加確認: お薬。
7. 終了画面。

戻る操作:

- 前画面の回答を保持する。
- 回答変更により表示条件が外れた追加質問は、送信データから除外する。

進捗:

- 基本6問中は `基本確認 1 / 6` のように分けてもよい。
- 追加質問は基本6問後に表示対象を計算して `追加確認 1 / N` としてもよい。

## サマリー生成

MVPで出すのは、完全版サマリーではなく医師向けミニサマリー。

基本形:

```text
【診察前 便秘ミニサマリー】

最終排便:
最近の排便頻度:
うんちの硬さ:
排便時痛:
がまん:

お薬:
- 状況:
- 補足:
- 少なめ・飲み忘れ・中止後の変化:
- 飲みにくさ:

追加確認:
- お腹の張り・腹痛:
- 嘔吐:
- 食欲・機嫌:
- 血がつく:
- パンツやおむつに少し便がつく:

AI追加確認候補:
-

AIが判断していないこと:
- 診断
- 便塞栓の有無
- モビコールなどの処方量変更
- 治療中止可否
- 専門紹介の要否
```

値の扱い:

- 分岐で表示されなかった項目は `未確認`。
- 保護者が `わからない` を選んだ項目は `わからない`。
- 薬を使っていない等で当てはまらない項目は `該当なし`。

## 保護者向け安全表示

終了画面で、次のいずれかがある場合に表示する。

- `q9_abdominal_symptom = 強い`
- `q10_vomiting = ある`
- `q11_appetite_mood = 食欲が少ない`
- `q11_appetite_mood = 機嫌が悪い`
- `q11_appetite_mood = 食欲も機嫌も気になる`

表示文:

```text
強い腹痛、吐いた、食欲や機嫌がいつもと違う場合は、入力だけでなく受付または医療スタッフにもお伝えください。
```

## 絶対に守るAIの境界

AIは以下をしない。

- 診断。
- 便塞栓の有無判断。
- モビコールなどの処方量変更。
- 薬を増やす、減らす、中止する、再開する指示。
- 治療中止可否の判断。
- 専門紹介の要否判断。
- 先天性疾患の有無判断。

禁止出力例:

```text
モビコールを増やしてください
モビコールを減らしてください
薬を中止してよいです
薬を再開してください
便塞栓です
便塞栓ではありません
先天性疾患が疑われます
専門医へ紹介してください
```

## MVPテストケース

実装後は `constipation_waiting_room_questionnaire_mvp_summary_test_cases.md` の8ケースを確認する。

| ID | ケース |
|---|---|
| MVP-TC-A | 安定維持例 |
| MVP-TC-B | 4日以上無排便 + 硬便・痛み・がまん |
| MVP-TC-C | 医師指示範囲内の自己調節 |
| MVP-TC-D | 最近少なめ + 変化あり |
| MVP-TC-E | 飲みにくくて残る |
| MVP-TC-F | 水のような便 + 嘔吐あり |
| MVP-TC-G | 飲み忘れ追加チェック |
| MVP-TC-H | わからないが多い例 |

## 排他ルール

### `q13_med_difficulty_reason`

- `わからない` と他選択肢は同時選択不可。

### `q14_change_after_less_med`

- `わからない` と他選択肢は同時選択不可。
- `まだわからない` と具体的変化は同時選択不可。
- `変わらない` と `硬くなった`、`出る間隔があいた`、`痛がるようになった` は同時選択不可。

## 初回実装では扱わないもの

MVPでは以下を実装しない、または後回しにする。

- 周産期・新生児期の背景情報。
- 基礎疾患、発達・行動面、定期薬。
- 家族歴。
- トイレ詰まり。
- 園・外出先での排便困難。
- 浣腸歴、受診中断歴、便秘開始時期。
- 詳細版v2の全項目。

## 次チャットへのおすすめ指示文

```text
/Users/haman14/Documents/codex-work/constipation_ai_implementation_handoff_2026-04-28.md を読んで、2-3歳便秘AIのMVP実装を始めてください。
まずは MVP版の待合アンケート入力画面、分岐ロジック、医師向けミニサマリー生成からお願いします。
```

## 現在の関連ファイル一覧

- `constipation_ai_implementation_handoff_2026-04-28.md`
- `constipation_waiting_room_questionnaire_mvp_spec.md`
- `constipation_waiting_room_questionnaire_mvp_wireframe.md`
- `constipation_waiting_room_questionnaire_mvp_summary_test_cases.md`
- `constipation_ai_physician_review_onepager.md`
- `constipation_ai_handoff_2026-04-28.md`
- `constipation_waiting_room_questionnaire_v2.md`
- `constipation_waiting_room_questionnaire_v2_implementation_spec.md`
- `constipation_waiting_room_questionnaire_v2_summary_logic.md`
- `constipation_waiting_room_questionnaire_v2_parent_facing_copy.md`
- `constipation_waiting_room_questionnaire_v2_screen_flow_examples.md`
- `constipation_waiting_room_questionnaire_v2_summary_test_cases.md`

