const assert = require("assert");
const {
  visibleFieldIds,
  pruneHiddenAnswers,
  hasSafetyNotice,
  generatePhysicianReview,
  generateSummary,
} = require("../src/questionnaire");

const forbidden = [
  "モビコールを増やしてください",
  "モビコールを減らしてください",
  "薬を中止してよいです",
  "薬を再開してください",
  "便塞栓です",
  "便塞栓ではありません",
  "先天性疾患が疑われます",
  "専門医へ紹介してください",
];

const cases = [
  {
    id: "MVP-TC-A",
    input: {
      q1_last_bowel_movement: "今日",
      q2_bowel_frequency: "1日1回くらい",
      q3_stool_consistency: "普通",
      q4_pain: "痛がらない",
      q5_withholding: "ない",
      q6_med_status: "先生に言われた量で飲んでいる",
      q6_med_adherence_flags: [],
    },
    visible: ["q6_med_adherence_flags"],
    hidden: ["q7_blood", "q8_soiling", "q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood", "q13_med_difficulty_reason", "q14_change_after_less_med"],
    safety: false,
    includes: ["現時点で強く追加確認する項目はありません。", "- 補足: なし"],
  },
  {
    id: "MVP-TC-B",
    input: {
      q1_last_bowel_movement: "4日以上前",
      q2_bowel_frequency: "4日以上あくことがある",
      q3_stool_consistency: "硬い",
      q4_pain: "強く痛がる",
      q5_withholding: "ある",
      q6_med_status: "先生に言われた量で飲んでいる",
      q6_med_adherence_flags: [],
      q9_abdominal_symptom: "少しある",
      q10_vomiting: "ない",
      q11_appetite_mood: "食欲が少ない",
      q7_blood: "紙に少しつく",
      q8_soiling: "ときどきある",
    },
    visible: ["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood", "q7_blood", "q8_soiling"],
    safety: true,
    includes: ["硬い便、強い痛み、がまんがあるため", "食欲・機嫌の変化があります。", "便塞栓の有無や追加対応は医師診察で確認が必要です。"],
  },
  {
    id: "MVP-TC-C",
    input: {
      q1_last_bowel_movement: "今日",
      q2_bowel_frequency: "1日1回くらい",
      q3_stool_consistency: "普通",
      q4_pain: "痛がらない",
      q5_withholding: "ない",
      q6_med_status: "先生から調節してよいと言われていて、うんちの様子を見ながら調節している",
      q6_med_adherence_flags: [],
    },
    hidden: ["q14_change_after_less_med"],
    safety: false,
    includes: ["- 状況: 医師指示範囲内で自己調節", "- 少なめ・飲み忘れ・中止後の変化: 該当なし"],
  },
  {
    id: "MVP-TC-D",
    input: {
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "2-3日に1回くらい",
      q3_stool_consistency: "硬い",
      q4_pain: "少し痛がる",
      q5_withholding: "ない",
      q6_med_status: "調節してよいと言われたが、最近は少なめになっている",
      q6_med_adherence_flags: [],
      q7_blood: "ない",
      q8_soiling: "ない",
      q14_change_after_less_med: ["硬くなった", "出る間隔があいた"],
    },
    visible: ["q7_blood", "q8_soiling", "q14_change_after_less_med"],
    safety: false,
    includes: ["硬い便があるため", "- 状況: 調節可と説明あり、最近は少なめ", "処方量の変更や調節範囲の確認は医師判断です。"],
  },
  {
    id: "MVP-TC-E",
    input: {
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "2-3日に1回くらい",
      q3_stool_consistency: "普通",
      q4_pain: "痛がらない",
      q5_withholding: "ない",
      q6_med_status: "飲みにくくて残る",
      q6_med_adherence_flags: [],
      q13_med_difficulty_reason: ["味が苦手", "量が多い"],
    },
    visible: ["q13_med_difficulty_reason"],
    safety: false,
    includes: ["- 状況: 内服困難あり", "- 飲みにくさ: 味が苦手、量が多い"],
  },
  {
    id: "MVP-TC-F",
    input: {
      q1_last_bowel_movement: "今日",
      q2_bowel_frequency: "1日に2回以上",
      q3_stool_consistency: "水のよう",
      q4_pain: "わからない",
      q5_withholding: "わからない",
      q6_med_status: "わからない",
      q9_abdominal_symptom: "強い",
      q10_vomiting: "ある",
      q11_appetite_mood: "食欲も機嫌も気になる",
    },
    visible: ["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"],
    safety: true,
    includes: ["水のような便あり。", "- 補足: 不明"],
  },
  {
    id: "MVP-TC-G",
    input: {
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "1日1回くらい",
      q3_stool_consistency: "普通",
      q4_pain: "痛がらない",
      q5_withholding: "ない",
      q6_med_status: "先生に言われた量で飲んでいる",
      q6_med_adherence_flags: ["ときどき忘れる"],
      q14_change_after_less_med: ["まだわからない"],
    },
    visible: ["q14_change_after_less_med"],
    safety: false,
    includes: ["- 状況: 先生に言われた量で飲んでいる", "- 補足: ときどき忘れる"],
  },
  {
    id: "MVP-TC-H",
    input: {
      q1_last_bowel_movement: "わからない",
      q2_bowel_frequency: "わからない",
      q3_stool_consistency: "わからない",
      q4_pain: "わからない",
      q5_withholding: "わからない",
      q6_med_status: "便秘のお薬は使っていない",
    },
    hidden: ["q6_med_adherence_flags", "q7_blood", "q8_soiling", "q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"],
    safety: false,
    includes: ["保護者がわからないと回答した項目が複数あります。", "- 状況: 便秘薬なし"],
  },
];

for (const testCase of cases) {
  const visible = visibleFieldIds(testCase.input);
  for (const id of testCase.visible || []) {
    assert(visible.includes(id), `${testCase.id}: expected ${id} to be visible`);
  }
  for (const id of testCase.hidden || []) {
    assert(!visible.includes(id), `${testCase.id}: expected ${id} to be hidden`);
  }

  const payload = pruneHiddenAnswers(testCase.input);
  const summary = generateSummary(payload);
  const review = generatePhysicianReview(payload);
  assert.strictEqual(hasSafetyNotice(payload), testCase.safety, `${testCase.id}: safety notice mismatch`);
  assert(review.headline, `${testCase.id}: physician review should have a headline`);
  assert(review.urgency.label, `${testCase.id}: physician review should have an urgency label`);
  assert.strictEqual(review.stool.length, 5, `${testCase.id}: physician review stool snapshot mismatch`);
  assert(review.checkItems.length > 0, `${testCase.id}: physician review should include check items`);

  for (const text of testCase.includes || []) {
    assert(summary.includes(text), `${testCase.id}: summary missing ${text}`);
  }
  for (const text of forbidden) {
    assert(!summary.includes(text), `${testCase.id}: forbidden output found ${text}`);
  }
}

console.log(`${cases.length} MVP questionnaire cases passed`);
