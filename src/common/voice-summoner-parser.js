// 召唤师技能语音指令解析模块
// 将一段语音识别后的文本解析为：分路 / 阵营 / 召唤师技能 / 技能状态 + 剩余时间

function normalizeText(text) {
  if (!text) return '';
  let t = String(text).trim().toLowerCase();
  t = t.replace(/[，。、,.!?！？]/g, '');
  t = t.replace(/\s+/g, '');

  // 针对整句级别的强纠错（避免“还/都”这种单字误替换带来误判）
  // 这些样本来自：用户说“打野没闪”，百度常识别为“倒也没啥 / 还没啥 / 都没啥”
  if (t === '倒也没啥' || t === '还没啥' || t === '都没啥') {
    t = '打野没闪';
  }

  // 语音识别容错纠正：把常见误识别词替换为“标准口令词”
  // 注意：替换顺序很重要，优先处理更长的片段，避免被短词误替换
  const corrections = [
    // 分路误识别
    [/上班/g, '上单'],
    [/张丹/g, '中单'],
    [/中的/g, '中单'],
    [/从来/g, '下路'],
    [/下楼/g, '下路'],
    [/打也/g, '打野'],
    [/白也/g, '打野'],
    [/倒也/g, '打野'],

    // 技能别称/误识别
    [/点火/g, '点燃'],
    [/踢/g, 'tp'],

    // 技能状态误识别（核心：把“没事/没伞/铃声”纠正为“没闪”）
    [/没事/g, '没闪'],
    [/没伞/g, '没闪'],
    [/没啥/g, '没闪'],
    [/铃声/g, '没闪']
  ];
  corrections.forEach(([pattern, replacement]) => {
    t = t.replace(pattern, replacement);
  });

  return t;
}

function detectLane(text) {
  // 注意：不要用“上/中/下”这种单字做匹配，误伤太多（比如“马上/中间/下来”）。
  if (/上路|上单/.test(text)) return 'top';
  if (/中路|中单/.test(text)) return 'mid';
  if (/下路|下单|adc|射手/.test(text)) return 'adc';
  // 辅助
  if (/辅\s*助|挂件|辅助位/.test(text)) return 'sup';
  if (/打野|野区|野辅?/.test(text)) return 'jg';
  return 'unknown';
}

function detectSide(text) {
  if (/对面|敌方|敌人|他们/.test(text)) return 'enemy';
  if (/我方|我们|咱们|自己|我这边/.test(text)) return 'ally';
  return 'unknown';
}

const SPELL_DICT = [
  { name: 'flash', pattern: /(闪现|闪|f)/ },
  { name: 'ignite', pattern: /(点燃|引燃|点火)/ },
  { name: 'heal', pattern: /(治疗|奶|heal)/ },
  { name: 'exhaust', pattern: /(虚弱|weak)/ },
  // 传送：T、TP（标准叫法）+ 踢（识别错误）
  { name: 'teleport', pattern: /(传送|tp|电传|踢)/ },
  { name: 'smite', pattern: /(惩戒|惩)/ },
  { name: 'barrier', pattern: /(屏障|护盾|盾)/ },
  { name: 'ghost', pattern: /(幽灵|疾跑)/ },
  { name: 'cleanse', pattern: /(净化|净)/ },
  { name: 'clarity', pattern: /(清晰|回蓝)/ }
];

function detectSpells(text) {
  const spells = [];
  SPELL_DICT.forEach((s) => {
    if (s.pattern.test(text)) {
      spells.push({
        name: s.name,
        status: 'unknown',
        remainingSeconds: null
      });
    }
  });

  if (/双招/.test(text)) {
    spells.push({
      name: 'all_summoners',
      status: 'used',
      remainingSeconds: null
    });
  }

  if (spells.length === 0) {
    spells.push({
      name: 'unknown',
      status: 'unknown',
      remainingSeconds: null
    });
  }

  return spells;
}

function parseTimeToSeconds(text) {
  let minutes = 0;
  let seconds = 0;

  const fullMatch = /(\d+)\s*分(?:钟)?\s*(\d+)\s*秒?/.exec(text);
  if (fullMatch) {
    minutes = parseInt(fullMatch[1], 10);
    seconds = parseInt(fullMatch[2], 10);
    return minutes * 60 + seconds;
  }

  const minOnly = /(\d+)\s*分(钟)?/.exec(text);
  if (minOnly) {
    minutes = parseInt(minOnly[1], 10);
    return minutes * 60;
  }

  const secOnly = /(\d+)\s*(秒|s)/.exec(text);
  if (secOnly) {
    seconds = parseInt(secOnly[1], 10);
    return seconds;
  }

  return null;
}

function detectStatus(text) {
  const seconds = parseTimeToSeconds(text);
  if (seconds !== null) {
    return {
      status: 'cooldown',
      remainingSeconds: seconds
    };
  }

  // 没闪的识别错误：没事、没伞、没啥、铃声
  if (/(没闪|无闪|没闪现|闪现没了|闪没了|没事|没伞|没啥|铃声|没点燃|无点燃|没治疗|交了|刚交|用掉了|用了)/.test(text)) {
    return {
      status: 'used',
      remainingSeconds: null
    };
  }

  if (/(有闪|有点燃|有治疗|闪在|闪好了|点燃好了|治疗好了|技能好了|cd好了)/.test(text)) {
    return {
      status: 'ready',
      remainingSeconds: null
    };
  }

  return {
    status: 'unknown',
    remainingSeconds: null
  };
}

export function parseSummonerCommand(rawText) {
  const text = normalizeText(rawText);
  if (!text) {
    return null;
  }

  const lane = detectLane(text);
  const side = detectSide(text);
  let spells = detectSpells(text);
  const statusInfo = detectStatus(text);

  spells = spells.map((s) => ({
    ...s,
    status: statusInfo.status,
    remainingSeconds: statusInfo.remainingSeconds
  }));

  return {
    rawText,
    lane,
    side,
    spells
  };
}

