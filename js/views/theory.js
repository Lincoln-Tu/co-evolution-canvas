/**
 * 理论图谱：四要素 / 四阶段 / 48 演化 / 双 S 曲线
 */

import {
  ELEMENTS, POINTS, STAGES, STAGE_KEYS, SIX_QUESTIONS, CURVES, TRANSITIONS,
  MISREADINGS, FOUR_RULES, FOUR_DEGREES, EVOLUTION_MATRIX, SOURCES, META,
  elementByKey, stageByKey, pointsOfElement, AI_SHIFTS,
} from '../data/theory.js';
import { dualSCurve, quadMatrix } from '../charts.js';
import { h, $$, openSheet, observeReveals, escapeHtml } from '../util.js';
import { pointLabel } from './home.js';

const TABS = [
  { key: 'elements', label: '四要素' },
  { key: 'stages', label: '四阶段' },
  { key: 'matrix', label: '48 演化' },
  { key: 'curve', label: '双 S 曲线' },
];

export function renderTheory(root, meta) {
  const tab = meta?.query?.tab && TABS.some((t) => t.key === meta.query.tab) ? meta.query.tab : 'elements';

  root.innerHTML = `
    <div class="wrap wrap-wide">
      <div class="page-head">
        <div class="breadcrumb"><a href="#/">总览</a><span class="sep">/</span><span>理论图谱</span></div>
        <span class="eyebrow">理论基石</span>
        <h1 class="h1" style="margin-top:12px">${META.title}</h1>
        <p class="lead" style="margin-top:12px">
          路江涌教授把企业战略拆成「空间」与「时间」两条线：空间是四要素的协同，时间是四阶段的演化。
          两者交叉，得到 <b class="strong">48 个战略演化</b>——这就是共演战略的全部棋盘。
        </p>
        <div class="tag-row" style="margin-top:16px">
          ${META.formulaMeaning.map((f) => `<span class="badge badge-outline"><b class="num" style="color:var(--gold-600);margin-right:4px">${f.n}</b>${f.label}</span>`).join('')}
        </div>
      </div>

      <div class="segmented theory-tabs" role="tablist" aria-label="理论模块">
        ${TABS.map((t) => `<button type="button" role="tab" aria-pressed="${t.key === tab}" data-tab="${t.key}">${t.label}</button>`).join('')}
      </div>

      <div id="tabPanel" class="theory-section"></div>

      ${renderAIShift()}

      <hr class="divider">
      ${renderMisreadings()}
      <hr class="divider">
      ${renderSources()}
    </div>
  `;

  const panel = root.querySelector('#tabPanel');
  const paint = (key) => {
    panel.innerHTML = renderTab(key);
    bindTab(panel, key);
    observeReveals(panel);
  };
  paint(tab);

  $$('[data-tab]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.tab;
      $$('[data-tab]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      history.replaceState(null, '', `#/theory?tab=${key}`);
      paint(key);
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 支持 #/theory#stage-xxx / #element-xxx / #curve
  if (meta?.anchor) {
    requestAnimationFrame(() => {
      const a = meta.anchor;
      if (a.startsWith('stage-')) {
        const key = a.replace('stage-', '');
        if (STAGE_KEYS.includes(key)) {
          $$('[data-tab]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === 'stages')));
          paint('stages');
          setTimeout(() => document.getElementById(a)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        }
      } else if (a.startsWith('element-')) {
        $$('[data-tab]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === 'elements')));
        paint('elements');
        setTimeout(() => document.getElementById(a)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      } else if (a === 'curve') {
        $$('[data-tab]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === 'curve')));
        paint('curve');
      }
    });
  }
}

/* ============================  四要素  ============================ */

function renderTab(key) {
  if (key === 'stages') return renderStages();
  if (key === 'matrix') return renderMatrix();
  if (key === 'curve') return renderCurve();
  return renderElements();
}

function renderElements() {
  return `
    <div class="matrix-panel">
      <div class="reveal">
        <div class="curve-wrap" style="background:transparent;border:none;padding:0">
          ${quadMatrix({})}
        </div>
        <div class="callout" style="margin-top:16px">
          <div>
            <b>先人后事、先外后内。</b> 四要素不是平级的四张清单：用户与市场是「外」，
            组织与产品是「内」；用户与组织是「人」，产品与市场是「事」。
            战略的顺序，是先看清外部，再调整内部。
          </div>
        </div>
      </div>
      <div class="matrix-legend">
        ${ELEMENTS.map((el) => `
          <button type="button" class="matrix-legend-item" data-open-el="${el.key}" style="--el:${el.color};--el-soft:${el.colorSoft}">
            <span class="ml-dot">${el.label[0]}</span>
            <span>
              <strong>${el.label} <small>${el.en.toUpperCase()}</small> <em style="font-style:normal;font-size:0.625rem;color:var(--el);font-weight:700">${el.axis}</em></strong>
              <p>${el.tagline} · ${el.desc.slice(0, 44)}…</p>
            </span>
          </button>`).join('')}
      </div>
    </div>

    <div class="grid g3" style="margin-top:40px">
      ${SIX_QUESTIONS.map((q) => `
        <div class="card">
          <div style="display:flex;align-items:baseline;justify-content:space-between">
            <b class="num" style="font-size:1.375rem;color:var(--gold-600)">${q.label}</b>
            <span class="tiny muted">${q.cn}</span>
          </div>
          <p class="small" style="margin-top:8px;color:var(--text-2);line-height:1.8">${q.desc}</p>
          <div class="tiny" style="margin-top:10px;color:var(--text-4)">→ ${q.maps}</div>
        </div>`).join('')}
    </div>

    <div style="margin-top:48px" id="elements-detail">
      ${ELEMENTS.map((el) => `
        <section class="reveal" id="element-${el.key}" style="margin-top:36px;--el:${el.color};--el-soft:${el.colorSoft};--el-ink:${el.colorInk}">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--line)">
            <div>
              <span class="badge" style="background:var(--el-soft);color:var(--el-ink)">${el.axis}</span>
              <h3 style="font-size:var(--fs-2xl);margin-top:8px">${el.label} <span style="font-size:0.5em;color:var(--text-4);font-family:var(--font-num);letter-spacing:.1em">${el.en.toUpperCase()}</span></h3>
              <p style="font-size:var(--fs-sm);color:var(--el);font-weight:700;margin-top:2px">${el.tagline}</p>
            </div>
            <p style="max-width:38ch;font-size:var(--fs-sm);color:var(--text-3);line-height:1.8">${el.question}</p>
          </div>
          <div style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:24px;margin-top:20px" class="el-detail-grid">
            <div>
              <p style="font-size:var(--fs-sm);line-height:1.9;color:var(--text-2)">${el.desc}</p>
              <div class="callout callout-warn" style="margin-top:16px">
                <div><b>常见误读：</b>${el.fallacy}</div>
              </div>
            </div>
            <div class="grid" style="gap:8px">
              ${pointsOfElement(el.key).map((p) => `
                <button type="button" class="card card-hover" data-point="${p.key}" style="padding:14px 16px;text-align:left;display:flex;gap:12px;align-items:flex-start">
                  <span class="tag-num">${p.en}</span>
                  <span>
                    <b style="font-size:var(--fs-sm)">${p.label}</b>
                    <span class="tiny" style="display:block;color:var(--text-3);margin-top:2px;line-height:1.6">${p.desc}</span>
                  </span>
                </button>`).join('')}
            </div>
          </div>
        </section>`).join('')}
    </div>
    <style>
      @media (max-width: 820px) { .el-detail-grid { grid-template-columns: 1fr !important; } }
    </style>
  `;
}

/* ============================  四阶段  ============================ */

function renderStages() {
  return `
    <div class="stage-cards">
      ${STAGES.map((s, i) => `
        <article class="stage-card reveal" data-code="${s.code}" id="stage-${s.key}" style="--c:${s.color}">
          <div class="stage-card-top">
            <span class="sc-badge"><i></i>${s.span}</span>
            <span class="sc-span">${String(i + 1).padStart(2, '0')} / 04</span>
          </div>
          <h3>${s.label}</h3>
          <div class="sc-rule"><b>${s.rule.op}</b><span>${s.rule.formula}</span></div>
          <p class="sc-gist">${s.gist}</p>
          <div class="sc-points">
            ${POINTS.map((p) => `<span>${s.points[p.key].label}</span>`).join('')}
          </div>
          <div class="sc-meta"><span>${s.curve}</span><span>「${s.metaphor}」</span></div>
        </article>`).join('')}
    </div>

    <div style="margin-top:48px">
      <span class="eyebrow">阶段深入</span>
      <h2 class="h2" style="margin-top:12px;margin-bottom:16px">四问 · 四益 · 十二要点</h2>
      <div class="accordion">
        ${STAGES.map((s) => `
          <details ${s.key === 'startup' ? 'open' : ''}>
            <summary>${s.code} · ${s.label} <span class="tiny muted" style="font-family:var(--font-sans);font-weight:400;margin-left:auto">${s.span}</span></summary>
            <div class="acc-body">
              <div class="stage-detail-grid">
                <div>
                  <h4 class="h5" style="margin-bottom:12px">四问</h4>
                  <div class="grid" style="gap:10px">
                    ${s.fourQuestions.map((q) => `
                      <div style="padding:12px 14px;border-radius:10px;background:var(--paper-2)">
                        <b style="font-size:var(--fs-sm);color:var(--el-product-ink)">${q.q}</b>
                        <p style="font-size:var(--fs-xs);color:var(--text-2);line-height:1.7;margin-top:4px">${q.a}</p>
                      </div>`).join('')}
                  </div>
                  <div class="callout" style="margin-top:16px">
                    <div><b>本阶段的核心：</b>${s.core}</div>
                  </div>
                </div>
                <div>
                  <h4 class="h5" style="margin-bottom:12px">十二要点</h4>
                  <div class="grid" style="gap:8px">
                    ${ELEMENTS.map((el) => `
                      <div style="padding:10px 12px;border-radius:10px;border:1px solid var(--line);border-left:3px solid ${el.color}">
                        <div class="tiny" style="color:${el.color};font-weight:700;letter-spacing:.06em">${el.label}</div>
                        ${el.points.map((pk) => `
                          <div style="display:flex;gap:8px;align-items:baseline;margin-top:4px">
                            <b style="font-size:var(--fs-xs);min-width:4.4em">${s.points[pk].label}</b>
                            <span class="tiny" style="color:var(--text-3);line-height:1.6">${s.points[pk].desc}</span>
                          </div>`).join('')}
                      </div>`).join('')}
                  </div>
                  <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
                    <div style="padding:12px;border-radius:10px;background:var(--ok-soft)">
                      <b class="tiny" style="color:var(--ok);letter-spacing:.08em">进入信号</b>
                      <ul style="margin-top:6px;display:flex;flex-direction:column;gap:4px">
                        ${s.signals.map((x) => `<li class="tiny" style="color:var(--text-2);line-height:1.55">· ${x}</li>`).join('')}
                      </ul>
                    </div>
                    <div style="padding:12px;border-radius:10px;background:var(--danger-soft)">
                      <b class="tiny" style="color:var(--danger);letter-spacing:.08em">典型风险</b>
                      <ul style="margin-top:6px;display:flex;flex-direction:column;gap:4px">
                        ${s.risks.map((x) => `<li class="tiny" style="color:var(--text-2);line-height:1.55">· ${x}</li>`).join('')}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </details>`).join('')}
      </div>
    </div>

    <div style="margin-top:48px">
      <span class="eyebrow">阶段跃迁</span>
      <h2 class="h2" style="margin-top:12px;margin-bottom:8px">每一次跃迁，都是四要素的重新配对</h2>
      <p class="small muted" style="margin-bottom:20px;max-width:60ch">跃迁不是「升级」，而是「换挡」：旧阶段有效的动作，在新阶段可能变成阻力。下面三组对照，是课堂讨论最常出现的分歧点。</p>
      <div class="grid g3">
        ${TRANSITIONS.map((t, i) => `
          <article class="card reveal" style="transition-delay:${i * 70}ms">
            <div class="badge badge-gold">${t.title}</div>
            <h3 class="h4" style="margin-top:10px">${t.slogan}</h3>
            <div class="grid" style="gap:8px;margin-top:14px">
              ${t.changes.map(([el, change, why]) => `
                <div style="padding:9px 11px;border-radius:8px;background:var(--paper-2)">
                  <b class="tiny" style="color:var(--gold-600);letter-spacing:.08em">${el}</b>
                  <div style="font-size:var(--fs-xs);font-weight:600;margin-top:2px">${change}</div>
                  <div class="tiny muted" style="margin-top:2px">${why}</div>
                </div>`).join('')}
            </div>
            <p class="tiny" style="margin-top:12px;padding-top:10px;border-top:1px dashed var(--line);color:var(--text-3);line-height:1.7"><b style="color:var(--text-1)">不变的是：</b>${t.unchanged}</p>
          </article>`).join('')}
      </div>
    </div>
  `;
}

/* ============================  48 演化  ============================ */

function renderMatrix() {
  return `
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px">
      <div>
        <h2 class="h3" style="margin-bottom:6px">48 个战略演化</h2>
        <p class="small muted" style="max-width:56ch">横读一行，是同一个要点在四个阶段的演变；纵读一列，是一个阶段里十二个要点的组合。课堂上的用法：先横读找「演化规律」，再纵读找「失衡」。</p>
      </div>
      <div class="segmented" id="stageHighlight" role="group" aria-label="高亮阶段">
        <button type="button" aria-pressed="true" data-hl="all">全部</button>
        ${STAGES.map((s) => `<button type="button" aria-pressed="false" data-hl="${s.key}">${s.short}</button>`).join('')}
      </div>
    </div>

    <div class="table-wrap">
      <table class="data evolution-table" id="evTable">
        <thead>
          <tr>
            <th>要素 / 要点</th>
            ${STAGES.map((s) => `<th><span style="color:${s.color}">${s.label}</span><br><span class="tiny" style="font-weight:400;color:var(--text-4)">${s.span}</span></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${ELEMENTS.map((el) => `
            ${el.points.map((pk) => {
              const p = POINTS.find((x) => x.key === pk);
              return `<tr data-el="${el.key}">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="width:6px;height:6px;border-radius:50%;background:${el.color}"></span>
                    <div>
                      <span class="ev-el" style="color:${el.color}">${el.label}</span>
                      <b style="display:block;font-size:var(--fs-sm)">${p.label}</b>
                    </div>
                  </div>
                </td>
                ${STAGES.map((s, idx) => `
                  <td class="ev-cell" data-stage="${s.key}">
                    <b>${s.points[pk].label}</b>
                    <span>${s.points[pk].desc}</span>
                  </td>`).join('')}
              </tr>`;
            }).join('')}
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="grid g2" style="margin-top:32px">
      <div class="card">
        <span class="eyebrow" style="color:var(--el-product)">横读规律 · 产品的三级跳</span>
        <div class="grid" style="gap:6px;margin-top:14px">
          ${['development', 'marketing', 'businessModel'].map((k) => {
            const p = POINTS.find((x) => x.key === k);
            return `<div style="display:grid;grid-template-columns:72px 1fr;gap:10px;align-items:center;padding:8px 0;border-bottom:1px dashed var(--line)">
              <b class="tiny" style="color:var(--text-3)">${p.label}</b>
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                ${STAGES.map((s, i) => `<span class="tiny" style="padding:2px 7px;border-radius:99px;background:var(--paper-2)">${s.points[k].label}</span>${i < 3 ? '<span class="tiny" style="color:var(--text-4)">→</span>' : ''}`).join('')}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <span class="eyebrow" style="color:var(--el-market)">纵读规律 · 市场的四色</span>
        <div class="grid" style="gap:8px;margin-top:14px">
          ${['chaos', 'blue', 'red', 'ice'].map((color, i) => {
            const s = STAGES[i];
            const m = { chaos: ['#8A8F98', '混沌市场'], blue: ['#3C6E9E', '蓝海市场'], red: ['#B23B3B', '红海市场'], ice: ['#5B8FA8', '蓝冰市场'] }[color];
            return `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:color-mix(in srgb, ${m[0]} 9%, var(--surface));border-left:3px solid ${m[0]}">
              <b style="font-family:var(--font-serif);font-size:1.0625rem;color:${m[0]};min-width:5em">${m[1]}</b>
              <div>
                <div class="tiny" style="color:var(--text-4)">${s.label}</div>
                <div class="tiny" style="color:var(--text-2);line-height:1.6;margin-top:2px">${s.points.competition.desc}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ============================  双 S 曲线  ============================ */

function renderCurve() {
  return `
    <div class="grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:28px;align-items:start" id="curve">
      <div>
        <div class="curve-wrap reveal">
          ${dualSCurve({ interactive: true, id: 'theory' })}
        </div>
        <div class="grid g3" style="margin-top:16px">
          <div class="card card-flat">
            <b class="tiny" style="color:var(--el-user);letter-spacing:.1em">A 曲线 · 现有业务</b>
            <p class="tiny" style="margin-top:6px;color:var(--text-2);line-height:1.75">萌芽 → 成长 → 稳定 → 衰减。它的形状由现有业务的「投入—产出」关系决定，无法被意志改变。</p>
          </div>
          <div class="card card-flat">
            <b class="tiny" style="color:var(--el-market);letter-spacing:.1em">B 曲线 · 新业务</b>
            <p class="tiny" style="margin-top:6px;color:var(--text-2);line-height:1.75">在第一曲线仍在上行时启动。早期投入大、回报小，需要「耐心资本」和独立组织。</p>
          </div>
          <div class="card card-flat">
            <b class="tiny" style="color:var(--el-org);letter-spacing:.1em">C 曲线 · 企业价值</b>
            <p class="tiny" style="margin-top:6px;color:var(--text-2);line-height:1.75">A 与 B 叠加后的总价值。成功转型的标志：C 曲线没有随 A 曲线一起下滑。</p>
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="card">
          <span class="eyebrow">时机判断</span>
          <h3 class="h4" style="margin-top:10px">什么时候启动 B 曲线？</h3>
          <p class="small" style="margin-top:8px;color:var(--text-2);line-height:1.85">
            不是等到 A 曲线下滑，而是在它<strong>增速开始放缓、但现金流仍然充沛</strong>的窗口期。
            这个窗口在图上标为「战略切换窗口」——早了，资源不够；晚了，时间不够。
          </p>
          <div class="callout callout-warn" style="margin-top:14px">
            <div><b>最贵的错误：</b>用 A 曲线的成功经验，去判断 B 曲线的机会。两条曲线需要的能力、组织与评价标准，往往相反。</div>
          </div>
        </div>

        <div class="card">
          <span class="eyebrow">四益法则</span>
          <h3 class="h4" style="margin-top:10px">每个阶段，换一种「运算法则」</h3>
          <div class="rule-cards" style="margin-top:14px">
            ${FOUR_RULES.map((r) => `
              <div class="rule-card" style="--c:${r.color}">
                <div class="rc-op">${r.op}</div>
                <div class="rc-stage">${r.stage}</div>
                <div class="rc-formula">${r.formula}</div>
              </div>`).join('')}
          </div>
          <p class="tiny muted" style="margin-top:12px;line-height:1.7">精益阶段做减法，成长阶段做乘法，扩张阶段做加法，转型阶段做除法。四句话对应四种完全不同的资源分配逻辑。</p>
        </div>
      </div>
    </div>

    <div style="margin-top:40px">
      <span class="eyebrow">四度空间</span>
      <h2 class="h3" style="margin-top:10px;margin-bottom:8px">市场不是越来越「大」，而是越来越「多维度」</h2>
      <p class="small muted" style="margin-bottom:18px;max-width:64ch">精度、深度、宽度、维度——这是市场要素在四个阶段的递进。很多企业卡在「宽度」，是因为精度与深度还没做透。</p>
      <div class="rule-cards">
        ${FOUR_DEGREES.map((d, i) => `
          <div class="rule-card" style="--c:${STAGES[i].color}">
            <div class="rc-op" style="font-size:1.5rem">${d.degree}</div>
            <div class="rc-stage">${d.stage}</div>
            <div class="rc-formula">${d.desc}</div>
          </div>`).join('')}
      </div>
    </div>
  `;
}

/* ============================  其它区块  ============================ */

function renderAIShift() {
  return `
    <section class="reveal" style="margin-top:48px">
      <div class="section-head" style="margin-bottom:18px">
        <div>
          <span class="eyebrow" style="color:var(--el-market)">教学延伸 · 非原书内容</span>
          <h2 class="h3" style="margin-top:10px">AI 时代：四个要素可能同时在换轨</h2>
          <p>共演战略的框架不变，但 AI 让「要素演化」的节奏变了。这一页是课堂讨论的延伸问题，不是原书结论。</p>
        </div>
      </div>
      <div class="grid g2">
        ${AI_SHIFTS.map((s, i) => {
          const el = elementByKey[s.el];
          return `
          <article class="card reveal" style="border-left:3px solid ${el.color};transition-delay:${i * 60}ms">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge" style="background:${el.colorSoft};color:${el.colorInk}">${el.label}</span>
              <span class="tiny muted">${el.axis}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap">
              <span class="small" style="color:var(--text-3);text-decoration:line-through;text-decoration-color:var(--line-strong)">${s.from}</span>
              <span class="tiny" style="color:var(--gold-600)">→</span>
              <b class="small" style="color:var(--text-1)">${s.to}</b>
            </div>
            <p class="small" style="margin-top:10px;color:var(--text-2);line-height:1.85">${s.note}</p>
          </article>`;
        }).join('')}
      </div>
      <div class="callout callout-info" style="margin-top:18px">
        <div><b>课堂追问：</b>如果四个要素同时换轨，企业的「阶段」还能用原来的顺序判断吗？当 AI 把每个阶段都压缩到 18 个月，第二曲线应该在什么时候启动？</div>
      </div>
    </section>`;
}

function renderMisreadings() {
  return `
    <section class="reveal">
      <span class="eyebrow">学习提示</span>
      <h2 class="h2" style="margin-top:10px;margin-bottom:8px">五个最常见的误读</h2>
      <p class="small muted" style="margin-bottom:20px;max-width:60ch">记住名词不等于掌握方法。下面每一条，都是课堂讨论中反复出现的分歧。</p>
      <div class="grid g2">
        ${MISREADINGS.map((m, i) => `
          <div class="card" style="transition-delay:${i * 50}ms">
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span class="badge badge-danger" style="flex-shrink:0">误读</span>
              <p class="small" style="color:var(--text-2);line-height:1.7;text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--danger) 40%,transparent)">${m.wrong}</p>
            </div>
            <div style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding-top:12px;border-top:1px dashed var(--line)">
              <span class="badge badge-ok" style="flex-shrink:0">正解</span>
              <p class="small" style="color:var(--text-1);line-height:1.8">${m.right}</p>
            </div>
          </div>`).join('')}
      </div>
    </section>`;
}

function renderSources() {
  return `
    <section class="reveal">
      <span class="eyebrow">文献与致谢</span>
      <h2 class="h3" style="margin-top:10px;margin-bottom:12px">方法论来源</h2>
      <p class="small muted" style="max-width:62ch;margin-bottom:16px">
        本工具是教学辅助材料，非官方出版物。理论框架、四要素、四阶段与 48 演化均来自路江涌教授的研究；
        其中的阶段性解释、案例分析与教学建议，由本工具团队补充，仅供课堂讨论。
      </p>
      <div class="src-list">
        ${SOURCES.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join('')}
      </div>
    </section>`;
}

/* ============================  交互  ============================ */

function bindTab(panel, key) {
  $$('[data-stage]', panel).forEach((g) => {
    const go = () => {
      const stageKey = g.dataset.stage;
      $$('[data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === 'stages')));
      panel.innerHTML = renderStages();
      bindTab(panel, 'stages');
      requestAnimationFrame(() => document.getElementById(`stage-${stageKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  if (key === 'elements') {
    $$('[data-open-el]', panel).forEach((btn) => {
      btn.addEventListener('click', () => openElementSheet(btn.dataset.openEl));
    });
    $$('[data-point]', panel).forEach((btn) => {
      btn.addEventListener('click', () => openPointSheet(btn.dataset.point));
    });
  }

  if (key === 'matrix') {
    const table = panel.querySelector('#evTable');
    $$('[data-hl]', panel).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('[data-hl]', panel).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const hl = btn.dataset.hl;
        table.querySelectorAll('td[data-stage]').forEach((td) => {
          td.style.background = '';
          td.style.boxShadow = '';
        });
        table.querySelectorAll('tr').forEach((tr) => tr.classList.remove('is-changed'));
        if (hl !== 'all') {
          table.querySelectorAll(`td[data-stage="${hl}"]`).forEach((td) => {
            td.style.background = 'color-mix(in srgb, var(--gold-400) 12%, var(--surface))';
            td.style.boxShadow = 'inset 0 0 0 1px color-mix(in srgb, var(--gold-400) 30%, transparent)';
          });
          table.querySelectorAll('tr').forEach((tr) => tr.classList.add('is-changed'));
        }
      });
    });
  }
}

export function openElementSheet(elKey) {
  const el = elementByKey[elKey];
  const content = h('div.stack-lg');
  content.innerHTML = `
    <div>
      <span class="badge" style="background:${el.colorSoft};color:${el.colorInk}">${el.axis}</span>
      <h3 class="h3" style="margin-top:10px">${el.label} <span class="tiny" style="font-family:var(--font-num);color:var(--text-4);letter-spacing:.14em">${el.en.toUpperCase()}</span></h3>
      <p class="small" style="color:${el.color};font-weight:700;margin-top:2px">${el.tagline}</p>
      <p style="margin-top:12px;font-size:var(--fs-sm);line-height:1.9;color:var(--text-2)">${el.desc}</p>
    </div>
    <div class="callout callout-warn"><div><b>常见误读：</b>${el.fallacy}</div></div>
    <div>
      <h4 class="h5" style="margin-bottom:10px">三个阶段形态</h4>
      <div class="table-wrap">
        <table class="data" style="min-width:0">
          <thead><tr><th>阶段</th><th>要点</th><th>含义</th></tr></thead>
          <tbody>
            ${STAGES.map((s) => el.points.map((pk, i) => `
              <tr>
                ${i === 0 ? `<td rowspan="3" style="vertical-align:middle"><span class="badge" style="background:${s.colorSoft};color:${s.colorInk}">${s.label}</span></td>` : ''}
                <td><b>${s.points[pk].label}</b></td>
                <td class="small" style="color:var(--text-2)">${s.points[pk].desc}</td>
              </tr>`).join('')).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a class="btn btn-outline btn-sm" href="#/canvas">到画布中为「${el.label}」打分</a>
      <a class="btn btn-ghost btn-sm" href="#/cases">看相关案例</a>
    </div>
  `;
  openSheet(`${el.label} · ${el.tagline}`, content);
}

export function openPointSheet(pointKey, opts = {}) {
  const p = POINTS.find((x) => x.key === pointKey);
  if (!p) return;
  const el = elementByKey[p.el];
  const curStage = opts.stage || null;
  const content = h('div.stack-lg');
  content.innerHTML = `
    <div>
      <div style="display:flex;align-items:baseline;gap:10px">
        <span class="badge" style="background:${el.colorSoft};color:${el.colorInk}">${el.label}</span>
        <span class="tiny muted">${p.en}</span>
      </div>
      <h3 class="h3" style="margin-top:8px">${p.label}</h3>
      <p class="small" style="color:var(--text-2);line-height:1.8;margin-top:6px">${p.desc}</p>
    </div>
    <div>
      <h4 class="h5" style="margin-bottom:10px">它在四个阶段里叫什么</h4>
      <div class="grid g2" style="gap:8px">
        ${STAGES.map((s) => `
          <div style="padding:12px 14px;border-radius:10px;border:1px solid ${s.key === curStage ? s.color : 'var(--line)'};background:${s.key === curStage ? s.colorSoft : 'var(--surface)'}">
            <div class="tiny" style="color:${s.color};font-weight:700;letter-spacing:.06em">${s.label} ${s.key === curStage ? '· 当前阶段' : ''}</div>
            <b style="font-size:var(--fs-sm);display:block;margin-top:4px">${s.points[pointKey].label}</b>
            <p class="tiny" style="color:var(--text-2);line-height:1.65;margin-top:4px">${s.points[pointKey].desc}</p>
          </div>`).join('')}
      </div>
    </div>
    <div class="callout">
      <div><b>课堂追问：</b>在你的企业里，这个要点此刻处于哪个阶段的形态？如果「名字」已经换了、但「做法」没换，就是典型的要素滞后。</div>
    </div>
  `;
  openSheet(`${p.label} · 演化路径`, content);
}

export const THEORY_TABS = TABS;
export { renderTab };
