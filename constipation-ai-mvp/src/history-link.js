const els = {
  patientId: document.getElementById("patientIdInput"),
  limit: document.getElementById("limitInput"),
  webAppUrl: document.getElementById("webAppUrlInput"),
  copyEntryButton: document.getElementById("copyEntryButton"),
  copyProfileButton: document.getElementById("copyProfileButton"),
  copyDoctorButton: document.getElementById("copyDoctorButton"),
  copyHistoryButton: document.getElementById("copyHistoryButton"),
  copyPreVisitContextButton: document.getElementById("copyPreVisitContextButton"),
  copyTreatmentContextButton: document.getElementById("copyTreatmentContextButton"),
  entryUrlOutput: document.getElementById("entryUrlOutput"),
  profileUrlOutput: document.getElementById("profileUrlOutput"),
  doctorUrlOutput: document.getElementById("doctorUrlOutput"),
  historyUrlOutput: document.getElementById("historyUrlOutput"),
  preVisitContextUrlOutput: document.getElementById("preVisitContextUrlOutput"),
  treatmentContextUrlOutput: document.getElementById("treatmentContextUrlOutput"),
  entryOpenLink: document.getElementById("entryOpenLink"),
  profileOpenLink: document.getElementById("profileOpenLink"),
  doctorOpenLink: document.getElementById("doctorOpenLink"),
  historyOpenLink: document.getElementById("historyOpenLink"),
  preVisitContextOpenLink: document.getElementById("preVisitContextOpenLink"),
  treatmentContextOpenLink: document.getElementById("treatmentContextOpenLink"),
  message: document.getElementById("historyToolMessage"),
};

const DEFAULT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyIGLsSur088ftzSGgwHOuiNeIgBUq7LE2yZiyrsjtQuLE-QXeJuCeeD002m6qBoLzN/exec";

function sanitizePatientId(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 5);
}

function normalizeLimit(value) {
  const limit = Number.parseInt(value, 10);
  if (!Number.isFinite(limit) || limit < 1) return "5";
  return String(Math.min(limit, 20));
}

function normalizeWebAppUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch (error) {
    return "";
  }
}

function buildActionUrl(action, extraParams = {}) {
  const webAppUrl = normalizeWebAppUrl(els.webAppUrl.value);
  const patientId = sanitizePatientId(els.patientId.value);
  const limit = normalizeLimit(els.limit.value);
  if (!webAppUrl || patientId.length !== 5) return "";
  const url = new URL(webAppUrl);
  url.searchParams.set("action", action);
  url.searchParams.set("patient_id", patientId);
  url.searchParams.set("limit", limit);
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  return url.toString();
}

function updateOutput() {
  els.patientId.value = sanitizePatientId(els.patientId.value);
  els.limit.value = normalizeLimit(els.limit.value);
  const webAppUrl = normalizeWebAppUrl(els.webAppUrl.value);
  const entryUrl = buildActionUrl("doctorEntry");
  const profileUrl = buildActionUrl("patientProfile");
  const doctorUrl = buildActionUrl("doctorHistory");
  const historyUrl = buildActionUrl("patientHistory");
  const preVisitContextUrl = buildActionUrl("chatGPTContext", { mode: "preVisit" });
  const treatmentContextUrl = buildActionUrl("chatGPTContext", { mode: "treatmentReview" });
  const ready = Boolean(entryUrl && profileUrl && doctorUrl && historyUrl && preVisitContextUrl && treatmentContextUrl);

  els.copyEntryButton.disabled = !ready;
  els.copyProfileButton.disabled = !ready;
  els.copyDoctorButton.disabled = !ready;
  els.copyHistoryButton.disabled = !ready;
  els.copyPreVisitContextButton.disabled = !ready;
  els.copyTreatmentContextButton.disabled = !ready;
  els.entryUrlOutput.textContent = entryUrl || "患者IDとWeb App URLを入力してください。";
  els.profileUrlOutput.textContent = profileUrl || "患者IDとWeb App URLを入力してください。";
  els.doctorUrlOutput.textContent = doctorUrl || "患者IDとWeb App URLを入力してください。";
  els.historyUrlOutput.textContent = historyUrl || "患者IDとWeb App URLを入力してください。";
  els.preVisitContextUrlOutput.textContent = preVisitContextUrl || "患者IDとWeb App URLを入力してください。";
  els.treatmentContextUrlOutput.textContent = treatmentContextUrl || "患者IDとWeb App URLを入力してください。";
  els.entryOpenLink.href = entryUrl || "#";
  els.profileOpenLink.href = profileUrl || "#";
  els.doctorOpenLink.href = doctorUrl || "#";
  els.historyOpenLink.href = historyUrl || "#";
  els.preVisitContextOpenLink.href = preVisitContextUrl || "#";
  els.treatmentContextOpenLink.href = treatmentContextUrl || "#";
  els.entryOpenLink.classList.toggle("is-disabled", !ready);
  els.profileOpenLink.classList.toggle("is-disabled", !ready);
  els.doctorOpenLink.classList.toggle("is-disabled", !ready);
  els.historyOpenLink.classList.toggle("is-disabled", !ready);
  els.preVisitContextOpenLink.classList.toggle("is-disabled", !ready);
  els.treatmentContextOpenLink.classList.toggle("is-disabled", !ready);

  if (!els.webAppUrl.value.trim()) {
    els.message.textContent = "Web App URLを入力してください。";
  } else if (!webAppUrl) {
    els.message.textContent = "Web App URLの形式を確認してください。";
  } else if (els.patientId.value.length !== 5) {
    els.message.textContent = "患者IDは5桁で入力してください。";
  } else {
    els.message.textContent = "";
  }
}

async function copyText(text, button, doneLabel) {
  if (!text) {
    els.message.textContent = "患者IDとWeb App URLを入力してください。";
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    fallbackCopyText(text);
  }
  const original = button.textContent;
  button.textContent = doneLabel;
  els.message.textContent = "URLをコピーしました。";
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

els.webAppUrl.value = localStorage.getItem("constipation_web_app_url") || DEFAULT_WEB_APP_URL;

[els.patientId, els.limit, els.webAppUrl].forEach((input) => {
  input.addEventListener("input", () => {
    if (input === els.webAppUrl) localStorage.setItem("constipation_web_app_url", els.webAppUrl.value);
    updateOutput();
  });
});

els.copyEntryButton.addEventListener("click", () => copyText(buildActionUrl("doctorEntry"), els.copyEntryButton, "医師入力URLコピー済み"));
els.copyProfileButton.addEventListener("click", () => copyText(buildActionUrl("patientProfile"), els.copyProfileButton, "患者台帳URLコピー済み"));
els.copyDoctorButton.addEventListener("click", () => copyText(buildActionUrl("doctorHistory"), els.copyDoctorButton, "医師用URLコピー済み"));
els.copyHistoryButton.addEventListener("click", () => copyText(buildActionUrl("patientHistory"), els.copyHistoryButton, "履歴URLコピー済み"));
els.copyPreVisitContextButton.addEventListener("click", () => copyText(buildActionUrl("chatGPTContext", { mode: "preVisit" }), els.copyPreVisitContextButton, "診察前整理URLコピー済み"));
els.copyTreatmentContextButton.addEventListener("click", () => copyText(buildActionUrl("chatGPTContext", { mode: "treatmentReview" }), els.copyTreatmentContextButton, "治療方針検討URLコピー済み"));

updateOutput();
