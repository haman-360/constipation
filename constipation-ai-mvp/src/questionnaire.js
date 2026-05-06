(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ConstipationMvp = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const UNKNOWN = "わからない";
  const AGE_PROFILES = ["infant", "toddler", "child", "unknown"];
  const QUESTIONNAIRE_VERSIONS = {
    infant: "infant-prototype-v1",
    toddler: "toddler-mvp-v1",
    child: "child-prototype-v1",
    unknown: "toddler-mvp-v1",
  };

  const TODDLER_FIELDS = {
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
      options: ["硬い", "普通（バナナくらい）", "やわらかい", "水のよう（下痢に近い）", UNKNOWN],
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

  const INFANT_FIELDS = {
    i1_last_bowel_movement: {
      label: "最後にうんちが出たのはいつですか？",
      summaryLabel: "最終排便",
      help: "だいたいで大丈夫です。",
      type: "single",
      required: true,
      options: ["今日", "昨日", "2-3日前", "4日以上前", UNKNOWN],
      group: "basic",
    },
    i2_stool_consistency: {
      label: "うんちの様子はどれに近いですか？",
      summaryLabel: "便性状",
      type: "single",
      required: true,
      options: ["やわらかい", "普通", "硬い", "コロコロ", "水っぽい", "細い便が続く", UNKNOWN],
      group: "basic",
    },
    i3_stool_behavior: {
      label: "うんちのときの様子を教えてください。",
      summaryLabel: "排便時の様子",
      type: "multi",
      required: true,
      options: ["普段どおり", "いきむ", "泣く、痛がる", "顔を赤くして苦しそう", "出そうで出ない", "血がつくことがある"],
      group: "basic",
    },
    i4_onset: {
      label: "便秘はいつごろから気になりますか？",
      summaryLabel: "気になる時期",
      type: "single",
      required: true,
      options: ["生まれてすぐから", "生後数週間以内から", "ミルクや母乳の変化後から", "離乳食を始めたころから", "最近になってから", UNKNOWN],
      group: "basic",
    },
    i5_birth_check: {
      label: "出生時や1か月健診で異常を指摘されたことはありますか？",
      summaryLabel: "出生時・1か月健診",
      type: "single",
      required: true,
      options: ["ない", "ある", UNKNOWN],
      group: "basic",
    },
    i5_birth_check_note: {
      label: "差し支えなければ、指摘された内容を入力してください。",
      type: "text",
      required: false,
      maxLength: 120,
      group: "basic",
    },
    i6_feeding: {
      label: "ミルク・母乳・食事の様子を教えてください。",
      summaryLabel: "哺乳・食事",
      type: "multi",
      required: true,
      options: ["よく飲む、よく食べる", "飲む量、食べる量が少ない", "最近飲む量、食べる量が減った", "離乳食を始めた、または内容が変わった", "吐くことが増えた"],
      group: "condition",
    },
    i7_milk_dairy: {
      label: "ミルク、母乳、牛乳・乳製品との関係で気になることはありますか？",
      summaryLabel: "ミルク・乳製品との関係",
      type: "multi",
      required: true,
      options: ["特に気にならない", "ミルクを変えてから便が硬くなった気がする", "牛乳・乳製品をとると便やおなかの調子が変わる気がする", "母乳中で、母が牛乳・乳製品を多くとると便やおなかの調子が変わる気がする", "湿疹、血便、吐き戻しなども気になる", UNKNOWN],
      group: "condition",
    },
    i8_abdominal_condition: {
      label: "おなかの様子で気になることはありますか？",
      summaryLabel: "おなか・全身状態",
      type: "multi",
      required: true,
      options: ["特に気にならない", "張っているように見える", "触ると嫌がる", "吐くことがある", "機嫌が悪い時間が増えた", "発熱がある"],
      group: "condition",
    },
    i9_growth: {
      label: "体重や成長について気になることはありますか？",
      summaryLabel: "体重・成長",
      type: "single",
      required: true,
      options: ["特に気にならない", "体重の増えが悪いと言われた", "最近体重が増えにくい気がする", "健診で相談するように言われた", UNKNOWN],
      group: "condition",
    },
    i10_constipation_support: {
      label: "便秘に対して使っているものはありますか？",
      summaryLabel: "薬・処置",
      type: "multi",
      required: true,
      options: ["なし", "医師から処方された薬", "市販薬", "浣腸", "綿棒刺激", "その他"],
      group: "medicine",
    },
    i10_support_note: {
      label: "使う頻度や使った後の様子を入力してください。",
      type: "text",
      required: false,
      maxLength: 160,
      group: "medicine",
    },
  };

  const CHILD_FIELDS = {
    c1_last_bowel_movement: {
      label: "最後にうんちが出たのはいつですか？",
      summaryLabel: "最終排便",
      type: "single",
      required: true,
      options: ["今日", "昨日", "2-3日前", "4日以上前", UNKNOWN],
      group: "basic",
    },
    c2_stool_consistency: {
      label: "うんちの様子はどれに近いですか？",
      summaryLabel: "便性状",
      type: "multi",
      required: true,
      options: ["やわらかい", "普通", "硬い", "コロコロ", "とても大きい", "トイレが詰まりそうなくらい大きい", "水っぽい、または泥のよう", UNKNOWN],
      group: "basic",
    },
    c3_pain_problem: {
      label: "うんちのときに痛みや困りごとはありますか？",
      summaryLabel: "排便時痛・困りごと",
      type: "multi",
      required: true,
      options: ["痛がらない", "少し痛がる", "強く痛がる", "血がつくことがある", "出そうで出ない", "トイレに行くのを嫌がる", UNKNOWN],
      group: "basic",
    },
    c4_withholding: {
      label: "うんちを我慢する様子はありますか？",
      summaryLabel: "がまん・排便回避",
      type: "multi",
      required: true,
      options: ["ない", "ときどきある", "よくある", "足を閉じる、体を固くする、隠れることがある", "遊びや動画を優先してトイレを後回しにする", UNKNOWN],
      group: "basic",
    },
    c5_soiling: {
      label: "下着やパンツに便がつくことはありますか？",
      summaryLabel: "便失禁・下着汚れ",
      type: "single",
      required: true,
      options: ["ない", "ときどきある", "週1回以上ある", "ほぼ毎日ある", "本人が気づいていないことがある", UNKNOWN],
      group: "basic",
    },
    c6_school_toilet: {
      label: "園・学校でうんちに行けますか？",
      summaryLabel: "園・学校での排便",
      type: "multi",
      required: true,
      options: ["行ける", "ほとんど行かない", "行きたいけれど我慢する", "トイレが嫌で行けない", "恥ずかしくて行けない", "先生に言いにくい", UNKNOWN],
      group: "school",
    },
    c7_urinary: {
      label: "おしっこ、夜尿、昼間尿失禁で気になることはありますか？",
      summaryLabel: "排尿・夜尿",
      type: "multi",
      required: true,
      options: ["特にない", "夜尿がある", "昼間に尿もれがある（昼間尿失禁）", "トイレが近い", "尿を我慢することが多い", UNKNOWN],
      group: "condition",
    },
    c8_abdominal_symptom: {
      label: "おなかの症状はありますか？",
      summaryLabel: "腹部症状",
      type: "multi",
      required: true,
      options: ["特にない", "おなかが痛い", "食欲が落ちる", "吐くことがある", "おなかが張る", "うんちが出ると楽になる", UNKNOWN],
      group: "condition",
    },
    c9_lifestyle: {
      label: "食事・水分・生活リズムで気になることはありますか？",
      summaryLabel: "食事・生活リズム",
      type: "multi",
      required: true,
      options: ["特にない", "野菜が少ない", "果物が少ない", "水分が少ない", "お菓子が多い", "朝の時間がなくトイレに行きにくい", "運動が少ない", "生活リズムが不規則"],
      group: "lifestyle",
    },
    c10_med_status: {
      label: "便秘薬の飲み方について教えてください。",
      summaryLabel: "便秘薬",
      type: "multi",
      required: true,
      options: ["先生に言われた量で飲んでいる", "ときどき忘れる", "少なめに飲んでいる", "多めに飲んでいる", "飲みにくくて困る", "最近やめた", "便秘薬は使っていない"],
      group: "medicine",
    },
    c10_med_note: {
      label: "飲みにくい理由や学校・外出の日の困りごとがあれば入力してください。",
      type: "text",
      required: false,
      maxLength: 160,
      group: "medicine",
    },
    c11_background: {
      label: "発達相談、通院中の病気、他院の薬について教えてください。",
      summaryLabel: "背景情報",
      type: "multi",
      required: true,
      options: ["特にない", "発達について相談中", "他院に通院中の病気がある", "他院で長く飲んでいる薬がある", "遺伝性疾患などを指摘されたことがある", "答えたくない、または今はわからない"],
      group: "background",
    },
    c11_background_note: {
      label: "差し支えなければ、通院中の病気や薬の名前を入力してください。",
      type: "text",
      required: false,
      maxLength: 160,
      group: "background",
    },
    c12_concerns: {
      label: "本人と保護者の困りごと、薬への不安を教えてください。",
      summaryLabel: "困りごと・不安",
      type: "multi",
      required: true,
      options: ["本人はあまり困っていない", "本人が痛みを嫌がっている", "本人がトイレを嫌がっている", "保護者が薬を続けることを不安に思っている", "保護者が薬を減らすことを不安に思っている", "便秘になるのが不安で薬をやめられない", "頓用で薬を使っているが、続け方に迷っている", "学校や園で困っている", "家族内で対応に迷っている"],
      group: "concern",
    },
  };

  const FIELDS = { ...TODDLER_FIELDS, ...INFANT_FIELDS, ...CHILD_FIELDS };

  const BASIC_IDS = [
    "q1_last_bowel_movement",
    "q2_bowel_frequency",
    "q3_stool_consistency",
    "q4_pain",
    "q5_withholding",
    "q6_med_status",
  ];

  const INFANT_BASIC_IDS = [
    "i1_last_bowel_movement",
    "i2_stool_consistency",
    "i3_stool_behavior",
    "i4_onset",
    "i5_birth_check",
    "i6_feeding",
    "i7_milk_dairy",
    "i8_abdominal_condition",
    "i9_growth",
    "i10_constipation_support",
  ];

  const CHILD_BASIC_IDS = [
    "c1_last_bowel_movement",
    "c2_stool_consistency",
    "c3_pain_problem",
    "c4_withholding",
    "c5_soiling",
    "c6_school_toilet",
    "c7_urinary",
    "c8_abdominal_symptom",
    "c9_lifestyle",
    "c10_med_status",
    "c11_background",
    "c12_concerns",
  ];

  const INFANT_CONDITIONAL_IDS = ["i5_birth_check_note", "i10_support_note"];
  const CHILD_CONDITIONAL_IDS = ["c10_med_note", "c11_background_note"];

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

  const VISIT_META_FIELD_IDS = ["patient_id", "visit_id", "visit_token", "submitted_at", "age_years", "age_months", "age_profile", "questionnaire_version"];

  const TODDLER_QUESTIONNAIRE_FIELD_IDS = [...BASIC_IDS, "q6_med_adherence_flags", ...ADDITIONAL_ORDER];
  const QUESTIONNAIRE_FIELD_IDS = [...TODDLER_QUESTIONNAIRE_FIELD_IDS, ...INFANT_BASIC_IDS, ...INFANT_CONDITIONAL_IDS, ...CHILD_BASIC_IDS, ...CHILD_CONDITIONAL_IDS];

  const SHORT_QR_FIELD_ALIASES = {
    q1: "q1_last_bowel_movement",
    q2: "q2_bowel_frequency",
    q3: "q3_stool_consistency",
    q4: "q4_pain",
    q5: "q5_withholding",
    q6: "q6_med_status",
    q6a: "q6_med_adherence_flags",
    q7: "q7_blood",
    q8: "q8_soiling",
    q9: "q9_abdominal_symptom",
    q10: "q10_vomiting",
    q11: "q11_appetite_mood",
    q13: "q13_med_difficulty_reason",
    q14: "q14_change_after_less_med",
  };

  const SHORT_QR_DIARY_IDS = DIARY_FIELD_IDS.filter((id) => id !== "diary_note");

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeAgeProfile(value) {
    const profile = String(value || "").trim();
    return AGE_PROFILES.includes(profile) ? profile : "toddler";
  }

  function questionnaireVersionForProfile(profile) {
    return QUESTIONNAIRE_VERSIONS[normalizeAgeProfile(profile)] || QUESTIONNAIRE_VERSIONS.toddler;
  }

  function profileBasicIds(profile) {
    const normalized = normalizeAgeProfile(profile);
    if (normalized === "infant") return INFANT_BASIC_IDS;
    if (normalized === "child") return CHILD_BASIC_IDS;
    return BASIC_IDS;
  }

  function visibleInfantFieldIds(data) {
    const ids = [...INFANT_BASIC_IDS];
    if (data.i5_birth_check === "ある") ids.splice(ids.indexOf("i6_feeding"), 0, "i5_birth_check_note");
    const support = asArray(data.i10_constipation_support);
    if (support.some((item) => item !== "なし")) ids.push("i10_support_note");
    return ids;
  }

  function visibleChildFieldIds(data) {
    const ids = [...CHILD_BASIC_IDS];
    const med = asArray(data.c10_med_status);
    if (med.some((item) => item !== "便秘薬は使っていない")) ids.splice(ids.indexOf("c11_background"), 0, "c10_med_note");
    const background = asArray(data.c11_background);
    if (background.some((item) => item !== "特にない" && item !== "答えたくない、または今はわからない")) ids.splice(ids.indexOf("c12_concerns"), 0, "c11_background_note");
    return ids;
  }

  function profileQuestionnaireIds(profile) {
    const normalized = normalizeAgeProfile(profile);
    if (normalized === "infant") return [...INFANT_BASIC_IDS, ...INFANT_CONDITIONAL_IDS];
    if (normalized === "child") return [...CHILD_BASIC_IDS, ...CHILD_CONDITIONAL_IDS];
    return TODDLER_QUESTIONNAIRE_FIELD_IDS;
  }

  function isToddlerProfile(data) {
    const profile = normalizeAgeProfile(data && data.age_profile);
    return profile === "toddler" || profile === "unknown";
  }

  function isHardStool(value) {
    return value === "硬い";
  }

  function isWateryStool(value) {
    return value === "水のよう" || value === "水のよう（下痢に近い）";
  }

  function flags(data) {
    const canUseAdherence = data.q6_med_status && data.q6_med_status !== "便秘のお薬は使っていない" && data.q6_med_status !== UNKNOWN;
    const adherence = canUseAdherence ? asArray(data.q6_med_adherence_flags) : [];
    return {
      fourDays: data.q1_last_bowel_movement === "4日以上前" || data.q2_bowel_frequency === "4日以上あくことがある",
      watery: isWateryStool(data.q3_stool_consistency),
      hardPainWithholding:
        isHardStool(data.q3_stool_consistency) ||
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
    if (!isToddlerProfile(data)) {
      const profile = normalizeAgeProfile(data && data.age_profile);
      if (profile === "infant") return visibleInfantFieldIds(data || {});
      if (profile === "child") return visibleChildFieldIds(data || {});
      return profileBasicIds(profile);
    }
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
    VISIT_META_FIELD_IDS.forEach((id) => {
      if (data && data[id] !== undefined) next[id] = data[id];
    });
    profileQuestionnaireIds(data && data.age_profile).forEach((id) => {
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
    const ageYears = normalizeAgeNumber_(input.age_years, 0, 18);
    const ageMonths = normalizeAgeNumber_(input.age_months, 0, 11);
    const hasAgeProfile = input.age_profile !== undefined && input.age_profile !== null && input.age_profile !== "";
    const ageProfile = hasAgeProfile ? normalizeAgeProfile(input.age_profile) : "";
    const questionnaireVersion = String(input.questionnaire_version || (ageProfile ? questionnaireVersionForProfile(ageProfile) : ""))
      .replace(/[^A-Za-z0-9_.-]/g, "")
      .slice(0, 40);

    if (patientId.length === 5) meta.patient_id = patientId;
    if (visitToken) meta.visit_token = visitToken;
    if (submittedAt) meta.submitted_at = submittedAt;
    if (ageYears !== undefined) meta.age_years = ageYears;
    if (ageMonths !== undefined) meta.age_months = ageMonths;
    if (ageProfile) meta.age_profile = ageProfile;
    if (questionnaireVersion) meta.questionnaire_version = questionnaireVersion;
    if (visitId) {
      meta.visit_id = visitId;
    } else if (patientId.length === 5 && visitToken && submittedAt) {
      meta.visit_id = `${submittedAt.slice(0, 10).replaceAll("-", "")}-${patientId}-${visitToken}`;
    }
    return meta;
  }

  function normalizeAgeNumber_(value, min, max) {
    if (value === undefined || value === null || value === "") return undefined;
    const number = Number.parseInt(String(value), 10);
    if (!Number.isFinite(number) || number < min || number > max) return undefined;
    return number;
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
    const exclusiveFirstOptions = new Set(["i7_milk_dairy", "i8_abdominal_condition", "i10_constipation_support", "c7_urinary", "c8_abdominal_symptom", "c9_lifestyle", "c10_med_status", "c11_background"]);
    if (exclusiveFirstOptions.has(fieldId)) {
      const first = FIELDS[fieldId] && FIELDS[fieldId].options && FIELDS[fieldId].options[0];
      if (clicked === first && values.has(first)) values = new Set([first]);
      if (clicked !== first && first && values.has(clicked)) values.delete(first);
    }
    return Array.from(values);
  }

  function displayValue(data, fieldId) {
    if (data[fieldId] === undefined) return "未確認";
    if (Array.isArray(data[fieldId])) return data[fieldId].length ? data[fieldId].join("、") : "なし";
    return data[fieldId] || "未確認";
  }

  function ageText(data) {
    const hasYears = data.age_years !== undefined && data.age_years !== "";
    const hasMonths = data.age_months !== undefined && data.age_months !== "";
    if (!hasYears && !hasMonths) return "未確認";
    const years = hasYears ? `${data.age_years}歳` : "";
    const months = hasMonths ? `${data.age_months}か月` : "";
    return `${years}${months}` || "未確認";
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

  function profileDisplayName(profile) {
    const normalized = normalizeAgeProfile(profile);
    if (normalized === "infant") return "0-1歳";
    if (normalized === "child") return "4歳以降";
    if (normalized === "unknown") return "年齢未確認";
    return "2-3歳";
  }

  function hasAnyValue(data, ids, values) {
    return ids.some((id) => asArray(data[id]).some((item) => values.includes(item)) || values.includes(data[id]));
  }

  function fieldLine(data, id) {
    const field = FIELDS[id] || {};
    return `- ${field.summaryLabel || field.label || id}: ${displayValue(data, id)}`;
  }

  function profileCheckItems(data) {
    const profile = normalizeAgeProfile(data.age_profile);
    if (profile === "infant") {
      const items = [];
      if (["生まれてすぐから", "生後数週間以内から"].includes(data.i4_onset)) items.push("出生直後または生後早期からの便秘として、出生時・1か月健診、哺乳、体重、腹部膨満、嘔吐を診察で確認。");
      if (data.i5_birth_check === "ある" || data.i5_birth_check === UNKNOWN) items.push("出生時や1か月健診での指摘内容を診察で確認。");
      if (hasAnyValue(data, ["i6_feeding", "i8_abdominal_condition", "i9_growth"], ["飲む量、食べる量が少ない", "最近飲む量、食べる量が減った", "吐くことが増えた", "張っているように見える", "触ると嫌がる", "吐くことがある", "機嫌が悪い時間が増えた", "発熱がある", "体重の増えが悪いと言われた", "最近体重が増えにくい気がする", "健診で相談するように言われた"])) {
        items.push("哺乳・食事、嘔吐、腹部膨満、発熱、機嫌、体重増加を診察で確認。");
      }
      if (hasAnyValue(data, ["i7_milk_dairy"], ["ミルクを変えてから便が硬くなった気がする", "牛乳・乳製品をとると便やおなかの調子が変わる気がする", "母乳中で、母が牛乳・乳製品を多くとると便やおなかの調子が変わる気がする", "湿疹、血便、吐き戻しなども気になる"])) {
        items.push("ミルク変更、牛乳・乳製品、湿疹、血便、吐き戻しとの関係を断定せず追加確認。");
      }
      if (hasAnyValue(data, ["i10_constipation_support"], ["市販薬", "浣腸", "綿棒刺激", "その他"])) items.push("薬・浣腸・綿棒刺激などの使用頻度と効果を確認し、自己判断を促さない。");
      if (!items.length) items.push("0-1歳として、哺乳、体重増加、嘔吐、腹部膨満、発症時期を診察で確認。");
      return items;
    }
    if (profile === "child") {
      const items = [];
      if (data.c5_soiling && data.c5_soiling !== "ない" && data.c5_soiling !== UNKNOWN) items.push("便失禁・下着汚れの頻度、本人の自覚、園・学校生活への影響を確認。");
      if (hasAnyValue(data, ["c6_school_toilet"], ["ほとんど行かない", "行きたいけれど我慢する", "トイレが嫌で行けない", "恥ずかしくて行けない", "先生に言いにくい"])) items.push("園・学校での排便回避、トイレ環境、先生への相談可否を確認。");
      if (hasAnyValue(data, ["c7_urinary"], ["夜尿がある", "昼間に尿もれがある（昼間尿失禁）", "トイレが近い", "尿を我慢することが多い"])) items.push("夜尿・昼間尿失禁・排尿習慣は便秘との関係を決めつけず背景情報として確認。");
      if (hasAnyValue(data, ["c10_med_status", "c12_concerns"], ["ときどき忘れる", "少なめに飲んでいる", "多めに飲んでいる", "飲みにくくて困る", "最近やめた", "保護者が薬を続けることを不安に思っている", "保護者が薬を減らすことを不安に思っている", "便秘になるのが不安で薬をやめられない"])) items.push("服薬継続、自己調整、中止、不安を分けて診察で確認。");
      if (hasAnyValue(data, ["c11_background"], ["発達について相談中", "他院に通院中の病気がある", "他院で長く飲んでいる薬がある", "遺伝性疾患などを指摘されたことがある"])) items.push("発達相談、他院通院、他院処方は便秘との関係を断定せず背景情報として確認。");
      if (!items.length) items.push("4歳以降として、園・学校での排便、便失禁、生活リズム、本人と保護者の困りごとを確認。");
      return items;
    }
    return aiFollowUpItems(data);
  }

  function profileHeadline(data) {
    const profile = normalizeAgeProfile(data.age_profile);
    const items = profileCheckItems(data);
    if (profile === "infant") return `0-1歳向け問診です。${items[0] || "哺乳、体重、嘔吐、腹部膨満を診察で確認します。"}`;
    if (profile === "child") return `4歳以降向け問診です。${items[0] || "園・学校生活、便失禁、生活リズムを診察で確認します。"}`;
    return primaryConcern(data);
  }

  function profileReviewRows(data, ids) {
    return ids.map((id) => ({ label: (FIELDS[id] && (FIELDS[id].summaryLabel || FIELDS[id].label)) || id, value: displayValue(data, id) }));
  }

  function generateProfileReview(data) {
    const profile = normalizeAgeProfile(data.age_profile);
    if (profile === "infant") {
      return {
        urgency: { level: "watch", label: "診察で確認", message: "0-1歳として診察時に確認したい情報があります。" },
        headline: profileHeadline(data),
        stool: profileReviewRows(data, ["i1_last_bowel_movement", "i2_stool_consistency", "i3_stool_behavior", "i4_onset", "i5_birth_check"]),
        safety: profileReviewRows(data, ["i6_feeding", "i8_abdominal_condition", "i9_growth"]),
        stoolConcerns: profileReviewRows(data, ["i7_milk_dairy"]),
        medication: profileReviewRows(data, ["i10_constipation_support", "i10_support_note"]),
        diary: diaryRows(data),
        weeklySummary: weeklySummary(data),
        checkItems: profileCheckItems(data).slice(0, 4),
        notJudged: ["診断", "背景疾患の有無", "処方量変更", "処置頻度の指示", "専門紹介の要否"],
        raw: data,
      };
    }
    return {
      urgency: { level: "watch", label: "診察で確認", message: "4歳以降として診察時に確認したい情報があります。" },
      headline: profileHeadline(data),
      stool: profileReviewRows(data, ["c1_last_bowel_movement", "c2_stool_consistency", "c3_pain_problem", "c4_withholding", "c5_soiling"]),
      safety: profileReviewRows(data, ["c6_school_toilet", "c7_urinary", "c8_abdominal_symptom"]),
      stoolConcerns: profileReviewRows(data, ["c9_lifestyle", "c11_background", "c12_concerns"]),
      medication: profileReviewRows(data, ["c10_med_status", "c10_med_note"]),
      diary: diaryRows(data),
      weeklySummary: weeklySummary(data),
      checkItems: profileCheckItems(data).slice(0, 4),
      notJudged: ["診断", "便塞栓の有無", "処方量変更", "治療中止可否", "専門紹介の要否"],
      raw: data,
    };
  }

  function generateProfileSummary(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const profile = normalizeAgeProfile(data.age_profile);
    const review = generateProfileReview(data);
    const ids = profileQuestionnaireIds(profile);
    const answers = ids
      .filter((id) => data[id] !== undefined)
      .map((id) => fieldLine(data, id))
      .join("\n") || "- 未確認";
    return `【診察前 便秘ミニサマリー】

年齢: ${ageText(data)}
年齢プロファイル: ${profileDisplayName(profile)}
質問セット: ${questionnaireVersionForProfile(profile)}

問診回答:
${answers}

直近日誌:
${diarySummaryText(data)}

週次サマリー:
${weeklySummaryText(data)}

医師が確認する候補:
${review.checkItems.map((item) => `- ${item}`).join("\n")}

AIが判断していないこと:
- ${review.notJudged.join("\n- ")}`;
  }

  function generateProfilePatientMemo(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const profile = normalizeAgeProfile(data.age_profile);
    const review = generateProfileReview(data);
    const diaryText = weeklySummary(data);
    const diarySection = diaryText.length
      ? `
最近の記録:
${diaryText.map((item) => `- ${item}`).join("\n")}
`
      : "";
    const firstRows = profileQuestionnaireIds(profile)
      .filter((id) => data[id] !== undefined)
      .slice(0, 6)
      .map((id) => fieldLine(data, id))
      .join("\n");
    return `【便秘メモ】

今日のうんちの様子:
${firstRows || "- 未確認"}
${diarySection}
次に相談すること:
${review.checkItems.slice(0, 3).map((item) => `- ${item}`).join("\n")}

大事なこと:
- このメモでは診断や薬の量を決めません。
- 薬を増やす、減らす、やめる、再開する判断は医師と相談します。`;
  }

  function staffShareConcerns(data) {
    const concerns = [];
    if (data.q9_abdominal_symptom === "強い") concerns.push("強い腹痛・お腹の張り");
    if (data.q10_vomiting === "ある") concerns.push("嘔吐");
    if (data.q11_appetite_mood === "食欲も機嫌も気になる") concerns.push("食欲と機嫌の変化");
    return concerns;
  }

  function hasSafetyNotice(data) {
    return false;
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
      if (isHardStool(data.q3_stool_consistency)) reasons.push("硬い便");
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
    const conditionConcerns = staffShareConcerns(data);
    if (conditionConcerns.length) {
      items.push(`${conditionConcerns.join("、")}があります。診察で確認します。`);
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
    const conditionConcerns = staffShareConcerns(data).map((item) => `${item}があります`);
    const stoolConcerns = buildStoolConcernPhrases(data);
    const medicineConcerns = buildMedicineConcernPhrases(data);
    const concerns = [...conditionConcerns, ...stoolConcerns, ...medicineConcerns];

    if (concerns.length) return `${concerns.join("。")}。`;
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
    if (isHardStool(data.q3_stool_consistency)) hardPainWithholding.push("硬い便");
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
    if (f.fourDays || f.watery || f.hardPainWithholding || f.medLessForgotStopped || f.medDifficulty || staffShareConcerns(data).length) {
      return {
        level: "watch",
        label: "診察で確認",
        message: "診察時に確認したい追加情報があります。",
      };
    }
    return {
      level: "stable",
      label: "通常確認",
      message: "現時点で目立つ追加確認項目はありません。",
    };
  }

  function generatePhysicianReview(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    if (!isToddlerProfile(data)) return generateProfileReview(data);
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
    if (!isToddlerProfile(data)) return generateProfileSummary(data);
    const followUps = aiFollowUpItems(data).map((item) => `- ${item}`).join("\n");
    return `【診察前 便秘ミニサマリー】

年齢: ${ageText(data)}

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
    if (!isToddlerProfile(data)) {
      const review = generatePhysicianReview(data);
      return `【院内共有用 便秘問診】

確認区分: ${review.urgency.label}
概要: ${review.headline}
年齢: ${ageText(data)}
年齢プロファイル: ${profileDisplayName(data.age_profile)}
質問セット: ${questionnaireVersionForProfile(data.age_profile)}

診察で見るポイント:
${review.checkItems.map((item) => `- ${item}`).join("\n")}

AIが判断していないこと:
- ${review.notJudged.join("\n- ")}

送信JSON:
${JSON.stringify(data, null, 2)}`;
    }
    const review = generatePhysicianReview(data);
    return `【院内共有用 便秘問診】

確認区分: ${review.urgency.label}
概要: ${review.headline}
年齢: ${ageText(data)}

診察で見るポイント:
${review.checkItems.map((item) => `- ${item}`).join("\n")}

AIが判断していないこと:
- ${review.notJudged.join("\n- ")}

送信JSON:
${JSON.stringify(data, null, 2)}`;
  }

  function generatePatientMemo(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    if (!isToddlerProfile(data)) return generateProfilePatientMemo(data);
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

  function pickDefined(data, ids) {
    return Object.fromEntries(ids.filter((id) => data[id] !== undefined).map((id) => [id, data[id]]));
  }

  function generateSheetsVisitPayload(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const review = generatePhysicianReview(data);
    return {
      patient_id: data.patient_id || "",
      visit_id: data.visit_id || "",
      visit_token: data.visit_token || "",
      submitted_at: data.submitted_at || "",
      age_years: data.age_years === undefined ? "" : data.age_years,
      age_months: data.age_months === undefined ? "" : data.age_months,
      age_profile: normalizeAgeProfile(data.age_profile),
      questionnaire_version: data.questionnaire_version || questionnaireVersionForProfile(data.age_profile),
      questionnaire: pickDefined(data, profileQuestionnaireIds(data.age_profile)),
      diary: pickDefined(data, DIARY_FIELD_IDS),
      outputs: {
        urgency_level: review.urgency.level,
        urgency_label: review.urgency.label,
        headline: review.headline,
        check_items: review.checkItems,
        not_judged: review.notJudged,
        summary_text: generateSummary(data),
        facility_share_text: generateFacilityShare(data),
        patient_memo_text: generatePatientMemo(data),
      },
    };
  }

  function generateShortQrPayload(input) {
    const data = mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(input), input), input);
    const parts = ["v1"];
    if (data.patient_id) parts.push(`pid=${data.patient_id}`);
    if (data.visit_token) parts.push(`tok=${data.visit_token}`);

    Object.entries(SHORT_QR_FIELD_ALIASES).forEach(([alias, fieldId]) => {
      const encoded = encodeShortQrAnswer_(FIELDS[fieldId], data[fieldId]);
      if (encoded !== "") parts.push(`${alias}=${encoded}`);
    });

    const diaryValues = SHORT_QR_DIARY_IDS.map((id) => (data[id] === undefined ? "" : String(data[id])));
    if (diaryValues.some((value) => value !== "")) parts.push(`d=${diaryValues.join(",")}`);
    return parts.join("|");
  }

  function decodeShortQrPayload(value) {
    const parts = String(value || "").split("|").filter(Boolean);
    if (parts.shift() !== "v1") return {};
    const data = {};

    parts.forEach((part) => {
      const separator = part.indexOf("=");
      if (separator === -1) return;
      const key = part.slice(0, separator);
      const raw = part.slice(separator + 1);
      if (key === "pid") data.patient_id = raw.replace(/\D/g, "").slice(0, 5);
      if (key === "tok") data.visit_token = raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 12).toUpperCase();
      if (key === "d") decodeShortQrDiary_(data, raw);
      if (SHORT_QR_FIELD_ALIASES[key]) {
        const fieldId = SHORT_QR_FIELD_ALIASES[key];
        const decoded = decodeShortQrAnswer_(FIELDS[fieldId], raw);
        if (decoded !== undefined) data[fieldId] = decoded;
      }
    });

    return mergeVisitMeta(mergeDiaryAnswers(pruneHiddenAnswers(data), data), data);
  }

  function encodeShortQrAnswer_(field, value) {
    if (!field || value === undefined) return "";
    if (field.type === "multi") {
      const indexes = asArray(value)
        .map((item) => field.options.indexOf(item))
        .filter((index) => index >= 0);
      return indexes.length ? indexes.join(".") : "";
    }
    const index = field.options.indexOf(value);
    return index >= 0 ? String(index) : "";
  }

  function decodeShortQrAnswer_(field, raw) {
    if (!field || raw === "") return undefined;
    if (field.type === "multi") {
      const values = raw
        .split(".")
        .map((item) => Number.parseInt(item, 10))
        .filter((index) => Number.isFinite(index) && field.options[index] !== undefined)
        .map((index) => field.options[index]);
      return values.length ? values : undefined;
    }
    const index = Number.parseInt(raw, 10);
    return Number.isFinite(index) ? field.options[index] : undefined;
  }

  function decodeShortQrDiary_(data, raw) {
    raw.split(",").forEach((item, index) => {
      const id = SHORT_QR_DIARY_IDS[index];
      const value = Number.parseInt(item, 10);
      if (id && Number.isFinite(value) && value >= 0) data[id] = value;
    });
  }

  function branchMessage(fieldId, data) {
    if (!isToddlerProfile(data)) return "";
    const f = flags(data);
    if (["q9_abdominal_symptom", "q10_vomiting", "q11_appetite_mood"].includes(fieldId)) {
      return f.fourDays
        ? "うんちの間隔があいているため、体調について少し確認します。"
        : "水のようなうんち（下痢に近い）があるため、体調について少し確認します。";
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
    AGE_PROFILES,
    QUESTIONNAIRE_VERSIONS,
    TODDLER_FIELDS,
    INFANT_FIELDS,
    CHILD_FIELDS,
    FIELDS,
    BASIC_IDS,
    INFANT_BASIC_IDS,
    CHILD_BASIC_IDS,
    ADDITIONAL_ORDER,
    DIARY_FIELD_IDS,
    VISIT_META_FIELD_IDS,
    QUESTIONNAIRE_FIELD_IDS,
    SHORT_QR_FIELD_ALIASES,
    SHORT_QR_DIARY_IDS,
    flags,
    normalizeAgeProfile,
    questionnaireVersionForProfile,
    profileBasicIds,
    profileQuestionnaireIds,
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
    generateSheetsVisitPayload,
    generateShortQrPayload,
    decodeShortQrPayload,
    branchMessage,
  };
});
