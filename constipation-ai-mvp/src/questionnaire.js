(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ConstipationMvp = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const UNKNOWN = "わからない";

  const FIELDS = {
    q1_last_bowel_movement: {
      label: "最後にうんちが出たのはいつですか？",
      summaryLabel: "最終排便",
      help: "だいたいで大丈夫です。",
      type: "single",
      required: true,
      options: ["今日", "昨日", "2-3日前", "4日以上前", UNKNOWN],
      group: "basic",
    },
    q2_bowel_frequency: {
      label: "最近、うんちはどれくらいの間隔で出ていますか？",
      summaryLabel: "最近の排便頻度",
      help: "ここ1-2週間くらいの様子で選んでください。",
      type: "single",
      required: true,
      options: ["1日に2回以上", "1日1回くらい", "2-3日に1回くらい", "4日以上あくことがある", UNKNOWN],
      group: "basic",
    },
    q3_stool_consistency: {
      label: "最近のうんちの硬さはどれに近いですか？",
      summaryLabel: "うんちの硬さ",
      help: "いつも同じでない場合は、気になるものを選んでください。",
      type: "single",
      required: true,
      options: ["硬い", "普通", "やわらかい", "水のよう", UNKNOWN],
      group: "basic",
    },
    q4_pain: {
      label: "うんちをするとき、痛がることはありますか？",
      summaryLabel: "排便時痛",
      help: "泣く、こわがる、強く嫌がる様子も含めてください。",
      type: "single",
      required: true,
      options: ["痛がらない", "少し痛がる", "強く痛がる", "泣く、またはとても嫌がる", UNKNOWN],
      group: "basic",
    },
    q5_withholding: {
      label: "うんちをがまんしているように見えることはありますか？",
      summaryLabel: "がまん",
      help: "足を閉じる、隠れる、体をこわばらせる、トイレやおむつ替えを嫌がる様子などです。",
      type: "single",
      required: true,
      options: ["ない", "ある", "強くある", UNKNOWN],
      group: "basic",
    },
    q6_med_status: {
      label: "便秘のお薬は、今どのように飲んでいますか？",
      summaryLabel: "お薬の状況",
      help: "一番近いものを選んでください。",
      type: "single",
      required: true,
      options: [
        "先生に言われた量で飲んでいる",
        "先生から調節してよいと言われていて、うんちの様子を見ながら調節している",
        "調節してよいと言われたが、最近は少なめになっている",
        "ときどき忘れる",
        "飲みにくくて残る",
        "今は中止している",
        "便秘のお薬は使っていない",
        UNKNOWN,
      ],
      group: "basic",
    },
    q6_med_adherence_flags: {
      label: "お薬について、あてはまることがあれば選んでください。",
      help: "なければ選ばずに進めます。",
      type: "multi",
      required: false,
      options: ["ときどき忘れる", "飲みにくくて残る"],
      group: "medicine",
    },
    q9_abdominal_symptom: {
      label: "お腹の張りや腹痛はありますか？",
      type: "single",
      required: true,
      options: ["ない", "少しある", "強い", UNKNOWN],
      group: "condition",
    },
    q10_vomiting: {
      label: "吐いたことはありますか？",
      type: "single",
      required: true,
      options: ["ない", "ある", UNKNOWN],
      group: "condition",
    },
    q11_appetite_mood: {
      label: "食欲や機嫌はいつも通りですか？",
      type: "single",
      required: true,
      options: ["いつも通り", "食欲が少ない", "機嫌が悪い", "食欲も機嫌も気になる", UNKNOWN],
      group: "condition",
    },
    q7_blood: {
      label: "血がつくことはありますか？",
      type: "single",
      required: true,
      options: ["ない", "紙に少しつく", "便に混じる", UNKNOWN],
      group: "stool",
    },
    q8_soiling: {
      label: "パンツやおむつに、少し便がつくことはありますか？",
      type: "single",
      required: true,
      options: ["ない", "ときどきある", "よくある", UNKNOWN],
      group: "stool",
    },
    q13_med_difficulty_reason: {
      label: "便秘薬が飲みにくい理由はありますか？",
      help: "あてはまるものを選んでください。",
      type: "multi",
      required: true,
      options: ["味が苦手", "量が多い", "飲ませるタイミングが難しい", "子どもが嫌がる", "その他", UNKNOWN],
      group: "medicine",
    },
    q13_med_difficulty_other: {
      label: "よければ、くわしく教えてください。",
      type: "text",
      required: false,
      maxLength: 100,
      group: "medicine",
    },
    q14_change_after_less_med: {
      label: "便秘薬を飲まなかったり、少なめになったりした後、うんちは変わりましたか？",
      help: "あてはまるものを選んでください。",
      type: "multi",
      required: true,
      options: ["変わらない", "硬くなった", "出る間隔があいた", "痛がるようになった", "まだわからない", UNKNOWN],
      group: "medicine",
    },
  };

  const BASIC_IDS = [
    "q1_last_bowel_movement",
    "q2_bowel_frequency",
    "q3_stool_consistency",
    "q4_pain",
    "q5_withholding",
    "q6_med_status",
  ];

  const ADDITIONAL_ORDER = [
    "q9_abdominal_symptom",
    "q10_vomiting",
    "q11_appetite_mood",
    "q7_blood",
    "q8_soiling",
    "q13_med_difficulty_reason",
    "q13_med_difficulty_other",
    "q14_change_after_less_med",
  ];

  const DIARY_FIELD_IDS = [
    "diary_days_recorded",
    "diary_bowel_days",
    "diary_longest_no_bowel_days",
    "diary_hard_days",
    "diary_pain_days",
    "diary_med_taken_days",
    "diary_note",
  ];

  const VISIT_META_FIELD_IDS = ["patient_id", "visit_id", "visit_token", "submitted_at"];

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function flags(data) {
    const canUseAdherence = data.q6_med_status && data.q6_med_status !== "便秘のお薬は使っていない" && data.q6_med_status !== UNKNOWN;
    const adherence = canUseAdherence ? asArray(data.q6_med_adherence_flags) : [];
    return {
      fourDays: data.q1_last_bowel_movement === "4日以上前" || data.q2_bowel_frequency === "4日以上あくことがある",
      watery: data.q3_stool_consistency === "水のよう",
      hardPainWithholding:
        data.q3_stool_consistency === "硬い" ||
        data.q4_pain === "強く痛がる" ||
        data.q4_pain === "泣く、またはとても嫌がる" ||
        data.q5_withholding === "ある" ||
        data.q5_withholding === "強くある",
      medDifficulty: data.q6_med_status === "飲みにくくて残る" || adherence.includes("飲みにくくて残る"),
      medLessForgotStopped:
        data.q6_med_status === "調節してよいと言われたが、最近は少なめになっている" ||
        data.q6_med_status === "ときどき忘れる" ||
        data.q6_med_status === "今は中止している" ||
        adherence.includes("ときどき忘れる"),
    };
  }

  function shouldShowMedAdherence(data) {
    return data.q6_med_status && data.q6_med_status !== "便秘のお薬は使っていない" && data.q6_med_status !== UNKNOWN;
  }

  function visibleFieldIds(data) {
    const f = flags(data);
    const ids = [...BASIC_IDS];
    if (shouldShowMedAdherence(data)) ids.push("q6_med_adherence_flags");
    if (f.fourDays || f.watery) ids.push("q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood");
    if (f.hardPainWithholding) ids.push("q7_blood", "q8_soiling");
    if (f.medDifficulty) {
      ids.push("q13_med_difficulty_reason");
      if (asArray(data.q13_med_difficulty_reason).includes("その他")) ids.push("q13_med_difficulty_other");
    }
    if (f.medLessForgotStopped) ids.push("q14_change_after_less_med");
    return ids;
  }

  function pruneHiddenAnswers(data) {
    const visible = new Set(visibleFieldIds(data));
    const next = {};
    [...BASIC_IDS, "q6_med_adherence_flags", ...ADDITIONAL_ORDER].forEach((id) => {
      if (visible.has(id) && data[id] !== undefined) next[id] = data[id];
    });
    return next;
  }

  function normalizeDiaryAnswers(input) {
    const next = {};
    const numericIds = DIARY_FIELD_IDS.filter((id) => id !== "diary_note");
    numericIds.forEach((id) => {
      if (input[id] === undefined || input[id] === "") return;
      const value = Number.parseInt(input[id], 10);
      if (Number.isFinite(value) && value >= 0) next[id] = value;
    });
    if (input.diary_note !== undefined) {
      const note = String(input.diary_note).trim();
      if (note) next.diary_note = note.slice(0, 200);
    }
    return next;
  }

  function mergeDiaryAnswers(base, diary) {
    return { ...base, ...normalizeDiaryAnswers(diary || {}) };
  }

  function normalizeVisitMeta(input) {
    const meta = {};
    const patientId = String(input.patient_id || "").replace(/\D/g, "").slice(0, 5);
    const visitToken = String(input.visit_token || "")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 12)
      .toUpperCase();
    const submittedAt = input.submitted_at ? String(input.submitted_at) : "";
    const visitId = String(input.visit_id || "")
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, 40);

    if (patientId) meta.patient_id = patientId;
    if (visitToken) meta.visit_token = visitToken;
    if (submittedAt) meta.submitted_at = submittedAt;
    if (visitId) {
      meta.visit_id = visitId;
    } else if (patientId && visitToken && submittedAt) {
      meta.visit_id = `${submittedAt.slice(0, 10).replaceAll("-", "")}-${patientId}-${visitToken}`;
    }
    return meta;
  }

  function mergeVisitMeta(base, meta) {
    return { ...base, ...normalizeVisitMeta(meta || {}) };
  }

  function normalizeMultiSelection(fieldId, current, clicked) {
    let values = new Set(asArray(current));
    values.has(clicked) ? values.delete(clicked) : values.add(clicked);

    if (fieldId === "q13_med_difficulty_reason") {
      if (clicked === UNKNOWN && values.has(UNKNOWN)) values = new Set([UNKNOWN]);
      if (clicked !== UNKNOWN && values.has(clicked)) values.delete(UNKNOWN);
    }

    if (fieldId === "q14_change_after_less_med") {
      const concrete = ["硬くなった", "出る間隔があいた", "痛がるようになった"];
      if (clicked === UNKNOWN && values.has(UNKNOWN)) values = new Set([UNKNOWN]);
      if (clicked === "まだわからない" && values.has("まだわからない")) {
        concrete.forEach((item) => values.delete(item));
        values.delete(UNKNOWN);
      }
      if (clicked === "変わらない" && values.has("変わらない")) {
        concrete.forEach((item) => values.delete(item));
        values.delete(UNKNOWN);
      }
      if (concrete.includes(clicked) && values.has(clicked)) {
        values.delete("変わらない");
        values.delete("まだわからない");
        values.delete(UNKNOWN);
      }
    }
    return Array.from(values);
  }

  function displayValue(data, fieldId) {
    if (data[fieldId] === undefined) return "未確認";
    if (Array.isArray(data[fieldId])) return data[fieldId].length ? data[fieldId].join("、") : "なし";
    return data[fieldId] || "未確認";
  }

  function medicineStatus(data) {
    switch (data.q6_med_status) {
      case "先生から調節してよいと言われていて、うんちの様子を見ながら調節している":
        return "医師指示範囲内で自己調節";
      case "調節してよいと言われたが、最近は少なめになっている":
        return "調節可と説明あり、最近は少なめ";
      case "飲みにくくて残る":
        return "内服困難あり";
      case "便秘のお薬は使っていない":
        return "便秘薬なし";
      default:
        return data.q6_med_status || "未確認";
    }
  }

  function medicineSupplement(data) {
    const parts = [];
    if (
      data.q6_med_status === "先生から調節してよいと言われていて、うんちの様子を見ながら調節している" ||
      data.q6_med_status === "調節してよいと言われたが、最近は少なめになっている"
    ) {
      parts.push("医師から調節可の説明あり");
    }
    parts.push(...asArray(data.q6_med_adherence_flags));
    if (data.q6_med_status === UNKNOWN) return "不明";
    return parts.length ? parts.join("、") : "なし";
  }

  function medChangeValue(data) {
    if (data.q6_med_status === "便秘のお薬は使っていない") return "該当なし";
    if (!flags(data).medLessForgotStopped) return "該当なし";
    return data.q14_change_after_less_med !== undefined ? displayValue(data, "q14_change_after_less_med") : "未確認";
  }

  function medDifficultyValue(data) {
    if (data.q6_med_status === "便秘のお薬は使っていない") return "該当なし";
    if (!flags(data).medDifficulty) return data.q6_med_status === UNKNOWN ? "未確認" : "該当なし";
    const base = asArray(data.q13_med_difficulty_reason);
    const withOther = base.map((item) => {
      if (item === "その他" && data.q13_med_difficulty_other) return `その他(${data.q13_med_difficulty_other})`;
      return item;
    });
    return withOther.length ? withOther.join("、") : "未確認";
  }

  function staffShareConcerns(data) {
    const concerns = [];
    if (data.q9_abdominal_symptom === "強い") concerns.push("強い腹痛・お腹の張り");
    if (data.q10_vomiting === "ある") concerns.push("嘔吐");
    if (data.q11_appetite_mood === "食欲も機嫌も気になる") concerns.push("食欲と機嫌の変化");
    return concerns;
  }

  function hasSafetyNotice(data) {
    return staffShareConcerns(data).length > 0;
  }

  function aiFollowUpItems(data) {
    const f = flags(data);
    const items = [];
    if (f.fourDays) {
      items.push("4日以上うんちが出ていない、または4日以上あくことがあるため、お腹の張り・腹痛、嘔吐、食欲・機嫌を診察で確認。");
    }
    if (f.watery) {
      items.push("水のような便あり。お腹の張り・腹痛、嘔吐、食欲・機嫌の変化をあわせて確認。");
    }
    if (f.hardPainWithholding) {
      const reasons = [];
      if (data.q3_stool_consistency === "硬い") reasons.push("硬い便");
      if (data.q4_pain === "強く痛がる" || data.q4_pain === "泣く、またはとても嫌がる") reasons.push("強い痛み");
      if (data.q5_withholding === "ある" || data.q5_withholding === "強くある") reasons.push("がまん");
      items.push(`${reasons.join("、")}があるため、出血や便が少しつく様子もあわせて確認。`);
    }
    if (data.q11_appetite_mood && data.q11_appetite_mood !== "いつも通り" && data.q11_appetite_mood !== UNKNOWN) {
      items.push("食欲・機嫌の変化があります。");
    }
    if (f.medLessForgotStopped) {
      items.push(medWorseningPhrase(data) || "実際のお薬が少なめ、飲み忘れ、または中止中。以後の硬さ、間隔、痛みの変化を確認。");
      if (data.q6_med_status === "調節してよいと言われたが、最近は少なめになっている") {
        items.push("処方量の変更や調節範囲は、この画面では判断せず診察で確認します。");
      }
    }
    if (f.medDifficulty) {
      items.push("お薬が飲みにくい可能性あり。味、量、タイミング、子どもの拒否など具体的な理由を確認。");
    }
    if (f.fourDays && f.hardPainWithholding) {
      items.push("便塞栓の有無や追加対応は、この画面では判断せず診察で確認します。");
    }
    if (hasSafetyNotice(data)) {
      items.push(`${staffShareConcerns(data).join("、")}があります。受付または医療スタッフにも共有する項目です。`);
    }
    const diaryItems = diaryFollowUpItems(data);
    items.push(...diaryItems);
    const unknownCount = BASIC_IDS.filter((id) => data[id] === UNKNOWN).length;
    if (!items.length && unknownCount >= 3) {
      items.push("保護者がわからないと回答した項目が複数あります。診察で確認できる範囲を確認。");
    }
    if (!items.length) items.push("現時点で強く追加確認する項目はありません。");
    return items;
  }

  function diaryFollowUpItems(data) {
    if (!hasDiaryData(data)) return [];
    const items = [];
    if (data.diary_longest_no_bowel_days >= 4) {
      items.push(`直近日誌で最長${data.diary_longest_no_bowel_days}日の無排便があります。問診回答とあわせて診察で確認。`);
    }
    const symptomParts = [];
    if (data.diary_hard_days > 0) symptomParts.push(`硬い便${data.diary_hard_days}日`);
    if (data.diary_pain_days > 0) symptomParts.push(`痛み${data.diary_pain_days}日`);
    if (symptomParts.length) {
      items.push(`直近日誌に${symptomParts.join("、")}があります。便の硬さ、痛み、がまんの流れを確認。`);
    }
    if (data.diary_med_taken_days !== undefined && data.diary_days_recorded !== undefined && data.diary_med_taken_days < data.diary_days_recorded) {
      items.push(`直近日誌で内服できた日は${data.diary_med_taken_days}/${data.diary_days_recorded}日です。飲めなかった理由を確認。`);
    }
    if (!items.length) items.push("直近日誌メモがあります。問診回答とあわせて診察で確認。");
    return items;
  }

  function hasDiaryData(data) {
    return DIARY_FIELD_IDS.some((id) => data[id] !== undefined && data[id] !== "");
  }

  function diaryRows(data) {
    if (!hasDiaryData(data)) return [];
    return [
      { label: "記録日数", value: data.diary_days_recorded !== undefined ? `${data.diary_days_recorded}日` : "未確認" },
      { label: "排便あり", value: data.diary_bowel_days !== undefined ? `${data.diary_bowel_days}日` : "未確認" },
      { label: "最長無排便", value: data.diary_longest_no_bowel_days !== undefined ? `${data.diary_longest_no_bowel_days}日` : "未確認" },
      { label: "硬い便", value: data.diary_hard_days !== undefined ? `${data.diary_hard_days}日` : "未確認" },
      { label: "痛み", value: data.diary_pain_days !== undefined ? `${data.diary_pain_days}日` : "未確認" },
      { label: "内服できた日", value: data.diary_med_taken_days !== undefined ? `${data.diary_med_taken_days}日` : "未確認" },
      { label: "日誌メモ", value: data.diary_note || "なし" },
    ];
  }

  function diarySummaryText(data) {
    const rows = diaryRows(data);
    if (!rows.length) return "- なし";
    return rows.map((item) => `- ${item.label}: ${item.value}`).join("\n");
  }

  function weeklySummary(data) {
    if (!hasDiaryData(data)) return [];
    const days = data.diary_days_recorded;
    const period = days !== undefined ? `${days}日間` : "直近日誌";
    const items = [];

    if (data.diary_bowel_days !== undefined) {
      items.push(`${period}で排便あり${data.diary_bowel_days}${days !== undefined ? `/${days}` : ""}日`);
    }
    if (data.diary_longest_no_bowel_days !== undefined) {
      items.push(`最長無排便${data.diary_longest_no_bowel_days}日`);
    }
    if (data.diary_hard_days !== undefined || data.diary_pain_days !== undefined) {
      const hard = data.diary_hard_days !== undefined ? `硬い便${data.diary_hard_days}日` : "硬い便未確認";
      const pain = data.diary_pain_days !== undefined ? `痛み${data.diary_pain_days}日` : "痛み未確認";
      items.push(`${hard}、${pain}`);
    }
    if (data.diary_med_taken_days !== undefined) {
      items.push(`内服できた日${data.diary_med_taken_days}${days !== undefined ? `/${days}` : ""}日`);
    }
    if (!items.length && data.diary_note) {
      items.push("日誌メモのみ記録あり");
    }
    return items;
  }

  function weeklySummaryText(data) {
    const items = weeklySummary(data);
    if (!items.length) return "- なし";
    return items.map((item) => `- ${item}`).join("\n");
  }

  function primaryConcern(data) {
    const f = flags(data);
    const safety = hasSafetyNotice(data);
    const safetyConcerns = staffShareConcerns(data);
    const stoolConcerns = buildStoolConcernPhrases(data);
    const medicineConcerns = buildMedicineConcernPhrases(data);
    const bodyConcerns = [...stoolConcerns, ...medicineConcerns];

    if (safety) {
      const body = bodyConcerns.length ? `${bodyConcerns.join("。")}。` : "追加で確認されています。";
      return `${safetyConcerns.join("、")}があります。${body}`;
    }
    if (stoolConcerns.length && medicineConcerns.length) {
      return `${stoolConcerns.join("。")}。${medicineConcerns.join("。")}。`;
    }
    if (stoolConcerns.length) {
      return `${stoolConcerns.join("。")}。`;
    }
    if (medicineConcerns.length) {
      return `${medicineConcerns.join("。")}。`;
    }
    return "今回の回答では、目立つ追加確認項目はありません。";
  }

  function buildStoolConcernPhrases(data) {
    const f = flags(data);
    const concerns = [];
    if (f.fourDays) {
      concerns.push("4日以上の無排便または排便間隔のあきがあります");
    } else if (f.watery) {
      concerns.push("水のような便があります");
    }

    const hardPainWithholding = [];
    if (data.q3_stool_consistency === "硬い") hardPainWithholding.push("硬い便");
    if (data.q4_pain === "強く痛がる" || data.q4_pain === "泣く、またはとても嫌がる") hardPainWithholding.push("強い排便時痛");
    if (data.q5_withholding === "ある" || data.q5_withholding === "強くある") hardPainWithholding.push("がまん行動");
    if (hardPainWithholding.length) {
      concerns.push(`${hardPainWithholding.join("・")}が確認されています`);
    }
    return concerns;
  }

  function buildMedicineConcernPhrases(data) {
    const concerns = medicineConcernLabels(data);
    if (!concerns.length) return [];
    const worsening = medWorseningPhrase(data);
    return [`便秘薬では${concerns.join("、")}が確認されています${worsening ? `。${worsening}` : ""}`];
  }

  function medicineConcernLabels(data) {
    const adherence = asArray(data.q6_med_adherence_flags);
    const concerns = [];
    if (data.q6_med_status === "調節してよいと言われたが、最近は少なめになっている") concerns.push("最近少なめ");
    if (data.q6_med_status === "ときどき忘れる" || adherence.includes("ときどき忘れる")) concerns.push("飲み忘れ");
    if (data.q6_med_status === "今は中止している") concerns.push("中止中");
    if (data.q6_med_status === "飲みにくくて残る" || adherence.includes("飲みにくくて残る")) concerns.push("飲みにくさ");
    return concerns;
  }

  function medWorseningPhrase(data) {
    const changes = medSpecificWorseningLabels(data);
    if (!changes.length) return "";
    return `薬が少なめ・飲み忘れ・中止のあとに${changes.join("、")}があります`;
  }

  function medSpecificWorseningLabels(data) {
    const values = asArray(data.q14_change_after_less_med);
    const labels = [];
    if (values.includes("硬くなった")) labels.push("硬便化");
    if (values.includes("出る間隔があいた")) labels.push("排便間隔延長");
    if (values.includes("痛がるようになった")) labels.push("排便時痛の変化");
    return labels;
  }

  function reviewUrgency(data) {
    const f = flags(data);
    if (hasSafetyNotice(data)) {
      return {
        level: "alert",
        label: "受付・スタッフ共有",
        message: "受付・スタッフ共有の表示対象となる体調変化が含まれます。",
      };
    }
    if (f.fourDays || f.watery || f.hardPainWithholding || f.medLessForgotStopped || f.medDifficulty) {
      return {
        level: "watch",
        label: "診察で確認",
        message: "診察時に確認したい追加情報があります。",
      };
    }
    return {
      level: "stable",
      label: "通常確認",
      message: "現時点で受付・スタッフ共有の表示対象はありません。",
    };
  }

  function generatePhysicianReview(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const followUps = aiFollowUpItems(data);
    return {
      urgency: reviewUrgency(data),
      headline: primaryConcern(data),
      stool: [
        { label: "最終排便", value: displayValue(data, "q1_last_bowel_movement") },
        { label: "頻度", value: displayValue(data, "q2_bowel_frequency") },
        { label: "硬さ", value: displayValue(data, "q3_stool_consistency") },
        { label: "痛み", value: displayValue(data, "q4_pain") },
        { label: "がまん", value: displayValue(data, "q5_withholding") },
      ],
      safety: [
        { label: "腹痛・張り", value: displayValue(data, "q9_abdominal_symptom") },
        { label: "嘔吐", value: displayValue(data, "q10_vomiting") },
        { label: "食欲・機嫌", value: displayValue(data, "q11_appetite_mood") },
      ],
      stoolConcerns: [
        { label: "出血", value: displayValue(data, "q7_blood") },
        { label: "便付着", value: displayValue(data, "q8_soiling") },
      ],
      medication: [
        { label: "状況", value: medicineStatus(data) },
        { label: "補足", value: medicineSupplement(data) },
        { label: "少なめ/忘れ/中止後", value: medChangeValue(data) },
        { label: "飲みにくさ", value: medDifficultyValue(data) },
      ],
      diary: diaryRows(data),
      weeklySummary: weeklySummary(data),
      checkItems: followUps.slice(0, 4),
      notJudged: ["診断", "便塞栓の有無", "処方量変更", "治療中止可否", "専門紹介の要否"],
      raw: data,
    };
  }

  function generateSummary(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const followUps = aiFollowUpItems(data).map((item) => `- ${item}`).join("\n");
    return `【診察前 便秘ミニサマリー】

最終排便: ${displayValue(data, "q1_last_bowel_movement")}
最近の排便頻度: ${displayValue(data, "q2_bowel_frequency")}
うんちの硬さ: ${displayValue(data, "q3_stool_consistency")}
排便時痛: ${displayValue(data, "q4_pain")}
がまん: ${displayValue(data, "q5_withholding")}

お薬:
- 状況: ${medicineStatus(data)}
- 補足: ${medicineSupplement(data)}
- 少なめ・飲み忘れ・中止後の変化: ${medChangeValue(data)}
- 飲みにくさ: ${medDifficultyValue(data)}

直近日誌:
${diarySummaryText(data)}

週次サマリー:
${weeklySummaryText(data)}

追加確認:
- お腹の張り・腹痛: ${displayValue(data, "q9_abdominal_symptom")}
- 嘔吐: ${displayValue(data, "q10_vomiting")}
- 食欲・機嫌: ${displayValue(data, "q11_appetite_mood")}
- 血がつく: ${displayValue(data, "q7_blood")}
- パンツやおむつに少し便がつく: ${displayValue(data, "q8_soiling")}

AI追加確認候補:
${followUps}

AIが判断していないこと:
- 診断
- 便塞栓の有無
- モビコールなどの処方量変更
- 治療中止可否
- 専門紹介の要否`;
  }

  function generateFacilityShare(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const review = generatePhysicianReview(data);
    return `【院内共有用 便秘問診】

確認区分: ${review.urgency.label}
概要: ${review.headline}

診察で見るポイント:
${review.checkItems.map((item) => `- ${item}`).join("\n")}

AIが判断していないこと:
- ${review.notJudged.join("\n- ")}

送信JSON:
${JSON.stringify(data, null, 2)}`;
  }

  function generatePatientMemo(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const diaryText = weeklySummary(data);
    const diarySection = diaryText.length
      ? `
最近の記録:
${diaryText.map((item) => `- ${item}`).join("\n")}
`
      : "";

    return `【便秘メモ】

今日のうんちの様子:
- 最後のうんち: ${displayValue(data, "q1_last_bowel_movement")}
- うんちの間隔: ${displayValue(data, "q2_bowel_frequency")}
- うんちの硬さ: ${displayValue(data, "q3_stool_consistency")}
- うんちのときの痛み: ${displayValue(data, "q4_pain")}
- がまんする様子: ${displayValue(data, "q5_withholding")}

お薬:
- 今の飲み方: ${medicineStatus(data)}
- 飲みにくさなど: ${medicineSupplement(data)}
${diarySection}
次に相談すること:
- お薬を続けるか、減らすか、やめるかは診察で相談します。
- 不安で自己判断しそうなときは、このメモと日誌を見て、相談したいことを整理します。

大事なこと:
- このメモでは薬の量を決めません。
- 薬を増やす、減らす、やめる、再開する判断は医師と相談します。`;
  }

  function branchMessage(fieldId, data) {
    const f = flags(data);
    if (["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"].includes(fieldId)) {
      return f.fourDays
        ? "うんちの間隔があいているため、体調について少し確認します。"
        : "水のようなうんちがあるため、体調について少し確認します。";
    }
    if (["q7_blood", "q8_soiling"].includes(fieldId)) {
      return "うんちが硬い、痛がる、がまんする様子について少し確認します。";
    }
    if (fieldId === "q13_med_difficulty_reason" || fieldId === "q13_med_difficulty_other") {
      return "お薬が飲みにくい理由を確認します。";
    }
    if (fieldId === "q14_change_after_less_med") {
      return "お薬が少なめ、飲み忘れ、中止のあとについて確認します。";
    }
    return "";
  }

  return {
    FIELDS,
    BASIC_IDS,
    ADDITIONAL_ORDER,
    DIARY_FIELD_IDS,
    VISIT_META_FIELD_IDS,
    flags,
    shouldShowMedAdherence,
    visibleFieldIds,
    pruneHiddenAnswers,
    normalizeDiaryAnswers,
    mergeDiaryAnswers,
    normalizeVisitMeta,
    mergeVisitMeta,
    weeklySummary,
    normalizeMultiSelection,
    hasSafetyNotice,
    aiFollowUpItems,
    generatePhysicianReview,
    generateSummary,
    generateFacilityShare,
    generatePatientMemo,
    branchMessage,
  };
});
