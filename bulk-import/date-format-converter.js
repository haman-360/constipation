(function initDateFormatConverter(root) {
  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function isValidDateParts(year, month, day, hour, minute, second) {
    if (![year, month, day, hour, minute, second].every(Number.isFinite)) return false;
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return false;
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function normalizeDateCell(value) {
    const original = String(value ?? "");
    const text = original.normalize("NFKC").trim();
    const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
    if (!match) return { value: original, changed: false, invalidDate: false };

    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const day = Number.parseInt(match[3], 10);
    const hasTime = match[4] !== undefined;
    const hour = hasTime ? Number.parseInt(match[4], 10) : 0;
    const minute = hasTime ? Number.parseInt(match[5], 10) : 0;
    const second = match[6] === undefined ? 0 : Number.parseInt(match[6], 10);

    if (!isValidDateParts(year, month, day, hour, minute, second)) {
      return { value: original, changed: false, invalidDate: true };
    }

    let normalized = `${year}-${pad2(month)}-${pad2(day)}`;
    if (hasTime) {
      normalized += ` ${pad2(hour)}:${pad2(minute)}`;
      if (match[6] !== undefined) normalized += `:${pad2(second)}`;
    }

    return { value: normalized, changed: normalized !== original, invalidDate: false };
  }

  function convertTsvDateFormat(input) {
    const text = String(input ?? "");
    let changedCells = 0;
    let invalidCells = 0;
    const output = text
      .split(/\n/)
      .map((line) =>
        line
          .split("\t")
          .map((cell) => {
            const result = normalizeDateCell(cell);
            if (result.changed) changedCells += 1;
            if (result.invalidDate) invalidCells += 1;
            return result.value;
          })
          .join("\t"),
      )
      .join("\n");

    return { output, changedCells, invalidCells };
  }

  function setupBrowserUi() {
    const els = {
      input: document.getElementById("tsvInput"),
      output: document.getElementById("tsvOutput"),
      convert: document.getElementById("convertButton"),
      copy: document.getElementById("copyButton"),
      clear: document.getElementById("clearButton"),
      message: document.getElementById("converterMessage"),
    };
    if (!els.input || !els.output || !els.convert || !els.copy || !els.clear || !els.message) return;

    function setMessage(text) {
      els.message.textContent = text;
    }

    els.convert.addEventListener("click", () => {
      const result = convertTsvDateFormat(els.input.value);
      els.output.value = result.output;
      const invalidText = result.invalidCells ? ` 不正な日付らしいセル ${result.invalidCells} 件はそのまま残しました。` : "";
      setMessage(`${result.changedCells} 件の日付セルを変換しました。${invalidText}`);
    });

    els.copy.addEventListener("click", async () => {
      if (!els.output.value) {
        setMessage("先に変換してください。");
        return;
      }
      try {
        await navigator.clipboard.writeText(els.output.value);
        setMessage("変換後TSVをコピーしました。Google Sheetsへ貼り付けできます。");
      } catch (error) {
        setMessage("コピーできませんでした。出力欄を選択してコピーしてください。");
      }
    });

    els.clear.addEventListener("click", () => {
      els.input.value = "";
      els.output.value = "";
      setMessage("");
      els.input.focus();
    });
  }

  const api = { normalizeDateCell, convertTsvDateFormat };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.DateFormatConverter = api;
  if (typeof document !== "undefined") setupBrowserUi();
})(typeof globalThis !== "undefined" ? globalThis : window);
