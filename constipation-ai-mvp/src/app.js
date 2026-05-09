const {
  FIELDS,
  BASIC_IDS,
  visibleFieldIds,
  pruneHiddenAnswers,
  normalizeDiaryAnswers,
  mergeDiaryAnswers,
  normalizeVisitMeta,
  mergeVisitMeta,
  normalizeMultiSelection,
  generatePhysicianReview,
  generateSummary,
  generateFacilityShare,
  generatePatientMemo,
  generateSheetsVisitPayload,
  generateShortQrPayload,
  branchMessage,
  normalizeAgeProfile,
  questionnaireVersionForProfile,
  profileBasicIds,
} = window.ConstipationMvp;

const DEFAULT_SUBMIT_URL = "https://script.google.com/macros/s/AKfycbyIGLsSur088ftzSGgwHOuiNeIgBUq7LE2yZiyrsjtQuLE-QXeJuCeeD002m6qBoLzN/exec";
const urlParams = new URLSearchParams(window.location.search);
const STAFF_MODES = new Set(["staff", "doctor", "clinician"]);
const isStaffMode = STAFF_MODES.has(urlParams.get("mode")) || urlParams.get("staff") === "1";
const submitUrlFromParam = urlParams.get("submit_url") || urlParams.get("submitUrl") || "";
if (submitUrlFromParam) localStorage.setItem("constipation_submit_url", submitUrlFromParam);
const submitUrl = submitUrlFromParam || localStorage.getItem("constipation_submit_url") || DEFAULT_SUBMIT_URL;
const ageProfileFromUrl = urlParams.get("age_profile") || urlParams.get("profile");
const visitMetaFromUrl = normalizeVisitMeta({
  patient_id: urlParams.get("patient_id") || urlParams.get("pid"),
  visit_id: urlParams.get("visit_id") || urlParams.get("vid"),
  visit_token: urlParams.get("visit_token") || urlParams.get("token"),
  age_profile: ageProfileFromUrl,
});
let activeAgeProfile = normalizeAgeProfile(visitMetaFromUrl.age_profile);
let activeQuestionnaireVersion = questionnaireVersionForProfile(activeAgeProfile);
let profileLookupStatus = ageProfileFromUrl ? "url" : "pending";
let patientProfileData = null;

const state = {
  started: false,
  index: 0,
  answers: {
    age_profile: activeAgeProfile,
    questionnaire_version: activeQuestionnaireVersion,
  },
  diary: {},
  submitted: false,
  dashboardMode: "full",
};

function setActiveAgeProfile(profile, source) {
  activeAgeProfile = normalizeAgeProfile(profile);
  activeQuestionnaireVersion = questionnaireVersionForProfile(activeAgeProfile);
  profileLookupStatus = source || profileLookupStatus;
  state.answers.age_profile = activeAgeProfile;
  state.answers.questionnaire_version = activeQuestionnaireVersion;
}

async function loadAgeProfileFromWebApp() {
  if (ageProfileFromUrl) return;
  if (!submitUrl || !visitMetaFromUrl.patient_id) {
    profileLookupStatus = "fallback";
    return;
  }
  try {
    const url = new URL(submitUrl);
    url.searchParams.set("action", "patientProfileData");
    url.searchParams.set("patient_id", visitMetaFromUrl.patient_id);
    const response = await fetch(url.toString(), { method: "GET", mode: "cors" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || `HTTP ${response.status}`);
    patientProfileData = result;
    if (result.age_profile && result.age_profile !== "unknown") {
      setActiveAgeProfile(result.age_profile, "patientProfile");
    } else {
      profileLookupStatus = "fallback";
    }
  } catch (error) {
    profileLookupStatus = "fallback";
  }
}

const els = {
  screen: document.getElementById("screen"),
  progress: document.getElementById("progress"),
  progressLabel: document.getElementById("progressLabel"),
  progressCount: document.getElementById("progressCount"),
  progressBar: document.getElementById("progressBar"),
  nav: document.getElementById("nav"),
  backButton: document.getElementById("backButton"),
  nextButton: document.getElementById("nextButton"),
  doctorPanel: document.getElementById("doctorPanel"),
  summaryOutput: document.getElementById("summaryOutput"),
  jsonOutput: document.getElementById("jsonOutput"),
  toggleDashboardModeButton: document.getElementById("toggleDashboardModeButton"),
  copySummaryButton: document.getElementById("copySummaryButton"),
  copyFacilityShareButton: document.getElementById("copyFacilityShareButton"),
  copyJsonButton: document.getElementById("copyJsonButton"),
  printPdfButton: document.getElementById("printPdfButton"),
};

const appShell = document.querySelector(".app-shell");

function setDoctorPanelVisible(visible) {
  els.doctorPanel.hidden = !visible;
  appShell.classList.toggle("app-shell--patient-only", !visible);
}

function currentFlow() {
  return visibleFieldIds(state.answers);
}

function currentFieldId() {
  return currentFlow()[state.index];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderReviewRows(items) {
  return items
    .map(
      (item) => `
        <div class="review-row">
          <span class="review-row__label">${escapeHtml(item.label)}</span>
          <strong class="review-row__value">${escapeHtml(item.value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderReviewList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderPhysicianReview(review) {
  return `
    <section class="review-hero review-hero--${escapeHtml(review.urgency.level)}">
      <div>
        <p class="review-hero__label">${escapeHtml(review.urgency.label)}</p>
        <h2>${escapeHtml(review.headline)}</h2>
        <p>${escapeHtml(review.urgency.message)}</p>
      </div>
    </section>

    <section class="review-section">
      <h3>排便スナップショット</h3>
      <div class="review-grid review-grid--stool">${renderReviewRows(review.stool)}</div>
    </section>

    <section class="review-section review-section--detail">
      <h3>安全・追加確認</h3>
      <div class="review-grid">${renderReviewRows(review.safety)}</div>
      <div class="review-grid review-grid--compact">${renderReviewRows(review.stoolConcerns)}</div>
    </section>

    <section class="review-section review-section--detail">
      <h3>便秘薬</h3>
      <div class="review-grid review-grid--medicine">${renderReviewRows(review.medication)}</div>
    </section>

    ${
      review.diary.length
        ? `
          <section class="review-section review-section--detail">
            <h3>直近日誌</h3>
            <ul class="weekly-summary">${renderReviewList(review.weeklySummary)}</ul>
            <div class="review-grid review-grid--diary">${renderReviewRows(review.diary)}</div>
          </section>
        `
        : ""
    }

    <section class="review-section">
      <h3>診察で見るポイント</h3>
      <ul class="review-list">${renderReviewList(review.checkItems)}</ul>
    </section>

    <section class="review-section review-section--muted review-section--detail">
      <h3>AIが判断していないこと</h3>
      <p>${escapeHtml(review.notJudged.join(" / "))}</p>
    </section>
  `;
}

function renderDiaryField(id, label, suffix) {
  const value = state.diary[id] ?? "";
  return `
    <label class="diary-field">
      <span>${escapeHtml(label)}</span>
      <span class="diary-field__control">
        <input class="diary-input" type="number" min="0" max="31" inputmode="numeric" data-diary-id="${escapeHtml(id)}" value="${escapeHtml(value)}" />
        <span>${escapeHtml(suffix)}</span>
      </span>
    </label>
  `;
}

function renderDiaryForm() {
  return `
    <section class="diary-link" aria-label="直近日誌">
      <div class="diary-link__header">
        <h2>直近日誌がある場合</h2>
        <p>空欄のままでも送信できます。入力した内容だけ診察前サマリーに追加します。</p>
      </div>
      <div class="diary-grid">
        ${renderDiaryField("diary_days_recorded", "記録日数", "日")}
        ${renderDiaryField("diary_bowel_days", "排便あり", "日")}
        ${renderDiaryField("diary_longest_no_bowel_days", "最長無排便", "日")}
        ${renderDiaryField("diary_hard_days", "硬い便", "日")}
        ${renderDiaryField("diary_pain_days", "痛み", "日")}
        ${renderDiaryField("diary_med_taken_days", "内服できた日", "日")}
      </div>
      <label class="diary-note">
        <span>日誌メモ</span>
        <textarea id="diaryNoteInput" class="text-input text-input--compact" maxlength="200" placeholder="例: 園では出にくい、薬は朝だけ残ることがある">${escapeHtml(state.diary.diary_note || "")}</textarea>
      </label>
    </section>
  `;
}

function wireDiaryForm() {
  document.querySelectorAll("[data-diary-id]").forEach((input) => {
    input.addEventListener("input", () => {
      state.diary[input.dataset.diaryId] = input.value;
    });
  });
  const note = document.getElementById("diaryNoteInput");
  if (note) {
    note.addEventListener("input", () => {
      state.diary.diary_note = note.value;
    });
  }
}

function updateDashboardMode() {
  const compact = state.dashboardMode === "compact";
  els.doctorPanel.classList.toggle("is-compact", compact);
  els.toggleDashboardModeButton.textContent = compact ? "詳細表示" : "簡略表示";
  els.toggleDashboardModeButton.setAttribute("aria-pressed", String(compact));
}

function renderIntro() {
  els.progress.hidden = true;
  els.nav.hidden = true;
  setDoctorPanelVisible(false);
  const profileNotes = {
    infant: "0-1歳向けの確認項目で進めます。",
    toddler: "2-3歳向けの確認項目で進めます。",
    child: "4歳以降向けの確認項目で進めます。",
    unknown: "年齢情報を確認できなかったため、2-3歳向けの確認項目で進めます。",
  };
  const lookupNote = profileLookupStatus === "fallback"
    ? "年齢情報を確認できませんでした。このまま問診を続けられます。診察時に年齢を確認します。"
    : profileNotes[activeAgeProfile] || profileNotes.toddler;
  const backgroundSummary = patientProfileData && patientProfileData.has_background_context ? String(patientProfileData.background_summary || "") : "";
  const backgroundFlags = patientProfileData && Array.isArray(patientProfileData.background_flags) ? patientProfileData.background_flags : [];
  const canSkipUrinary = backgroundFlags.some((item) => item.includes("夜尿") || item.includes("尿失禁") || item.includes("泌尿器"));
  els.screen.innerHTML = `
    <div class="intro">
      <h1>うんちの様子を教えてください</h1>
      <p>診察の前に、最近のうんちの様子を確認します。<br>
      わかる範囲で、近いものを選んでください。<br>
      薬の量をこの画面で決めることはありません。</p>
      <p class="intro-save-note">${escapeHtml(lookupNote)}</p>
      ${
        backgroundSummary
          ? `
            <section class="intro-profile">
              <h2>登録済みの基礎疾患・併存相談</h2>
              <p>${escapeHtml(backgroundSummary)}</p>
              <label>
                <span>変更や追加がある場合だけ入力してください</span>
                <textarea id="backgroundChangeNote" class="text-input text-input--compact" maxlength="200" placeholder="例: 夜尿症の治療は終了した、発達相談が新しく始まった">${escapeHtml(state.answers.patient_background_change_note || "")}</textarea>
              </label>
            </section>
          `
          : ""
      }
      <p class="intro-save-note">最後に院内保存の完了表示が出るまで、この画面を閉じずにお待ちください。入力内容は最後にメモとしてコピーできます。</p>
      <button id="startButton" class="button" type="button">はじめる</button>
    </div>
  `;
  if (backgroundSummary) {
    state.answers.patient_background_registered = backgroundSummary;
    if (canSkipUrinary) state.answers.patient_background_skip_urinary = "1";
    const backgroundChangeNote = document.getElementById("backgroundChangeNote");
    backgroundChangeNote.addEventListener("input", () => {
      const note = backgroundChangeNote.value.trim().slice(0, 200);
      if (note) {
        state.answers.patient_background_change_note = note;
      } else {
        delete state.answers.patient_background_change_note;
      }
    });
  }
  document.getElementById("startButton").addEventListener("click", () => {
    state.started = true;
    state.index = 0;
    render();
  });
}

function updateProgress(flow) {
  const fieldId = currentFieldId();
  const field = FIELDS[fieldId];
  const basicIds = profileBasicIds(activeAgeProfile);
  const basicPosition = basicIds.indexOf(fieldId);
  const isBasic = basicPosition !== -1;
  const additionalIds = flow.filter((id) => !basicIds.includes(id) && id !== "q6_med_adherence_flags");
  const additionalPosition = additionalIds.indexOf(fieldId);

  if (isBasic) {
    els.progressLabel.textContent = "基本確認";
    els.progressCount.textContent = `${basicPosition + 1} / ${basicIds.length}`;
    els.progressBar.style.width = `${((basicPosition + 1) / basicIds.length) * 100}%`;
    return;
  }

  if (fieldId === "q6_med_adherence_flags") {
    els.progressLabel.textContent = "お薬補足";
    els.progressCount.textContent = "任意";
    els.progressBar.style.width = "100%";
    return;
  }

  els.progressLabel.textContent = field.group === "medicine" ? "お薬の追加確認" : "追加確認";
  els.progressCount.textContent = `${additionalPosition + 1} / ${additionalIds.length}`;
  els.progressBar.style.width = `${((additionalPosition + 1) / additionalIds.length) * 100}%`;
}

function renderChoices(fieldId, field) {
  const current = state.answers[fieldId];
  if (field.type === "text") {
    return `
      <textarea id="textInput" class="text-input" maxlength="${field.maxLength}" placeholder="100字以内">${escapeHtml(current || "")}</textarea>
      <div id="fieldError" class="field-error" hidden></div>
    `;
  }

  return `
    <div class="choices">
      ${field.options
        .map((option) => {
          const selected = field.type === "multi" ? Array.isArray(current) && current.includes(option) : current === option;
          return `<button class="choice ${selected ? "is-selected" : ""}" type="button" data-option="${escapeHtml(option)}">${escapeHtml(option)}</button>`;
        })
        .join("")}
    </div>
    <div id="fieldError" class="field-error" hidden></div>
  `;
}

function renderQuestion() {
  const flow = currentFlow();
  if (state.index >= flow.length) {
    renderFinish();
    return;
  }

  const fieldId = currentFieldId();
  const field = FIELDS[fieldId];
  const message = branchMessage(fieldId, state.answers);

  els.progress.hidden = false;
  els.nav.hidden = false;
  setDoctorPanelVisible(false);
  updateProgress(flow);

  els.screen.innerHTML = `
    <div class="question">
      ${message ? `<p class="question__branch">${escapeHtml(message)}</p>` : ""}
      <h1 class="question__title">${escapeHtml(field.label)}</h1>
      ${field.help ? `<p class="question__help">${escapeHtml(field.help)}</p>` : ""}
      ${renderChoices(fieldId, field)}
    </div>
  `;

  els.backButton.disabled = state.index === 0;
  els.nextButton.textContent = state.index === flow.length - 1 ? "確認へ" : "次へ";
  updateNextState();
  wireQuestionEvents(fieldId, field);
}

function wireQuestionEvents(fieldId, field) {
  if (field.type === "text") {
    const input = document.getElementById("textInput");
    input.addEventListener("input", () => {
      state.answers[fieldId] = input.value;
      updateNextState();
    });
    return;
  }

  document.querySelectorAll(".choice").forEach((button) => {
    button.addEventListener("click", () => {
      const option = button.dataset.option;
      if (field.type === "multi") {
        state.answers[fieldId] = normalizeMultiSelection(fieldId, state.answers[fieldId], option);
      } else {
        state.answers[fieldId] = option;
      }
      state.answers = pruneHiddenAnswers(state.answers);
      if (!visibleFieldIds(state.answers).includes(currentFieldId())) {
        state.index = Math.min(state.index, currentFlow().length - 1);
      }
      render();
    });
  });
}

function isAnswered(fieldId) {
  const field = FIELDS[fieldId];
  const value = state.answers[fieldId];
  if (!field.required) return true;
  if (field.type === "multi") return Array.isArray(value) && value.length > 0;
  if (field.type === "text") return !value || value.length <= field.maxLength;
  return Boolean(value);
}

function updateNextState() {
  const fieldId = currentFieldId();
  const ready = isAnswered(fieldId);
  els.nextButton.disabled = !ready;
  const error = document.getElementById("fieldError");
  if (!error) return;
  if (ready) {
    error.hidden = true;
    error.textContent = "";
  } else {
    error.hidden = false;
    error.textContent = FIELDS[fieldId].type === "multi" ? "1つ以上選んでください。" : "選択してください。";
  }
}

function renderFinish() {
  state.answers = pruneHiddenAnswers(state.answers);
  els.progress.hidden = true;
  els.nav.hidden = false;
  els.backButton.disabled = false;
  els.nextButton.textContent = "送信する";
  els.nextButton.disabled = false;
  setDoctorPanelVisible(false);
  els.screen.innerHTML = `
    <div class="finish">
      <h1>入力ありがとうございました</h1>
      <p>回答内容を診察前の確認用にまとめます。</p>
      <p>薬の量や治療方針は、診察で医師が確認します。</p>
      ${renderDiaryForm()}
    </div>
  `;
  wireDiaryForm();
}

function buildPayload() {
  return mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(state.answers), normalizeDiaryAnswers(state.diary)), {
    ...visitMetaFromUrl,
    age_profile: activeAgeProfile,
    questionnaire_version: activeQuestionnaireVersion,
    submitted_at: new Date().toISOString(),
  });
}

function renderSubmitted() {
  const payload = buildPayload();
  const review = generatePhysicianReview(payload);
  const patientMemo = generatePatientMemo(payload);
  const shortQrPayload = generateShortQrPayload(payload);
  const sheetsPayload = generateSheetsVisitPayload(payload);
  const canAutoSave = Boolean(submitUrl && sheetsPayload.patient_id && sheetsPayload.visit_token);
  const initialSubmitMessage = canAutoSave
    ? "院内保存を準備しています。"
    : submitUrl
      ? "患者IDまたは来院トークンがURLにないため、院内保存は行いません。URL/QR作成ページから患者ID入りURLで開いてください。"
      : "この端末では院内保存URLが未設定です。必要時は回答コードまたはJSONを使用します。";
  els.progress.hidden = true;
  els.nav.hidden = true;
  setDoctorPanelVisible(isStaffMode);
  updateDashboardMode();
  els.screen.innerHTML = `
    <div class="finish finish--submitted">
      <h1>送信内容を作成しました</h1>
      <p>入力内容は診察前確認のために使います。薬の量や治療方針は診察で医師が確認します。</p>
      ${isStaffMode ? `<p>医療者確認用のダッシュボードを表示しています。院内システム連携用のJSONは必要時に開けます。</p>` : ""}
      <section id="submitStatusPanel" class="submit-status submit-status--floating submit-status--pending" aria-live="assertive">
        <h2>院内保存</h2>
        <p id="submitStatusText">${initialSubmitMessage}</p>
        <p id="submitStatusHelp" class="submit-status__help">${canAutoSave ? "保存が完了するまで、この画面を閉じずにお待ちください。" : "必要な場合は、この画面を受付または医師に見せてください。"}</p>
        ${canAutoSave ? `<button id="retrySubmitButton" class="button button--secondary button--small" type="button" hidden>再送信</button>` : ""}
      </section>
      <section class="patient-memo">
        <div class="patient-memo__header">
          <h2>患者用メモ</h2>
          <button id="copyPatientMemoButton" class="button button--secondary button--small" type="button">メモコピー</button>
        </div>
        <p>このメモは、あとで相談内容を思い出すためのものです。薬の量を決めるものではありません。</p>
        <pre class="patient-memo__preview">${escapeHtml(patientMemo)}</pre>
      </section>
      <section class="patient-memo">
        <div class="patient-memo__header">
          <h2>回答コード</h2>
          <button id="copyShortQrButton" class="button button--secondary button--small" type="button">コードコピー</button>
        </div>
        <p>院内で必要になった場合に読み取り用QRへ変換できる短い形式です。長いメモや医療判断は含みません。</p>
        <pre class="patient-memo__preview">${escapeHtml(shortQrPayload)}</pre>
      </section>
      <button id="restartButton" class="button button--secondary" type="button">最初から入力</button>
    </div>
  `;
  els.summaryOutput.innerHTML = renderPhysicianReview(review);
  els.summaryOutput.dataset.copyText = generateSummary(payload);
  els.summaryOutput.dataset.facilityShareText = generateFacilityShare(payload);
  els.jsonOutput.textContent = JSON.stringify(sheetsPayload, null, 2);
  wireSubmitStatus(sheetsPayload);
  document.getElementById("copyPatientMemoButton").addEventListener("click", async (event) => {
    await copyText(event.currentTarget, patientMemo, "メモコピー");
  });
  document.getElementById("copyShortQrButton").addEventListener("click", async (event) => {
    await copyText(event.currentTarget, shortQrPayload, "コードコピー");
  });
document.getElementById("restartButton").addEventListener("click", () => {
    state.started = false;
    state.index = 0;
    state.answers = {
      age_profile: activeAgeProfile,
      questionnaire_version: activeQuestionnaireVersion,
    };
    state.diary = {};
    state.submitted = false;
    state.dashboardMode = "full";
    render();
  });
}


function wireSubmitStatus(sheetsPayload) {
  if (!submitUrl || !sheetsPayload.patient_id || !sheetsPayload.visit_token) return;
  const retryButton = document.getElementById("retrySubmitButton");
  if (retryButton) {
    retryButton.addEventListener("click", () => submitVisitToAppsScript(sheetsPayload));
  }
  submitVisitToAppsScript(sheetsPayload);
}

async function submitVisitToAppsScript(sheetsPayload) {
  const statusPanel = document.getElementById("submitStatusPanel");
  const statusText = document.getElementById("submitStatusText");
  const statusHelp = document.getElementById("submitStatusHelp");
  const retryButton = document.getElementById("retrySubmitButton");
  if (!statusText || !submitUrl) return;
  if (!sheetsPayload.patient_id || !sheetsPayload.visit_token) {
    statusText.textContent = "患者IDまたは来院トークンがURLにないため、院内保存は行いません。URL/QR作成ページから患者ID入りURLで開いてください。";
    statusText.className = "submit-status__text submit-status__text--error";
    if (statusHelp) statusHelp.textContent = "必要な場合は、この画面を受付または医師に見せてください。";
    setSubmitStatusPanelState(statusPanel, "error");
    return;
  }

  statusText.textContent = "院内保存中です。このままお待ちください。";
  statusText.className = "submit-status__text submit-status__text--pending";
  if (statusHelp) statusHelp.textContent = "保存が完了するまで、この画面を閉じないでください。";
  setSubmitStatusPanelState(statusPanel, "pending");
  if (retryButton) retryButton.hidden = true;

  try {
    const result = await postVisitWithReadableResponse_(sheetsPayload);
    statusText.textContent = `院内保存が完了しました。画面を閉じても大丈夫です。来院ID: ${result.visit_id || sheetsPayload.visit_id || "未設定"}`;
    statusText.className = "submit-status__text submit-status__text--success";
    if (statusHelp) statusHelp.textContent = "必要な場合は、患者用メモをコピーしてご自身用に保存できます。";
    setSubmitStatusPanelState(statusPanel, "success");
  } catch (error) {
    try {
      postVisitWithHiddenForm_(sheetsPayload);
      statusText.textContent = "院内保存リクエストを送信しました。画面はまだ閉じず、受付または医師に確認してください。";
      statusText.className = "submit-status__text submit-status__text--success";
      if (statusHelp) statusHelp.textContent = "保存結果は院内で確認します。必要な場合は、患者用メモをコピーできます。";
      setSubmitStatusPanelState(statusPanel, "success");
    } catch (fallbackError) {
      statusText.textContent = `院内保存に失敗しました。回答コードまたはJSONで確認できます。詳細: ${fallbackError.message || error.message}`;
      statusText.className = "submit-status__text submit-status__text--error";
      if (statusHelp) statusHelp.textContent = "この画面を閉じず、受付または医師に見せてください。";
      setSubmitStatusPanelState(statusPanel, "error");
      if (retryButton) retryButton.hidden = false;
    }
  }
}

function setSubmitStatusPanelState(panel, stateName) {
  if (!panel) return;
  panel.classList.toggle("submit-status--pending", stateName === "pending");
  panel.classList.toggle("submit-status--success", stateName === "success");
  panel.classList.toggle("submit-status--error", stateName === "error");
}

async function postVisitWithReadableResponse_(sheetsPayload) {
  const response = await fetch(submitUrl, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(sheetsPayload),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || `HTTP ${response.status}`);
  }
  return result;
}

function postVisitWithHiddenForm_(sheetsPayload) {
  const iframeName = "appsScriptSubmitFrame";
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.hidden = true;
    document.body.appendChild(iframe);
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = submitUrl;
  form.target = iframeName;
  form.hidden = true;

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "payload";
  input.value = JSON.stringify(sheetsPayload);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function goNext() {
  if (!state.started) return;
  if (state.index >= currentFlow().length) {
    state.submitted = true;
    render();
    return;
  }
  if (!isAnswered(currentFieldId())) {
    updateNextState();
    return;
  }
  state.answers = pruneHiddenAnswers(state.answers);
  state.index += 1;
  render();
}

function goBack() {
  if (state.index <= 0) return;
  if (state.index >= currentFlow().length) {
    state.index = currentFlow().length - 1;
  } else {
    state.index -= 1;
  }
  render();
}

function render() {
  if (!state.started) {
    renderIntro();
  } else if (state.submitted) {
    renderSubmitted();
  } else {
    renderQuestion();
  }
}

els.nextButton.addEventListener("click", goNext);
els.backButton.addEventListener("click", goBack);
els.toggleDashboardModeButton.addEventListener("click", () => {
  state.dashboardMode = state.dashboardMode === "compact" ? "full" : "compact";
  updateDashboardMode();
});

async function copyText(button, text, defaultLabel) {
  await navigator.clipboard.writeText(text);
  button.textContent = "コピー済み";
  setTimeout(() => {
    button.textContent = defaultLabel;
  }, 1200);
}

els.copySummaryButton.addEventListener("click", async () => {
  await copyText(els.copySummaryButton, els.summaryOutput.dataset.copyText || els.summaryOutput.textContent, "サマリーコピー");
});

els.copyFacilityShareButton.addEventListener("click", async () => {
  await copyText(els.copyFacilityShareButton, els.summaryOutput.dataset.facilityShareText || els.summaryOutput.textContent, "院内共有コピー");
});

els.copyJsonButton.addEventListener("click", async (event) => {
  await copyText(els.copyJsonButton, els.jsonOutput.textContent, "JSONコピー");
});

els.printPdfButton.addEventListener("click", () => {
  window.print();
});

async function boot() {
  await loadAgeProfileFromWebApp();
  render();
}

boot();
