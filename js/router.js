/**
 * 极简哈希路由
 * 支持：#/、#/theory、#/theory#curve、#/cases/xiaomi、#/cases?stage=growth
 */

const routes = new Map();
let notFound = null;
let current = null;

export function route(pattern, handler) {
  routes.set(pattern, handler);
}

export function setNotFound(handler) {
  notFound = handler;
}

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathAndQuery, anchor] = raw.split('#');
  const [path, query = ''] = pathAndQuery.split('?');
  return {
    path: path.startsWith('/') ? path : '/' + path,
    query: Object.fromEntries(new URLSearchParams(query)),
    anchor: anchor || null,
  };
}

function match(path) {
  if (routes.has(path)) return { handler: routes.get(path), params: {} };
  for (const [pattern, handler] of routes) {
    if (!pattern.includes(':')) continue;
    const pSeg = pattern.split('/');
    const aSeg = path.split('/');
    if (pSeg.length !== aSeg.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < pSeg.length; i++) {
      if (pSeg[i].startsWith(':')) params[pSeg[i].slice(1)] = decodeURIComponent(aSeg[i]);
      else if (pSeg[i] !== aSeg[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { handler, params };
  }
  return null;
}

let renderToken = 0;
export async function dispatch() {
  const { path, query, anchor } = parseHash();
  const found = match(path);
  const token = ++renderToken;
  const root = document.getElementById('viewRoot');
  const handler = found ? found.handler : notFound;
  if (!handler) return;

  const meta = { path, query, anchor, params: found ? found.params : {} };
  current = meta;

  // 视图切换时的过渡
  root.style.opacity = '0';
  let result;
  try {
    result = await handler(meta);
  } catch (err) {
    console.error('[route]', err);
    result = null;
  }
  if (token !== renderToken) return; // 已被更新的路由取代
  if (typeof result === 'function') {
    // handler 自行渲染到 #viewRoot
  }
  root.style.opacity = '';
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

  if (anchor) {
    requestAnimationFrame(() => {
      const target = document.getElementById(anchor);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  updateNav(path);
  document.dispatchEvent(new CustomEvent('dsh:route', { detail: meta }));
}

export function updateNav(path) {
  const section = '/' + (path.split('/')[1] || '');
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('is-active', a.getAttribute('data-nav') === (section === '/' ? 'home' : section.slice(1)));
  });
}

export function navigate(to) {
  if (location.hash === '#' + to) dispatch();
  else location.hash = to;
}

export function currentRoute() {
  return current;
}

export function start() {
  window.addEventListener('hashchange', dispatch);
  if (!location.hash) location.replace('#/');
  dispatch();
}
