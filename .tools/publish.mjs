/**
 * 发布脚本（Node）：设备码换 token → 建仓 → 推送（失败则用 API 上传）→ 开启 Pages → 验证
 * 用法：node .tools/publish.mjs --device <code> --repo co-evolution-canvas
 */
import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';

const args = process.argv.slice(2);
const arg = (name, def = '') => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const DEVICE = arg('--device');
const REPO = arg('--repo', 'co-evolution-canvas');
const BRANCH = 'main';
const ROOT = process.cwd();
const STATE = join(homedir(), '.coevo');
const TOKEN_FILE = join(STATE, 'token');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const log = (m) => console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${m}`);

async function ghFetch(path, { method = 'GET', body, token, base = 'https://api.github.com' } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'co-evolution-canvas',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status} ${json?.message || text.slice(0, 200)}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

async function pollToken(deviceCode) {
  for (let i = 0; i < 170; i++) {
    try {
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: '178c6fc778ccc68e1d6a',
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });
      const json = await res.json();
      if (json.access_token) return json.access_token;
      if (json.error === 'authorization_pending') { await sleep(5000); continue; }
      if (json.error === 'slow_down') { await sleep(8000); continue; }
      if (json.error === 'expired_token' || json.error === 'access_denied') throw new Error(json.error);
      await sleep(5000);
    } catch (e) {
      if (e.message === 'expired_token' || e.message === 'access_denied') throw e;
      await sleep(5000);
    }
  }
  throw new Error('授权超时');
}

async function walk(dir, base = dir, out = []) {
  for (const name of await readdir(dir)) {
    if (['.git', 'node_modules', '.DS_Store'].includes(name)) continue;
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) await walk(full, base, out);
    else out.push({ full, rel: relative(base, full).split(sep).join('/') });
  }
  return out;
}

function run(cmd, argv, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, argv, { cwd: ROOT, stdio: 'ignore', ...opts });
    p.on('close', (code) => resolve(code));
    p.on('error', () => resolve(-1));
  });
}

async function main() {
  let token;
  if (DEVICE) {
    log('等待 GitHub 授权…');
    token = await pollToken(DEVICE);
    await mkdir(STATE, { recursive: true });
    await writeFile(TOKEN_FILE, token, { mode: 0o600 });
    log('已获得令牌');
  } else {
    token = (await readFile(TOKEN_FILE, 'utf8')).trim();
  }

  const user = await ghFetch('/user', { token });
  const login = user.login;
  log(`账号：${login}`);

  // 仓库
  let repoExists = true;
  try { await ghFetch(`/repos/${login}/${REPO}`, { token }); } catch (e) { if (e.status === 404) repoExists = false; else throw e; }
  if (!repoExists) {
    log(`创建仓库 ${login}/${REPO}`);
    await ghFetch('/user/repos', {
      method: 'POST', token,
      body: { name: REPO, description: '共演战略画布 · 基于路江涌教授方法论的 EMBA 交互式战略推演工具', private: false, has_issues: true, has_wiki: false, auto_init: false },
    });
  } else log('仓库已存在');

  // 优先 git push
  const b64 = Buffer.from(`x-access-token:${token}`).toString('base64');
  const gitExe = ['git', join(process.env.LOCALAPPDATA || '', 'dsh-tools/git/cmd/git.exe')];
  let pushed = false;
  for (const g of gitExe) {
    const v = await run(g, ['--version']);
    if (v !== 0) continue;
    await run(g, ['remote', 'remove', 'origin']);
    await run(g, ['remote', 'add', 'origin', `https://github.com/${login}/${REPO}.git`]);
    await run(g, ['branch', '-M', BRANCH]);
    log('尝试 git push…');
    const code = await run(g, ['-c', 'credential.helper=', '-c', `http.https://github.com/.extraheader=AUTHORIZATION: basic ${b64}`, 'push', '-u', 'origin', BRANCH, '--force']);
    if (code === 0) { pushed = true; log('push 成功'); break; }
  }

  if (!pushed) {
    log('git push 不可用，改用 GitHub API 上传…');
    const files = await walk(ROOT);
    log(`共 ${files.length} 个文件`);
    const entries = [];
    for (const f of files) {
      const buf = await readFile(f.full);
      const blob = await ghFetch(`/repos/${login}/${REPO}/git/blobs`, {
        method: 'POST', token, body: { content: buf.toString('base64'), encoding: 'base64' },
      });
      entries.push({ path: f.rel, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const tree = await ghFetch(`/repos/${login}/${REPO}/git/trees`, {
      method: 'POST', token, body: { tree: entries },
    });
    const commit = await ghFetch(`/repos/${login}/${REPO}/git/commits`, {
      method: 'POST', token, body: { message: 'feat: 共演战略画布 v1.0（API 上传）', tree: tree.sha, parents: [] },
    });
    try {
      await ghFetch(`/repos/${login}/${REPO}/git/refs`, { method: 'POST', token, body: { ref: `refs/heads/${BRANCH}`, sha: commit.sha } });
    } catch {
      await ghFetch(`/repos/${login}/${REPO}/git/refs/heads/${BRANCH}`, { method: 'PATCH', token, body: { sha: commit.sha, force: true } });
    }
    await ghFetch(`/repos/${login}/${REPO}`, { method: 'PATCH', token, body: { default_branch: BRANCH } });
    log('API 上传完成');
  }

  // Pages
  log('配置 Pages…');
  try {
    await ghFetch(`/repos/${login}/${REPO}/pages`, { method: 'POST', token, body: { source: { branch: BRANCH, path: '/' } } });
    log('Pages 已开启');
  } catch (e) {
    try {
      await ghFetch(`/repos/${login}/${REPO}/pages`, { method: 'PUT', token, body: { source: { branch: BRANCH, path: '/' } } });
      log('Pages 已更新');
    } catch (e2) {
      log(`Pages 配置失败：${e2.message}`);
    }
  }

  // 验证
  const url = `https://${login}.github.io/${REPO}/`;
  log(`等待站点：${url}`);
  for (let i = 0; i < 36; i++) {
    await sleep(10000);
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const html = await res.text();
      if (res.ok && html.includes('共演战略画布')) { log(`线上验证通过：${url}`); break; }
    } catch { /* retry */ }
  }

  await writeFile(join(STATE, 'publish.json'), JSON.stringify({ login, repo: REPO, url, repoUrl: `https://github.com/${login}/${REPO}`, at: new Date().toISOString() }, null, 2));
  console.log(`RESULT_URL=${url}`);
  console.log(`RESULT_REPO=https://github.com/${login}/${REPO}`);
  console.log(`RESULT_LOGIN=${login}`);
}

main().catch((e) => {
  console.error('PUBLISH_FAILED:', e.message);
  process.exit(1);
});
