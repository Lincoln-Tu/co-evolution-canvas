/**
 * 应用状态与持久化
 * 采用极简的「单一状态 + 订阅」模式，避免引入框架。
 */

import { storage, uid } from './util.js';
import { STAGES, POINTS, stageByKey } from './data/theory.js';

const KEY_CANVAS = 'canvas';
const KEY_UI = 'ui';
const KEY_ACTIONS = 'actions';
const KEY_QUIZ = 'quiz';
const KEY_BOOKMARKS = 'bookmarks';
const KEY_VISITS = 'visits';
const KEY_CASE_CHOICES = 'caseChoices';

const defaultCanvas = () => ({
  company: '',
  industry: '',
  stage: 'startup',
  scores: Object.fromEntries(POINTS.map((p) => [p.key, 0])),
  notes: Object.fromEntries(POINTS.map((p) => [p.key, ''])),
  elementNotes: { user: '', org: '', product: '', market: '' },
  signals: [],
  updatedAt: null,
  createdAt: null,
});

function loadCanvas() {
  const saved = storage.get(KEY_CANVAS, null);
  if (!saved || typeof saved !== 'object') return defaultCanvas();
  const base = defaultCanvas();
  return {
    ...base,
    ...saved,
    scores: { ...base.scores, ...(saved.scores || {}) },
    notes: { ...base.notes, ...(saved.notes || {}) },
    elementNotes: { ...base.elementNotes, ...(saved.elementNotes || {}) },
    signals: Array.isArray(saved.signals) ? saved.signals : [],
  };
}

export const state = {
  canvas: loadCanvas(),
  actions: storage.get(KEY_ACTIONS, []),
  quiz: storage.get(KEY_QUIZ, { index: 0, answers: {}, done: false, startedAt: null, finishedAt: null }),
  bookmarks: storage.get(KEY_BOOKMARKS, []),
  caseChoices: storage.get(KEY_CASE_CHOICES, {}),
  ui: {
    theme: storage.get(KEY_UI + ':theme', null),
    lastView: storage.get(KEY_VISITS, null),
  },
};

const subs = new Set();
export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
function emit(reason) {
  for (const fn of subs) fn(state, reason);
}

/* ---------------- Canvas ---------------- */

export function setCompany(patch) {
  Object.assign(state.canvas, patch);
  touch();
}

export function setStage(stageKey) {
  if (!stageByKey[stageKey]) return;
  state.canvas.stage = stageKey;
  touch();
}

export function setScore(pointKey, value) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  state.canvas.scores[pointKey] = v;
  touch();
}

export function setPointNote(pointKey, text) {
  state.canvas.notes[pointKey] = String(text || '').slice(0, 600);
  touch();
}

export function setElementNote(elKey, text) {
  state.canvas.elementNotes[elKey] = String(text || '').slice(0, 800);
  touch();
}

export function toggleSignal(text) {
  const arr = state.canvas.signals;
  const i = arr.indexOf(text);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(text);
  touch();
}

function touch() {
  state.canvas.updatedAt = new Date().toISOString();
  if (!state.canvas.createdAt) state.canvas.createdAt = state.canvas.updatedAt;
  storage.set(KEY_CANVAS, state.canvas);
  emit('canvas');
}

export function resetCanvas({ keepCompany = false } = {}) {
  const company = keepCompany ? { company: state.canvas.company, industry: state.canvas.industry } : {};
  state.canvas = { ...defaultCanvas(), ...company };
  touch();
  emit('canvas-reset');
}

export function clearAllData() {
  storage.clearAll();
  state.canvas = defaultCanvas();
  state.actions = [];
  state.quiz = { index: 0, answers: {}, done: false, startedAt: null, finishedAt: null };
  state.bookmarks = [];
  emit('reset');
}

/* ---------------- Actions（30 天行动） ---------------- */

export function addAction({ point, text, days = 30 }) {
  if (!text || !String(text).trim()) return null;
  const item = {
    id: uid('act'),
    point: point || null,
    text: String(text).trim().slice(0, 240),
    days,
    done: false,
    createdAt: new Date().toISOString(),
  };
  state.actions.unshift(item);
  persistActions();
  return item;
}

export function toggleAction(id) {
  const a = state.actions.find((x) => x.id === id);
  if (!a) return;
  a.done = !a.done;
  a.doneAt = a.done ? new Date().toISOString() : null;
  persistActions();
}

export function removeAction(id) {
  state.actions = state.actions.filter((a) => a.id !== id);
  persistActions();
}

function persistActions() {
  storage.set(KEY_ACTIONS, state.actions);
  emit('actions');
}

/* ---------------- Quiz ---------------- */

export function quizAnswer(qid, choice) {
  state.quiz.answers[qid] = choice;
  persistQuiz();
}

export function quizSetIndex(i) {
  state.quiz.index = i;
  if (!state.quiz.startedAt) state.quiz.startedAt = new Date().toISOString();
  persistQuiz();
}

export function quizFinish() {
  state.quiz.done = true;
  state.quiz.finishedAt = new Date().toISOString();
  persistQuiz();
}

export function quizReset() {
  state.quiz = { index: 0, answers: {}, done: false, startedAt: null, finishedAt: null };
  persistQuiz();
}

function persistQuiz() {
  storage.set(KEY_QUIZ, state.quiz);
  emit('quiz');
}

/* ---------------- Bookmarks ---------------- */

export function setCaseChoice(caseId, choiceIndex) {
  state.caseChoices[caseId] = choiceIndex;
  storage.set(KEY_CASE_CHOICES, state.caseChoices);
}

export function toggleBookmark(id) {
  const i = state.bookmarks.indexOf(id);
  if (i >= 0) state.bookmarks.splice(i, 1);
  else state.bookmarks.push(id);
  storage.set(KEY_BOOKMARKS, state.bookmarks);
  emit('bookmarks');
  return i < 0;
}

/* ---------------- UI ---------------- */

export function setTheme(theme) {
  state.ui.theme = theme;
  storage.set(KEY_UI + ':theme', theme);
}

export function noteVisit(view) {
  state.ui.lastView = view;
  storage.set(KEY_VISITS, view);
}

/* ---------------- 诊断引擎 ---------------- */

export function diagnose() {
  const c = state.canvas;
  const elKeys = ['user', 'org', 'product', 'market'];
  const elScores = {};
  for (const el of elKeys) {
    const keys = POINTS.filter((p) => p.el === el).map((p) => p.key);
    const vals = keys.map((k) => c.scores[k] || 0);
    const filled = vals.filter((v) => v > 0);
    elScores[el] = {
      avg: filled.length ? filled.reduce((a, b) => a + b, 0) / filled.length : 0,
      filled: filled.length,
      total: keys.length,
      scores: Object.fromEntries(keys.map((k) => [k, c.scores[k] || 0])),
      min: filled.length ? Math.min(...filled) : 0,
      max: filled.length ? Math.max(...filled) : 0,
    };
  }

  const allVals = POINTS.map((p) => c.scores[p.key] || 0).filter((v) => v > 0);
  const overall = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0;
  const filledCount = allVals.length;

  // 要素失衡：低于整体均值 0.7 以上
  const imbalances = elKeys
    .filter((k) => elScores[k].filled > 0 && overall > 0 && elScores[k].avg < overall - 0.7)
    .sort((a, b) => elScores[a].avg - elScores[b].avg)
    .map((k) => ({ el: k, gap: +(overall - elScores[k].avg).toFixed(1), avg: +elScores[k].avg.toFixed(1) }));

  // 阶段成熟度：按平均分推断
  let maturityStage = null;
  if (filledCount >= 6) {
    if (overall < 2) maturityStage = 'startup';
    else if (overall < 2.9) maturityStage = 'growth';
    else if (overall < 3.7) maturityStage = 'expansion';
    else maturityStage = 'transformation';
  }
  const declaredIndex = STAGES.findIndex((s) => s.key === c.stage);
  const maturityIndex = maturityStage ? STAGES.findIndex((s) => s.key === maturityStage) : null;
  const stageGap = maturityIndex == null ? null : maturityIndex - declaredIndex;

  // 关键短板：评分 <= 2 的要点
  const weakPoints = POINTS.filter((p) => (c.scores[p.key] || 0) > 0 && c.scores[p.key] <= 2)
    .sort((a, b) => c.scores[a.key] - c.scores[b.key]);

  // 优先行动建议
  const priorities = buildPriorities({ elScores, overall, imbalances, weakPoints, stage: c.stage, stageGap });

  return {
    elScores,
    overall: +overall.toFixed(2),
    filledCount,
    complete: filledCount === POINTS.length,
    imbalances,
    maturityStage,
    stageGap,
    weakPoints,
    priorities,
    verdict: buildVerdict({ overall, filledCount, imbalances, stageGap, c }),
  };
}

function buildVerdict({ overall, filledCount, imbalances, stageGap, c }) {
  if (filledCount === 0) {
    return {
      level: 'empty',
      title: '尚未开始评分',
      text: '先用 10 分钟为 12 个战略要点打分。评分不是精确测量，而是把你对企业现状的直觉显性化。',
    };
  }
  if (filledCount < 6) {
    return {
      level: 'partial',
      title: '评分尚未完成',
      text: `已完成 ${filledCount} / 12 个要点。完成全部评分后，诊断会更准——尤其是四要素之间的失衡。`,
    };
  }
  if (imbalances.length >= 2) {
    return {
      level: 'warn',
      title: '要素之间出现明显失衡',
      text: `你有 ${imbalances.length} 个要素显著落后于整体水平。共演战略的核心不是「补短板」，而是先确认：滞后的要素是否正在拖住其他要素的演化。`,
    };
  }
  if (stageGap != null && stageGap >= 2) {
    return {
      level: 'warn',
      title: '阶段认知可能偏保守',
      text: '从要素表现看，企业的成熟度已经越过你自评的阶段。要么是你低估了自己，要么是组织能力没有被「承认」——两种情况的战略动作完全不同。',
    };
  }
  if (stageGap != null && stageGap <= -1) {
    return {
      level: 'info',
      title: '阶段自评可能偏乐观',
      text: '你自评的阶段高于要素实际表现所对应的阶段。这通常意味着：战略已经「说」到了下一阶段，但组织与产品还没有「做」到。',
    };
  }
  if (overall >= 3.8) {
    return {
      level: 'ok',
      title: '要素整体成熟，注意「成功陷阱」',
      text: '四要素表现较均衡。此时的战略风险往往不是短板，而是路径依赖——第一曲线的成功会让人不愿意启动第二曲线。',
    };
  }
  return {
    level: 'ok',
    title: '要素相对均衡',
    text: '当前没有出现显著的要素失衡。接下来要关注的是：在你的阶段，哪一个要点的「边际改进」最大。',
  };
}

function buildPriorities({ elScores, overall, imbalances, weakPoints, stage, stageGap }) {
  const out = [];
  for (const im of imbalances) {
    out.push({
      kind: 'element',
      key: im.el,
      title: `${elLabel(im.el)}要素是结构性短板`,
      why: `该要素均分 ${im.avg}，低于整体 ${overall.toFixed(1)} 达 ${im.gap} 分，正在拖住其他要素的演化。`,
    });
  }
  for (const wp of weakPoints.slice(0, 3)) {
    const sp = stageByKey[stage].points[wp.key];
    out.push({
      kind: 'point',
      key: wp.key,
      title: `${sp.label}只有 ${state.canvas.scores[wp.key]} 分`,
      why: `在${stageByKey[stage].label}阶段，这个要点直接影响下一阶段能否启动。先做一个 30 天内可验证的动作。`,
    });
  }
  if (stageGap != null && stageGap <= -1) {
    out.push({
      kind: 'stage',
      key: stage,
      title: '校准阶段自评',
      why: '要素表现尚未支撑你所自评的阶段。建议先用一个季度把「上一阶段」的关键动作补齐。',
    });
  }
  if (stageGap != null && stageGap >= 2) {
    out.push({
      kind: 'stage',
      key: 'transformation',
      title: '重新审视阶段定位',
      why: '企业实际成熟度已超过自评阶段。继续用旧阶段的方法管理，可能会压制新的增长曲线。',
    });
  }
  if (!out.length) {
    out.push({
      kind: 'insight',
      key: stage,
      title: '寻找「边际改进」最大的一个点',
      why: '整体均衡时，不要平均用力。选择那个「改一点就能撬动其他要素」的要点。',
    });
  }
  return out.slice(0, 5);
}

export function elLabel(key) {
  return { user: '用户', org: '组织', product: '产品', market: '市场' }[key] || key;
}

/* ---------------- 导出 / 导入 ---------------- */

export function exportCanvas() {
  return {
    schema: 'co-evolution-canvas/v1',
    exportedAt: new Date().toISOString(),
    canvas: state.canvas,
    actions: state.actions,
    quiz: state.quiz,
    bookmarks: state.bookmarks,
  };
}

export function importCanvas(data) {
  if (!data || typeof data !== 'object' || !data.canvas) throw new Error('文件格式不正确');
  const base = defaultCanvas();
  state.canvas = {
    ...base,
    ...data.canvas,
    scores: { ...base.scores, ...(data.canvas.scores || {}) },
    notes: { ...base.notes, ...(data.canvas.notes || {}) },
    elementNotes: { ...base.elementNotes, ...(data.canvas.elementNotes || {}) },
  };
  if (Array.isArray(data.actions)) state.actions = data.actions;
  if (data.quiz && typeof data.quiz === 'object') state.quiz = { ...state.quiz, ...data.quiz };
  if (Array.isArray(data.bookmarks)) state.bookmarks = data.bookmarks;
  touch();
  persistActions();
  persistQuiz();
  emit('import');
}
