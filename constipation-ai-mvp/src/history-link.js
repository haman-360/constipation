const els = {
  patientId: document.getElementById("patientIdInput"),
  limit: document.getElementById("limitInput"),
  webAppUrl: document.getElementById("webAppUrlInput"),
  copyDoctorButton: document.getElementById("copyDoctorButton"),
  copyHistoryButton: document.getElementById("copyHistoryButton"),
  copyContextButton: document.getElementById("copyContextButton"),
  doctorUrlOutput: document.getElementById("doctorUrlOutput"),
  historyUrlOutput: document.getElementById("historyUrlOutput"),
  contextUrlOutput: document.getElementById("contextUrlOutput"),
  doctorOpenLink: document.getElementById("doctorOpenLink"),
  historyOpenLink: document.getElementById("historyOpenLink"),
  contextOpenLink: document.getElementById("contextOpenLink"),
  message: document.getElementById("historyToolMessage"),
};

function sanitizePatientId(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 12);
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

function buildActionUrl(action) {
  const webAppUrl = normalizeWebAppUrl(els.webAppUrl.value);
  const patientId = sanitizePatientId(els.patientId.value);
  const limit = normalizeLimit(els.limit.value);
  if (!webAppUrl || !patientId) return "";
  const url = new URL(webAppUrl);
  url.searchParams.set("action", action);
  url.searchParams.set("patient_id", patientId);
  url.searchParams.set("limit", limit);
  return url.toString();
}

function updateOutput() {
  els.patientId.value = sanitizePatientId(els.patientId.value);
  els.limit.value = normalizeLimit(els.limit.value);
  const webAppUrl = normalizeWebAppUrl(els.webAppUrl.value);
  const doctorUrl = buildActionUrl("doctorHistory");
  const historyUrl = buildActionUrl("patientHistory");
  const contextUrl = buildActionUrl("chatGPTContext");
  const ready = Boolean(doctorUrl && historyUrl && contextUrl);

  els.copyDoctorButton.disabled = !ready;
  els.copyHistoryButton.disabled = !ready;
  els.copyContextButton.disabled = !ready;
  els.doctorUrlOutput.textContent = doctorUrl || "患者IDとWeb App URLを入力してください。";
  els.historyUrlOutput.textContent = historyUrl || "患者IDとWeb App URLを入力してください。";
  els.contextUrlOutput.textContent = contextUrl || "患者IDとWeb App URLを入力してください。";
  els.doctorOpenLink.href = doctorUrl || "#";
  els.historyOpenLink.href = historyUrl || "#";
  els.contextOpenLink.href = contextUrl || "#";
  els.doctorOpenLink.classList.toggle("is-disabled", !ready);
  els.historyOpenLink.classList.toggle("is-disabled", !ready);
  els.contextOpenLink.classList.toggle("is-disabled", !ready);

  if (!els.webAppUrl.value.trim()) {
    els.message.textContent = "Web App URLを入力してください。";
  } else if (!webAppUrl) {
    els.message.textContent = "Web App URLの形式を確認してください。";
  } else if (!els.patientId.value) {
    els.message.textContent = "患者IDを入力してください。";
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

els.webAppUrl.value = localStorage.getItem("constipation_web_app_url") || "";

[els.patientId, els.limit, els.webAppUrl].forEach((input) => {
  input.addEventListener("input", () => {
    if (input === els.webAppUrl) localStorage.setItem("constipation_web_app_url", els.webAppUrl.value);
    updateOutput();
  });
});

els.copyDoctorButton.addEventListener("click", () => copyText(buildActionUrl("doctorHistory"), els.copyDoctorButton, "医師用URLコピー済み"));
els.copyHistoryButton.addEventListener("click", () => copyText(buildActionUrl("patientHistory"), els.copyHistoryButton, "履歴URLコピー済み"));
els.copyContextButton.addEventListener("click", () => copyText(buildActionUrl("chatGPTContext"), els.copyContextButton, "ChatGPT用URLコピー済み"));

updateOutput();
