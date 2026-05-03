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

const SHEET_DEFINITIONS = [
  { name: SHEET_NAMES.patients, headers: PATIENTS_HEADERS, widths: [110, 90, 105, 160, 260] },
  {
    name: SHEET_NAMES.visits,
    headers: VISITS_HEADERS,
    widths: [170, 95, 95, 175, 175, 105, 120, 300, 260, 180, 420, 420, 360, 130, 260],
    hiddenHeaders: ["questionnaire_json", "diary_json"],
  },
  { name: SHEET_NAMES.prescriptions, headers: PRESCRIPTIONS_HEADERS, widths: [150, 95, 120, 160, 140, 260, 260] },
  { name: SHEET_NAMES.toiletTraining, headers: TOILET_TRAINING_HEADERS, widths: [95, 120, 150, 140, 140, 260] },
  { name: SHEET_NAMES.diaryWeekly, headers: DIARY_WEEKLY_HEADERS, widths: [95, 120, 120, 110, 110, 160, 100, 100, 125, 125, 130, 260] },
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
    throw new Error(`Unsupported action: ${action}`);
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error.message || error) }, 400);
  }
}

function doPost(e) {
  try {
    const payload = parseJsonBody_(e);
    const result = submitVisit(payload);
    return jsonResponse_(result);
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error.message || error) }, 400);
  }
}

function submitVisit(payload) {
  validateSubmitVisitPayload_(payload);
  const sheet = getOrCreateSheet_(SHEET_NAMES.visits, VISITS_HEADERS);
  const savedAt = new Date().toISOString();
  const outputs = payload.outputs || {};

  sheet.appendRow([
    payload.visit_id,
    payload.patient_id,
    payload.visit_token || "",
    payload.submitted_at || "",
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
  ]);

  return {
    ok: true,
    visit_id: payload.visit_id,
    saved_at: savedAt,
  };
}


function getPatientHistory(params) {
  const patientId = normalizePatientId_(params.patient_id || params.pid);
  const limit = normalizeLimit_(params.limit, 5);
  if (!patientId) throw new Error("patient_id is required.");

  return {
    ok: true,
    patient_id: patientId,
    visits: latestByDate_(rowsForPatient_(SHEET_NAMES.visits, VISITS_HEADERS, patientId).map(parseVisitRow_), limit, "submitted_at"),
    prescriptions: latestByDate_(rowsForPatient_(SHEET_NAMES.prescriptions, PRESCRIPTIONS_HEADERS, patientId), limit, "date"),
    toilet_training: latestByDate_(rowsForPatient_(SHEET_NAMES.toiletTraining, TOILET_TRAINING_HEADERS, patientId), limit, "date"),
    diary_weekly: latestByDate_(rowsForPatient_(SHEET_NAMES.diaryWeekly, DIARY_WEEKLY_HEADERS, patientId), limit, "period_end"),
  };
}


function generateChatGPTContext(params) {
  const history = getPatientHistory(params);
  const lines = [
    "これは医師が診察前に確認するための便秘経過サマリーです。",
    "診断、処方量変更、治療中止、専門紹介の判断は行わないでください。",
    "薬を増やす、減らす、やめる、再開するなどの指示は出さないでください。",
    "過去経過から、医師が確認すべき変化点、追加で聞くべきこと、注意して見るべき矛盾点だけを整理してください。",
    "",
    `患者ID: ${history.patient_id}`,
    `対象履歴: 受診${history.visits.length}件 / 処方${history.prescriptions.length}件 / トイレトレーニング${history.toilet_training.length}件 / 日誌${history.diary_weekly.length}件`,
    "",
    "【受診・問診履歴】",
    ...formatVisitsForContext_(history.visits),
    "",
    "【処方履歴】",
    ...formatSimpleRowsForContext_(history.prescriptions, ["date", "medicine_name", "dose", "instruction", "doctor_note"]),
    "",
    "【トイレトレーニング履歴】",
    ...formatSimpleRowsForContext_(history.toilet_training, ["date", "training_status", "diaper_status", "toilet_refusal", "note"]),
    "",
    "【週次日誌】",
    ...formatSimpleRowsForContext_(history.diary_weekly, ["period_start", "period_end", "recorded_days", "bowel_days", "longest_no_bowel_days", "hard_days", "pain_days", "withholding_days", "soiling_days", "med_taken_days", "note"]),
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

function formatVisitsForContext_(visits) {
  if (!visits.length) return ["- なし"];
  return visits.map((visit, index) => {
    const questionnaire = visit.questionnaire || {};
    const diary = visit.diary || {};
    return [
      `${index + 1}. ${visit.submitted_at || visit.saved_at || "日付不明"} / ${visit.urgency_label || "区分不明"}`,
      `   概要: ${visit.headline || "未記録"}`,
      `   便: 最終排便=${questionnaire.q1_last_bowel_movement || "未確認"}, 頻度=${questionnaire.q2_bowel_frequency || "未確認"}, 硬さ=${questionnaire.q3_stool_consistency || "未確認"}, 痛み=${questionnaire.q4_pain || "未確認"}, がまん=${questionnaire.q5_withholding || "未確認"}`,
      `   薬: ${questionnaire.q6_med_status || "未確認"}`,
      `   日誌: 記録${diary.diary_days_recorded ?? "未確認"}日, 排便${diary.diary_bowel_days ?? "未確認"}日, 最長無排便${diary.diary_longest_no_bowel_days ?? "未確認"}日, 硬便${diary.diary_hard_days ?? "未確認"}日, 痛み${diary.diary_pain_days ?? "未確認"}日, 内服${diary.diary_med_taken_days ?? "未確認"}日`,
      visit.doctor_note ? `   医師メモ: ${visit.doctor_note}` : "",
    ].filter(Boolean).join("\n");
  });
}

function formatSimpleRowsForContext_(rows, keys) {
  if (!rows.length) return ["- なし"];
  return rows.map((row, index) => `${index + 1}. ${keys.map((key) => `${key}=${cellText_(row[key])}`).join(", ")}`);
}

function cellText_(value) {
  if (value === "" || value === null || value === undefined) return "未記録";
  return String(value);
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
  return readSheetObjects_(sheetName, headers).filter((row) => String(row.patient_id || "") === patientId);
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
  return {
    ...row,
    questionnaire: parseJsonCell_(row.questionnaire_json),
    diary: parseJsonCell_(row.diary_json),
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
