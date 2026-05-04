const assert = require("assert");
const {
  visibleFieldIds,
  pruneHiddenAnswers,
  normalizeDiaryAnswers,
  mergeDiaryAnswers,
  normalizeVisitMeta,
  mergeVisitMeta,
  weeklySummary,
  normalizeMultiSelection,
  hasSafetyNotice,
  generatePhysicianReview,
  generateSummary,
  generateFacilityShare,
  generatePatientMemo,
  generateSheetsVisitPayload,
  generateShortQrPayload,
  decodeShortQrPayload,
} = require("../src/questionnaire");

const UNKNOWN = "わからない";

const forbidden = [
  "モビコールを増やしてください",
  "モビコールを減らしてください",
  "薬を中止してよいです",
  "薬を再開してください",
  "便塞栓です",
  "便塞栓ではありません",
  "先天性疾患が疑われます",
  "専門医へ紹介してください",
  "便塞栓の有無や追加対応は医師診察で確認が必要です",
  "伝える必要があります",
  "処方量の変更や調節範囲の確認は医師判断です",
];

const cases = [
  {
    id: "MVP-TC-A",
    input: {
      q1_last_bowel_movement: "今日",
      q2_bowel_frequency: "1日1回くらい",
      q3_stool_consistency: "普通（バナナくらい）",
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
    safety: false,
    includes: ["硬い便、強い痛み、がまんがあるため", "食欲・機嫌の変化があります。", "便塞栓の有無や追加対応は、この画面では判断せず診察で確認します。"],
  },
  {
    id: "MVP-TC-C",
    input: {
      q1_last_bowel_movement: "今日",
      q2_bowel_frequency: "1日1回くらい",
      q3_stool_consistency: "普通（バナナくらい）",
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
    includes: ["硬い便があるため", "- 状況: 調節可と説明あり、最近は少なめ", "処方量の変更や調節範囲は、この画面では判断せず診察で確認します。"],
  },
  {
    id: "MVP-TC-E",
    input: {
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "2-3日に1回くらい",
      q3_stool_consistency: "普通（バナナくらい）",
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
      q3_stool_consistency: "水のよう（下痢に近い）",
      q4_pain: "わからない",
      q5_withholding: "わからない",
      q6_med_status: "わからない",
      q9_abdominal_symptom: "強い",
      q10_vomiting: "ある",
      q11_appetite_mood: "食欲も機嫌も気になる",
    },
    visible: ["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"],
    safety: false,
    includes: ["水のような便あり。", "- 補足: 不明"],
  },
  {
    id: "MVP-TC-G",
    input: {
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "1日1回くらい",
      q3_stool_consistency: "普通（バナナくらい）",
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
  assert(!review.headline.includes(" + "), `${testCase.id}: physician review headline should be readable text`);
  assert(!review.headline.includes("ありますも"), `${testCase.id}: physician review headline should not include broken particles`);
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

const reviewScenarios = [
  {
    id: "REVIEW-STABLE",
    input: cases[0].input,
    level: "stable",
    label: "通常確認",
    message: "現時点で目立つ追加確認項目はありません。",
    headline: "今回の回答では、目立つ追加確認項目はありません。",
  },
  {
    id: "REVIEW-WATCH-STOOL-MEDICINE",
    input: {
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "2-3日に1回くらい",
      q3_stool_consistency: "硬い",
      q4_pain: "少し痛がる",
      q5_withholding: "ある",
      q6_med_status: "今は中止している",
      q6_med_adherence_flags: ["飲みにくくて残る", "ときどき忘れる"],
      q7_blood: "便に混じる",
      q8_soiling: "ない",
      q13_med_difficulty_reason: ["子どもが嫌がる"],
      q14_change_after_less_med: ["痛がるようになった"],
    },
    level: "watch",
    label: "診察で確認",
    message: "診察時に確認したい追加情報があります。",
    headline: "硬い便・がまん行動が確認されています。便秘薬では飲み忘れ、中止中、飲みにくさが確認されています。薬が少なめ・飲み忘れ・中止のあとに排便時痛の変化があります。",
  },
  {
    id: "REVIEW-ALERT",
    input: cases[5].input,
    level: "watch",
    label: "診察で確認",
    message: "診察時に確認したい追加情報があります。",
    headline: "強い腹痛・お腹の張りがあります。嘔吐があります。食欲と機嫌の変化があります。水のような便があります。",
  },
  {
    id: "REVIEW-APPETITE-ONLY-WATCH",
    input: cases[1].input,
    level: "watch",
    label: "診察で確認",
    message: "診察時に確認したい追加情報があります。",
    headline: "4日以上の無排便または排便間隔のあきがあります。硬い便・強い排便時痛・がまん行動が確認されています。",
  },
];

for (const scenario of reviewScenarios) {
  const review = generatePhysicianReview(pruneHiddenAnswers(scenario.input));
  assert.strictEqual(review.urgency.level, scenario.level, `${scenario.id}: urgency level mismatch`);
  assert.strictEqual(review.urgency.label, scenario.label, `${scenario.id}: urgency label mismatch`);
  assert.strictEqual(review.urgency.message, scenario.message, `${scenario.id}: urgency message mismatch`);
  assert.strictEqual(review.headline, scenario.headline, `${scenario.id}: headline mismatch`);
}

const stableBase = {
  q1_last_bowel_movement: "今日",
  q2_bowel_frequency: "1日1回くらい",
  q3_stool_consistency: "普通（バナナくらい）",
  q4_pain: "痛がらない",
  q5_withholding: "ない",
  q6_med_status: "先生に言われた量で飲んでいる",
  q6_med_adherence_flags: [],
};

const urgencyCases = [
  {
    id: "URGENCY-STABLE-BASE",
    input: stableBase,
    level: "stable",
  },
  {
    id: "URGENCY-ALERT-STRONG-ABDOMINAL-SYMPTOM",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "強い",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    level: "watch",
  },
  {
    id: "URGENCY-ALERT-VOMITING",
    input: {
      ...stableBase,
      q3_stool_consistency: "水のよう（下痢に近い）",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ある",
      q11_appetite_mood: "いつも通り",
    },
    level: "watch",
  },
  {
    id: "URGENCY-ALERT-APPETITE-AND-MOOD",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "食欲も機嫌も気になる",
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-APPETITE-ONLY",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "食欲が少ない",
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-FOUR-DAYS",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-WATERY-STOOL",
    input: {
      ...stableBase,
      q3_stool_consistency: "水のよう（下痢に近い）",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-HARD-STOOL",
    input: {
      ...stableBase,
      q3_stool_consistency: "硬い",
      q7_blood: "ない",
      q8_soiling: "ない",
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-STRONG-PAIN",
    input: {
      ...stableBase,
      q4_pain: "泣く、またはとても嫌がる",
      q7_blood: "ない",
      q8_soiling: "ない",
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-WITHHOLDING",
    input: {
      ...stableBase,
      q5_withholding: "強くある",
      q7_blood: "ない",
      q8_soiling: "ない",
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-LESS-MEDICINE",
    input: {
      ...stableBase,
      q6_med_status: "調節してよいと言われたが、最近は少なめになっている",
      q6_med_adherence_flags: [],
      q14_change_after_less_med: ["まだわからない"],
    },
    level: "watch",
  },
  {
    id: "URGENCY-WATCH-MEDICINE-DIFFICULTY",
    input: {
      ...stableBase,
      q6_med_status: "飲みにくくて残る",
      q6_med_adherence_flags: [],
      q13_med_difficulty_reason: ["子どもが嫌がる"],
    },
    level: "watch",
  },
];

for (const urgencyCase of urgencyCases) {
  const review = generatePhysicianReview(pruneHiddenAnswers(urgencyCase.input));
  assert.strictEqual(review.urgency.level, urgencyCase.level, `${urgencyCase.id}: urgency level mismatch`);
}

const medicationCases = [
  {
    id: "MED-DIFFICULTY-ONLY",
    input: {
      ...stableBase,
      q6_med_status: "飲みにくくて残る",
      q6_med_adherence_flags: [],
      q13_med_difficulty_reason: ["味が苦手"],
    },
    headline: "便秘薬では飲みにくさが確認されています。",
    medChange: "該当なし",
    medDifficulty: "味が苦手",
  },
  {
    id: "MED-LESS-ONLY",
    input: {
      ...stableBase,
      q6_med_status: "調節してよいと言われたが、最近は少なめになっている",
      q6_med_adherence_flags: [],
      q14_change_after_less_med: ["硬くなった"],
    },
    headline: "便秘薬では最近少なめが確認されています。薬が少なめ・飲み忘れ・中止のあとに硬便化があります。",
    medChange: "硬くなった",
    medDifficulty: "該当なし",
  },
  {
    id: "MED-STOPPED-WITH-FLAGS",
    input: {
      ...stableBase,
      q6_med_status: "今は中止している",
      q6_med_adherence_flags: ["ときどき忘れる", "飲みにくくて残る"],
      q13_med_difficulty_reason: ["子どもが嫌がる"],
      q14_change_after_less_med: ["痛がるようになった"],
    },
    headline: "便秘薬では飲み忘れ、中止中、飲みにくさが確認されています。薬が少なめ・飲み忘れ・中止のあとに排便時痛の変化があります。",
    medChange: "痛がるようになった",
    medDifficulty: "子どもが嫌がる",
  },
];

for (const medicationCase of medicationCases) {
  const review = generatePhysicianReview(pruneHiddenAnswers(medicationCase.input));
  const medication = Object.fromEntries(review.medication.map((item) => [item.label, item.value]));
  assert.strictEqual(review.headline, medicationCase.headline, `${medicationCase.id}: headline mismatch`);
  assert.strictEqual(medication["少なめ/忘れ/中止後"], medicationCase.medChange, `${medicationCase.id}: medicine change mismatch`);
  assert.strictEqual(medication["飲みにくさ"], medicationCase.medDifficulty, `${medicationCase.id}: medicine difficulty mismatch`);
}

const medicationBranchCases = [
  {
    id: "MED-BRANCH-ADHERENCE-FORGOT",
    input: {
      ...stableBase,
      q6_med_status: "先生に言われた量で飲んでいる",
      q6_med_adherence_flags: ["ときどき忘れる"],
      q14_change_after_less_med: ["まだわからない"],
    },
    level: "watch",
    visible: ["q6_med_adherence_flags", "q14_change_after_less_med"],
    hidden: ["q13_med_difficulty_reason", "q13_med_difficulty_other"],
    headline: "便秘薬では飲み忘れが確認されています。",
    checkItem: "実際のお薬が少なめ、飲み忘れ、または中止中。以後の硬さ、間隔、痛みの変化を確認。",
    medication: {
      状況: "先生に言われた量で飲んでいる",
      補足: "ときどき忘れる",
      "少なめ/忘れ/中止後": "まだわからない",
      飲みにくさ: "該当なし",
    },
  },
  {
    id: "MED-BRANCH-ADHERENCE-DIFFICULTY-OTHER",
    input: {
      ...stableBase,
      q6_med_status: "先生に言われた量で飲んでいる",
      q6_med_adherence_flags: ["飲みにくくて残る"],
      q13_med_difficulty_reason: ["その他"],
      q13_med_difficulty_other: "粉っぽい",
    },
    level: "watch",
    visible: ["q6_med_adherence_flags", "q13_med_difficulty_reason", "q13_med_difficulty_other"],
    hidden: ["q14_change_after_less_med"],
    headline: "便秘薬では飲みにくさが確認されています。",
    checkItem: "お薬が飲みにくい可能性あり。味、量、タイミング、子どもの拒否など具体的な理由を確認。",
    medication: {
      状況: "先生に言われた量で飲んでいる",
      補足: "飲みにくくて残る",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "その他(粉っぽい)",
    },
  },
  {
    id: "MED-BRANCH-LESS-WITH-UNCHANGED",
    input: {
      ...stableBase,
      q6_med_status: "調節してよいと言われたが、最近は少なめになっている",
      q6_med_adherence_flags: [],
      q14_change_after_less_med: ["変わらない"],
    },
    level: "watch",
    visible: ["q6_med_adherence_flags", "q14_change_after_less_med"],
    hidden: ["q13_med_difficulty_reason", "q13_med_difficulty_other"],
    headline: "便秘薬では最近少なめが確認されています。",
    checkItem: "実際のお薬が少なめ、飲み忘れ、または中止中。以後の硬さ、間隔、痛みの変化を確認。",
    medication: {
      状況: "調節可と説明あり、最近は少なめ",
      補足: "医師から調節可の説明あり",
      "少なめ/忘れ/中止後": "変わらない",
      飲みにくさ: "該当なし",
    },
  },
  {
    id: "MED-BRANCH-NO-MEDICINE-PRUNES_STALE",
    input: {
      ...stableBase,
      q6_med_status: "便秘のお薬は使っていない",
      q6_med_adherence_flags: ["ときどき忘れる", "飲みにくくて残る"],
      q13_med_difficulty_reason: ["味が苦手"],
      q14_change_after_less_med: ["硬くなった"],
    },
    level: "stable",
    visible: [],
    hidden: ["q6_med_adherence_flags", "q13_med_difficulty_reason", "q13_med_difficulty_other", "q14_change_after_less_med"],
    headline: "今回の回答では、目立つ追加確認項目はありません。",
    checkItem: "現時点で強く追加確認する項目はありません。",
    medication: {
      状況: "便秘薬なし",
      補足: "なし",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "該当なし",
    },
  },
  {
    id: "MED-BRANCH-UNKNOWN-PRUNES_STALE",
    input: {
      ...stableBase,
      q6_med_status: UNKNOWN,
      q6_med_adherence_flags: ["ときどき忘れる", "飲みにくくて残る"],
      q13_med_difficulty_reason: ["子どもが嫌がる"],
      q14_change_after_less_med: ["痛がるようになった"],
    },
    level: "stable",
    visible: [],
    hidden: ["q6_med_adherence_flags", "q13_med_difficulty_reason", "q13_med_difficulty_other", "q14_change_after_less_med"],
    headline: "今回の回答では、目立つ追加確認項目はありません。",
    checkItem: "現時点で強く追加確認する項目はありません。",
    medication: {
      状況: UNKNOWN,
      補足: "不明",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "未確認",
    },
  },
];

for (const medicationBranchCase of medicationBranchCases) {
  const visible = visibleFieldIds(medicationBranchCase.input);
  for (const id of medicationBranchCase.visible) {
    assert(visible.includes(id), `${medicationBranchCase.id}: expected ${id} to be visible`);
  }
  for (const id of medicationBranchCase.hidden) {
    assert(!visible.includes(id), `${medicationBranchCase.id}: expected ${id} to be hidden`);
  }

  const payload = pruneHiddenAnswers(medicationBranchCase.input);
  const review = generatePhysicianReview(payload);
  const summary = generateSummary(payload);
  const medication = Object.fromEntries(review.medication.map((item) => [item.label, item.value]));
  assert.strictEqual(review.urgency.level, medicationBranchCase.level, `${medicationBranchCase.id}: urgency level mismatch`);
  assert.strictEqual(hasSafetyNotice(payload), false, `${medicationBranchCase.id}: safety notice mismatch`);
  assert.strictEqual(review.headline, medicationBranchCase.headline, `${medicationBranchCase.id}: headline mismatch`);
  assert(review.checkItems.includes(medicationBranchCase.checkItem), `${medicationBranchCase.id}: medication check item missing`);
  assert.deepStrictEqual(medication, medicationBranchCase.medication, `${medicationBranchCase.id}: medication snapshot mismatch`);
  for (const id of medicationBranchCase.hidden) {
    assert(!Object.prototype.hasOwnProperty.call(payload, id), `${medicationBranchCase.id}: hidden ${id} should be pruned`);
  }
  for (const text of forbidden) {
    assert(!summary.includes(text), `${medicationBranchCase.id}: forbidden output found ${text}`);
  }
}

const medicationMultiSelectCases = [
  {
    id: "MED-MULTI-DIFFICULTY-UNKNOWN-CLEARS-DETAILS",
    fieldId: "q13_med_difficulty_reason",
    current: ["味が苦手", "量が多い"],
    clicked: UNKNOWN,
    expected: [UNKNOWN],
  },
  {
    id: "MED-MULTI-DIFFICULTY-DETAIL-CLEARS-UNKNOWN",
    fieldId: "q13_med_difficulty_reason",
    current: [UNKNOWN],
    clicked: "子どもが嫌がる",
    expected: ["子どもが嫌がる"],
  },
  {
    id: "MED-MULTI-CHANGE-NOT-YET-CLEARS-CONCRETE",
    fieldId: "q14_change_after_less_med",
    current: ["硬くなった", "出る間隔があいた"],
    clicked: "まだわからない",
    expected: ["まだわからない"],
  },
  {
    id: "MED-MULTI-CHANGE-CONCRETE-CLEARS-UNCHANGED",
    fieldId: "q14_change_after_less_med",
    current: ["変わらない"],
    clicked: "痛がるようになった",
    expected: ["痛がるようになった"],
  },
];

for (const multiCase of medicationMultiSelectCases) {
  assert.deepStrictEqual(
    normalizeMultiSelection(multiCase.fieldId, multiCase.current, multiCase.clicked),
    multiCase.expected,
    `${multiCase.id}: normalized selection mismatch`
  );
}

const recurrenceCases = [
  {
    id: "RECURRENCE-SPECIFIC-CHANGES",
    input: {
      ...stableBase,
      q6_med_status: "今は中止している",
      q6_med_adherence_flags: [],
      q14_change_after_less_med: ["硬くなった", "出る間隔があいた", "痛がるようになった"],
    },
    headline: "便秘薬では中止中が確認されています。薬が少なめ・飲み忘れ・中止のあとに硬便化、排便間隔延長、排便時痛の変化があります。",
    checkItem: "薬が少なめ・飲み忘れ・中止のあとに硬便化、排便間隔延長、排便時痛の変化があります",
  },
  {
    id: "RECURRENCE-NOT-YET-KNOWN",
    input: {
      ...stableBase,
      q6_med_status: "ときどき忘れる",
      q6_med_adherence_flags: [],
      q14_change_after_less_med: ["まだわからない"],
    },
    headline: "便秘薬では飲み忘れが確認されています。",
    checkItem: "実際のお薬が少なめ、飲み忘れ、または中止中。以後の硬さ、間隔、痛みの変化を確認。",
  },
];

for (const recurrenceCase of recurrenceCases) {
  const review = generatePhysicianReview(pruneHiddenAnswers(recurrenceCase.input));
  assert.strictEqual(review.headline, recurrenceCase.headline, `${recurrenceCase.id}: headline mismatch`);
  assert(review.checkItems.includes(recurrenceCase.checkItem), `${recurrenceCase.id}: recurrence check item missing`);
}

const formerAlertCases = [
  {
    id: "ALERT-STRONG-ABDOMINAL-ONLY",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "強い",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    headline: "強い腹痛・お腹の張りがあります。4日以上の無排便または排便間隔のあきがあります。",
    checkItem: "強い腹痛・お腹の張りがあります。診察で確認します。",
  },
  {
    id: "ALERT-VOMITING-ONLY",
    input: {
      ...stableBase,
      q3_stool_consistency: "水のよう（下痢に近い）",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ある",
      q11_appetite_mood: "いつも通り",
    },
    headline: "嘔吐があります。水のような便があります。",
    checkItem: "嘔吐があります。診察で確認します。",
  },
  {
    id: "ALERT-APPETITE-AND-MOOD-ONLY",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "食欲も機嫌も気になる",
    },
    headline: "食欲と機嫌の変化があります。4日以上の無排便または排便間隔のあきがあります。",
    checkItem: "食欲と機嫌の変化があります。診察で確認します。",
  },
  {
    id: "ALERT-COMBINED-SAFETY",
    input: {
      ...stableBase,
      q3_stool_consistency: "水のよう（下痢に近い）",
      q9_abdominal_symptom: "強い",
      q10_vomiting: "ある",
      q11_appetite_mood: "食欲も機嫌も気になる",
    },
    headline: "強い腹痛・お腹の張りがあります。嘔吐があります。食欲と機嫌の変化があります。水のような便があります。",
    checkItem: "強い腹痛・お腹の張り、嘔吐、食欲と機嫌の変化があります。診察で確認します。",
  },
];

for (const formerAlertCase of formerAlertCases) {
  const payload = pruneHiddenAnswers(formerAlertCase.input);
  const review = generatePhysicianReview(payload);
  const summary = generateSummary(payload);
  assert.strictEqual(review.urgency.level, "watch", `${formerAlertCase.id}: urgency level mismatch`);
  assert.strictEqual(review.urgency.label, "診察で確認", `${formerAlertCase.id}: urgency label mismatch`);
  assert.strictEqual(hasSafetyNotice(payload), false, `${formerAlertCase.id}: safety notice mismatch`);
  assert.strictEqual(review.headline, formerAlertCase.headline, `${formerAlertCase.id}: headline mismatch`);
  assert(review.checkItems.includes(formerAlertCase.checkItem), `${formerAlertCase.id}: former alert check item missing`);
  for (const text of forbidden) {
    assert(!summary.includes(text), `${formerAlertCase.id}: forbidden output found ${text}`);
  }
}

const watchCases = [
  {
    id: "WATCH-FOUR-DAYS",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    headline: "4日以上の無排便または排便間隔のあきがあります。",
    checkItem: "4日以上うんちが出ていない、または4日以上あくことがあるため、お腹の張り・腹痛、嘔吐、食欲・機嫌を診察で確認。",
  },
  {
    id: "WATCH-WATERY-STOOL",
    input: {
      ...stableBase,
      q3_stool_consistency: "水のよう（下痢に近い）",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    headline: "水のような便があります。",
    checkItem: "水のような便あり。お腹の張り・腹痛、嘔吐、食欲・機嫌の変化をあわせて確認。",
  },
  {
    id: "WATCH-HARD-STOOL",
    input: {
      ...stableBase,
      q3_stool_consistency: "硬い",
      q7_blood: "ない",
      q8_soiling: "ない",
    },
    headline: "硬い便が確認されています。",
    checkItem: "硬い便があるため、出血や便が少しつく様子もあわせて確認。",
  },
  {
    id: "WATCH-STRONG-PAIN",
    input: {
      ...stableBase,
      q4_pain: "泣く、またはとても嫌がる",
      q7_blood: "ない",
      q8_soiling: "ない",
    },
    headline: "強い排便時痛が確認されています。",
    checkItem: "強い痛みがあるため、出血や便が少しつく様子もあわせて確認。",
  },
  {
    id: "WATCH-WITHHOLDING",
    input: {
      ...stableBase,
      q5_withholding: "強くある",
      q7_blood: "ない",
      q8_soiling: "ない",
    },
    headline: "がまん行動が確認されています。",
    checkItem: "がまんがあるため、出血や便が少しつく様子もあわせて確認。",
  },
  {
    id: "WATCH-APPETITE-ONLY",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "食欲が少ない",
    },
    headline: "4日以上の無排便または排便間隔のあきがあります。",
    checkItem: "食欲・機嫌の変化があります。",
  },
  {
    id: "WATCH-MED-LESS",
    input: {
      ...stableBase,
      q6_med_status: "調節してよいと言われたが、最近は少なめになっている",
      q6_med_adherence_flags: [],
      q14_change_after_less_med: ["まだわからない"],
    },
    headline: "便秘薬では最近少なめが確認されています。",
    checkItem: "実際のお薬が少なめ、飲み忘れ、または中止中。以後の硬さ、間隔、痛みの変化を確認。",
  },
  {
    id: "WATCH-MED-DIFFICULTY",
    input: {
      ...stableBase,
      q6_med_status: "飲みにくくて残る",
      q6_med_adherence_flags: [],
      q13_med_difficulty_reason: ["量が多い"],
    },
    headline: "便秘薬では飲みにくさが確認されています。",
    checkItem: "お薬が飲みにくい可能性あり。味、量、タイミング、子どもの拒否など具体的な理由を確認。",
  },
];

for (const watchCase of watchCases) {
  const payload = pruneHiddenAnswers(watchCase.input);
  const review = generatePhysicianReview(payload);
  const summary = generateSummary(payload);
  assert.strictEqual(review.urgency.level, "watch", `${watchCase.id}: urgency level mismatch`);
  assert.strictEqual(review.urgency.label, "診察で確認", `${watchCase.id}: urgency label mismatch`);
  assert.strictEqual(hasSafetyNotice(payload), false, `${watchCase.id}: safety notice mismatch`);
  assert.strictEqual(review.headline, watchCase.headline, `${watchCase.id}: headline mismatch`);
  assert(review.checkItems.includes(watchCase.checkItem), `${watchCase.id}: watch check item missing`);
  for (const text of forbidden) {
    assert(!summary.includes(text), `${watchCase.id}: forbidden output found ${text}`);
  }
}

const stableCases = [
  {
    id: "STABLE-BASE",
    input: stableBase,
    checkItem: "現時点で強く追加確認する項目はありません。",
    medication: {
      状況: "先生に言われた量で飲んでいる",
      補足: "なし",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "該当なし",
    },
  },
  {
    id: "STABLE-SOFT-STOOL-MILD-PAIN",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "2-3日前",
      q2_bowel_frequency: "2-3日に1回くらい",
      q3_stool_consistency: "やわらかい",
      q4_pain: "少し痛がる",
    },
    checkItem: "現時点で強く追加確認する項目はありません。",
    medication: {
      状況: "先生に言われた量で飲んでいる",
      補足: "なし",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "該当なし",
    },
  },
  {
    id: "STABLE-ADJUSTING-AS-DIRECTED",
    input: {
      ...stableBase,
      q6_med_status: "先生から調節してよいと言われていて、うんちの様子を見ながら調節している",
      q6_med_adherence_flags: [],
    },
    checkItem: "現時点で強く追加確認する項目はありません。",
    medication: {
      状況: "医師指示範囲内で自己調節",
      補足: "医師から調節可の説明あり",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "該当なし",
    },
  },
  {
    id: "STABLE-NO-MEDICINE",
    input: {
      ...stableBase,
      q6_med_status: "便秘のお薬は使っていない",
    },
    checkItem: "現時点で強く追加確認する項目はありません。",
    medication: {
      状況: "便秘薬なし",
      補足: "なし",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "該当なし",
    },
  },
  {
    id: "STABLE-MULTIPLE-UNKNOWN",
    input: {
      q1_last_bowel_movement: UNKNOWN,
      q2_bowel_frequency: UNKNOWN,
      q3_stool_consistency: UNKNOWN,
      q4_pain: UNKNOWN,
      q5_withholding: UNKNOWN,
      q6_med_status: UNKNOWN,
    },
    checkItem: "保護者がわからないと回答した項目が複数あります。診察で確認できる範囲を確認。",
    medication: {
      状況: UNKNOWN,
      補足: "不明",
      "少なめ/忘れ/中止後": "該当なし",
      飲みにくさ: "未確認",
    },
  },
];

for (const stableCase of stableCases) {
  const payload = pruneHiddenAnswers(stableCase.input);
  const review = generatePhysicianReview(payload);
  const summary = generateSummary(payload);
  const medication = Object.fromEntries(review.medication.map((item) => [item.label, item.value]));

  assert.strictEqual(review.urgency.level, "stable", `${stableCase.id}: urgency level mismatch`);
  assert.strictEqual(review.urgency.label, "通常確認", `${stableCase.id}: urgency label mismatch`);
  assert.strictEqual(review.urgency.message, "現時点で目立つ追加確認項目はありません。", `${stableCase.id}: urgency message mismatch`);
  assert.strictEqual(hasSafetyNotice(payload), false, `${stableCase.id}: safety notice mismatch`);
  assert.strictEqual(review.headline, "今回の回答では、目立つ追加確認項目はありません。", `${stableCase.id}: headline mismatch`);
  assert(review.checkItems.includes(stableCase.checkItem), `${stableCase.id}: stable check item missing`);
  assert(!review.checkItems.some((item) => item.includes("受付または医療スタッフ")), `${stableCase.id}: should not include staff share item`);
  assert.deepStrictEqual(medication, stableCase.medication, `${stableCase.id}: medication snapshot mismatch`);

  for (const text of forbidden) {
    assert(!summary.includes(text), `${stableCase.id}: forbidden output found ${text}`);
  }
}

const boundaryCases = [
  {
    id: "BOUNDARY-LAST-BOWEL-THREE-DAYS-STABLE",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "2-3日前",
      q2_bowel_frequency: "2-3日に1回くらい",
    },
    level: "stable",
    headline: "今回の回答では、目立つ追加確認項目はありません。",
    visible: [],
    hidden: ["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"],
    checkItem: "現時点で強く追加確認する項目はありません。",
  },
  {
    id: "BOUNDARY-LAST-BOWEL-FOUR-DAYS-WATCH",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q2_bowel_frequency: "2-3日に1回くらい",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    level: "watch",
    headline: "4日以上の無排便または排便間隔のあきがあります。",
    visible: ["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"],
    hidden: [],
    checkItem: "4日以上うんちが出ていない、または4日以上あくことがあるため、お腹の張り・腹痛、嘔吐、食欲・機嫌を診察で確認。",
  },
  {
    id: "BOUNDARY-FREQUENCY-THREE-DAYS-STABLE",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "2-3日に1回くらい",
    },
    level: "stable",
    headline: "今回の回答では、目立つ追加確認項目はありません。",
    visible: [],
    hidden: ["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"],
    checkItem: "現時点で強く追加確認する項目はありません。",
  },
  {
    id: "BOUNDARY-FREQUENCY-FOUR-DAYS-WATCH",
    input: {
      ...stableBase,
      q1_last_bowel_movement: "昨日",
      q2_bowel_frequency: "4日以上あくことがある",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    },
    level: "watch",
    headline: "4日以上の無排便または排便間隔のあきがあります。",
    visible: ["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"],
    hidden: [],
    checkItem: "4日以上うんちが出ていない、または4日以上あくことがあるため、お腹の張り・腹痛、嘔吐、食欲・機嫌を診察で確認。",
  },
];

for (const boundaryCase of boundaryCases) {
  const visible = visibleFieldIds(boundaryCase.input);
  for (const id of boundaryCase.visible) {
    assert(visible.includes(id), `${boundaryCase.id}: expected ${id} to be visible`);
  }
  for (const id of boundaryCase.hidden) {
    assert(!visible.includes(id), `${boundaryCase.id}: expected ${id} to be hidden`);
  }

  const payload = pruneHiddenAnswers(boundaryCase.input);
  const review = generatePhysicianReview(payload);
  const summary = generateSummary(payload);
  assert.strictEqual(review.urgency.level, boundaryCase.level, `${boundaryCase.id}: urgency level mismatch`);
  assert.strictEqual(hasSafetyNotice(payload), false, `${boundaryCase.id}: safety notice mismatch`);
  assert.strictEqual(review.headline, boundaryCase.headline, `${boundaryCase.id}: headline mismatch`);
  assert(review.checkItems.includes(boundaryCase.checkItem), `${boundaryCase.id}: boundary check item missing`);
  for (const text of forbidden) {
    assert(!summary.includes(text), `${boundaryCase.id}: forbidden output found ${text}`);
  }
}

const diaryCases = [
  {
    id: "DIARY-NORMALIZES-AND-MERGES",
    base: stableBase,
    diary: {
      diary_days_recorded: "7",
      diary_bowel_days: "5",
      diary_longest_no_bowel_days: "3",
      diary_hard_days: "2",
      diary_pain_days: "1",
      diary_med_taken_days: "7",
      diary_note: "園では出にくい",
    },
    expectedPayload: {
      diary_days_recorded: 7,
      diary_bowel_days: 5,
      diary_longest_no_bowel_days: 3,
      diary_hard_days: 2,
      diary_pain_days: 1,
      diary_med_taken_days: 7,
      diary_note: "園では出にくい",
    },
    diaryRows: 7,
    weeklySummary: ["7日間で排便あり5/7日", "最長無排便3日", "硬い便2日、痛み1日", "内服できた日7/7日"],
    checkItem: "直近日誌に硬い便2日、痛み1日があります。便の硬さ、痛み、がまんの流れを確認。",
    summaryIncludes: ["直近日誌:", "- 記録日数: 7日", "- 日誌メモ: 園では出にくい", "週次サマリー:", "- 7日間で排便あり5/7日"],
  },
  {
    id: "DIARY-FOUR-DAYS-NO-BOWEL",
    base: stableBase,
    diary: {
      diary_days_recorded: "7",
      diary_bowel_days: "3",
      diary_longest_no_bowel_days: "4",
      diary_hard_days: "0",
      diary_pain_days: "0",
      diary_med_taken_days: "5",
    },
    expectedPayload: {
      diary_days_recorded: 7,
      diary_bowel_days: 3,
      diary_longest_no_bowel_days: 4,
      diary_hard_days: 0,
      diary_pain_days: 0,
      diary_med_taken_days: 5,
    },
    diaryRows: 7,
    weeklySummary: ["7日間で排便あり3/7日", "最長無排便4日", "硬い便0日、痛み0日", "内服できた日5/7日"],
    checkItem: "直近日誌で最長4日の無排便があります。問診回答とあわせて診察で確認。",
    secondCheckItem: "直近日誌で内服できた日は5/7日です。飲めなかった理由を確認。",
    summaryIncludes: ["- 最長無排便: 4日", "- 内服できた日: 5日", "- 7日間で排便あり3/7日", "- 内服できた日5/7日"],
  },
  {
    id: "DIARY-BLANK-OMITS-SECTION",
    base: stableBase,
    diary: {
      diary_days_recorded: "",
      diary_note: "   ",
    },
    expectedPayload: {},
    diaryRows: 0,
    weeklySummary: [],
    checkItem: "現時点で強く追加確認する項目はありません。",
    summaryIncludes: ["直近日誌:\n- なし", "週次サマリー:\n- なし"],
  },
];

for (const diaryCase of diaryCases) {
  const payload = mergeDiaryAnswers(pruneHiddenAnswers(diaryCase.base), diaryCase.diary);
  const review = generatePhysicianReview(payload);
  const summary = generateSummary(payload);
  const diaryPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => key.startsWith("diary_")));

  assert.deepStrictEqual(normalizeDiaryAnswers(diaryCase.diary), diaryCase.expectedPayload, `${diaryCase.id}: normalized diary mismatch`);
  assert.deepStrictEqual(diaryPayload, diaryCase.expectedPayload, `${diaryCase.id}: merged diary payload mismatch`);
  assert.strictEqual(review.diary.length, diaryCase.diaryRows, `${diaryCase.id}: diary row count mismatch`);
  assert.deepStrictEqual(review.weeklySummary, diaryCase.weeklySummary, `${diaryCase.id}: review weekly summary mismatch`);
  assert.deepStrictEqual(weeklySummary(payload), diaryCase.weeklySummary, `${diaryCase.id}: weekly summary mismatch`);
  assert(review.checkItems.includes(diaryCase.checkItem), `${diaryCase.id}: diary check item missing`);
  if (diaryCase.secondCheckItem) {
    assert(review.checkItems.includes(diaryCase.secondCheckItem), `${diaryCase.id}: second diary check item missing`);
  }
  for (const text of diaryCase.summaryIncludes) {
    assert(summary.includes(text), `${diaryCase.id}: summary missing ${text}`);
  }
  for (const text of forbidden) {
    assert(!summary.includes(text), `${diaryCase.id}: forbidden output found ${text}`);
  }
}

const facilityShareCases = [
  {
    id: "FACILITY-SHARE-WATCH-WITH-DIARY",
    input: mergeDiaryAnswers(pruneHiddenAnswers({
      ...stableBase,
      q1_last_bowel_movement: "4日以上前",
      q9_abdominal_symptom: "ない",
      q10_vomiting: "ない",
      q11_appetite_mood: "いつも通り",
    }), {
      diary_days_recorded: "7",
      diary_bowel_days: "3",
      diary_longest_no_bowel_days: "4",
    }),
    includes: [
      "【院内共有用 便秘問診】",
      "確認区分: 診察で確認",
      "概要: 4日以上の無排便または排便間隔のあきがあります。",
      "診察で見るポイント:",
      "AIが判断していないこと:",
      "送信JSON:",
      "\"q1_last_bowel_movement\": \"4日以上前\"",
      "\"diary_longest_no_bowel_days\": 4",
    ],
  },
  {
    id: "FACILITY-SHARE-STABLE",
    input: pruneHiddenAnswers(stableBase),
    includes: [
      "確認区分: 通常確認",
      "概要: 今回の回答では、目立つ追加確認項目はありません。",
      "- 診断",
      "\"q6_med_status\": \"先生に言われた量で飲んでいる\"",
    ],
  },
];

for (const shareCase of facilityShareCases) {
  const share = generateFacilityShare(shareCase.input);
  for (const text of shareCase.includes) {
    assert(share.includes(text), `${shareCase.id}: facility share missing ${text}`);
  }
  for (const text of forbidden) {
    assert(!share.includes(text), `${shareCase.id}: forbidden output found ${text}`);
  }
}

const patientMemoCases = [
  {
    id: "PATIENT-MEMO-STABLE",
    input: pruneHiddenAnswers(stableBase),
    includes: [
      "【便秘メモ】",
      "今日のうんちの様子:",
      "- 最後のうんち: 今日",
      "- 今の飲み方: 先生に言われた量で飲んでいる",
      "お薬を続けるか、減らすか、やめるかは診察で相談します。",
      "このメモでは薬の量を決めません。",
    ],
  },
  {
    id: "PATIENT-MEMO-WITH-DIARY",
    input: mergeDiaryAnswers(pruneHiddenAnswers({
      ...stableBase,
      q6_med_status: "ときどき忘れる",
      q6_med_adherence_flags: [],
      q14_change_after_less_med: ["まだわからない"],
    }), {
      diary_days_recorded: "7",
      diary_bowel_days: "5",
      diary_longest_no_bowel_days: "3",
      diary_hard_days: "1",
      diary_pain_days: "0",
      diary_med_taken_days: "6",
    }),
    includes: [
      "最近の記録:",
      "- 7日間で排便あり5/7日",
      "- 内服できた日6/7日",
      "不安で自己判断しそうなときは、このメモと日誌を見て、相談したいことを整理します。",
    ],
  },
];

const patientMemoForbidden = [
  ...forbidden,
  "薬を増やしましょう",
  "薬を減らしましょう",
  "薬をやめましょう",
  "薬を再開しましょう",
  "便秘は治りました",
  "便秘は治っていません",
];

for (const memoCase of patientMemoCases) {
  const memo = generatePatientMemo(memoCase.input);
  for (const text of memoCase.includes) {
    assert(memo.includes(text), `${memoCase.id}: patient memo missing ${text}`);
  }
  for (const text of patientMemoForbidden) {
    assert(!memo.includes(text), `${memoCase.id}: forbidden output found ${text}`);
  }
}

const visitMetaCases = [
  {
    id: "VISIT-META-NORMALIZES-AND-GENERATES-ID",
    input: {
      patient_id: "1234567",
      visit_token: "ab-7 k2!",
      submitted_at: "2026-05-03T10:15:00+09:00",
    },
    expected: {
      patient_id: "12345",
      visit_token: "AB7K2",
      submitted_at: "2026-05-03T10:15:00+09:00",
      visit_id: "20260503-12345-AB7K2",
    },
  },
  {
    id: "VISIT-META-USES-EXPLICIT-VISIT-ID",
    input: {
      patient_id: "00987",
      visit_id: "visit 2026/05/03 #1",
      visit_token: "xy9",
      submitted_at: "2026-05-03T11:00:00+09:00",
    },
    expected: {
      patient_id: "00987",
      visit_token: "XY9",
      submitted_at: "2026-05-03T11:00:00+09:00",
      visit_id: "visit202605031",
    },
  },
  {
    id: "VISIT-META-OMITS-INCOMPLETE",
    input: {
      patient_id: "abc",
      visit_token: "---",
    },
    expected: {},
  },
  {
    id: "VISIT-META-OMITS-SHORT-ID",
    input: {
      patient_id: "1234",
      visit_token: "A7K2",
      submitted_at: "2026-05-03T10:15:00+09:00",
    },
    expected: {
      visit_token: "A7K2",
      submitted_at: "2026-05-03T10:15:00+09:00",
    },
  },
];

for (const visitMetaCase of visitMetaCases) {
  assert.deepStrictEqual(normalizeVisitMeta(visitMetaCase.input), visitMetaCase.expected, `${visitMetaCase.id}: visit meta mismatch`);
}

const visitPayload = mergeVisitMeta(pruneHiddenAnswers(stableBase), {
  patient_id: "54321",
  visit_token: "m1",
  submitted_at: "2026-05-03T12:00:00+09:00",
});
assert.strictEqual(visitPayload.patient_id, "54321", "VISIT-META-PAYLOAD: patient_id missing");
assert.strictEqual(visitPayload.visit_token, "M1", "VISIT-META-PAYLOAD: visit_token missing");
assert.strictEqual(visitPayload.visit_id, "20260503-54321-M1", "VISIT-META-PAYLOAD: visit_id mismatch");
assert(generateFacilityShare(visitPayload).includes('"patient_id": "54321"'), "VISIT-META-PAYLOAD: facility share should include patient_id");

const sheetsPayloadInput = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers({
  ...stableBase,
  q1_last_bowel_movement: "4日以上前",
  q3_stool_consistency: "硬い",
  q9_abdominal_symptom: "ない",
  q10_vomiting: "ない",
  q11_appetite_mood: "いつも通り",
  q7_blood: "紙に少しつく",
  q8_soiling: "ない",
}), {
  diary_days_recorded: "7",
  diary_bowel_days: "3",
  diary_longest_no_bowel_days: "4",
  diary_hard_days: "2",
  diary_pain_days: "1",
  diary_med_taken_days: "6",
}), {
  patient_id: "123456",
  visit_token: "a7-k2",
  submitted_at: "2026-05-03T10:15:00+09:00",
});
const sheetsPayload = generateSheetsVisitPayload(sheetsPayloadInput);
assert.strictEqual(sheetsPayload.patient_id, "12345", "SHEETS-PAYLOAD: patient_id mismatch");
assert.strictEqual(sheetsPayload.visit_token, "A7K2", "SHEETS-PAYLOAD: visit_token mismatch");
assert.strictEqual(sheetsPayload.visit_id, "20260503-12345-A7K2", "SHEETS-PAYLOAD: visit_id mismatch");
assert.strictEqual(sheetsPayload.outputs.urgency_level, "watch", "SHEETS-PAYLOAD: urgency level mismatch");
assert.strictEqual(sheetsPayload.outputs.urgency_label, "診察で確認", "SHEETS-PAYLOAD: urgency label mismatch");
assert(sheetsPayload.outputs.headline.includes("4日以上"), "SHEETS-PAYLOAD: headline missing");
assert(sheetsPayload.outputs.summary_text.includes("【診察前 便秘ミニサマリー】"), "SHEETS-PAYLOAD: summary missing");
assert(sheetsPayload.outputs.facility_share_text.includes("【院内共有用 便秘問診】"), "SHEETS-PAYLOAD: facility share missing");
assert(sheetsPayload.outputs.patient_memo_text.includes("【便秘メモ】"), "SHEETS-PAYLOAD: patient memo missing");
assert.deepStrictEqual(Object.keys(sheetsPayload.diary).sort(), [
  "diary_bowel_days",
  "diary_days_recorded",
  "diary_hard_days",
  "diary_longest_no_bowel_days",
  "diary_med_taken_days",
  "diary_pain_days",
].sort(), "SHEETS-PAYLOAD: diary keys mismatch");
assert(!Object.prototype.hasOwnProperty.call(sheetsPayload.questionnaire, "diary_days_recorded"), "SHEETS-PAYLOAD: questionnaire should not contain diary fields");
assert(!Object.prototype.hasOwnProperty.call(sheetsPayload.diary, "q1_last_bowel_movement"), "SHEETS-PAYLOAD: diary should not contain questionnaire fields");
for (const text of patientMemoForbidden) {
  assert(!JSON.stringify(sheetsPayload).includes(text), `SHEETS-PAYLOAD: forbidden output found ${text}`);
}

const shortQrInput = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers({
  ...stableBase,
  q1_last_bowel_movement: "4日以上前",
  q2_bowel_frequency: "4日以上あくことがある",
  q3_stool_consistency: "硬い",
  q4_pain: "強く痛がる",
  q5_withholding: "ある",
  q6_med_status: "飲みにくくて残る",
  q6_med_adherence_flags: ["飲みにくくて残る"],
  q9_abdominal_symptom: "少しある",
  q10_vomiting: "ない",
  q11_appetite_mood: "いつも通り",
  q7_blood: "紙に少しつく",
  q8_soiling: "ときどきある",
  q13_med_difficulty_reason: ["味が苦手", "量が多い"],
}), {
  diary_days_recorded: "7",
  diary_bowel_days: "3",
  diary_longest_no_bowel_days: "4",
  diary_hard_days: "2",
  diary_pain_days: "1",
  diary_med_taken_days: "6",
  diary_note: "QRには含めない",
}), {
  patient_id: "12345",
  visit_token: "qr-9",
});
const shortQrPayload = generateShortQrPayload(shortQrInput);
assert(shortQrPayload.startsWith("v1|pid=12345|tok=QR9"), "SHORT-QR: prefix/meta mismatch");
assert(shortQrPayload.includes("q1=3"), "SHORT-QR: q1 code mismatch");
assert(shortQrPayload.includes("q13=0.1"), "SHORT-QR: multi code mismatch");
assert(shortQrPayload.includes("d=7,3,4,2,1,6"), "SHORT-QR: diary code mismatch");
assert(!shortQrPayload.includes("QRには含めない"), "SHORT-QR: should not include long diary note");
assert(shortQrPayload.length < 180, "SHORT-QR: payload should stay compact");
const decodedShortQr = decodeShortQrPayload(shortQrPayload);
assert.strictEqual(decodedShortQr.patient_id, "12345", "SHORT-QR: decoded patient_id mismatch");
assert.strictEqual(decodedShortQr.visit_token, "QR9", "SHORT-QR: decoded visit_token mismatch");
assert.strictEqual(decodedShortQr.q1_last_bowel_movement, "4日以上前", "SHORT-QR: decoded q1 mismatch");
assert.deepStrictEqual(decodedShortQr.q13_med_difficulty_reason, ["味が苦手", "量が多い"], "SHORT-QR: decoded multi mismatch");
assert.strictEqual(decodedShortQr.diary_longest_no_bowel_days, 4, "SHORT-QR: decoded diary mismatch");
assert(!Object.prototype.hasOwnProperty.call(decodedShortQr, "diary_note"), "SHORT-QR: decoded payload should not include diary note");

console.log(
  `${cases.length} MVP questionnaire cases, ${urgencyCases.length} urgency cases, ${medicationCases.length} medication cases, ${medicationBranchCases.length} medication branch cases, ${medicationMultiSelectCases.length} medication multi-select cases, ${recurrenceCases.length} recurrence cases, ${formerAlertCases.length} former alert-now-watch cases, ${watchCases.length} watch cases, ${stableCases.length} stable cases, ${boundaryCases.length} boundary cases, ${diaryCases.length} diary cases, ${facilityShareCases.length} facility share cases, ${patientMemoCases.length} patient memo cases, and ${visitMetaCases.length} visit meta cases plus 1 sheets payload case and 1 short QR case passed`
);
