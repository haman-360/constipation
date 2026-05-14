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
  "background_history",
  "background_flags",
  "background_status",
  "background_updated_at",
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

const BACKGROUND_FLAG_DEFINITIONS = [
  { tag: "夜尿あり", category: "変化しうる併存相談", patientVisible: true, patientLabel: "夜尿あり", skipUrinaryQuestion: true, skipBackgroundQuestion: false },
  { tag: "昼間尿失禁あり", category: "変化しうる併存相談", patientVisible: true, patientLabel: "昼間尿失禁あり", skipUrinaryQuestion: true, skipBackgroundQuestion: false },
  { tag: "昼間尿失禁で相談中", category: "変化しうる併存相談", patientVisible: true, patientLabel: "昼間尿失禁で相談中", skipUrinaryQuestion: true, skipBackgroundQuestion: false },
  { tag: "泌尿器科通院中", category: "変化しうる併存相談", patientVisible: true, patientLabel: "泌尿器科通院中", skipUrinaryQuestion: true, skipBackgroundQuestion: false },
  { tag: "発達について相談中", category: "変化しうる併存相談", patientVisible: true, patientLabel: "発達について相談中", skipUrinaryQuestion: false, skipBackgroundQuestion: true },
  { tag: "発達遅滞または発達特性あり", category: "変化しうる併存相談", patientVisible: true, patientLabel: "発達について相談中", skipUrinaryQuestion: false, skipBackgroundQuestion: true },
  { tag: "療育・発達支援を利用中", category: "変化しうる併存相談", patientVisible: true, patientLabel: "療育・発達支援を利用中", skipUrinaryQuestion: false, skipBackgroundQuestion: true },
  { tag: "他院に通院中の病気がある", category: "変化しうる併存相談", patientVisible: true, patientLabel: "他院に通院中の病気がある", skipUrinaryQuestion: false, skipBackgroundQuestion: true },
  { tag: "他院で長く飲んでいる薬がある", category: "変化しうる併存相談", patientVisible: true, patientLabel: "他院で長く飲んでいる薬がある", skipUrinaryQuestion: false, skipBackgroundQuestion: true },
  { tag: "園・学校で排便やトイレ配慮あり", category: "変化しうる併存相談", patientVisible: true, patientLabel: "園・学校で排便やトイレ配慮あり", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "排便姿勢・トイレ介助が必要", category: "変化しうる併存相談", patientVisible: true, patientLabel: "排便姿勢・トイレ介助が必要", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "早産・低出生体重・NICU入院歴", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "新生児仮死・周産期合併症", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "出生直後から便秘", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "胎便排泄遅延の既往", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "小児外科紹介・受診歴あり", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "肛門・直腸の手術歴あり", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "神経・筋疾患", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
  { tag: "便秘に影響しうる薬あり", category: "固定既往歴", patientVisible: false, patientLabel: "", skipUrinaryQuestion: false, skipBackgroundQuestion: false },
];

const BACKGROUND_FLAG_OPTIONS = BACKGROUND_FLAG_DEFINITIONS.map((definition) => definition.tag);
const BACKGROUND_FLAG_ALIASES = {
  "夜尿症で相談中": "夜尿あり",
  "昼間尿失禁・排尿相談中": "昼間尿失禁で相談中",
  "消化器・肛門疾患または手術歴": "小児外科紹介・受診歴あり",
  "ヒルシュスプルング病評価歴あり": "小児外科紹介・受診歴あり",
};
const BACKGROUND_STATUS_OPTIONS = ["継続中", "過去にあり", "終了", "不明"];
const MEDICINE_DOSE_PRESETS = [
  { name: "モビコール", unit: "包/日" },
  { name: "モニラック", unit: "ml/kg/日" },
  { name: "酸化マグネシウム", unit: "g/日" },
  { name: "ピコスルファート", unit: "滴 頓用" },
  { name: "グリセリン浣腸", unit: "本 頓用" },
];

const SHEET_DEFINITIONS = [
  { name: SHEET_NAMES.patients, headers: PATIENTS_HEADERS, widths: [110, 90, 105, 160, 260, 120, 360, 320, 110, 145], plainTextHeaders: ["patient_id"], dateHeaders: ["birth_date", "background_updated_at"] },
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
    if (action === "patientProfileData") {
      return jsonResponse_(getPatientProfileData(e.parameter || {}));
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
  const calculatedAgeProfile = patientAgeProfile_(patient, submittedAt);
  const ageProfile = calculatedAgeProfile === "unknown" ? normalizeAgeProfile_(payload.age_profile) : calculatedAgeProfile;
  const ageTextAtVisit = patientAgeText_(patient, submittedAt);
  const questionnaireVersion = normalizeQuestionnaireVersion_(payload.questionnaire_version, ageProfile);
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
  const entries = prescriptionEntriesFromParams_(params);
  if (!entries.length) throw new Error("薬剤名を入力してください。");
  upsertPatient_(patientId, savedAt);
  const sheet = getOrCreateSheet_(SHEET_NAMES.prescriptions, PRESCRIPTIONS_HEADERS);
  entries.forEach((entry, index) => {
    sheet.appendRow([
      entry.prescription_id || params.prescription_id || generateRowId_("RX", patientId, `${date}-${index + 1}`),
      patientId,
      date,
      entry.medicine_name,
      entry.dose,
      String(params.instruction || "").trim(),
      String(params.doctor_note || "").trim(),
    ]);
  });
  return entries.length;
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
  const count = savePrescription_(formObject || {});
  return { ok: true, message: `処方履歴を${count}件保存しました。`, saved_sections: ["prescription"] };
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
  const backgroundHistory = String(params.background_history || "").trim();
  const backgroundFlags = normalizeBackgroundFlags_(params.background_flags);
  const backgroundStatus = normalizeBackgroundStatus_(params.background_status);
  const backgroundUpdatedAt = normalizeOptionalDate_(params.background_updated_at);
  const sheet = getOrCreateSheet_(SHEET_NAMES.patients, PATIENTS_HEADERS);
  const existingRow = findPatientRow_(sheet, patientId);

  if (existingRow) {
    sheet.getRange(existingRow, 1).setNumberFormat("@").setValue(patientId);
    sheet.getRange(existingRow, 5).setValue(note);
    sheet.getRange(existingRow, 6).setNumberFormat("yyyy-mm-dd").setValue(birthDate);
    sheet.getRange(existingRow, 7).setValue(backgroundHistory);
    sheet.getRange(existingRow, 8).setValue(backgroundFlags.join("、"));
    sheet.getRange(existingRow, 9).setValue(backgroundStatus);
    sheet.getRange(existingRow, 10).setNumberFormat("yyyy-mm-dd").setValue(backgroundUpdatedAt);
    return { ok: true, created: false };
  }

  sheet.appendRow([
    patientId,
    "",
    "",
    savedAt,
    note,
    birthDate,
    backgroundHistory,
    backgroundFlags.join("、"),
    backgroundStatus,
    backgroundUpdatedAt,
  ]);
  const row = sheet.getLastRow();
  sheet.getRange(row, 1).setNumberFormat("@").setValue(patientId);
  sheet.getRange(row, 6).setNumberFormat("yyyy-mm-dd").setValue(birthDate);
  sheet.getRange(row, 10).setNumberFormat("yyyy-mm-dd").setValue(backgroundUpdatedAt);
  return { ok: true, created: true };
}

function savePatientProfileFromForm(formObject) {
  savePatientProfile_(formObject || {});
  return { ok: true, message: "患者台帳を保存しました。" };
}

function hasPrescriptionInput_(params) {
  if (["medicine_name", "dose", "instruction", "doctor_note"].some((key) => String(params[key] || "").trim())) return true;
  for (let index = 0; index < 5; index += 1) {
    if ([
      `medicine_name_${index}`,
      `dose_amount_${index}`,
      `dose_unit_${index}`,
      `dose_${index}`,
    ].some((key) => String(params[key] || "").trim())) return true;
  }
  return false;
}

function prescriptionEntriesFromParams_(params) {
  const entries = [];
  for (let index = 0; index < 5; index += 1) {
    const medicineName = String(params[`medicine_name_${index}`] || "").trim();
    const dose = prescriptionDoseText_(params[`dose_amount_${index}`], params[`dose_unit_${index}`], params[`dose_${index}`]);
    if (!medicineName && !dose) continue;
    if (!medicineName) throw new Error(`薬剤名を入力してください（${index + 1}行目）。`);
    entries.push({
      medicine_name: medicineName,
      dose,
      prescription_id: String(params[`prescription_id_${index}`] || "").trim(),
    });
  }

  if (entries.length) return entries;
  const medicineName = String(params.medicine_name || "").trim();
  if (!medicineName && !String(params.dose || "").trim()) return [];
  if (!medicineName) throw new Error("薬剤名を入力してください。");
  return [{
    medicine_name: medicineName,
    dose: String(params.dose || "").trim(),
    prescription_id: String(params.prescription_id || "").trim(),
  }];
}

function prescriptionDoseText_(amountValue, unitValue, fallbackValue) {
  const fallback = String(fallbackValue || "").trim();
  const amount = String(amountValue || "").trim();
  const unit = String(unitValue || "").trim();
  if (!amount && !unit) return fallback;
  if (amount && /^[A-Za-z]/.test(unit)) return `${amount} ${unit}`;
  return [amount, unit].filter(Boolean).join("");
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
    "",
    "",
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

function dateSortKey_(value) {
  const date = parseDateTimeValue_(value);
  return date ? date.getTime() : 0;
}

function parseDateTimeValue_(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }
  const parts = dateParts_(value);
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function dateParts_(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
      hour: value.getHours(),
      minute: value.getMinutes(),
      second: value.getSeconds(),
      hasTime: value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0,
    };
  }
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;
  const parts = {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10),
    day: Number.parseInt(match[3], 10),
    hour: match[4] === undefined ? 0 : Number.parseInt(match[4], 10),
    minute: match[5] === undefined ? 0 : Number.parseInt(match[5], 10),
    second: match[6] === undefined ? 0 : Number.parseInt(match[6], 10),
    hasTime: match[4] !== undefined,
  };
  if (!isValidDateParts_(parts)) return null;
  return parts;
}

function isValidDateParts_(parts) {
  if (!parts) return false;
  const { year, month, day, hour, minute, second } = parts;
  if (![year, month, day, hour, minute, second].every(Number.isFinite)) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return false;
  const date = new Date(year, month - 1, day, hour, minute, second);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function displayDateTime_(value) {
  const parts = dateParts_(value);
  if (!parts) return value === "" || value === null || value === undefined ? "未記録" : String(value);
  const dateText = `${parts.year}-${pad2_(parts.month)}-${pad2_(parts.day)}`;
  if (!parts.hasTime) return dateText;
  const timeText = `${pad2_(parts.hour)}:${pad2_(parts.minute)}`;
  return parts.second ? `${dateText} ${timeText}:${pad2_(parts.second)}` : `${dateText} ${timeText}`;
}

function displayDate_(value) {
  const parts = dateParts_(value);
  if (!parts) return value === "" || value === null || value === undefined ? "未記録" : String(value);
  return `${parts.year}-${pad2_(parts.month)}-${pad2_(parts.day)}`;
}

function pad2_(value) {
  return String(value).padStart(2, "0");
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

function normalizeOptionalDate_(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("日付は yyyy-mm-dd 形式で入力してください。");
  const date = parseDateOnly_(text);
  if (!date || date.toISOString().slice(0, 10) !== text) throw new Error("日付を確認してください。");
  return text;
}

function normalizeBackgroundFlags_(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(/[、,\n]/);
  const allowed = new Set(BACKGROUND_FLAG_OPTIONS);
  return values
    .map((item) => BACKGROUND_FLAG_ALIASES[String(item || "").trim()] || String(item || "").trim())
    .filter((item, index, array) => item && allowed.has(item) && array.indexOf(item) === index);
}

function normalizeBackgroundStatus_(value) {
  const text = String(value || "").trim();
  return BACKGROUND_STATUS_OPTIONS.includes(text) ? text : "";
}

function backgroundFlagDefinition_(tag) {
  return BACKGROUND_FLAG_DEFINITIONS.find((definition) => definition.tag === tag) || null;
}

function patientVisibleBackgroundLabels_(flags) {
  const labels = flags
    .map((tag) => backgroundFlagDefinition_(tag))
    .filter((definition) => definition && definition.patientVisible)
    .map((definition) => definition.patientLabel || definition.tag);
  return labels.filter((label, index, array) => array.indexOf(label) === index);
}

function backgroundHasSkipRule_(flags, key) {
  return flags
    .map((tag) => backgroundFlagDefinition_(tag))
    .some((definition) => definition && definition[key]);
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
    `基礎疾患・既往歴: ${cellText_(history.patient && history.patient.background_history)}`,
    `基礎疾患・併存相談チェック: ${cellText_(history.patient && history.patient.background_flags)}`,
    `基礎疾患・併存相談の状態: ${cellText_(history.patient && history.patient.background_status)}`,
    `基礎疾患・併存相談の最終確認日: ${cellText_(displayValueForKey_("background_updated_at", history.patient && history.patient.background_updated_at))}`,
    `台帳メモ: ${cellText_(history.patient && history.patient.note)}`,
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
  const preVisitItems = formatPreVisitItemsHtml_(history);
  const visitItems = history.visits.length
    ? history.visits.map(formatVisitHtml_).join("")
    : "<p>受診・問診履歴はありません。</p>";
  return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <base target="_top">
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
      .item { padding: 10px; border: 1px solid #d9e0e8; border-left-width: 6px; border-radius: 8px; background: #fbfdfe; }
      .item--meta { border-left-color: #8b96a5; background: #fbfdfe; }
      .item--good { border-color: #a8d5b2; border-left-color: #1f8a4c; background: #f2fbf5; }
      .item--check { border-color: #f0d48a; border-left-color: #bd7b00; background: #fff9e8; }
      .item--warn { border-color: #eeaaa4; border-left-color: #c5332b; background: #fff1ef; }
      .item--missing { border-color: #d9e0e8; border-left-color: #b4bdc8; background: #f6f8fa; color: #5d6673; }
      .label { display: block; color: #5d6673; font-size: .86rem; }
      .summary-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
      .summary-list li { padding: 12px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fbfdfe; line-height: 1.65; }
      .summary-list li:first-child { border-left: 6px solid #bd7b00; background: #fff9e8; }
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
      <section class="panel">
        <h2>患者基本情報</h2>
        <div class="grid">
          ${htmlItem_("基礎疾患・既往歴", history.patient && history.patient.background_history, "meta")}
          ${htmlItem_("基礎疾患・併存相談チェック", history.patient && history.patient.background_flags, "meta")}
          ${htmlItem_("状態", history.patient && history.patient.background_status, "meta")}
          ${htmlItem_("最終確認日", displayValueForKey_("background_updated_at", history.patient && history.patient.background_updated_at), "meta")}
          ${htmlItem_("台帳メモ", history.patient && history.patient.note, "meta")}
        </div>
      </section>
      <details>
        <summary>ChatGPT診察前整理テキストをページ内で表示</summary>
        <div class="copy-row">
          <button type="button" data-copy-target="preVisitContextText" data-copy-status="preVisitContextStatus" data-context-mode="preVisit">診察前整理テキストをコピー</button>
          <span id="preVisitContextStatus" class="copy-status"></span>
        </div>
        <pre id="preVisitContextText" data-context-mode="preVisit">未読み込みです。開くかコピーすると読み込みます。</pre>
      </details>
      <details>
        <summary>ChatGPT治療方針検討テキストをページ内で表示</summary>
        <div class="copy-row">
          <button type="button" data-copy-target="treatmentContextText" data-copy-status="treatmentContextStatus" data-context-mode="treatmentReview">治療方針検討テキストをコピー</button>
          <span id="treatmentContextStatus" class="copy-status"></span>
        </div>
        <pre id="treatmentContextText" data-context-mode="treatmentReview">未読み込みです。開くかコピーすると読み込みます。</pre>
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
      const patientId = ${JSON.stringify(history.patient_id)};
      const historyLimit = ${JSON.stringify(normalizeLimit_(params.limit, 5))};

      function loadContextText(mode, status) {
        const target = document.querySelector('pre[data-context-mode="' + mode + '"]');
        if (!target) return Promise.resolve("");
        if (target.dataset.loaded === "true") return Promise.resolve(target.textContent || "");
        target.textContent = "読み込み中です...";
        if (status) status.textContent = "読み込み中です...";
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler((text) => {
              target.dataset.loaded = "true";
              target.textContent = text || "";
              if (status) status.textContent = "";
              resolve(target.textContent || "");
            })
            .withFailureHandler((error) => {
              const message = "読み込めませんでした: " + (error && error.message ? error.message : error);
              target.textContent = message;
              if (status) status.textContent = message;
              reject(error);
            })
            .generateChatGPTContext({ patient_id: patientId, limit: historyLimit, mode });
        });
      }

      document.querySelectorAll("details").forEach((details) => {
        details.addEventListener("toggle", () => {
          if (!details.open) return;
          const target = details.querySelector("pre[data-context-mode]");
          if (target) loadContextText(target.dataset.contextMode);
        });
      });

      document.querySelectorAll("[data-copy-target]").forEach((button) => {
        button.addEventListener("click", async () => {
          const target = document.getElementById(button.dataset.copyTarget);
          const status = document.getElementById(button.dataset.copyStatus);
          const text = await loadContextText(button.dataset.contextMode, status);
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

function getPatientProfileData(params) {
  const patientId = requirePatientId_(params.patient_id || params.pid);
  const referenceDate = dateTimeInScriptTimezone_(new Date());
  const patient = getPatient_(patientId);
  const ageProfile = patientAgeProfile_(patient, referenceDate);
  const backgroundSummary = patientBackgroundSummary_(patient, { patientFacing: true });
  const backgroundFlags = normalizeBackgroundFlags_(patient.background_flags);
  return {
    ok: true,
    patient_id: patientId,
    age_text: patientAgeText_(patient, referenceDate),
    age_profile: ageProfile,
    age_profile_label: ageProfileLabel_(ageProfile),
    questionnaire_version: normalizeQuestionnaireVersion_("", ageProfile),
    background_summary: backgroundSummary,
    background_flags: backgroundFlags,
    background_patient_visible_flags: patientVisibleBackgroundLabels_(backgroundFlags),
    background_skip_urinary_question: backgroundHasSkipRule_(backgroundFlags, "skipUrinaryQuestion"),
    background_skip_background_question: backgroundHasSkipRule_(backgroundFlags, "skipBackgroundQuestion"),
    background_status: String(patient.background_status || ""),
    background_updated_at: dateInputValue_(patient.background_updated_at),
    has_background_context: Boolean(backgroundSummary),
  };
}

function patientBackgroundSummary_(patient, options) {
  if (!patient) return "";
  const patientFacing = Boolean(options && options.patientFacing);
  const parts = [];
  const flags = normalizeBackgroundFlags_(patient.background_flags);
  const displayFlags = patientFacing ? patientVisibleBackgroundLabels_(flags) : flags;
  if (patientFacing && !displayFlags.length) return "";
  if (displayFlags.length) parts.push(displayFlags.join("、"));
  if (patient.background_status) parts.push(`状態: ${patient.background_status}`);
  const updatedAt = dateInputValue_(patient.background_updated_at);
  if (updatedAt) parts.push(`最終確認: ${updatedAt}`);
  if (!patientFacing && patient.background_history) parts.push(`補足: ${patient.background_history}`);
  return parts.join(" / ");
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

function normalizeAgeProfile_(value) {
  const profile = String(value || "").trim();
  return ["infant", "toddler", "child", "unknown"].includes(profile) ? profile : "unknown";
}

function normalizeQuestionnaireVersion_(value, ageProfile) {
  const text = String(value || "").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 40);
  if (text) return text;
  if (ageProfile === "infant") return "infant-prototype-v1";
  if (ageProfile === "child") return "child-prototype-v1";
  return "toddler-mvp-v1";
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
  const medicinePresetJson = JSON.stringify(MEDICINE_DOSE_PRESETS);
  const medicineOptionsHtml = MEDICINE_DOSE_PRESETS.map((preset) => `<option value="${escapeHtml_(preset.name)}"></option>`).join("");
  const medicineRowsHtml = [0, 1, 2].map((index) => `
              <div class="medicine-row" data-medicine-row>
                <label>薬剤名
                  <input name="medicine_name_${index}" type="text" list="medicineNameList" data-medicine-name placeholder="${index === 0 ? "例: モビコール" : "薬剤を追加"}">
                </label>
                <label>量
                  <input name="dose_amount_${index}" type="text" inputmode="decimal" data-dose-amount placeholder="${index === 0 ? "例: 1" : ""}">
                </label>
                <label>単位・用法
                  <input name="dose_unit_${index}" type="text" data-dose-unit placeholder="${index === 0 ? "例: 包/日、ml/kg/日" : ""}">
                </label>
              </div>`).join("");
  return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <base target="_top">
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
      label, .field-label { display: grid; gap: 6px; color: #5d6673; font-weight: 800; }
      input, textarea, select { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #d9e0e8; border-radius: 8px; color: #20242a; font: inherit; }
      textarea { min-height: 88px; resize: vertical; }
      .wide { grid-column: 1 / -1; }
      .medicine-list { grid-column: 1 / -1; display: grid; gap: 10px; }
      .medicine-row { display: grid; grid-template-columns: minmax(180px, 1.4fr) minmax(90px, .7fr) minmax(130px, 1fr); gap: 10px; padding: 12px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fbfdfe; }
      .field-help { margin: 4px 0 0; color: #5d6673; font-size: .9rem; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      button { min-height: 44px; padding: 10px 18px; border: 0; border-radius: 8px; background: #0b6f85; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
      button.secondary { border: 1px solid #d9e0e8; background: #fff; color: #20242a; }
      button:disabled { cursor: wait; opacity: .62; }
      a { color: #07576b; font-weight: 800; }
      @media (max-width: 700px) { .grid, .medicine-row { grid-template-columns: 1fr; } }
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
            <div></div>
            <div class="medicine-list">
              <datalist id="medicineNameList">${medicineOptionsHtml}</datalist>
${medicineRowsHtml}
              <p class="field-help">薬剤名を選ぶと単位・用法を自動入力します。例: モニラック 1.7 ml/kg/日。リスト外の薬剤や単位も直接入力できます。</p>
            </div>
            <label class="wide">指示内容
              <textarea name="instruction" placeholder="例: 便の様子を見ながら医師指示範囲で調整"></textarea>
              <span class="field-help">患者・家族に伝える処方意図や具体的な使い方を記録します。例: 便が硬い間は継続、下痢が続く場合は連絡。</span>
            </label>
            <label class="wide">医師メモ
              <textarea name="doctor_note"></textarea>
              <span class="field-help">診療側だけで共有したい判断理由、次回確認事項、背景情報を記録します。例: 体重増加より便秘治療を優先、次回食欲と体重を確認。</span>
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
      const medicinePresets = ${medicinePresetJson};
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
        ["instruction", "doctor_note"].forEach((name) => {
          if (form.elements[name]) form.elements[name].value = "";
        });
        document.querySelectorAll("[data-medicine-row]").forEach((row) => {
          row.querySelectorAll("input").forEach((input) => {
            input.value = "";
          });
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

      function setupMedicineRows() {
        document.querySelectorAll("[data-medicine-row]").forEach((row) => {
          const nameInput = row.querySelector("[data-medicine-name]");
          const unitInput = row.querySelector("[data-dose-unit]");
          if (!nameInput || !unitInput) return;
          nameInput.addEventListener("input", () => {
            const preset = medicinePresets.find((item) => item.name === nameInput.value.trim());
            if (preset && !unitInput.value.trim()) unitInput.value = preset.unit;
          });
        });
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
      setupMedicineRows();
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
  const backgroundFlags = normalizeBackgroundFlags_(patient.background_flags);
  const backgroundUpdatedAtValue = dateInputValue_(patient.background_updated_at);
  const backgroundFlagInputs = BACKGROUND_FLAG_OPTIONS.map((option) => `
              <label class="checkbox-option">
                <input name="background_flags" type="checkbox" value="${escapeHtml_(option)}" ${backgroundFlags.includes(option) ? "checked" : ""}>
                <span>${escapeHtml_(option)}</span>
              </label>`).join("");
  const backgroundStatusOptions = ["", ...BACKGROUND_STATUS_OPTIONS].map((option) => {
    const label = option || "未選択";
    return `<option value="${escapeHtml_(option)}" ${String(patient.background_status || "") === option ? "selected" : ""}>${escapeHtml_(label)}</option>`;
  }).join("");
  return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <base target="_top">
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
      label, .field-label { display: grid; gap: 6px; min-width: 0; color: #5d6673; font-weight: 800; }
      input, textarea, select { width: 100%; min-width: 0; min-height: 44px; padding: 10px 12px; border: 1px solid #d9e0e8; border-radius: 8px; color: #20242a; font: inherit; background: #fff; }
      textarea { min-height: 110px; resize: vertical; }
      .wide { grid-column: 1 / -1; }
      .checkbox-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .checkbox-option { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: 8px; padding: 10px; border: 1px solid #d9e0e8; border-radius: 8px; background: #fbfdfe; color: #20242a; font-weight: 600; line-height: 1.45; }
      .checkbox-option input { width: auto; min-height: auto; margin-top: 3px; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      button { min-height: 44px; padding: 10px 18px; border: 0; border-radius: 8px; background: #0b6f85; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
      button:disabled { cursor: wait; opacity: .62; }
      a { color: #07576b; font-weight: 800; }
      @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
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
            <label class="wide">基礎疾患・既往歴
              <textarea name="background_history" placeholder="例: 重症新生児仮死でNICU入院歴あり。極低出生体重児。出生時から便秘。">${escapeHtml_(patient.background_history || "")}</textarea>
            </label>
            <div class="field-label wide">基礎疾患・併存相談チェック
              <div class="checkbox-grid">
                ${backgroundFlagInputs}
              </div>
            </div>
            <label>状態
              <select name="background_status">
                ${backgroundStatusOptions}
              </select>
            </label>
            <label>最終確認日
              <input name="background_updated_at" type="date" value="${escapeHtml_(backgroundUpdatedAtValue)}">
            </label>
            <label class="wide">台帳メモ
              <textarea name="patient_note" placeholder="例: 年齢確認済み、家族からの補足など">${escapeHtml_(patient.note || "")}</textarea>
            </label>
          </div>
          <p class="help">生年月日は患者向けURL、QR、ChatGPT貼り付け用テキストには直接出さず、医師側の年齢表示にだけ使います。基礎疾患・既往歴は医師側履歴とChatGPT貼り付け用テキストに反映します。</p>
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
          if (data[key] === undefined) {
            data[key] = value;
          } else if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
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
    const diary = visit.diary || {};
    const questionnaireText = visitQuestionnaireContextText_(visit);
    return [
      `${index + 1}. ${displayDateTime_(visit.submitted_at || visit.saved_at)} / ${visit.urgency_label || "区分不明"}`,
      `   年齢: ${visit.age_text_at_visit || "未確認"}, 年齢プロファイル=${visit.age_profile || "未記録"}, 質問セット=${visit.questionnaire_version || "未記録"}`,
      `   概要: ${visit.headline || "未記録"}`,
      `   問診: ${questionnaireText}`,
      `   日誌: 記録${diary.diary_days_recorded ?? "未確認"}日, 排便${diary.diary_bowel_days ?? "未確認"}日, 最長無排便${diary.diary_longest_no_bowel_days ?? "未確認"}日, 硬便${diary.diary_hard_days ?? "未確認"}日, 痛み${diary.diary_pain_days ?? "未確認"}日, 内服${diary.diary_med_taken_days ?? "未確認"}日`,
      visit.doctor_note ? `   医師メモ: ${visit.doctor_note}` : "",
    ].filter(Boolean).join("\n");
  });
}

function formatVisitHtml_(visit) {
  const diary = visit.diary || {};
  const questionnaireItems = visitQuestionnaireItems_(visit);
  return `
    <article class="visit">
      <p class="headline">${escapeHtml_(displayDateTime_(visit.submitted_at || visit.saved_at))} / ${escapeHtml_(visit.urgency_label || "区分不明")}</p>
      <p>${escapeHtml_(visit.headline || "概要未記録")}</p>
      <div class="grid">
        ${htmlItem_("受診時年齢", visit.age_text_at_visit, "meta")}
        ${htmlItem_("年齢プロファイル", displayAgeProfile_(visit.age_profile), "meta")}
        ${htmlItem_("質問セット", visit.questionnaire_version, "meta")}
        ${questionnaireItems.map(([label, value]) => htmlItem_(label, value)).join("")}
        ${htmlItem_("日誌記録", diary.diary_days_recorded === undefined ? "" : `${diary.diary_days_recorded}日`)}
        ${htmlItem_("排便あり", diary.diary_bowel_days === undefined ? "" : `${diary.diary_bowel_days}日`)}
        ${htmlItem_("最長無排便", diary.diary_longest_no_bowel_days === undefined ? "" : `${diary.diary_longest_no_bowel_days}日`)}
        ${htmlItem_("硬い便", diary.diary_hard_days === undefined ? "" : `${diary.diary_hard_days}日`)}
        ${htmlItem_("痛みの日", diary.diary_pain_days === undefined ? "" : `${diary.diary_pain_days}日`)}
        ${htmlItem_("内服できた日", diary.diary_med_taken_days === undefined ? "" : `${diary.diary_med_taken_days}日`)}
      </div>
    </article>`;
}

function visitQuestionnaireContextText_(visit) {
  const items = visitQuestionnaireItems_(visit);
  if (!items.length) return "未確認";
  return items.map(([label, value]) => `${label}=${cellText_(value)}`).join(", ");
}

function visitQuestionnaireItems_(visit) {
  const profile = normalizeAgeProfile_(visit.age_profile);
  if (profile === "infant") return visitQuestionnaireItemsForProfile_(visit, [
    ["最終排便", ["i1_last_bowel_movement", "q1_last_bowel_movement"]],
    ["便の硬さ", ["i2_stool_consistency", "q3_stool_consistency"]],
    ["排便時の様子", ["i3_stool_behavior", "q4_pain"]],
    ["発症時期", ["i4_onset"]],
    ["出生時・1か月健診", ["i5_birth_check"]],
    ["出生時・健診の補足", ["i5_birth_check_note"]],
    ["哺乳・食事", ["i6_feeding"]],
    ["ミルク・乳製品との関係", ["i7_milk_dairy"]],
    ["おなか・全身状態", ["i8_abdominal_condition"]],
    ["体重・成長", ["i9_growth"]],
    ["便秘対応", ["i10_constipation_support", "q6_med_status"]],
    ["便秘対応の補足", ["i10_support_note"]],
  ]);
  if (profile === "child") return visitQuestionnaireItemsForProfile_(visit, [
    ["最終排便", ["c1_last_bowel_movement", "q1_last_bowel_movement"]],
    ["便の硬さ", ["c2_stool_consistency", "q3_stool_consistency"]],
    ["痛み・困りごと", ["c3_pain_problem", "q4_pain"]],
    ["がまん・回避", ["c4_withholding", "q5_withholding"]],
    ["便失禁・下着汚れ", ["c5_soiling", "q8_soiling"]],
    ["園・学校トイレ", ["c6_school_toilet"]],
    ["排尿・夜尿", ["c7_urinary"]],
    ["腹部症状", ["c8_abdominal_symptom"]],
    ["食事・生活リズム", ["c9_lifestyle"]],
    ["薬", ["c10_med_status", "q6_med_status"]],
    ["薬の補足", ["c10_med_note"]],
    ["背景情報", ["c11_background"]],
    ["背景情報の補足", ["c11_background_note"]],
    ["困りごと・不安", ["c12_concerns"]],
  ]);
  return visitQuestionnaireItemsForProfile_(visit, [
    ["最終排便", ["q1_last_bowel_movement"]],
    ["排便頻度", ["q2_bowel_frequency"]],
    ["便の硬さ", ["q3_stool_consistency"]],
    ["痛み", ["q4_pain"]],
    ["がまん", ["q5_withholding"]],
    ["薬", ["q6_med_status"]],
    ["薬の飲み忘れ・飲みにくさ", ["q6_med_adherence_flags"]],
    ["腹部症状", ["q9_abdominal_symptom"]],
    ["嘔吐", ["q10_vomiting"]],
    ["食欲・機嫌", ["q11_appetite_mood"]],
    ["血便・出血", ["q7_blood"]],
    ["便もれ", ["q8_soiling"]],
    ["薬が飲みにくい理由", ["q13_med_difficulty_reason"]],
    ["薬が飲みにくい理由の補足", ["q13_med_difficulty_other"]],
    ["薬を減らした後の変化", ["q14_change_after_less_med"]],
  ]);
}

function visitQuestionnaireItemsForProfile_(visit, definitions) {
  const questionnaire = visit.questionnaire || {};
  return definitions
    .map(([label, keys]) => [label, firstQuestionnaireValue_(questionnaire, keys)])
    .filter(([, value]) => value !== "" && value !== null && value !== undefined);
}

function firstQuestionnaireValue_(questionnaire, keys) {
  for (const key of keys) {
    const value = questionnaire[key];
    if (value !== "" && value !== null && value !== undefined) return displayQuestionnaireValue_(value);
  }
  return "";
}

function displayQuestionnaireValue_(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== "" && item !== null && item !== undefined).join("、");
  return value;
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

function htmlItem_(label, value, forcedLevel) {
  const level = forcedLevel || itemImportanceLevel_(label, value);
  return `<div class="item item--${escapeHtml_(level)}"><span class="label">${escapeHtml_(label)}</span><strong>${escapeHtml_(cellText_(value))}</strong></div>`;
}

function itemImportanceLevel_(label, value) {
  const text = cellText_(value);
  if (text === "未記録" || text === "未確認" || text === "なし") return "missing";
  if (/(今日|昨日|1日1回|痛がらない|ない|特にない|行ける|普通|やわらかい|先生に言われた量で飲んでいる|便秘薬は使っていない)/.test(text)) {
    return "good";
  }
  const combined = `${label} ${text}`;

  if (/(4日以上|強く痛がる|泣く|とても嫌がる|血|嘔吐|吐|食欲低下|ぐったり|腹部膨満|おなかが張|週1回以上ある|毎日ある|水のよう|水っぽい|下痢|トイレが詰まりそう)/.test(combined)) {
    return "warn";
  }
  if (/(2-3日前|2-3日に1回|硬い|コロコロ|とても大きい|痛|嫌がる|がまん|我慢|回避|便失禁|下着汚れ|便もれ|行きたいけれど|先生に言いにくい|ときどきある|飲みにく|忘れる|少なめ|中止|困っている|不安|学校や園で困っている|夜尿|おなかが痛い|水分が少ない|朝の時間がなく)/.test(combined)) {
    return "check";
  }
  return "meta";
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
  if (value instanceof Date) return displayDateTime_(value);
  return String(value);
}

function displayValueForKey_(key, value) {
  if (value === "" || value === null || value === undefined) return "";
  if (["date", "submitted_at", "saved_at"].includes(key)) return displayDateTime_(value);
  if (["period_start", "period_end", "birth_date", "background_updated_at"].includes(key)) return displayDate_(value);
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
    .sort((a, b) => dateSortKey_(b[dateKey]) - dateSortKey_(a[dateKey]))
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
  fullRange
    .setFontFamily("Arial")
    .setFontSize(10)
    .setVerticalAlignment("top");
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
    <base target="_top">
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
