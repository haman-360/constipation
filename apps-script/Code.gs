const SPREADSHEET_ID = "";

const SHEET_NAMES = {
  patients: "patients",
  visits: "visits",
  prescriptions: "prescriptions",
  toiletTraining: "toilet_training",
  diaryWeekly: "diary_weekly",
};

const PATIENTS_HEADERS = [
  "patient_id",
  "age_years",
  "age_months",
  "created_at",
  "note",
  "birth_date",
];

const VISITS_HEADERS = [
  "visit_id",
  "patient_id",
  "visit_token",
  "submitted_at",
  "saved_at",
  "urgency_level",
  "urgency_label",
  "headline",
  "questionnaire_json",
  "diary_json",
  "summary_text",
  "facility_share_text",
  "patient_memo_text",
  "reviewed_by_doctor",
  "doctor_note",
  "age_profile",
  "age_text_at_visit",
  "questionnaire_version",
];

const PRESCRIPTIONS_HEADERS = [
  "prescription_id",
  "patient_id",
  "date",
  "medicine_name",
  "dose",
  "instruction",
  "doctor_note",
];

const TOILET_TRAINING_HEADERS = [
  "patient_id",
  "date",
  "training_status",
  "diaper_status",
  "toilet_refusal",
  "note",
];

const DIARY_WEEKLY_HEADERS = [
  "patient_id",
  "period_start",
  "period_end",
  "recorded_days",
  "bowel_days",
  "longest_no_bowel_days",
  "hard_days",
  "pain_days",
  "withholding_days",
  "soiling_days",
  "med_taken_days",
  "note",
];

const HISTORY_LABELS = {
  date: "日時",
  medicine_name: "薬剤名",
  dose: "量",
  instruction: "指示内容",
  doctor_note: "医師メモ",
  training_status: "トレーニング状況",
  diaper_status: "おむつ・パンツ",
  toilet_refusal: "トイレ拒否",
  note: "メモ",
  period_start: "開始日",
  period_end: "終了日",
  recorded_days: "記録日数",
  bowel_days: "排便あり",
  longest_no_bowel_days: "最長無排便",
  hard_days: "硬い便",
  pain_days: "痛みの日",
  withholding_days: "がまんの日",
  soiling_days: "便もれ",
  med_taken_days: "内服できた日",
  age_profile: "年齢プロファイル",
  age_text_at_visit: "受診時年齢",
  questionnaire_version: "質問セット",
};

const SHEET_DEFINITIONS = [
  { name: SHEET_NAMES.patients, headers: PATIENTS_HEADERS, widths: [110, 90, 105, 160, 260, 120], plainTextHeaders: ["patient_id"], dateHeaders: ["birth_date"] },
  {
    name: SHEET_NAMES.visits,
    headers: VISITS_HEADERS,
    widths: [170, 95, 95, 175, 175, 105, 120, 300, 260, 180, 420, 420, 360, 130, 260, 120, 130, 170],
    hiddenHeaders: ["questionnaire_json", "diary_json"],
    plainTextHeaders: ["visit_id", "patient_id", "visit_token"],
  },
  { name: SHEET_NAMES.prescriptions, headers: PRESCRIPTIONS_HEADERS, widths: [150, 95, 170, 160, 140, 260, 260], plainTextHeaders: ["prescription_id", "patient_id"], dateTimeHeaders: ["date"] },
  { name: SHEET_NAMES.toiletTraining, headers: TOILET_TRAINING_HEADERS, widths: [95, 170, 150, 140, 140, 260], plainTextHeaders: ["patient_id"], dateTimeHeaders: ["date"] },
  { name: SHEET_NAMES.diaryWeekly, headers: DIARY_WEEKLY_HEADERS, widths: [95, 120, 120, 110, 110, 160, 100, 100, 125, 125, 130, 260], plainTextHeaders: ["patient_id"] },
];


function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "patientHistory";
    if (action === "patientHistory") {
      return jsonResponse_(getPatientHistory(e.parameter || {}));
    }
    if (action === "chatGPTContext") {
      return textResponse_(generateChatGPTContext(e.parameter || {}));
    }
    if (action === "doctorHistory") {
      return htmlResponse_(generateDoctorHistoryHtml(e.parameter || {}));
    }
    if (action === "doctorEntry") {
      return htmlResponse_(generateDoctorEntryHtml(e.parameter || {}));
    }
    if (action === "patientProfile") {
      return htmlResponse_(generatePatientProfileHtml(e.parameter || {}));
    }
    throw new Error(`Unsupported action: ${action}`);
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error.message || error) }, 400);
  }
}

function doPost(e) {
  const params = (e && e.parameter) || {};
  try {
    if (params.action === "savePrescription") {
      savePrescription_(params);
      return redirectResponse_(buildSelfUrl_("doctorEntry", requirePatientId_(params.patient_id), 5, { message: "処方履歴を保存しました。" }));
    }
    if (params.action === "saveToiletTraining") {
      saveToiletTraining_(params);
      return redirectResponse_(buildSelfUrl_("doctorEntry", requirePatientId_(params.patient_id), 5, { message: "トイレトレーニング履歴を保存しました。" }));
    }
    if (params.action === "saveDoctorEntries") {
      const saved = saveDoctorEntries_(params);
      return redirectResponse_(buildSelfUrl_("doctorEntry", requirePatientId_(params.patient_id), 5, { message: saved.join("、") + "を保存しました。" }));
    }
    if (params.action === "savePatientProfile") {
      savePatientProfile_(params);
      return redirectResponse_(buildSelfUrl_("patientProfile", requirePatientId_(params.patient_id), 5, { message: "患者台帳を保存しました。" }));
    }
    const payload = parseJsonBody_(e);
    const result = submitVisit(payload);
    return jsonResponse_(result);
  } catch (error) {
    if (params.action && params.patient_id) {
      const patientId = normalizePatientId_(params.patient_id);
      if (patientId.length === 5) {
        if (params.action === "savePatientProfile") {
          return redirectResponse_(buildSelfUrl_("patientProfile", patientId, 5, { message: `保存できませんでした: ${String(error.message || error)}` }));
        }
        return redirectResponse_(buildSelfUrl_("doctorEntry", patientId, 5, { message: `保存できませんでした: ${String(error.message || error)}` }));
      }
    }
    return jsonResponse_({ ok: false, error: String(error.message || error) }, 400);
  }
}

function submitVisit(payload) {
  validateSubmitVisitPayload_(payload);
  const patientId = requirePatientId_(payload.patient_id);
  const sheet = getOrCreateSheet_(SHEET_NAMES.visits, VISITS_HEADERS);
  const savedAt = dateTimeInScriptTimezone_(new Date());
  const submittedAt = dateTimeInScriptTimezone_(payload.submitted_at || savedAt);
  const visitId = visitIdInScriptTimezone_(payload.visit_id, submittedAt, patientId, payload.visit_token);
  const outputs = payload.outputs || {};

  const patientSaved = upsertPatient_(patientId, savedAt, payload.age_years, payload.age_months);
  const patient = getPatient_(patientId);
  const ageProfile = patientAgeProfile_(patient, submittedAt);
  const ageTextAtVisit = patientAgeText_(patient, submittedAt);
  const questionnaireVersion = "toddler-mvp-v1";
  sheet.appendRow([
    visitId,
    patientId,
    payload.visit_token || "",
    submittedAt,
    savedAt,
    outputs.urgency_level || "",
    outputs.urgency_label || "",
    outputs.headline || "",
    JSON.stringify(payload.questionnaire || {}),
    JSON.stringify(payload.diary || {}),
    outputs.summary_text || "",
    outputs.facility_share_text || "",
    outputs.patient_memo_text || "",
    false,
    "",
    ageProfile,
    ageTextAtVisit,
    questionnaireVersion,
  ]);
  const row = sheet.getLastRow();
  sheet.getRange(row, 1, 1, 3)
    .setNumberFormat("@")
    .setValues([[visitId, patientId, payload.visit_token || ""]]);
  const diaryWeeklySaved = appendDiaryWeeklyIfPresent_(payload, patientId, savedAt);

  return {
    ok: true,
    visit_id: visitId,
    patient_id: patientId,
    saved_at: savedAt,
    patient_saved: patientSaved,
    diary_weekly_saved: diaryWeeklySaved,
  };
}

function savePrescription_(params) {
  const patientId = requirePatientId_(params.patient_id);
  const savedAt = new Date().toISOString();
  const date = dateTimeInScriptTimezone_(params.prescription_date || params.date || savedAt);
  const medicineName = String(params.medicine_name || "").trim();
  if (!medicineName) throw new Error("薬剤名を入力してください。");
  upsertPatient_(patientId, savedAt);
  const sheet = getOrCreateSheet_(SHEET_NAMES.prescriptions, PRESCRIPTIONS_HEADERS);
  sheet.appendRow([
    params.prescription_id || generateRowId_("RX", patientId, date),
    patientId,
    date,
    medicineName,
    String(params.dose || "").trim(),
    String(params.instruction || "").trim(),
    String(params.doctor_note || "").trim(),
  ]);
}

function saveToiletTraining_(params) {
  const patientId = requirePatientId_(params.patient_id);
  const savedAt = new Date().toISOString();
  const date = dateTimeInScriptTimezone_(params.training_date || params.date || savedAt);
  if (!hasToiletTrainingInput_(params)) throw new Error("トイレトレーニング履歴の内容を入力してください。");
  upsertPatient_(patientId, savedAt);
  const sheet = getOrCreateSheet_(SHEET_NAMES.toiletTraining, TOILET_TRAINING_HEADERS);
  sheet.appendRow([
    patientId,
    date,
    String(params.training_status || "").trim(),
    String(params.diaper_status || "").trim(),
    String(params.toilet_refusal || "").trim(),
    String(params.note || "").trim(),
  ]);
}

function saveDoctorEntries_(params) {
  const saved = [];
  if (hasPrescriptionInput_(params)) {
    savePrescription_(params);
    saved.push("処方履歴");
  }
  if (hasToiletTrainingInput_(params)) {
    saveToiletTraining_(params);
    saved.push("トイレトレーニング履歴");
  }
  if (!saved.length) throw new Error("保存する処方履歴またはトイレトレーニング履歴を入力してください。");
  return saved;
}

function savePrescriptionFromDoctorForm(formObject) {
  savePrescription_(formObject || {});
  return { ok: true, message: "処方履歴を保存しました。", saved_sections: ["prescription"] };
}

function saveToiletTrainingFromDoctorForm(formObject) {
  saveToiletTraining_(formObject || {});
  return { ok: true, message: "トイレトレーニング履歴を保存しました。", saved_sections: ["toiletTraining"] };
}

function saveDoctorEntriesFromDoctorForm(formObject) {
  const params = formObject || {};
  const savedSections = [];
  if (hasPrescriptionInput_(params)) savedSections.push("prescription");
  if (hasToiletTrainingInput_(params)) savedSections.push("toiletTraining");
  const saved = saveDoctorEntries_(params);
  return { ok: true, message: `${saved.join("、")}を保存しました。`, saved_sections: savedSections };
}

function savePatientProfile_(params) {
  const patientId = requirePatientId_(params.patient_id);
  const savedAt = new Date().toISOString();
  const birthDate = normalizeBirthDate_(params.birth_date);
  const note = String(params.patient_note || "").trim();
  const sheet = getOrCreateSheet_(SHEET_NAMES.patients, PATIENTS_HEADERS);
  const existingRow = findPatientRow_(sheet, patientId);

  if (existingRow) {
    sheet.getRange(existingRow, 1).setNumberFormat("@").setValue(patientId);
    sheet.getRange(existingRow, 5).setValue(note);
    sheet.getRange(existingRow, 6).setNumberFormat("yyyy-mm-dd").setValue(birthDate);
    return { ok: true, created: false };
  }

  sheet.appendRow([
    patientId,
    "",
    "",
    savedAt,
    note,
    birthDate,
  ]);
  const row = sheet.getLastRow();
  sheet.getRange(row, 1).setNumberFormat("@").setValue(patientId);
  sheet.getRange(row, 6).setNumberFormat("yyyy-mm-dd").setValue(birthDate);
  return { ok: true, created: true };
}

function savePatientProfileFromForm(formObject) {
  savePatientProfile_(formObject || {});
  return { ok: true, message: "患者台帳を保存しました。" };
}

function hasPrescriptionInput_(params) {
  return ["medicine_name", "dose", "instruction", "doctor_note"].some((key) => String(params[key] || "").trim());
}

function hasToiletTrainingInput_(params) {
  return ["training_status", "diaper_status", "toilet_refusal", "note"].some((key) => String(params[key] || "").trim());
}

function upsertPatient_(patientId, createdAt, ageYears, ageMonths) {
  const sheet = getOrCreateSheet_(SHEET_NAMES.patients, PATIENTS_HEADERS);
  const existingRow = findPatientRow_(sheet, patientId);
  if (existingRow) {
    sheet.getRange(existingRow, 1).setNumberFormat("@").setValue(patientId);
    updatePatientAgeIfPresent_(sheet, existingRow, ageYears, ageMonths);
    return false;
  }
  sheet.appendRow([
    patientId,
    ageOrBlank_(ageYears, 18),
    ageOrBlank_(ageMonths, 11),
    createdAt,
    "",
    "",
  ]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat("@").setValue(patientId);
  return true;
}

function findPatientRow_(sheet, patientId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (let index = 0; index < values.length; index += 1) {
    if (patientIdKey_(values[index][0]) === patientId) return index + 2;
  }
  return 0;
}

function updatePatientAgeIfPresent_(sheet, row, ageYears, ageMonths) {
  const years = ageOrBlank_(ageYears, 18);
  const months = ageOrBlank_(ageMonths, 11);
  if (years !== "") sheet.getRange(row, 2).setValue(years);
  if (months !== "") sheet.getRange(row, 3).setValue(months);
}

function ageOrBlank_(value, max) {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number.parseInt(String(value), 10);
  if (!Number.isFinite(number) || number < 0 || number > max) return "";
  return number;
}

function appendDiaryWeeklyIfPresent_(payload, patientId, savedAt) {
  const diary = payload.diary || {};
  if (!hasDiaryData_(diary)) return false;

  const recordedDays = numberOrBlank_(diary.diary_days_recorded);
  const periodEnd = dateOnlyInScriptTimezone_(payload.submitted_at || savedAt);
  const periodStart = recordedDays ? addDays_(periodEnd, -(recordedDays - 1)) : "";
  const sheet = getOrCreateSheet_(SHEET_NAMES.diaryWeekly, DIARY_WEEKLY_HEADERS);

  sheet.appendRow([
    patientId,
    periodStart,
    periodEnd,
    recordedDays,
    numberOrBlank_(diary.diary_bowel_days),
    numberOrBlank_(diary.diary_longest_no_bowel_days),
    numberOrBlank_(diary.diary_hard_days),
    numberOrBlank_(diary.diary_pain_days),
    "",
    "",
    numberOrBlank_(diary.diary_med_taken_days),
    diary.diary_note || "",
  ]);
  return true;
}

function hasDiaryData_(diary) {
  return Object.keys(diary).some((key) => key.startsWith("diary_") && diary[key] !== undefined && diary[key] !== "");
}

function numberOrBlank_(value) {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function dateOnlyInScriptTimezone_(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  try {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
  } catch (error) {
    return date.toISOString().slice(0, 10);
  }
}

function dateTimeInScriptTimezone_(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(text)) {
    const compact = text.slice(0, 19).replace("T", " ");
    return compact.length === 16 ? `${compact}:00` : compact;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text} 00:00:00`;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  try {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  } catch (error) {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }
}

function visitIdInScriptTimezone_(visitId, submittedAt, patientId, visitToken) {
  const token = String(visitToken || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 12)
    .toUpperCase();
  const datePart = String(submittedAt || "").slice(0, 10).replace(/\D/g, "");
  if (datePart && patientId && token) return `${datePart}-${patientId}-${token}`;
  return String(visitId || "")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 40);
}

function dateTimeInputValue_(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  try {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    return date.toISOString().slice(0, 16);
  }
}

function dateInputValue_(value) {
  const date = parseDateOnly_(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeBirthDate_(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("生年月日は yyyy-mm-dd 形式で入力してください。");
  const date = parseDateOnly_(text);
  if (!date || date.toISOString().slice(0, 10) !== text) throw new Error("生年月日の日付を確認してください。");
  const today = parseDateOnly_(new Date());
  if (today && date > today) throw new Error("生年月日は未来の日付にできません。");
  return text;
}

function addDays_(dateText, days) {
  if (!dateText) return "";
  const date = new Date(`${dateText}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}


function getPatientHistory(params) {
  const patientId = normalizePatientId_(params.patient_id || params.pid);
  const limit = normalizeLimit_(params.limit, 5);
  if (!patientId) throw new Error("patient_id is required.");

  const history = {
    ok: true,
    patient_id: patientId,
    visits: latestByDate_(rowsForPatient_(SHEET_NAMES.visits, VISITS_HEADERS, patientId).map(parseVisitRow_), limit, "submitted_at"),
    prescriptions: latestByDate_(rowsForPatient_(SHEET_NAMES.prescriptions, PRESCRIPTIONS_HEADERS, patientId), limit, "date"),
    toilet_training: latestByDate_(rowsForPatient_(SHEET_NAMES.toiletTraining, TOILET_TRAINING_HEADERS, patientId), limit, "date"),
    diary_weekly: latestByDate_(rowsForPatient_(SHEET_NAMES.diaryWeekly, DIARY_WEEKLY_HEADERS, patientId), limit, "period_end"),
  };
  history.patient = getPatient_(patientId);
  const ageReferenceDate = history.visits[0] && (history.visits[0].submitted_at || history.visits[0].saved_at);
  history.age_text = patientAgeText_(history.patient, ageReferenceDate);
  history.age_profile = patientAgeProfile_(history.patient, ageReferenceDate);
  history.age_profile_label = ageProfileLabel_(history.age_profile);
  return history;
}


function generateChatGPTContext(params) {
  const history = getPatientHistory(params);
  const mode = normalizeChatGPTMode_(params.mode);
  if (mode === "treatmentReview") return generateTreatmentReviewContext_(history);
  return generatePreVisitContext_(history);
}

function normalizeChatGPTMode_(mode) {
  const value = String(mode || "").trim();
  if (value === "treatmentReview" || value === "treatment" || value === "doctorTreatment") return "treatmentReview";
  return "preVisit";
}

function generateHistoryContextSections_(history) {
  return [
    "",
    `患者ID: ${history.patient_id}`,
    `年齢: ${history.age_text}`,
    `年齢プロファイル: ${history.age_profile}（${history.age_profile_label}）`,
    `対象履歴: 受診${history.visits.length}件 / 処方${history.prescriptions.length}件 / トイレトレーニング${history.toilet_training.length}件 / 日誌${history.diary_weekly.length}件`,
    "",
    "【受診・問診履歴】",
    ...formatVisitsForContext_(history.visits),
    "",
    "【処方履歴】",
    ...formatSimpleRowsForContext_(history.prescriptions, ["date", "medicine_name", "dose", "instruction", "doctor_note"], HISTORY_LABELS),
    "",
    "【トイレトレーニング履歴】",
    ...formatSimpleRowsForContext_(history.toilet_training, ["date", "training_status", "diaper_status", "toilet_refusal", "note"], HISTORY_LABELS),
    "",
    "【週次日誌】",
    ...formatSimpleRowsForContext_(history.diary_weekly, ["period_start", "period_end", "recorded_days", "bowel_days", "longest_no_bowel_days", "hard_days", "pain_days", "withholding_days", "soiling_days", "med_taken_days", "note"], HISTORY_LABELS),
  ];
}

function generatePreVisitContext_(history) {
  const lines = [
    "【診察前整理モード】",
    "これは医師が診察前に確認するための便秘経過サマリーです。",
    "診断、処方量変更、治療中止、専門紹介の判断は行わないでください。",
    "薬を増やす、減らす、やめる、再開するなどの指示は出さないでください。",
    "過去経過から、医師が確認すべき変化点、追加で聞くべきこと、注意して見るべき矛盾点だけを整理してください。",
    ...ageProfileContextLines_(history, "preVisit"),
    ...generateHistoryContextSections_(history),
    "",
    "【医師に整理してほしい観点】",
    "- 前回から改善した点",
    "- 前回から悪化した点",
    "- 薬の飲み忘れ、少なめ、中止、飲みにくさと便性状の関係",
    "- トイレトレーニング状況と痛み・がまんの関係",
    "- 医師が確認すべき追加質問",
    "- 矛盾または不足している情報",
  ];
  return lines.join("\n");
}

function generateTreatmentReviewContext_(history) {
  const lines = [
    "【医師向け治療方針検討モード】",
    "あなたは小児便秘診療の医師向け意思決定支援として回答してください。",
    "診断や処方の最終決定は医師が行います。患者・保護者へ直接指示する文体ではなく、医師が診察で検討・説明するための材料として書いてください。",
    "最新の小児便秘診療ガイドラインや一般的な診療原則と矛盾しにくい方針候補を整理してください。",
    "外部Web検索やURL引用は不要です。提示された経過、医師入力、日誌、一般的診療原則に基づいて整理してください。",
    "薬を急にやめることを急がせず、悪化時の確認点、戻し方の考え方、再診間隔も含めて検討してください。",
    "不確実な点や追加確認が必要な点は、推測で埋めずに明示してください。",
    "長期安定例では、段階的減量を独立した方針候補として必ず評価してください。同量継続は保護者不安への短期的な橋渡しとして扱い、漫然継続や長すぎる再診間隔とは分けて整理してください。",
    "",
    "【出力形式】",
    "1. 現在の状態評価",
    "2. 方針候補と推奨度（推奨 / 検討可 / 慎重 / 避けたい）",
    "3. 各方針の理由",
    "4. 避けたい方針とその理由",
    "5. 次回再診間隔の考え方",
    "6. 追加で確認すべき情報",
    "7. 保護者が不安な場合の中立的な説明文案",
    "",
    "【注意】",
    "- 最終的な処方量、減量、中止、再開、治療終了、専門紹介は医師が決定します。",
    "- 患者・保護者向けの断定的な指示は出さないでください。",
    "- 具体的な処方量変更の数値指示は出さず、方針候補として段階的減量、同量短期継続、再評価などを整理してください。",
    "- 長期安定、漫然継続、急な中止、長すぎる再診間隔については、利益とリスクを分けて整理してください。",
    ...ageProfileContextLines_(history, "treatmentReview"),
    ...generateHistoryContextSections_(history),
  ];
  return lines.join("\n");
}

function generateDoctorHistoryHtml(params) {
  const history = getPatientHistory(params);
  const preVisitContextUrl = buildSelfUrl_("chatGPTContext", history.patient_id, normalizeLimit_(params.limit, 5), { mode: "preVisit" });
  const treatmentContextUrl = buildSelfUrl_("chatGPTContext", history.patient_id, normalizeLimit_(params.limit, 5), { mode: "treatmentReview" });
  const entryUrl = buildSelfUrl_("doctorEntry", history.patient_id, normalizeLimit_(params.limit, 5));
  const profileUrl = buildSelfUrl_("patientProfile", history.patient_id, normalizeLimit_(params.limit, 5));
  const preVisitContextText = generateChatGPTContext({ ...params, mode: "preVisit" });
  const treatmentContextText = generateChatGPTContext({ ...params, mode: "treatmentReview" });
  const preVisitItems = formatPreVisitItemsHtml_(history);
  const visitItems = history.visits.length
    ? history.visits.map(formatVisitHtml_).join("")
    : "<p>受診・問診履歴はありません。</p>";
  return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>便秘履歴 ${escapeHtml_(history.patient_id)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f4f7f9; color: #20242a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { width: min(960px, calc(100% - 32px)); margin: 28px auto; }
      h1 { margin: 0 0 8px; font-size: 1.7rem; }
      h2 { margin: 0 0 12px; font-size: 1.1rem; }
      p { line-height: 1.7; }
      .panel { margin-top: 16px; padding: 18px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fff; }
      .meta { color: #5d6673; }
      .visit { border-top: 1px solid #d9e0e8; padding-top: 14px; margin-top: 14px; }
      .visit:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
      .headline { font-weight: 800; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .item { padding: 10px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fbfdfe; }
      .label { display: block; color: #5d6673; font-size: .86rem; }
      .summary-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
      .summary-list li { padding: 12px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fbfdfe; line-height: 1.65; }
      .summary-list strong { display: block; margin-bottom: 4px; }
      details { margin-top: 16px; }
      summary { color: #07576b; cursor: pointer; font-weight: 800; }
      .copy-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 12px 0; }
      button { min-height: 40px; padding: 8px 14px; border: 0; border-radius: 8px; background: #0b6f85; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
      .copy-status { color: #5d6673; }
      pre { overflow: auto; white-space: pre-wrap; line-height: 1.55; padding: 14px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fbfdfe; }
      a { color: #07576b; font-weight: 800; }
      @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
      @media print { body { background: #fff; } main { width: 100%; margin: 0; } .panel { border: 0; } }
    </style>
  </head>
  <body>
    <main>
      <h1>便秘履歴</h1>
      <p class="meta">患者ID: ${escapeHtml_(history.patient_id)} / 年齢: ${escapeHtml_(history.age_text)} / 年齢プロファイル: ${escapeHtml_(history.age_profile_label)} / 受診${history.visits.length}件 / 処方${history.prescriptions.length}件 / トイレトレーニング${history.toilet_training.length}件 / 日誌${history.diary_weekly.length}件</p>
      <p><a href="${escapeHtml_(entryUrl)}">医師入力を開く</a> / <a href="${escapeHtml_(profileUrl)}">患者台帳を開く</a> / <a href="${escapeHtml_(preVisitContextUrl)}" target="_blank" rel="noreferrer">ChatGPT診察前整理を開く</a> / <a href="${escapeHtml_(treatmentContextUrl)}" target="_blank" rel="noreferrer">ChatGPT治療方針検討を開く</a></p>
      <details>
        <summary>ChatGPT診察前整理テキストをページ内で表示</summary>
        <div class="copy-row">
          <button type="button" data-copy-target="preVisitContextText" data-copy-status="preVisitContextStatus">診察前整理テキストをコピー</button>
          <span id="preVisitContextStatus" class="copy-status"></span>
        </div>
        <pre id="preVisitContextText">${escapeHtml_(preVisitContextText)}</pre>
      </details>
      <details>
        <summary>ChatGPT治療方針検討テキストをページ内で表示</summary>
        <div class="copy-row">
          <button type="button" data-copy-target="treatmentContextText" data-copy-status="treatmentContextStatus">治療方針検討テキストをコピー</button>
          <span id="treatmentContextStatus" class="copy-status"></span>
        </div>
        <pre id="treatmentContextText">${escapeHtml_(treatmentContextText)}</pre>
      </details>
      <section class="panel">
        <h2>診察前の確認</h2>
        <ul class="summary-list">
          ${preVisitItems}
        </ul>
      </section>
      <section class="panel">
        <h2>受診・問診履歴</h2>
        ${visitItems}
      </section>
      <section class="panel">
        <h2>処方履歴</h2>
        ${formatSimpleRowsHtml_(history.prescriptions, ["date", "medicine_name", "dose", "instruction", "doctor_note"], HISTORY_LABELS)}
      </section>
      <section class="panel">
        <h2>トイレトレーニング履歴</h2>
        ${formatSimpleRowsHtml_(history.toilet_training, ["date", "training_status", "diaper_status", "toilet_refusal", "note"], HISTORY_LABELS)}
      </section>
      <section class="panel">
        <h2>週次日誌</h2>
        ${formatSimpleRowsHtml_(history.diary_weekly, ["period_start", "period_end", "recorded_days", "bowel_days", "longest_no_bowel_days", "hard_days", "pain_days", "withholding_days", "soiling_days", "med_taken_days", "note"], HISTORY_LABELS)}
      </section>
    </main>
    <script>
      document.querySelectorAll("[data-copy-target]").forEach((button) => {
        button.addEventListener("click", async () => {
          const target = document.getElementById(button.dataset.copyTarget);
          const status = document.getElementById(button.dataset.copyStatus);
          const text = target ? target.textContent || "" : "";
          try {
            await navigator.clipboard.writeText(text);
            if (status) status.textContent = "コピーしました。";
          } catch (error) {
            if (status) status.textContent = "コピーできませんでした。表示テキストを選択してコピーしてください。";
          }
        });
      });
    </script>
  </body>
</html>`;
}

function getPatient_(patientId) {
  return rowsForPatient_(SHEET_NAMES.patients, PATIENTS_HEADERS, patientId)[0] || {};
}

function patientAgeText_(patient, referenceDateValue) {
  if (!patient) return "未確認";
  const ageFromBirthDate = ageTextFromBirthDate_(patient.birth_date, referenceDateValue);
  if (ageFromBirthDate) return ageFromBirthDate;
  const hasYears = patient.age_years !== "" && patient.age_years !== null && patient.age_years !== undefined;
  const hasMonths = patient.age_months !== "" && patient.age_months !== null && patient.age_months !== undefined;
  if (!hasYears && !hasMonths) return "未確認";
  const years = hasYears ? `${patient.age_years}歳` : "";
  const months = hasMonths ? `${patient.age_months}か月` : "";
  return `${years}${months}` || "未確認";
}

function patientAgeProfile_(patient, referenceDateValue) {
  if (!patient) return "unknown";
  const ageMonths = ageMonthsFromBirthDate_(patient.birth_date, referenceDateValue);
  if (ageMonths === null) return "unknown";
  if (ageMonths < 24) return "infant";
  if (ageMonths < 48) return "toddler";
  return "child";
}

function ageProfileLabel_(profile) {
  if (profile === "infant") return "0-1歳";
  if (profile === "toddler") return "2-3歳";
  if (profile === "child") return "4歳以降";
  return "年齢未確認";
}

function ageMonthsFromBirthDate_(birthDateValue, referenceDateValue) {
  const birthDate = parseDateOnly_(birthDateValue);
  const referenceDate = parseDateOnly_(referenceDateValue || new Date());
  if (!birthDate || !referenceDate || referenceDate < birthDate) return null;

  let years = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = referenceDate.getUTCMonth() - birthDate.getUTCMonth();
  if (referenceDate.getUTCDate() < birthDate.getUTCDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;
  return years * 12 + months;
}

function ageTextFromBirthDate_(birthDateValue, referenceDateValue) {
  const ageMonths = ageMonthsFromBirthDate_(birthDateValue, referenceDateValue);
  if (ageMonths === null) return "";
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  return `${years}歳${months}か月`;
}

function ageProfileContextLines_(history, mode) {
  const profile = history.age_profile || "unknown";
  const profileLabel = history.age_profile_label || ageProfileLabel_(profile);
  const common = [
    "",
    "【年齢プロファイル】",
    `対象年齢層: ${profile}（${profileLabel}）`,
    `年齢表示: ${history.age_text || "未確認"}`,
  ];
  if (profile === "unknown") {
    return [
      ...common,
      "",
      "【この年齢層で特に確認する観点】",
      "- 年齢未確認です。患者台帳の生年月日を確認してください。",
      "- 問診内容は現MVPの2-3歳向け質問セットとして扱い、年齢に依存する判断は保留してください。",
    ];
  }
  return [
    ...common,
    "",
    "【この年齢層で特に確認する観点】",
    ...ageProfileFocusLines_(profile, mode),
  ];
}

function ageProfileFocusLines_(profile, mode) {
  if (profile === "infant") {
    if (mode === "treatmentReview") {
      return [
        "- 薬の方針候補を出す前に、哺乳、体重、嘔吐、腹部膨満、発症時期、出生時・1か月健診の指摘が十分に確認されているか整理する。",
        "- 牛乳アレルギーや背景疾患を断定せず、不足情報や追加確認候補として扱う。",
        "- 浣腸、綿棒刺激、市販薬について、具体的な頻度指示は出さない。",
      ];
    }
    return [
      "- 出生時や1か月健診で指摘があったか。",
      "- 出生直後または生後早期から便秘が続いているか。",
      "- 哺乳量、食事量、体重増加、嘔吐、腹部膨満、発熱、活気低下があるか。",
      "- 離乳食開始やミルク変更と便秘の時期関係があるか。",
      "- 浣腸、綿棒刺激、市販薬の使用頻度が不明でないか。",
    ];
  }
  if (profile === "child") {
    if (mode === "treatmentReview") {
      return [
        "- 便失禁や園・学校での排便回避がある場合、薬の方針だけでなく生活場面の支援も検討材料として整理する。",
        "- 発達相談、他院通院中の病気、他院処方薬は、便秘との関係を断定せず不足情報として明示する。",
        "- 本人と保護者の困りごとや治療目標のずれがないか整理する。",
      ];
    }
    return [
      "- 園・学校で排便できるか。",
      "- 便失禁、下着汚れ、本人の自覚があるか。",
      "- 腹痛、食欲低下、嘔吐、腹部膨満があるか。",
      "- 偏食、水分不足、朝のトイレ時間不足、生活リズムの乱れがあるか。",
      "- 本人と保護者の困りごとや目標がずれていないか。",
    ];
  }
  if (mode === "treatmentReview") {
    return [
      "- 長期安定例では、段階的減量を独立した方針候補として評価する。",
      "- 減量や飲み忘れ後に硬便、痛み、がまんが再燃している場合は、急な中止や減量継続を慎重に扱う。",
      "- トイレトレーニングの進み具合と痛み、がまんを分けて整理する。",
    ];
  }
  return [
    "- 排便頻度、便の硬さ、排便時痛、がまんの変化。",
    "- 薬の飲み忘れ、少なめ、中止、飲みにくさと便性状の関係。",
    "- トイレトレーニング状況と痛み、がまん、便失禁の関係。",
    "- 直近日誌の排便日数、硬便日数、痛みの日、内服できた日。",
    "- 保護者が薬の継続、減量、中止にどの程度不安を持っているか。",
  ];
}

function parseDateOnly_(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }
  const text = String(value).trim();
  const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function formatPreVisitItemsHtml_(history) {
  const latestVisit = history.visits[0];
  const latestPrescription = history.prescriptions[0];
  const latestTraining = history.toilet_training[0];
  const latestDiary = history.diary_weekly[0];
  const items = [
    ["直近問診", latestVisit ? [
      `${cellText_(latestVisit.submitted_at || latestVisit.saved_at)} / ${latestVisit.urgency_label || "区分不明"}`,
      latestVisit.headline || "概要未記録",
    ].join("。") : "なし"],
    ["直近処方", latestPrescription ? [
      cellText_(latestPrescription.date),
      latestPrescription.medicine_name || "薬剤名未記録",
      latestPrescription.dose ? `量: ${latestPrescription.dose}` : "",
      latestPrescription.instruction ? `指示: ${latestPrescription.instruction}` : "",
    ].filter(Boolean).join(" / ") : "なし"],
    ["直近トイレトレーニング", latestTraining ? [
      cellText_(latestTraining.date),
      latestTraining.training_status ? `状況: ${latestTraining.training_status}` : "",
      latestTraining.diaper_status ? `おむつ・パンツ: ${latestTraining.diaper_status}` : "",
      latestTraining.toilet_refusal ? `拒否: ${latestTraining.toilet_refusal}` : "",
    ].filter(Boolean).join(" / ") : "なし"],
    ["直近週次日誌", latestDiary ? [
      `${cellText_(latestDiary.period_start)}〜${cellText_(latestDiary.period_end)}`,
      latestDiary.recorded_days !== "" ? `記録${latestDiary.recorded_days}日` : "",
      latestDiary.bowel_days !== "" ? `排便${latestDiary.bowel_days}日` : "",
      latestDiary.longest_no_bowel_days !== "" ? `最長無排便${latestDiary.longest_no_bowel_days}日` : "",
      latestDiary.hard_days !== "" ? `硬い便${latestDiary.hard_days}日` : "",
      latestDiary.pain_days !== "" ? `痛み${latestDiary.pain_days}日` : "",
      latestDiary.med_taken_days !== "" ? `内服${latestDiary.med_taken_days}日` : "",
    ].filter(Boolean).join(" / ") : "なし"],
  ];
  return items.map(([label, value]) => `<li><strong>${escapeHtml_(label)}</strong>${escapeHtml_(value)}</li>`).join("");
}

function generateDoctorEntryHtml(params) {
  const patientId = requirePatientId_(params.patient_id);
  const nowValue = dateTimeInputValue_(new Date());
  const formAction = serviceUrl_();
  const historyUrl = buildSelfUrl_("doctorHistory", patientId, normalizeLimit_(params.limit, 5));
  const profileUrl = buildSelfUrl_("patientProfile", patientId, normalizeLimit_(params.limit, 5));
  return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>医師入力 ${escapeHtml_(patientId)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f4f7f9; color: #20242a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { width: min(960px, calc(100% - 32px)); margin: 28px auto; }
      h1 { margin: 0 0 8px; font-size: 1.7rem; }
      h2 { margin: 0 0 14px; font-size: 1.1rem; }
      p { line-height: 1.7; }
      .panel { margin-top: 16px; padding: 18px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fff; }
      .panel:first-of-type { margin-top: 0; }
      .meta { color: #5d6673; }
      .notice { padding: 12px 14px; border: 1px solid #8db9c4; border-radius: 8px; background: #e2f3f6; color: #07576b; font-weight: 800; }
      .notice.saving { border-color: #d6a740; background: #fff7df; color: #7a4d00; }
      .notice.error { border-color: #d8a1a1; background: #fdecec; color: #8a2d2d; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      label { display: grid; gap: 6px; color: #5d6673; font-weight: 800; }
      input, textarea, select { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #d9e0e8; border-radius: 8px; color: #20242a; font: inherit; }
      textarea { min-height: 88px; resize: vertical; }
      .wide { grid-column: 1 / -1; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      button { min-height: 44px; padding: 10px 18px; border: 0; border-radius: 8px; background: #0b6f85; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
      button.secondary { border: 1px solid #d9e0e8; background: #fff; color: #20242a; }
      button:disabled { cursor: wait; opacity: .62; }
      a { color: #07576b; font-weight: 800; }
      @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <h1>医師入力</h1>
      <p class="meta">患者ID: ${escapeHtml_(patientId)}</p>
      <p><a href="${escapeHtml_(historyUrl)}">便秘履歴へ戻る</a> / <a href="${escapeHtml_(profileUrl)}">患者台帳を開く</a></p>
      <p id="saveMessage" class="notice" ${params.message ? "" : "hidden"}>${params.message ? escapeHtml_(params.message) : ""}</p>

      <form id="doctorEntryForm" method="post" action="${escapeHtml_(formAction)}" target="_top">
        <input type="hidden" name="patient_id" value="${escapeHtml_(patientId)}">
        <section class="panel">
          <h2>処方履歴を追加</h2>
          <div class="grid">
            <label>処方日時
              <input name="prescription_date" type="datetime-local" value="${escapeHtml_(nowValue)}">
            </label>
            <label>薬剤名
              <input name="medicine_name" type="text" placeholder="例: モビコール">
            </label>
            <label>量
              <input name="dose" type="text" placeholder="例: 1包/日">
            </label>
            <label class="wide">指示内容
              <textarea name="instruction" placeholder="例: 便の様子を見ながら医師指示範囲で調整"></textarea>
            </label>
            <label class="wide">医師メモ
              <textarea name="doctor_note"></textarea>
            </label>
          </div>
        </section>

        <section class="panel">
          <h2>トイレトレーニング履歴を追加</h2>
          <div class="grid">
            <label>記録日時
              <input name="training_date" type="datetime-local" value="${escapeHtml_(nowValue)}">
            </label>
            <label>トレーニング状況
              <select name="training_status">
                <option value=""></option>
                <option>未開始</option>
                <option>開始中</option>
                <option>中断中</option>
                <option>不明</option>
              </select>
            </label>
            <label>おむつ・パンツ
              <select name="diaper_status">
                <option value=""></option>
                <option>おむつ</option>
                <option>パンツ</option>
                <option>併用</option>
                <option>不明</option>
              </select>
            </label>
            <label>トイレ拒否
              <select name="toilet_refusal">
                <option value=""></option>
                <option>なし</option>
                <option>あり</option>
                <option>強い</option>
                <option>不明</option>
              </select>
            </label>
            <label class="wide">メモ
              <textarea name="note"></textarea>
            </label>
          </div>
        </section>

        <div class="actions">
          <button type="button" data-save-action="both">両方とも保存</button>
          <button class="secondary" type="button" data-save-action="prescription">処方履歴だけ保存</button>
          <button class="secondary" type="button" data-save-action="toiletTraining">トイレトレーニング履歴だけ保存</button>
        </div>
      </form>
    </main>
    <script>
      const form = document.getElementById("doctorEntryForm");
      const message = document.getElementById("saveMessage");
      const buttons = Array.from(document.querySelectorAll("[data-save-action]"));
      const handlers = {
        both: "saveDoctorEntriesFromDoctorForm",
        prescription: "savePrescriptionFromDoctorForm",
        toiletTraining: "saveToiletTrainingFromDoctorForm",
      };

      function setMessage(text, isError) {
        message.textContent = text;
        message.hidden = false;
        message.classList.toggle("error", Boolean(isError));
        message.classList.toggle("saving", false);
        message.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      function setSavingMessage(text) {
        message.textContent = text;
        message.hidden = false;
        message.classList.remove("error");
        message.classList.add("saving");
        message.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      function formObject() {
        const data = {};
        new FormData(form).forEach((value, key) => {
          data[key] = value;
        });
        return data;
      }

      function setBusy(isBusy) {
        buttons.forEach((button) => {
          button.disabled = isBusy;
          if (isBusy) {
            button.dataset.originalText = button.dataset.originalText || button.textContent;
            button.textContent = "保存中...";
          } else if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
          }
        });
      }

      function setCurrentDateTime(inputName) {
        const input = form.elements[inputName];
        if (!input) return;
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60000);
        input.value = local.toISOString().slice(0, 16);
      }

      function clearPrescriptionFields() {
        ["medicine_name", "dose", "instruction", "doctor_note"].forEach((name) => {
          if (form.elements[name]) form.elements[name].value = "";
        });
        setCurrentDateTime("prescription_date");
      }

      function clearToiletTrainingFields() {
        ["training_status", "diaper_status", "toilet_refusal", "note"].forEach((name) => {
          if (form.elements[name]) form.elements[name].value = "";
        });
        setCurrentDateTime("training_date");
      }

      function clearSavedSections(savedSections) {
        if (savedSections.includes("prescription")) clearPrescriptionFields();
        if (savedSections.includes("toiletTraining")) clearToiletTrainingFields();
      }

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const handlerName = handlers[button.dataset.saveAction];
          if (!handlerName) return;
          if (button.disabled) return;
          setBusy(true);
          setSavingMessage("保存中です。このままお待ちください。");
          google.script.run
            .withSuccessHandler((result) => {
              setBusy(false);
              clearSavedSections((result && result.saved_sections) || []);
              setMessage(((result && result.message) || "保存しました。") + " 入力欄をクリアしました。", false);
            })
            .withFailureHandler((error) => {
              setBusy(false);
              setMessage("保存できませんでした: " + (error && error.message ? error.message : error), true);
            })[handlerName](formObject());
        });
      });
    </script>
  </body>
</html>`;
}

function generatePatientProfileHtml(params) {
  const patientId = requirePatientId_(params.patient_id);
  const history = getPatientHistory({ ...params, patient_id: patientId });
  const patient = history.patient || {};
  const formAction = serviceUrl_();
  const historyUrl = buildSelfUrl_("doctorHistory", patientId, normalizeLimit_(params.limit, 5));
  const entryUrl = buildSelfUrl_("doctorEntry", patientId, normalizeLimit_(params.limit, 5));
  const birthDateValue = dateInputValue_(patient.birth_date);
  return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>患者台帳 ${escapeHtml_(patientId)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f4f7f9; color: #20242a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { width: min(760px, calc(100% - 32px)); margin: 28px auto; }
      h1 { margin: 0 0 8px; font-size: 1.7rem; }
      h2 { margin: 0 0 14px; font-size: 1.1rem; }
      p { line-height: 1.7; }
      .panel { margin-top: 16px; padding: 18px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fff; }
      .meta, .help { color: #5d6673; }
      .notice { padding: 12px 14px; border: 1px solid #8db9c4; border-radius: 8px; background: #e2f3f6; color: #07576b; font-weight: 800; }
      .notice.saving { border-color: #d6a740; background: #fff7df; color: #7a4d00; }
      .notice.error { border-color: #d8a1a1; background: #fdecec; color: #8a2d2d; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      label { display: grid; gap: 6px; color: #5d6673; font-weight: 800; }
      input, textarea { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #d9e0e8; border-radius: 8px; color: #20242a; font: inherit; }
      textarea { min-height: 110px; resize: vertical; }
      .wide { grid-column: 1 / -1; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      button { min-height: 44px; padding: 10px 18px; border: 0; border-radius: 8px; background: #0b6f85; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
      button:disabled { cursor: wait; opacity: .62; }
      a { color: #07576b; font-weight: 800; }
      @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <h1>患者台帳</h1>
      <p class="meta">患者ID: ${escapeHtml_(patientId)} / 表示年齢: ${escapeHtml_(history.age_text)} / 年齢プロファイル: ${escapeHtml_(history.age_profile_label)}</p>
      <p><a href="${escapeHtml_(historyUrl)}">便秘履歴へ戻る</a> / <a href="${escapeHtml_(entryUrl)}">医師入力を開く</a></p>
      <p id="saveMessage" class="notice" ${params.message ? "" : "hidden"}>${params.message ? escapeHtml_(params.message) : ""}</p>

      <form id="patientProfileForm" method="post" action="${escapeHtml_(formAction)}" target="_top">
        <input type="hidden" name="action" value="savePatientProfile">
        <input type="hidden" name="patient_id" value="${escapeHtml_(patientId)}">
        <section class="panel">
          <h2>基本情報</h2>
          <div class="grid">
            <label>生年月日
              <input name="birth_date" type="date" value="${escapeHtml_(birthDateValue)}">
            </label>
            <label>現在の表示年齢
              <input type="text" value="${escapeHtml_(history.age_text)}" readonly>
            </label>
            <label>年齢プロファイル
              <input type="text" value="${escapeHtml_(history.age_profile_label)}" readonly>
            </label>
            <label class="wide">台帳メモ
              <textarea name="patient_note" placeholder="例: 年齢確認済み、家族からの補足など">${escapeHtml_(patient.note || "")}</textarea>
            </label>
          </div>
          <p class="help">生年月日は患者向けURL、QR、ChatGPT貼り付け用テキストには直接出さず、医師側の年齢表示にだけ使います。</p>
        </section>
        <div class="actions">
          <button type="button" id="savePatientProfileButton">患者台帳を保存</button>
        </div>
      </form>
    </main>
    <script>
      const form = document.getElementById("patientProfileForm");
      const message = document.getElementById("saveMessage");
      const button = document.getElementById("savePatientProfileButton");

      function setMessage(text, isError) {
        message.textContent = text;
        message.hidden = false;
        message.classList.toggle("error", Boolean(isError));
        message.classList.toggle("saving", false);
        message.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      function setSavingMessage(text) {
        message.textContent = text;
        message.hidden = false;
        message.classList.remove("error");
        message.classList.add("saving");
        message.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      function formObject() {
        const data = {};
        new FormData(form).forEach((value, key) => {
          data[key] = value;
        });
        return data;
      }

      button.addEventListener("click", () => {
        if (button.disabled) return;
        button.disabled = true;
        button.dataset.originalText = button.dataset.originalText || button.textContent;
        button.textContent = "保存中...";
        setSavingMessage("保存中です。このままお待ちください。");
        google.script.run
          .withSuccessHandler((result) => {
            button.disabled = false;
            button.textContent = button.dataset.originalText;
            setMessage((result && result.message) || "患者台帳を保存しました。", false);
          })
          .withFailureHandler((error) => {
            button.disabled = false;
            button.textContent = button.dataset.originalText;
            setMessage("保存できませんでした: " + (error && error.message ? error.message : error), true);
          })
          .savePatientProfileFromForm(formObject());
      });
    </script>
  </body>
</html>`;
}

function formatVisitsForContext_(visits) {
  if (!visits.length) return ["- なし"];
  return visits.map((visit, index) => {
    const questionnaire = visit.questionnaire || {};
    const diary = visit.diary || {};
    return [
      `${index + 1}. ${visit.submitted_at || visit.saved_at || "日付不明"} / ${visit.urgency_label || "区分不明"}`,
      `   年齢: ${visit.age_text_at_visit || "未確認"}, 年齢プロファイル=${visit.age_profile || "未記録"}, 質問セット=${visit.questionnaire_version || "未記録"}`,
      `   概要: ${visit.headline || "未記録"}`,
      `   便: 最終排便=${questionnaire.q1_last_bowel_movement || "未確認"}, 頻度=${questionnaire.q2_bowel_frequency || "未確認"}, 硬さ=${questionnaire.q3_stool_consistency || "未確認"}, 痛み=${questionnaire.q4_pain || "未確認"}, がまん=${questionnaire.q5_withholding || "未確認"}`,
      `   薬: ${questionnaire.q6_med_status || "未確認"}`,
      `   日誌: 記録${diary.diary_days_recorded ?? "未確認"}日, 排便${diary.diary_bowel_days ?? "未確認"}日, 最長無排便${diary.diary_longest_no_bowel_days ?? "未確認"}日, 硬便${diary.diary_hard_days ?? "未確認"}日, 痛み${diary.diary_pain_days ?? "未確認"}日, 内服${diary.diary_med_taken_days ?? "未確認"}日`,
      visit.doctor_note ? `   医師メモ: ${visit.doctor_note}` : "",
    ].filter(Boolean).join("\n");
  });
}

function formatVisitHtml_(visit) {
  const questionnaire = visit.questionnaire || {};
  const diary = visit.diary || {};
  return `
    <article class="visit">
      <p class="headline">${escapeHtml_(visit.submitted_at || visit.saved_at || "日付不明")} / ${escapeHtml_(visit.urgency_label || "区分不明")}</p>
      <p>${escapeHtml_(visit.headline || "概要未記録")}</p>
      <div class="grid">
        ${htmlItem_("受診時年齢", visit.age_text_at_visit)}
        ${htmlItem_("年齢プロファイル", displayAgeProfile_(visit.age_profile))}
        ${htmlItem_("質問セット", visit.questionnaire_version)}
        ${htmlItem_("最終排便", questionnaire.q1_last_bowel_movement)}
        ${htmlItem_("排便頻度", questionnaire.q2_bowel_frequency)}
        ${htmlItem_("便の硬さ", questionnaire.q3_stool_consistency)}
        ${htmlItem_("痛み", questionnaire.q4_pain)}
        ${htmlItem_("がまん", questionnaire.q5_withholding)}
        ${htmlItem_("薬", questionnaire.q6_med_status)}
        ${htmlItem_("日誌記録", diary.diary_days_recorded === undefined ? "" : `${diary.diary_days_recorded}日`)}
        ${htmlItem_("排便あり", diary.diary_bowel_days === undefined ? "" : `${diary.diary_bowel_days}日`)}
        ${htmlItem_("最長無排便", diary.diary_longest_no_bowel_days === undefined ? "" : `${diary.diary_longest_no_bowel_days}日`)}
        ${htmlItem_("硬い便", diary.diary_hard_days === undefined ? "" : `${diary.diary_hard_days}日`)}
        ${htmlItem_("痛みの日", diary.diary_pain_days === undefined ? "" : `${diary.diary_pain_days}日`)}
        ${htmlItem_("内服できた日", diary.diary_med_taken_days === undefined ? "" : `${diary.diary_med_taken_days}日`)}
      </div>
    </article>`;
}

function formatSimpleRowsHtml_(rows, keys, labels) {
  if (!rows.length) return "<p>なし</p>";
  return rows.map((row) => `
    <article class="visit">
      <div class="grid">
        ${keys.map((key) => htmlItem_(labels && labels[key] ? labels[key] : key, displayValueForKey_(key, row[key]))).join("")}
      </div>
    </article>
  `).join("");
}

function htmlItem_(label, value) {
  return `<div class="item"><span class="label">${escapeHtml_(label)}</span><strong>${escapeHtml_(cellText_(value))}</strong></div>`;
}

function displayAgeProfile_(profile) {
  if (!profile) return "";
  return `${profile}（${ageProfileLabel_(profile)}）`;
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSelfUrl_(action, patientId, limit, extraParams) {
  const params = {
    action,
    patient_id: patientId,
    limit,
    ...(extraParams || {}),
  };
  const query = Object.keys(params)
    .filter((key) => params[key] !== "" && params[key] !== null && params[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
  try {
    const serviceUrl = ScriptApp.getService().getUrl();
    if (serviceUrl) return `${serviceUrl}?${query}`;
  } catch (error) {
    // Local syntax checks do not provide ScriptApp.
  }
  return `?${query}`;
}

function serviceUrl_() {
  try {
    return ScriptApp.getService().getUrl();
  } catch (error) {
    return "";
  }
}

function generateRowId_(prefix, patientId, dateText) {
  const datePart = String(dateText || "").replace(/\D/g, "") || dateOnlyInScriptTimezone_(new Date()).replace(/\D/g, "");
  return `${prefix}-${datePart}-${patientId}-${Date.now()}`;
}

function formatSimpleRowsForContext_(rows, keys, labels) {
  if (!rows.length) return ["- なし"];
  return rows.map((row, index) => `${index + 1}. ${keys.map((key) => `${labels && labels[key] ? labels[key] : key}=${cellText_(displayValueForKey_(key, row[key]))}`).join(", ")}`);
}

function cellText_(value) {
  if (value === "" || value === null || value === undefined) return "未記録";
  if (value instanceof Date) return dateTimeInScriptTimezone_(value);
  return String(value);
}

function displayValueForKey_(key, value) {
  if (value === "" || value === null || value === undefined) return "";
  const dayCountKeys = [
    "recorded_days",
    "bowel_days",
    "longest_no_bowel_days",
    "hard_days",
    "pain_days",
    "withholding_days",
    "soiling_days",
    "med_taken_days",
  ];
  if (dayCountKeys.includes(key) && value !== "") return `${value}日`;
  return value;
}

function setupSheets() {
  SHEET_DEFINITIONS.forEach((definition) => {
    const sheet = getOrCreateSheet_(definition.name, definition.headers);
    formatTemplateSheet_(sheet, definition);
  });
}

function formatExistingSheets() {
  setupSheets();
}

function parseJsonBody_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("JSON body is required.");
  }
  return JSON.parse(e.postData.contents);
}

function validateSubmitVisitPayload_(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object.");
  if (!payload.patient_id) throw new Error("patient_id is required.");
  if (!payload.visit_id) throw new Error("visit_id is required.");
  if (!payload.questionnaire || typeof payload.questionnaire !== "object") {
    throw new Error("questionnaire is required.");
  }
  if (!payload.outputs || typeof payload.outputs !== "object") {
    throw new Error("outputs is required.");
  }
}


function rowsForPatient_(sheetName, headers, patientId) {
  return readSheetObjects_(sheetName, headers).filter((row) => patientIdKey_(row.patient_id) === patientId);
}

function readSheetObjects_(sheetName, headers) {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  return values
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])))
    .filter((row) => Object.values(row).some((value) => value !== "" && value !== null));
}

function parseVisitRow_(row) {
  const { questionnaire_json, diary_json, ...visit } = row;
  return {
    ...visit,
    questionnaire: parseJsonCell_(questionnaire_json),
    diary: parseJsonCell_(diary_json),
  };
}

function parseJsonCell_(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

function latestByDate_(rows, limit, dateKey) {
  return rows
    .slice()
    .sort((a, b) => String(b[dateKey] || "").localeCompare(String(a[dateKey] || "")))
    .slice(0, limit);
}

function normalizePatientId_(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 5);
}

function patientIdKey_(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 5);
  return digits ? digits.padStart(5, "0") : "";
}

function requirePatientId_(value) {
  const patientId = normalizePatientId_(value);
  if (patientId.length !== 5) throw new Error("patient_id must be 5 digits.");
  return patientId;
}

function normalizeLimit_(value, fallback) {
  const limit = Number.parseInt(value, 10);
  if (!Number.isFinite(limit) || limit <= 0) return fallback;
  return Math.min(limit, 20);
}

function getOrCreateSheet_(name, headers) {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  ensureHeaders_(sheet, headers);
  return sheet;
}

function getSpreadsheet_() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) return activeSpreadsheet;
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  throw new Error("Spreadsheet is not bound. Set SPREADSHEET_ID in Code.gs, or open Apps Script from the target Google Sheet.");
}

function ensureHeaders_(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = headers.every((header, index) => current[index] === header);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  const definition = SHEET_DEFINITIONS.find((item) => item.name === sheet.getName()) || { headers };
  formatTemplateSheet_(sheet, definition);
}

function formatTemplateSheet_(sheet, definition) {
  const headers = definition.headers;
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const fullRange = sheet.getRange(1, 1, lastRow, headers.length);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);

  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(Math.min(2, headers.length));
  headerRange
    .setFontWeight("bold")
    .setBackground("#e8f3ec")
    .setVerticalAlignment("middle")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  fullRange.setVerticalAlignment("top");
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  }

  applyColumnWidths_(sheet, headers, definition.widths || []);
  applyPlainTextColumns_(sheet, headers, definition.plainTextHeaders || []);
  applyDateColumns_(sheet, headers, definition.dateHeaders || []);
  applyDateTimeColumns_(sheet, headers, definition.dateTimeHeaders || []);
  hideColumnsByHeader_(sheet, headers, definition.hiddenHeaders || []);
  if (!sheet.getFilter()) {
    fullRange.createFilter();
  }
}

function applyColumnWidths_(sheet, headers, widths) {
  headers.forEach((header, index) => {
    const width = widths[index] || 120;
    sheet.setColumnWidth(index + 1, width);
  });
}

function applyPlainTextColumns_(sheet, headers, plainTextHeaders) {
  headers.forEach((header, index) => {
    if (plainTextHeaders.includes(header)) {
      const column = index + 1;
      sheet.getRange(1, column, sheet.getMaxRows(), 1)
        .setNumberFormat("@")
        .setHorizontalAlignment("left");
      normalizePlainTextColumnValues_(sheet, header, column);
    }
  });
}

function applyDateTimeColumns_(sheet, headers, dateTimeHeaders) {
  headers.forEach((header, index) => {
    if (dateTimeHeaders.includes(header)) {
      sheet.getRange(2, index + 1, sheet.getMaxRows() - 1, 1)
        .setNumberFormat("yyyy-mm-dd hh:mm:ss");
    }
  });
}

function applyDateColumns_(sheet, headers, dateHeaders) {
  headers.forEach((header, index) => {
    if (dateHeaders.includes(header)) {
      sheet.getRange(2, index + 1, sheet.getMaxRows() - 1, 1)
        .setNumberFormat("yyyy-mm-dd");
    }
  });
}

function normalizePlainTextColumnValues_(sheet, header, column) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const range = sheet.getRange(2, column, lastRow - 1, 1);
  const values = range.getDisplayValues().map(([value]) => {
    const text = String(value || "").trim();
    if (header === "patient_id" && /^\d{1,5}$/.test(text)) return [text.padStart(5, "0")];
    return [text];
  });
  range.setValues(values);
}

function hideColumnsByHeader_(sheet, headers, hiddenHeaders) {
  headers.forEach((header, index) => {
    if (hiddenHeaders.includes(header)) {
      sheet.hideColumns(index + 1);
    } else {
      sheet.showColumns(index + 1);
    }
  });
}

function jsonResponse_(body, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  if (statusCode && typeof output.setResponseCode === "function") {
    output.setResponseCode(statusCode);
  }
  return output;
}

function textResponse_(body) {
  const output = ContentService.createTextOutput(body);
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}

function htmlResponse_(body) {
  return HtmlService.createHtmlOutput(body)
    .setTitle("便秘履歴")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function redirectResponse_(url) {
  const safeUrl = escapeHtml_(url);
  const scriptUrl = JSON.stringify(url);
  return HtmlService.createHtmlOutput(`
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>保存しました</title>
    <script>
      window.top.location.replace(${scriptUrl});
    </script>
  </head>
  <body>
    <p><a href="${safeUrl}">保存後の画面へ移動します</a></p>
  </body>
</html>`);
}
