const {
  FIELDS,
  BASIC_IDS,
  visibleFieldIds,
  pruneHiddenAnswers,
  normalizeMultiSelection,
  hasSafetyNotice,
  generatePhysicianReview,
  generateSummary,
  branchMessage,
} = window.ConstipationMvp;

const SAFETY_TEXT = "強い腹痛、吐いた、食欲や機嫌がいつもと違う場合は、入力だけでなく受付または医療スタッフにもお伝えください。";

const state = {
  started: false,
  index: 0,
  answers: {},
  submitted: false,
};

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
  copySummaryButton: document.getElementById("copySummaryButton"),
};

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

    <section class="review-section">
      <h3>安全・追加確認</h3>
      <div class="review-grid">${renderReviewRows(review.safety)}</div>
      <div class="review-grid review-grid--compact">${renderReviewRows(review.stoolConcerns)}</div>
    </section>

    <section class="review-section">
      <h3>便秘薬</h3>
      <div class="review-grid review-grid--medicine">${renderReviewRows(review.medication)}</div>
    </section>

    <section class="review-section">
      <h3>診察で見るポイント</h3>
      <ul class="review-list">${renderReviewList(review.checkItems)}</ul>
    </section>

    <section class="review-section review-section--muted">
      <h3>AIが判断していないこと</h3>
      <p>${escapeHtml(review.notJudged.join(" / "))}</p>
    </section>
  `;
}

function renderIntro() {
  els.progress.hidden = true;
  els.nav.hidden = true;
  els.doctorPanel.hidden = true;
  els.screen.innerHTML = `
    <div class="intro">
      <h1>うんちの様子を教えてください</h1>
      <p>診察の前に、最近のうんちの様子を確認します。<br>
      わかる範囲で、近いものを選んでください。<br>
      薬の量をこの画面で決めることはありません。</p>
      <button id="startButton" class="button" type="button">はじめる</button>
    </div>
  `;
  document.getElementById("startButton").addEventListener("click", () => {
    state.started = true;
    state.index = 0;
    render();
  });
}

function updateProgress(flow) {
  const fieldId = currentFieldId();
  const field = FIELDS[fieldId];
  const basicPosition = BASIC_IDS.indexOf(fieldId);
  const isBasic = basicPosition !== -1;
  const additionalIds = flow.filter((id) => !BASIC_IDS.includes(id) && id !== "q6_med_adherence_flags");
  const additionalPosition = additionalIds.indexOf(fieldId);

  if (isBasic) {
    els.progressLabel.textContent = "基本確認";
    els.progressCount.textContent = `${basicPosition + 1} / ${BASIC_IDS.length}`;
    els.progressBar.style.width = `${((basicPosition + 1) / BASIC_IDS.length) * 100}%`;
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
  els.doctorPanel.hidden = true;
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
  const safe = hasSafetyNotice(state.answers);
  els.progress.hidden = true;
  els.nav.hidden = false;
  els.backButton.disabled = false;
  els.nextButton.textContent = "送信する";
  els.nextButton.disabled = false;
  els.doctorPanel.hidden = true;
  els.screen.innerHTML = `
    <div class="finish">
      <h1>入力ありがとうございました</h1>
      <p>回答内容を診察前の確認用にまとめます。</p>
      ${safe ? `<div class="notice">${SAFETY_TEXT}</div>` : ""}
      <p>薬の量や治療方針は、診察で医師が確認します。</p>
    </div>
  `;
}

function renderSubmitted() {
  const payload = pruneHiddenAnswers(state.answers);
  const review = generatePhysicianReview(payload);
  els.progress.hidden = true;
  els.nav.hidden = true;
  els.doctorPanel.hidden = false;
  els.screen.innerHTML = `
    <div class="finish">
      <h1>送信内容を作成しました</h1>
      <p>このミニサマリーは、診察前に医師または医療スタッフが確認するためのものです。ChatGPTなどに追加で判断を聞くための文章ではありません。</p>
      <p>右側または下部に、診察前確認用のダッシュボードと院内システム連携用のJSONを表示しています。</p>
      ${hasSafetyNotice(payload) ? `<div class="notice">${SAFETY_TEXT}</div>` : ""}
      <button id="restartButton" class="button button--secondary" type="button">最初から入力</button>
    </div>
  `;
  els.summaryOutput.innerHTML = renderPhysicianReview(review);
  els.summaryOutput.dataset.copyText = generateSummary(payload);
  els.jsonOutput.textContent = JSON.stringify(payload, null, 2);
  document.getElementById("restartButton").addEventListener("click", () => {
    state.started = false;
    state.index = 0;
    state.answers = {};
    state.submitted = false;
    render();
  });
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
els.copySummaryButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.summaryOutput.dataset.copyText || els.summaryOutput.textContent);
  els.copySummaryButton.textContent = "コピー済み";
  setTimeout(() => {
    els.copySummaryButton.textContent = "コピー";
  }, 1200);
});

render();
