const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { diaryPeriodContext } = require('../src/diary-period');

const now = new Date('2026-10-15T03:00:00Z');
test('前回受診から14日間を、前回受診の翌日から本日までで案内する', () => {
  const period = diaryPeriodContext('2026-10-01 09:30', now);
  assert.equal(period.elapsedDays, 14);
  assert.equal(period.recordedDays, 14);
  assert.equal(period.start, '2026/10/2');
  assert.equal(period.end, '2026/10/15');
  assert.match(period.message, /この14日間/);
});
test('31日超は経過日数と直近31日の対象期間を区別する', () => {
  const period = diaryPeriodContext('2026-08-01', now);
  assert.equal(period.elapsedDays, 75);
  assert.equal(period.recordedDays, 31);
  assert.equal(period.start, '2026/9/15');
  assert.match(period.message, /75日.*直近31日間/);
});
test('同日、未取得、不正日付、未来の日付で負数や誤った経過日数を出さない', () => {
  assert.equal(diaryPeriodContext('2026-10-15', now).recordedDays, 1);
  for (const value of ['', undefined, '未記録', '2026-02-30', '2026-13-01', '2026-10-16']) {
    const period = diaryPeriodContext(value, now);
    assert.equal(period.elapsedDays, null);
    assert.equal(period.recordedDays, null);
    assert.match(period.message, /確認できませんでした/);
  }
});
test('端末のタイムゾーンによらず日本の日付を使い、月末・年末・うるう年を計算する', () => {
  assert.equal(diaryPeriodContext('2026/10/14', new Date('2026-10-14T15:00:00Z')).elapsedDays, 1);
  assert.equal(diaryPeriodContext('2025-12-31', new Date('2026-01-01T03:00:00Z')).elapsedDays, 1);
  assert.equal(diaryPeriodContext('2024-02-28', new Date('2024-03-01T03:00:00Z')).elapsedDays, 2);
});

function appContext() {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', dataset: {}, classList: { toggle() {} },
      addEventListener() {}, setAttribute() {},
    });
    return elements.get(id);
  };
  const context = vm.createContext({
    window: { ConstipationMvp: require('../src/questionnaire'), ConstipationDiaryPeriod: {
      diaryPeriodContext: (date) => diaryPeriodContext(date, now),
    }, location: { search: '?age_profile=child&patient_id=00001' } },
    document: { getElementById: element, querySelectorAll: () => [], querySelector: element },
    localStorage: { getItem: () => null }, URL, URLSearchParams, Date, Set, console,
    fetch: async () => ({ ok: true, json: async () => ({ ok: true, age_profile: 'toddler', latest_visit_date: '2026-10-01' }) }),
  });
  const source = fs.readFileSync(require.resolve('../src/app.js'), 'utf8').replace(/boot\(\);\s*$/, '');
  vm.runInContext(source, context);
  return { context, element };
}
test('プロフィール指定時も受診日を取得し、日数を補助入力するが患者の入力は保持する', async () => {
  const { context, element } = appContext();
  await vm.runInContext('loadAgeProfileFromWebApp()', context);
  assert.equal(vm.runInContext('activeAgeProfile', context), 'child');
  vm.runInContext('renderFinish()', context);
  assert.equal(vm.runInContext('state.diary.diary_days_recorded', context), 14);
  assert.match(element('screen').innerHTML, /診察前に、うんちとお薬の経過を入力してください/);
  assert.match(element('screen').innerHTML, /この14日間/);
  assert.match(element('screen').innerHTML, /1日に何回出ても「1日」/);
  vm.runInContext('state.diary.diary_days_recorded = "7"; renderFinish()', context);
  assert.equal(vm.runInContext('state.diary.diary_days_recorded', context), '7');
  vm.runInContext('state.diary.diary_days_recorded = ""; renderFinish()', context);
  assert.equal(vm.runInContext('state.diary.diary_days_recorded', context), '');
});
test('履歴取得失敗時は記録日数を推測して補助入力しない', async () => {
  const { context, element } = appContext();
  context.fetch = async () => { throw new Error('network unavailable'); };
  await vm.runInContext('loadAgeProfileFromWebApp()', context);
  vm.runInContext('renderFinish()', context);
  assert.equal(vm.runInContext('state.diary.diary_days_recorded', context), undefined);
  assert.match(element('screen').innerHTML, /直近7日間/);
});
