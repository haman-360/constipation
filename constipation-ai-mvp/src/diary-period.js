(function (root) {
  const DAY_MS = 86400000;

  function parseCalendarDate(value) {
    const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:$|[ T])/.exec(String(value || ""));
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date.getTime();
  }

  function japanCalendarDate(now) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(now);
    const part = (type) => parts.find((item) => item.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  }

  function displayDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
  }

  function diaryPeriodContext(latestVisitDate, now = new Date()) {
    const today = parseCalendarDate(japanCalendarDate(now));
    const previous = parseCalendarDate(latestVisitDate);
    const elapsedDays = previous === null ? null : (today - previous) / DAY_MS;
    const validPrevious = elapsedDays !== null && elapsedDays >= 0;
    const recordedDays = validPrevious ? Math.max(1, Math.min(elapsedDays, 31)) : null;
    const end = displayDate(today);
    const start = displayDate(today - ((recordedDays || 7) - 1) * DAY_MS);
    let message;
    if (!validPrevious) {
      message = `前回受診日を確認できませんでした。直近7日間（${start}〜${end}）を目安に、確認できる期間の様子を入力してください。`;
    } else if (elapsedDays === 0) {
      message = `前回の記録は本日（${end}）です。本日1日分の様子を入力してください。`;
    } else if (elapsedDays > 31) {
      message = `前回受診は${displayDate(previous)}、本日は${end}です。${elapsedDays}日が経過しています。今回は直近31日間（${start}〜${end}）の様子を入力してください。`;
    } else {
      message = `前回受診は${displayDate(previous)}、本日は${end}です。前回受診から${elapsedDays}日が経過しています。この${elapsedDays}日間（${start}〜${end}）の様子を入力してください。`;
    }
    return { elapsedDays: validPrevious ? elapsedDays : null, recordedDays, start, end, message };
  }

  const api = { diaryPeriodContext };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ConstipationDiaryPeriod = api;
})(typeof window !== "undefined" ? window : globalThis);
