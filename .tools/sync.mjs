#!/usr/bin/env node
/**
 * 本地修改 → GitHub 即时同步（走 api.github.com，不依赖 github.com:443）
 *
 * 用法：
 *   node .tools/sync.mjs            # 同步一次
 *   node .tools/sync.mjs --watch    # 持续监听并同步
 *   node .tools/sync.mjs --status   # 查看待同步差异
 *
 * 原理：
 *   1. 读取 ~/.coevo/token 与 ~/.coevo/publish.json
 *   2. 拉取远端最新 commit / tree，用 git blob SHA 对比本地文件
 *   3. 仅上传变更的 blob，删除远端已不存在的文件
 *   4. 创建 commit 并更新 refs/heads/main
 *   GitHub Pages 会自动重新构建。
 */

import { readFile, writeFile, readdir, stat, appendFile, mkdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';

const ROOT = process.cwd();
const STATE_DIR = join(homedir(), '.coevo');
const TOKEN_FILE = join(STATE_DIR, 'token');
const META_FILE = join(STATE_DIR, 'publish.json');
const LOG_FILE = join(STATE_DIR, 'sync.log');
const BRANCH = 'main';
const API = 'https://api.github.com';

const IGNORE = new Set(['.git', 'node_modules', '.DS_Store', 'Thumbs.db', '.vscode']);
const args = new Set(process.argv.slice(2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function log(msg, silent = false) {
  const line = `[${new Date().toLocaleString('zh-CN')}] ${msg}`;
  try {
    await mkdir(STATE_DIR, { recursive: true });
    // 首次写入加 BOM，保证 Windows PowerShell 以 UTF-8 正确读取中文
    let prefix = '';
    try { await stat(LOG_FILE); } catch { prefix = '\uFEFF'; }
    await appendFile(LOG_FILE, prefix + line + '\n', 'utf8');
  } catch { /* ignore */ }
  if (!silent) console.log(line);
}

async function loadConfig() {
  const token = (await readFile(TOKEN_FILE, 'utf8')).trim();
  const meta = JSON.parse(await readFile(META_FILE, 'utf8'));
  return { token, owner: meta.login, repo: meta.repo, url: meta.url };
}

async function api(cfg, path, { method = 'GET', body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'co-evolution-canvas-sync',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status} ${json?.message || text.slice(0, 160)}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

function blobSha(buf) {
  return createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');
}

async function walk(dir, base = dir, out = []) {
  for (const name of await readdir(dir)) {
    if (IGNORE.has(name)) continue;
    const full = join(dir, name);
    let s;
    try { s = await stat(full); } catch { continue; }
    if (s.isDirectory()) await walk(full, base, out);
    else out.push({ full, rel: relative(base, full).split(sep).join('/'), size: s.size });
  }
  return out;
}

/** 计算本地与远端的差异 */
export async function diff(cfg) {
  const head = await api(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/ref/heads/${BRANCH}`);
  const headSha = head.object.sha;
  const commit = await api(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/commits/${headSha}`);
  const baseTree = commit.tree.sha;
  const tree = await api(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/trees/${baseTree}?recursive=1`);

  const remote = new Map();
  for (const e of tree.tree || []) if (e.type === 'blob') remote.set(e.path, e.sha);

  const files = await walk(ROOT);
  const local = new Map();
  const changed = [];
  for (const f of files) {
    const buf = await readFile(f.full);
    const sha = blobSha(buf);
    local.set(f.rel, sha);
    if (remote.get(f.rel) !== sha) changed.push({ ...f, buf, sha, isNew: !remote.has(f.rel) });
  }
  const removed = [...remote.keys()].filter((p) => !local.has(p));

  return { headSha, baseTree, changed, removed, total: files.length, remoteCount: remote.size };
}

export async function syncOnce(cfg, { silent = false } = {}) {
  const d = await diff(cfg);
  if (!d.changed.length && !d.removed.length) {
    if (!silent) console.log('✓ 没有需要同步的变更');
    return { synced: false };
  }

  const entries = [];
  for (const c of d.changed) {
    const blob = await api(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/blobs`, {
      method: 'POST',
      body: { content: c.buf.toString('base64'), encoding: 'base64' },
    });
    entries.push({ path: c.rel, mode: '100644', type: 'blob', sha: blob.sha });
  }
  for (const p of d.removed) entries.push({ path: p, mode: '100644', type: 'blob', sha: null });

  const tree = await api(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/trees`, {
    method: 'POST',
    body: { base_tree: d.baseTree, tree: entries },
  });

  const stamp = new Date().toLocaleString('zh-CN', { hour12: false });
  const summary = [
    d.changed.length ? `更新 ${d.changed.length} 个文件` : '',
    d.removed.length ? `删除 ${d.removed.length} 个文件` : '',
  ].filter(Boolean).join('，');

  const commit = await api(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/commits`, {
    method: 'POST',
    body: {
      message: `chore(auto): ${summary} · ${stamp}`,
      tree: tree.sha,
      parents: [d.headSha],
    },
  });

  await api(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: { sha: commit.sha, force: true },
  });

  await log(`✓ 已同步：${summary}（${commit.sha.slice(0, 7)}）`, silent);
  return { synced: true, commit: commit.sha, changed: d.changed.length, removed: d.removed.length };
}

async function watch(cfg) {
  const { watch: fsWatch } = await import('node:fs');
  await log('自动同步已启动（API 通道）');
  let timer = null;
  let running = false;
  let pending = false;

  const schedule = (delay = 1200) => {
    pending = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) return;
      running = true;
      pending = false;
      try {
        await syncOnce(cfg, { silent: false });
      } catch (e) {
        await log(`✗ 同步失败，将在 30 秒后重试：${e.message}`);
        schedule(30000);
      } finally {
        running = false;
        if (pending && !timer) schedule();
      }
    }, delay);
  };

  fsWatch(ROOT, { recursive: true }, (event, filename) => {
    if (!filename) return;
    const p = String(filename).split(sep).join('/');
    if (p.startsWith('.git/') || p.includes('/.git/')) return;
    if (p.endsWith('.tmp') || p.endsWith('~')) return;
    schedule();
  });

  // 启动先跑一次
  try { await syncOnce(cfg, { silent: false }); } catch (e) { await log(`✗ 首次同步失败：${e.message}`); }

  // 常驻
  await new Promise(() => {});
}

async function main() {
  const cfg = await loadConfig();
  if (args.has('--status')) {
    const d = await diff(cfg);
    console.log(`本地文件 ${d.total} 个，远端 ${d.remoteCount} 个`);
    console.log(`待上传 ${d.changed.length} 个，待删除 ${d.removed.length} 个`);
    for (const c of d.changed.slice(0, 20)) console.log(`  ${c.isNew ? '+' : '~'} ${c.rel}`);
    for (const r of d.removed.slice(0, 20)) console.log(`  - ${r}`);
    return;
  }
  if (args.has('--watch')) { await watch(cfg); return; }
  const r = await syncOnce(cfg);
  if (!r.synced) console.log('✓ 已是最新');
}

main().catch((e) => {
  console.error('✗', e.message);
  process.exit(1);
});
