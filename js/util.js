/* ============================  DOM 工具  ============================ */

/**
 * 创建元素的极简助手。
 * h('div.card', { onclick }, [children])
 * 选择器支持 tag、.class、#id 组合（简化写法，不支持嵌套）。
 */
export function h(sel, props = null, children = null) {
  const m = sel.match(/^([a-zA-Z0-9-]*)((?:[.#][\w-]+)*)$/);
  const tag = (m && m[1]) || 'div';
  const el = document.createElement(tag);
  if (m && m[2]) {
    for (const part of m[2].match(/[.#][\w-]+/g) || []) {
      if (part[0] === '.') el.classList.add(part.slice(1));
      else el.id = part.slice(1);
    }
  }
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className += (el.className ? ' ' : '') + v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'attrs') for (const [ak, av] of Object.entries(v)) el.setAttribute(ak, av);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  appendAll(el, children);
  return el;
}

export function appendAll(parent, children) {
  if (children == null || children === false) return parent;
  if (Array.isArray(children)) {
    for (const c of children) appendAll(parent, c);
  } else if (children instanceof Node) {
    parent.appendChild(children);
  } else {
    parent.appendChild(document.createTextNode(String(children)));
  }
  return parent;
}

/** 安全 HTML：仅用于受控的静态模板字符串 */
export function html(strings, ...vals) {
  return strings.reduce((acc, s, i) => acc + s + (i < vals.length ? (vals[i] ?? '') : ''), '');
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** 事件委托 */
export function delegate(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 滚动进入视口时加 .is-in（配合 CSS .reveal） */
let revealObserver = null;
export function observeReveals(root = document) {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal', root).forEach((el) => el.classList.add('is-in'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
  }
  $$('.reveal', root).forEach((el) => {
    if (!el.classList.contains('is-in')) revealObserver.observe(el);
  });
}

/** 数字滚动动画 */
export function animateNumber(el, to, { duration = 900, decimals = 0, suffix = '' } = {}) {
  const from = 0;
  const start = performance.now();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    el.textContent = to.toFixed(decimals) + suffix;
    return;
  }
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (from + (to - from) * eased).toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ============================  存储  ============================ */

const NS = 'coevo:';
const memory = new Map();

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return memory.has(key) ? memory.get(key) : fallback;
    }
  },
  set(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    memory.delete(key);
    try {
      localStorage.removeItem(NS + key);
    } catch {
      /* noop */
    }
  },
  clearAll() {
    memory.clear();
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(NS))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* noop */
    }
  },
};

/* ============================  反馈  ============================ */

let toastTimer = null;
export function toast(message, { duration = 2600 } = {}) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const prev = stack.lastElementChild;
  if (prev && prev.dataset.msg === message) {
    clearTimeout(toastTimer);
    prev.classList.remove('is-out');
    toastTimer = setTimeout(() => dismiss(prev), duration);
    return;
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.dataset.msg = message;
  el.textContent = message;
  stack.appendChild(el);
  toastTimer = setTimeout(() => dismiss(el), duration);
}
function dismiss(el) {
  el.classList.add('is-out');
  setTimeout(() => el.remove(), 220);
}

/** 底部/居中弹层 */
export function openSheet(title, content, { wide = false } = {}) {
  const dlg = document.getElementById('globalSheet');
  const body = document.getElementById('sheetBody');
  document.getElementById('sheetTitle').textContent = title;
  clear(body);
  if (typeof content === 'string') body.innerHTML = content;
  else appendAll(body, content);
  dlg.classList.toggle('sheet-wide', wide);
  if (!dlg.open) dlg.showModal();
  body.scrollTop = 0;
  return dlg;
}

export function closeSheet() {
  const dlg = document.getElementById('globalSheet');
  if (dlg && dlg.open) dlg.close();
}

/* ============================  分享  ============================ */

export async function sharePage({ title, text, url } = {}) {
  const data = {
    title: title || document.title,
    text: text || '共演战略画布：四要素 × 四阶段，让战略在生命周期中共同演化。',
    url: url || location.href,
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    toast('链接已复制，可分享给同学');
    return 'copied';
  } catch {
    toast('当前浏览器不支持一键分享，请手动复制地址栏链接');
    return 'failed';
  }
}

/* ============================  其它  ============================ */

export function debounce(fn, wait = 200) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function seededShuffle(arr, seed = 1) {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 生成不依赖后端的唯一 id */
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 下载文本文件 */
export function download(filename, text, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 复制文本 */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
    return true;
  } catch {
    toast('复制失败，请手动选择文本');
    return false;
  }
}
