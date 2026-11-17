/**
 * 开发期 QA 脚本（不参与站点运行）
 * 用 Edge DevTools Protocol 打开页面、收集控制台错误、注入测试数据并截图。
 *
 * 用法：node .tools/qa.mjs
 */

import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://127.0.0.1:4173/';
const PORT = 9222;
const OUT = join(tmpdir(), 'coevo-qa');

const ROUTES = [
  ['home', '#/'],
  ['theory', '#/theory'],
  ['theory-stages', '#/theory?tab=stages'],
  ['theory-matrix', '#/theory?tab=matrix'],
  ['theory-curve', '#/theory?tab=curve'],
  ['canvas', '#/canvas'],
  ['cases', '#/cases'],
  ['case-xiaomi', '#/cases/xiaomi'],
  ['quiz', '#/quiz'],
  ['workspace', '#/workspace'],
  ['about', '#/about'],
  ['notfound', '#/nope'],
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch {
      /* retry */
    }
    await sleep(200);
  }
  throw new Error('DevTools 未就绪');
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const profile = join(tmpdir(), 'coevo-qa-profile');
  const edge = spawn(
    EDGE,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--hide-scrollbars',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore', detached: false }
  );

  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let seq = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  };

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });

  // 附加到新标签页
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);

  await S('Page.enable');
  await S('Runtime.enable');
  await S('Log.enable');

  const consoleErrors = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.sessionId !== sessionId) return;
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push({ type: 'exception', text: msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text });
    }
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
      consoleErrors.push({
        type: msg.params.type,
        text: msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '),
      });
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push({ type: 'log', text: msg.params.entry.text });
    }
  });

  const results = [];

  for (const vp of viewports) {
    await S('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    });

    for (const [name, hash] of ROUTES) {
      const before = consoleErrors.length;
      await S('Page.navigate', { url: BASE + hash });
      await sleep(1100);
      const { result } = await S('Runtime.evaluate', {
        expression: `(() => {
          const r = document.getElementById('viewRoot');
          return {
            hash: location.hash,
            title: document.title,
            text: (r?.innerText || '').slice(0, 120).replace(/\\s+/g, ' '),
            h: document.documentElement.scrollHeight,
            nodes: r?.querySelectorAll('*').length || 0,
            overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
          };
        })()`,
        returnByValue: true,
      });
      const errs = consoleErrors.slice(before);
      results.push({ viewport: vp.name, route: name, ...result.value, errors: errs.length, errorTexts: errs.map((e) => e.text).slice(0, 3) });

      const shot = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(OUT, `${vp.name}-${name}.png`), Buffer.from(shot.data, 'base64'));
    }
  }

  // 注入一份填好的画布数据，验证评分与诊断
  await S('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });
  await S('Page.navigate', { url: BASE + '#/canvas' });
  await sleep(600);
  await S('Runtime.evaluate', {
    expression: `(() => {
      const canvas = {
        company: '示例科技', industry: 'SaaS', stage: 'growth',
        scores: { characteristics:4, needs:4, choice:3, leader:2, team:3, structure:2, development:4, marketing:2, businessModel:3, tech:3, capital:2, competition:2 },
        notes: {}, elementNotes: { org: '团队扩张快，但中层管理者缺位。' },
        signals: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('coevo:canvas', JSON.stringify(canvas));
      return true;
    })()`,
    returnByValue: true,
  });
  await S('Page.reload', { ignoreCache: true });
  await sleep(1400);
  const filled = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(join(OUT, 'desktop-canvas-filled.png'), Buffer.from(filled.data, 'base64'));

  const filledInfo = await S('Runtime.evaluate', {
    expression: `(() => {
      const t = document.getElementById('diagPanel')?.innerText || '';
      const quad = document.querySelector('[data-quad="org"] [data-quad-score-value]')?.textContent;
      return { diag: t.slice(0, 400).replace(/\\s+/g, ' '), orgScore: quad };
    })()`,
    returnByValue: true,
  });
  results.push({ viewport: 'desktop', route: 'canvas-filled', ...filledInfo.value, errors: 0 });

  // 评分交互：点击服务端看不到的新评分按钮
  const clickInfo = await S('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('[data-point-row="marketing"] [data-rate][data-level="5"]');
      if (!btn) return { ok:false, why:'no button' };
      btn.click();
      return { ok:true, pressed: btn.getAttribute('aria-pressed') };
    })()`,
    returnByValue: true,
  });
  await sleep(400);
  const afterClick = await S('Runtime.evaluate', {
    expression: `(() => ({
      scores: JSON.parse(localStorage.getItem('coevo:canvas') || '{}').scores,
      firstQuad: document.querySelector('[data-quad="product"] [data-quad-score-value]')?.textContent,
      diagTitle: document.querySelector('.diag-verdict b')?.textContent,
    }))()`,
    returnByValue: true,
  });
  results.push({ viewport: 'desktop', route: 'canvas-click', click: clickInfo.value, afterClick: afterClick.value, errors: 0 });

  // 移动端画布截图
  await S('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await S('Page.navigate', { url: BASE + '#/canvas' });
  await sleep(900);
  const mob = await S('Page.captureScreenshot', { format: 'png' });
  await writeFile(join(OUT, 'mobile-canvas-filled.png'), Buffer.from(mob.data, 'base64'));

  await writeFile(join(OUT, 'report.json'), JSON.stringify({ results, consoleErrors }, null, 2));

  console.log(JSON.stringify(results, null, 2));
  console.log('\n--- console errors (' + consoleErrors.length + ') ---');
  console.log(consoleErrors.slice(0, 20));

  ws.close();
  edge.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
