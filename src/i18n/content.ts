// 全コピーの辞書。日英は同じ Copy 型を満たす必要があるため、
// 文言の抜け漏れは型チェック(npm run build)で検出される。
//
// ブランド要素(NOVA RIDGE / CHASE THE WHITE. / コース名 / THE MOUNTAIN /
// RESERVE / BOOK YOUR RIDE / YOUR JOURNEY BEGINS HERE.)は両言語で英語のまま。
// これは docs/brand-guide.md の「英語ブランド × 日本語コピー」原則による。

export type Lang = 'ja' | 'en';

interface RunCopy {
  index: string;
  name: string; // ブランド要素(両言語共通の英語)
  grade: string;
  text: string;
  difficulty: string;
  distance: string;
  time: string;
}

export interface Copy {
  meta: { title: string };
  header: { est: string };
  a11y: {
    soundToggle: string;
    langToggle: string;
    journeySection: string;
    confirmDialog: string;
  };
  hero: {
    kicker: string;
    tagline: string;
    sub: string;
    stats: { label: string; value: string }[];
    cta: string;
  };
  journey: {
    firstSub: string;
    secondSub: string;
  };
  experiences: {
    kicker: string;
    statLabels: { difficulty: string; distance: string; time: string };
    runs: RunCopy[]; // 並び順は Routes.tsx / CameraRig.tsx とインデックスで対応(変更禁止)
  };
  firstTracks: {
    start: string;
    exit: string;
    hint: string;
    dialog: string;
  };
  booking: {
    kicker: string;
    dateLabel: string;
    guestsLabel: string;
    courseLabel: string;
    coursePlaceholder: string;
    guestsOption: (n: number) => string;
    note: string;
    errors: {
      dateRequired: string;
      datePast: string;
      courseRequired: string;
    };
    confirm: {
      sub: string;
      note: string;
      close: string;
      dateLabel: string;
      guestsLabel: string;
      courseLabel: string;
      formatGuests: (n: string) => string;
      formatDate: (iso: string) => string;
    };
  };
  footer: { fictional: string; season: string };
}

const ja: Copy = {
  meta: { title: 'NOVA RIDGE — 白を追え。' },
  header: { est: 'EST. 2041 — 北緯 64.9°' },
  a11y: {
    soundToggle: '効果音の切り替え',
    langToggle: '言語切り替え(English)',
    journeySection: '山への接近',
    confirmDialog: '予約確認',
  },
  hero: {
    kicker: '山脈の、最果てへ。',
    tagline: 'CHASE THE WHITE.',
    sub: '白を追え。日常の、その先へ。',
    stats: [
      { label: '標高', value: '2,840m' },
      { label: '気温', value: '−8°C' },
      { label: '積雪', value: '210cm' },
    ],
    cta: '山を探索する',
  },
  journey: {
    firstSub: '白を追え。',
    secondSub: '未知の、中へ。',
  },
  experiences: {
    kicker: '三本のライン。ひとつの滑降。',
    statLabels: { difficulty: '難易度', distance: '距離', time: '所要時間' },
    runs: [
      {
        index: '01',
        name: 'WHITE LINE',
        grade: '全レベル — 北壁',
        text: 'オーロラ回廊の真下に広がる、全長11kmのオープンパウダー。山域最長のロングコースは、広く、静かに、空の光だけに照らされる。',
        difficulty: '初級から',
        distance: '11.2 km',
        time: '約45分',
      },
      {
        index: '02',
        name: 'NOVA RUN',
        grade: '上級 — サミットゲート',
        text: 'リゾートを象徴するシグネチャーライン。標高2,840mの山頂ステーションから、風に削られた氷壁の間を切り裂いて滑り降りる。夜明けの光とともに。',
        difficulty: '上級',
        distance: '7.4 km',
        time: '約22分',
      },
      {
        index: '03',
        name: 'BLACK VOID',
        grade: 'エキスパート — 完全許可制',
        text: 'パトロールなし。照明なし。容赦なし。雪と静寂が揃った夜にだけ、シーズンに12回ひらかれるナイトセクター。',
        difficulty: 'エキスパート',
        distance: '4.8 km',
        time: '約13分',
      },
    ],
  },
  firstTracks: {
    start: 'FIRST TRACKS — このラインを滑る',
    exit: '終了',
    hint: 'Escape キーでも終了できます',
    dialog: 'コースの滑空プレビュー',
  },
  booking: {
    kicker: '白の中へ、最初の一歩を。',
    dateLabel: '日付',
    guestsLabel: '人数',
    courseLabel: 'コース',
    coursePlaceholder: '選択してください',
    guestsOption: (n) => `${n}名`,
    note: '※ これは架空のリゾートの体験デモです。実際の予約・決済は行われません。',
    errors: {
      dateRequired: 'ご希望の日付を選択してください。',
      datePast: '本日以降の日付を選択してください。',
      courseRequired: 'コースを選択してください。',
    },
    confirm: {
      sub: '旅は、ここから始まる。',
      note: '※ 架空の予約です。雪だけが、本物です。',
      close: '閉じる',
      dateLabel: '日付',
      guestsLabel: '人数',
      courseLabel: 'コース',
      formatGuests: (n) => `${n}名`,
      formatDate: (iso) => {
        const [y, m, d] = iso.split('-');
        return `${y}年${Number(m)}月${Number(d)}日`;
      },
    },
  },
  footer: { fictional: 'NOVA RIDGE — 架空のスキーリゾート', season: 'シーズン開幕 11.14' },
};

const en: Copy = {
  meta: { title: 'NOVA RIDGE — Chase the White.' },
  header: { est: 'EST. 2041 — 64.9° N' },
  a11y: {
    soundToggle: 'Toggle sound',
    langToggle: 'Switch language (日本語)',
    journeySection: 'The approach',
    confirmDialog: 'Reservation confirmed',
  },
  hero: {
    kicker: 'THE FAR SIDE OF THE RANGE',
    tagline: 'CHASE THE WHITE.',
    sub: 'Beyond the ordinary winter.',
    stats: [
      { label: 'ALTITUDE', value: '2,840m' },
      { label: 'TEMP', value: '−8°C' },
      { label: 'SNOW', value: '210cm' },
    ],
    cta: 'EXPLORE THE MOUNTAIN',
  },
  journey: {
    firstSub: 'Beyond the ordinary winter.',
    secondSub: 'Into the unknown.',
  },
  experiences: {
    kicker: 'THREE LINES. ONE DESCENT.',
    statLabels: { difficulty: 'DIFFICULTY', distance: 'DISTANCE', time: 'EST. TIME' },
    runs: [
      {
        index: '01',
        name: 'WHITE LINE',
        grade: 'ALL LEVELS — NORTH FACE',
        text: 'Eleven kilometres of open powder beneath the aurora corridor. The longest descent in the range — wide, silent, lit only by the sky.',
        difficulty: 'From beginner',
        distance: '11.2 km',
        time: '~45 min',
      },
      {
        index: '02',
        name: 'NOVA RUN',
        grade: 'ADVANCED — SUMMIT GATE',
        text: 'The signature line. A steep spine dropping from the 2,840m summit station, carved between wind-sculpted ice walls at first light.',
        difficulty: 'Advanced',
        distance: '7.4 km',
        time: '~22 min',
      },
      {
        index: '03',
        name: 'BLACK VOID',
        grade: 'EXPERT — PERMIT ONLY',
        text: 'Unpatrolled. Unlit. Unforgiving. A night sector opened twelve times a season, when the snow and the silence align.',
        difficulty: 'Expert',
        distance: '4.8 km',
        time: '~13 min',
      },
    ],
  },
  firstTracks: {
    start: 'FIRST TRACKS — RIDE THIS LINE',
    exit: 'EXIT',
    hint: 'Press Escape to exit',
    dialog: 'Course flyover preview',
  },
  booking: {
    kicker: 'YOUR FIRST STEP INTO THE WHITE.',
    dateLabel: 'DATE',
    guestsLabel: 'GUESTS',
    courseLabel: 'COURSE',
    coursePlaceholder: 'Select a course',
    guestsOption: (n) => (n === 1 ? '1 guest' : `${n} guests`),
    note: 'This is a demo for a fictional resort. No real bookings or payments are made.',
    errors: {
      dateRequired: 'Please select a date.',
      datePast: 'Please choose a date from today onward.',
      courseRequired: 'Please select a course.',
    },
    confirm: {
      sub: 'The mountain is waiting.',
      note: 'A fictional reservation. Only the snow is real.',
      close: 'CLOSE',
      dateLabel: 'DATE',
      guestsLabel: 'GUESTS',
      courseLabel: 'COURSE',
      formatGuests: (n) => (n === '1' ? '1 guest' : `${n} guests`),
      formatDate: (iso) => {
        const [y, m, d] = iso.split('-');
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
      },
    },
  },
  footer: { fictional: 'NOVA RIDGE — A FICTIONAL RESORT', season: 'SEASON OPENS 11.14' },
};

export const CONTENT: Record<Lang, Copy> = { ja, en };
