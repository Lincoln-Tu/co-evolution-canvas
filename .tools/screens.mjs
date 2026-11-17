/**
 * 生成 README 用的最终截图（浅色 / 深色 / 桌面 / 手机）
 * 输出：docs/screenshots/*.png
 */
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:4173/';
const PORT = 9351;
const OUT = resolve(process.cwd(), 'docs/screenshots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const edge = spawn(
  EDGE,
  ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), 'coevo-shots-prof')}`, 'about:blank'],
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
  notes: {},
  elementNotes: { org: '团队从 40 人扩到 180 人，中层管理者缺位，决策仍压在两位创始人身上。' },
  signals: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};
const actions = [
  { id: 'a1', point: 'leader', text: '与 3 位候选人深谈，确定 COO 候选人，Q1 前到位', days: 30, done: false, createdAt: new Date().toISOString() },
  { id: 'a2', point: 'structure', text: '把审批流程改成「10 万以下自主决策」，试行一个月', days: 30, done: true, doneAt: new Date().toISOString(), createdAt: new Date().toISOString() },
];
const quizAnswers = { q1: 1, q2: 1, q3: 1, q4: 1, q5: 0, q6: 1, q7: 1, q8: 1, q9: 0, q10: 1, q11: 0, q12: 1, q13: 2, q14: 1, q15: 1 };

async function setTheme(theme) {
  await S('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('coevo:ui:theme', JSON.stringify(${JSON.stringify(theme)})); return true; })()`,
    returnByValue: true,
  });
}

async function seed() {
  await S('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('coevo:canvas', ${JSON.stringify(JSON.stringify(canvas))});
      localStorage.setItem('coevo:actions', ${JSON.stringify(JSON.stringify(actions))});
      return true;
    })()`,
    returnByValue: true,
  });
}

async function shot(name, hash, { width = 1440, height = 960, mobile = false, dsf = 1, full = false } = {}) {
  await S('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile });
  await S('Runtime.evaluate', { expression: `location.hash = ${JSON.stringify(hash)}` });
  await sleep(200);
  await S('Page.reload', { ignoreCache: true });
  await sleep(1400);
  let params = { format: 'png' };
  if (full) {
    const { cssContentSize } = await S('Page.getLayoutMetrics');
    params = { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: cssContentSize.width, height: Math.min(cssContentSize.height, 5200), scale: 1 } };
  }
  const img = await S('Page.captureScreenshot', params);
  await writeFile(join(OUT, name + '.png'), Buffer.from(img.data, 'base64'));
  console.log('saved', name);
}

await S('Page.navigate', { url: BASE });
await sleep(700);
await setTheme('light');
await seed();

await shot('01-home-desktop', '#/', { height: 1000 });
await shot('02-theory-elements', '#/theory', { height: 1000 });
await shot('03-theory-matrix', '#/theory?tab=matrix', { height: 1000 });
await shot('04-canvas-desktop', '#/canvas', { height: 1000 });
await shot('05-cases', '#/cases', { height: 1000 });
await shot('06-case-detail', '#/cases/xiaomi', { height: 1000 });
await shot('07-workspace', '#/workspace', { height: 1000 });
await shot('08-home-mobile', '#/', { width: 390, height: 844, mobile: true, dsf: 2 });
await shot('09-canvas-mobile', '#/canvas', { width: 390, height: 844, mobile: true, dsf: 2 });
await shot('10-case-mobile', '#/cases/xiaomi', { width: 390, height: 844, mobile: true, dsf: 2 });

// 深色
await setTheme('dark');
await S('Page.reload', { ignoreCache: true });
await sleep(900);
await shot('11-home-dark', '#/', { height: 1000 });
await shot('12-canvas-dark', '#/canvas', { height: 1000 });
await setTheme('light');

ws.close();
edge.kill();
process.exit(0);
