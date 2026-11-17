/**
 * 定向 QA：注入画布/行动/测评数据，截图关键状态。
 */
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:4173/';
const PORT = 9341;
const OUT = join(tmpdir(), 'coevo-qa2');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(
  EDGE,
  ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), 'coevo-qa2-prof')}`, 'about:blank'],
  { stdio: 'ignore' }
);

let ver;
for (let i = 0; i < 60; i++) {
  try {
    ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    break;
  } catch {
    await sleep(200);
  }
}
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) {
    const p = pend.get(m.id);
    pend.delete(m.id);
    m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const i = ++id;
    pend.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);

await S('Page.enable');
await S('Runtime.enable');
await mkdir(OUT, { recursive: true });

const canvas = {
  company: '示例科技',
  industry: '企业服务 SaaS',
  stage: 'growth',
  scores: {
    characteristics: 4, needs: 5, choice: 3,
    leader: 2, team: 3, structure: 2,
    development: 4, marketing: 2, businessModel: 3,
    tech: 3, capital: 2, competition: 4,
  },
  notes: { marketing: '投放 ROI 只有 0.8，停止投放后线索腰斩。' },
  elementNotes: { org: '团队从 40 人扩到 180 人，中层管理者缺位，所有决策仍压到两位创始人。' },
  signals: ['PMF 已初步验证', '组织人数快速膨胀'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
const actions = [
  { id: 'a1', point: 'leader', text: '与 3 位候选人深谈，确定一位 COO 候选人，Q1 前到位', days: 30, done: false, createdAt: new Date().toISOString() },
  { id: 'a2', point: 'structure', text: '把审批流程拆成「10 万以下自主决策」，试行一个月', days: 30, done: true, doneAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'a3', point: 'marketing', text: '访谈 10 位流失用户，找出停投后线索腰斩的真实原因', days: 30, done: false, createdAt: new Date().toISOString() },
];
const quizAnswers = { q1: 1, q2: 1, q3: 1, q4: 1, q5: 0, q6: 1, q7: 1, q8: 1, q9: 0, q10: 1, q11: 0, q12: 1, q13: 2, q14: 1, q15: 1 };

async function seed() {
  await S('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('coevo:canvas', ${JSON.stringify(JSON.stringify(canvas))});
      localStorage.setItem('coevo:actions', ${JSON.stringify(JSON.stringify(actions))});
      localStorage.setItem('coevo:quiz', ${JSON.stringify(
        JSON.stringify({ index: 4, answers: quizAnswers, done: false, startedAt: new Date().toISOString() })
      )});
      return true;
    })()`,
    returnByValue: true,
  });
}

async function shot(name, hash, viewport) {
  const vp = { width: 1440, height: 1100, mobile: false, dsf: 1, ...(viewport || {}) };
  await S('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dsf,
    mobile: vp.mobile,
  });
  // 先在同一页面内切到目标 hash，再整页刷新，确保 store 从 localStorage 重新初始化
  await S('Runtime.evaluate', { expression: `location.hash = ${JSON.stringify(hash)}` });
  await sleep(250);
  await S('Page.reload', { ignoreCache: true });
  await sleep(1300);
  const img = await S('Page.captureScreenshot', { format: 'png' });
  await writeFile(join(OUT, name + '.png'), Buffer.from(img.data, 'base64'));
  const info = await S('Runtime.evaluate', {
    expression: `(() => ({
      h: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > innerWidth + 2,
      text: (document.getElementById('viewRoot')?.innerText || '').slice(0, 160).replace(/\\s+/g, ' ')
    }))()`,
    returnByValue: true,
  });
  console.log(name, JSON.stringify(info.result.value));
}

await S('Page.navigate', { url: BASE });
await sleep(600);
await seed();

await shot('ws-filled', '#/workspace', { width: 1440, height: 1400 });
await shot('quiz-answered', '#/quiz');

// 用真实点击走完 15 题
await S('Runtime.evaluate', {
  expression: `(async () => {
    for (let i = 0; i < 15; i++) {
      const opt = document.querySelectorAll('[data-opt]')[1] || document.querySelector('[data-opt]');
      opt?.click();
      await new Promise(r => setTimeout(r, 60));
      const next = document.getElementById('btnNext');
      if (next) { next.click(); await new Promise(r => setTimeout(r, 120)); }
    }
    document.getElementById('btnFinish')?.click();
    return true;
  })()`,
  awaitPromise: true,
  returnByValue: true,
});
await sleep(1000);
const resultShot = await S('Page.captureScreenshot', { format: 'png' });
await writeFile(join(OUT, 'quiz-result.png'), Buffer.from(resultShot.data, 'base64'));
const quizInfo = await S('Runtime.evaluate', {
  expression: `(() => ({ text: (document.getElementById('viewRoot')?.innerText||'').slice(0,240).replace(/\\s+/g,' ') }))()`,
  returnByValue: true,
});
console.log('quiz-result', JSON.stringify(quizInfo.result.value));

await shot('case-mobile', '#/cases/xiaomi', { width: 390, height: 844, mobile: true, dsf: 2 });
await shot('cases-mobile', '#/cases', { width: 390, height: 844, mobile: true, dsf: 2 });
await shot('theory-mobile', '#/theory', { width: 390, height: 844, mobile: true, dsf: 2 });
await shot('ws-mobile', '#/workspace', { width: 390, height: 844, mobile: true, dsf: 2 });
await shot('home-mobile-full', '#/', { width: 390, height: 2600, mobile: true, dsf: 1 });
await shot('theory-elements', '#/theory?tab=elements');
await shot('theory-matrix', '#/theory?tab=matrix');
await shot('theory-curve', '#/theory?tab=curve');

ws.close();
edge.kill();
process.exit(0);
