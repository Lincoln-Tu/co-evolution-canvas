/**
 * SVG 图表：双 S 曲线、要素雷达、进度环、迷你趋势
 * 不依赖任何图表库，全部手写路径。
 */

import { CURVES, STAGES, ELEMENTS } from './data/theory.js';

/* ------------------------- 几何工具 ------------------------- */

function toPoints(list, W, H, PAD) {
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  return list.map(([x, y]) => [PAD.l + x * innerW, PAD.t + (1 - y) * innerH]);
}

/** Catmull-Rom → 三次贝塞尔，得到平滑曲线 */
function smoothPath(points, tension = 0.5) {
  if (points.length < 2) return '';
  const d = [`M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const cp1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const cp2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const cp2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`);
  }
  return d.join(' ');
}

/** 两曲线的交点（按 x 采样近似） */
function findCross(aPts, bPts, W, H, PAD) {
  const A = toPoints(aPts, W, H, PAD);
  const B = toPoints(bPts, W, H, PAD);
  const sample = (pts, x) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      if (x >= x1 && x <= x2) {
        const t = (x - x1) / (x2 - x1 || 1);
        return y1 + (y2 - y1) * t;
      }
    }
    return null;
  };
  const from = Math.max(A[0][0], B[0][0]);
  const to = Math.min(A[A.length - 1][0], B[B.length - 1][0]);
  let prev = null;
  for (let x = from; x <= to; x += 2) {
    const ya = sample(A, x);
    const yb = sample(B, x);
    if (ya == null || yb == null) continue;
    const diff = ya - yb; // 屏幕坐标：越小越高
    if (prev && prev.diff > 0 && diff <= 0) {
      // 交点在 prev.x 与 x 之间
      return { x: (prev.x + x) / 2, y: (prev.ya + prev.yb) / 2 };
    }
    prev = { x, diff, ya, yb };
  }
  return null;
}

/* ------------------------- 双 S 曲线 ------------------------- */

/**
 * @param {object} opts
 * @param {string|null} opts.active 高亮的阶段 key
 * @param {boolean} opts.interactive 是否可点击切换阶段
 * @param {boolean} opts.compact 紧凑模式（首页/移动端）
 */
export function dualSCurve({ active = null, interactive = true, compact = false, id = 'dsc' } = {}) {
  const W = 760;
  const H = compact ? 300 : 420;
  const PAD = { l: 46, r: 26, t: 32, b: compact ? 46 : 64 };

  const A = toPoints(CURVES.a.points, W, H, PAD);
  const B = toPoints(CURVES.b.points, W, H, PAD);

  // C 曲线：取 A/B 在采样点上的较高值
  const samples = [];
  for (let i = 0; i <= 100; i++) {
    const x = PAD.l + (i / 100) * (W - PAD.l - PAD.r);
    const ya = sampleY(A, x);
    const yb = sampleY(B, x);
    if (ya == null && yb == null) continue;
    samples.push([x, Math.min(ya ?? 1e9, yb ?? 1e9)]);
  }
  const C = samples;

  const cross = findCross(CURVES.a.points, CURVES.b.points, W, H, PAD);

  // 阶段分界（相对 x）
  const bounds = [0, 0.25, 0.5, 0.78, 1];
  const stageXs = bounds.map((t) => PAD.l + t * (W - PAD.l - PAD.r));
  const stageOrder = ['startup', 'growth', 'expansion', 'transformation'];

  const gradA = `${id}-ga`;
  const gradB = `${id}-gb`;
  const gradC = `${id}-gc`;

  // 横向网格
  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => {
      const y = PAD.t + t * (H - PAD.t - PAD.b);
      return `<line x1="${PAD.l}" y1="${y}" x2="${W - PAD.r}" y2="${y}" class="dsc-grid"/>`;
    })
    .join('');

  // 阶段高亮带
  const band = active
    ? (() => {
        const i = stageOrder.indexOf(active);
        if (i < 0) return '';
        const x1 = stageXs[i];
        const x2 = stageXs[i + 1];
        return `<rect x="${x1}" y="${PAD.t - 10}" width="${x2 - x1}" height="${H - PAD.t - PAD.b + 10}" class="dsc-band" rx="6"/>`;
      })()
    : '';

  const stageLabels = stageOrder
    .map((key, i) => {
      const st = STAGES[i];
      const x = (stageXs[i] + stageXs[i + 1]) / 2;
      const y = H - PAD.b + (compact ? 22 : 26);
      const isActive = active === key;
      return `
        <g class="dsc-stage ${isActive ? 'is-active' : ''}" ${interactive ? `data-stage="${key}" tabindex="0" role="button" aria-label="查看${st.label}阶段"` : ''}>
          <text x="${x}" y="${y}" text-anchor="middle" class="dsc-stage-name">${st.label}</text>
          <text x="${x}" y="${y + (compact ? 14 : 16)}" text-anchor="middle" class="dsc-stage-sub">${st.span}</text>
          ${isActive ? `<circle cx="${x}" cy="${PAD.t - 2}" r="3.5" class="dsc-stage-dot"/>` : ''}
        </g>`;
    })
    .join('');

  const axisLabelY = PAD.t - 12;
  const legend = compact
    ? ''
    : `<g class="dsc-legend" transform="translate(${W - PAD.r - 150}, ${PAD.t - 18})">
        <line x1="0" y1="0" x2="18" y2="0" class="dsc-legend-a"/><text x="24" y="4" class="dsc-legend-text">A 曲线 · 现有业务</text>
        <line x1="0" y1="16" x2="18" y2="16" class="dsc-legend-b"/><text x="24" y="20" class="dsc-legend-text">B 曲线 · 新业务</text>
      </g>`;

  return `
  <svg class="dsc ${compact ? 'dsc-compact' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="企业价值双 S 曲线：A 曲线为现有业务生命周期，B 曲线为第二曲线，二者叠加为企业价值 C 曲线">
    <defs>
      <linearGradient id="${gradA}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#C0563A"/><stop offset="55%" stop-color="#C9A227"/><stop offset="100%" stop-color="#A87F16"/>
      </linearGradient>
      <linearGradient id="${gradB}" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="#3C5E8C"/><stop offset="100%" stop-color="#2E7D74"/>
      </linearGradient>
      <linearGradient id="${gradC}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#C9A227" stop-opacity=".28"/><stop offset="100%" stop-color="#2E7D74" stop-opacity=".06"/>
      </linearGradient>
      <filter id="${id}-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    ${gridLines}
    ${band}

    <text x="${PAD.l}" y="${axisLabelY}" class="dsc-axis-title">企业价值</text>
    <text x="${W - PAD.r}" y="${H - 6}" text-anchor="end" class="dsc-axis-title">时间 · 企业生命周期</text>

    <path d="${smoothPath(C)} L ${C[C.length - 1][0]} ${H - PAD.b} L ${C[0][0]} ${H - PAD.b} Z" fill="url(#${gradC})" class="dsc-c-fill"/>
    <path d="${smoothPath(A)}" class="dsc-a" stroke="url(#${gradA})"/>
    <path d="${smoothPath(B)}" class="dsc-b" stroke="url(#${gradB})"/>

    ${cross ? `
      <line x1="${cross.x}" y1="${PAD.t - 6}" x2="${cross.x}" y2="${H - PAD.b}" class="dsc-cross-line"/>
      <circle cx="${cross.x}" cy="${cross.y}" r="5.5" class="dsc-cross-dot"/>
      <text x="${cross.x + 12}" y="${cross.y - 14}" class="dsc-cross-text">曲线交接</text>
    ` : ''}

    <text x="${PAD.l + 18}" y="${PAD.t + 16}" class="dsc-anno">A 曲线 · 现有业务</text>
    <text x="${W - PAD.r - 96}" y="${H * 0.46}" class="dsc-anno dsc-anno-b">B 曲线 · 新业务</text>
    ${stageLabels}
    ${legend}
    ${interactive ? `<rect x="${PAD.l}" y="${PAD.t}" width="${W - PAD.l - PAD.r}" height="${H - PAD.t - PAD.b}" fill="transparent" class="dsc-hit"/>` : ''}
  </svg>`;
}

function sampleY(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    if (x >= x1 && x <= x2) {
      const t = (x - x1) / (x2 - x1 || 1);
      return y1 + (y2 - y1) * t;
    }
  }
  return null;
}

/* ------------------------- 要素雷达 ------------------------- */

/**
 * @param {Record<string, number>} scores 四要素均分（0-5）
 */
export function elementRadar(scores, { size = 300 } = {}) {
  const keys = ['org', 'user', 'market', 'product']; // 左上、右上、右下、左下
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.34;
  const angles = keys.map((_, i) => -Math.PI / 2 + (i * Math.PI) / 2);
  const pt = (i, v) => [cx + Math.cos(angles[i]) * R * (v / 5), cy + Math.sin(angles[i]) * R * (v / 5)];

  const rings = [1, 2, 3, 4, 5]
    .map((r) => {
      const pts = keys.map((_, i) => pt(i, r).map((n) => n.toFixed(1)).join(',')).join(' ');
      return `<polygon points="${pts}" class="radar-ring ${r === 5 ? 'radar-ring-outer' : ''}"/>`;
    })
    .join('');

  const axes = keys
    .map((_, i) => {
      const [x, y] = pt(i, 5);
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="radar-axis"/>`;
    })
    .join('');

  const polyPts = keys
    .map((k, i) => pt(i, Math.max(0.4, scores[k] || 0)).map((n) => n.toFixed(1)).join(','))
    .join(' ');

  const labels = keys
    .map((k, i) => {
      const el = ELEMENTS.find((e) => e.key === k);
      const [x, y] = pt(i, 5.9);
      const anchor = Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end';
      const val = scores[k] || 0;
      const valueLine = val > 0
        ? `<text x="${x.toFixed(1)}" y="${(y + 18).toFixed(1)}" text-anchor="${anchor}" class="radar-value">${val.toFixed(1)}</text>`
        : '';
      return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" class="radar-label" fill="${el.color}">${el.label}</text>${valueLine}`;
    })
    .join('');

  return `
  <svg class="radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="四要素均衡度雷达图">
    ${rings}${axes}
    <polygon points="${polyPts}" class="radar-area"/>
    ${keys.map((k, i) => {
      const [x, y] = pt(i, Math.max(0.4, scores[k] || 0));
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="var(--el-${k})" stroke="var(--surface)" stroke-width="1.4"/>`;
    }).join('')}
    ${labels}
  </svg>`;
}

/* ------------------------- 进度环 ------------------------- */

export function progressRing(value, { size = 120, stroke = 8, label = '', sub = '' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return `
  <div class="ring" style="--size:${size}px">
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-track" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-value" stroke-width="${stroke}"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - pct)).toFixed(1)}"/>
    </svg>
    <div class="ring-text"><b>${label}</b>${sub ? `<span>${sub}</span>` : ''}</div>
  </div>`;
}

/* ------------------------- 迷你阶段条 ------------------------- */

export function stageBar(activeKey, { compact = false } = {}) {
  return `
  <div class="stagebar ${compact ? 'stagebar-compact' : ''}" role="tablist" aria-label="生命周期阶段">
    ${STAGES.map((s) => `
      <button type="button" role="tab" aria-selected="${s.key === activeKey}" data-stage-tab="${s.key}"
        class="stagebar-item ${s.key === activeKey ? 'is-active' : ''}" style="--c:${s.color}">
        <span class="stagebar-code">${s.code}</span>
        <span class="stagebar-label">${s.label}</span>
        ${compact ? '' : `<span class="stagebar-span">${s.span}</span>`}
      </button>`).join('')}
  </div>`;
}

/* ------------------------- 45° 矩阵（SVG） ------------------------- */

export function quadMatrix({ active = null, showPoints = false } = {}) {
  const W = 520;
  const H = 460;
  const PAD = 44;
  const cx = W / 2;
  const cy = H / 2;
  const quadrants = [
    { key: 'org', x: PAD, y: PAD, w: cx - PAD - 8, h: cy - PAD - 8, label: '组织', sub: '内 · 人' },
    { key: 'user', x: cx + 8, y: PAD, w: W - cx - 8 - PAD, h: cy - PAD - 8, label: '用户', sub: '外 · 人' },
    { key: 'product', x: PAD, y: cy + 8, w: cx - PAD - 8, h: H - cy - 8 - PAD, label: '产品', sub: '内 · 事' },
    { key: 'market', x: cx + 8, y: cy + 8, w: W - cx - 8 - PAD, h: H - cy - 8 - PAD, label: '市场', sub: '外 · 事' },
  ];
  return `
  <svg class="matrix" viewBox="0 0 ${W} ${H}" role="img" aria-label="四要素二维矩阵：横轴内到外，纵轴事到人">
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/>
      </marker>
    </defs>
    ${quadrants.map((q) => `
      <g class="matrix-q ${active === q.key ? 'is-active' : ''}" data-el="${q.key}">
        <rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" rx="12" class="matrix-rect" style="--c:var(--el-${q.key})"/>
        <text x="${q.x + q.w / 2}" y="${q.y + 30}" text-anchor="middle" class="matrix-label">${q.label}</text>
        <text x="${q.x + q.w / 2}" y="${q.y + 50}" text-anchor="middle" class="matrix-sub">${q.sub}</text>
        <text x="${q.x + q.w / 2}" y="${q.y + q.h - 16}" text-anchor="middle" class="matrix-en">${q.key.toUpperCase()}</text>
      </g>`).join('')}
    <line x1="${cx}" y1="${PAD - 10}" x2="${cx}" y2="${H - PAD + 10}" class="matrix-axis"/>
    <line x1="${PAD - 10}" y1="${cy}" x2="${W - PAD + 10}" y2="${cy}" class="matrix-axis"/>
    <text x="${PAD - 14}" y="${cy - 6}" text-anchor="end" class="matrix-axis-label">内</text>
    <text x="${W - PAD + 14}" y="${cy - 6}" text-anchor="start" class="matrix-axis-label">外</text>
    <text x="${cx + 8}" y="${PAD - 16}" text-anchor="start" class="matrix-axis-label">人</text>
    <text x="${cx + 8}" y="${H - PAD + 18}" text-anchor="start" class="matrix-axis-label">事</text>
  </svg>`;
}
