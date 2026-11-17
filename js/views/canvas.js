/**
 * 战略画布：为自己的企业做一次 12 要点推演
 * - 阶段切换：同一要点在四阶段里名字不同
 * - 12 要点评分：1–5，构成要素雷达与失衡诊断
 * - 要点详情：看演化、写备注
 * - 诊断面板：要素均分、阶段匹配、优先行动
 */

import {
  ELEMENTS, STAGES, POINTS, stageByKey, elementByKey,
} from '../data/theory.js';
import { dualSCurve, elementRadar, progressRing } from '../charts.js';
import {
  state, setStage, setScore, setPointNote, setElementNote, setCompany, diagnose, resetCanvas,
} from '../store.js';
import { h, $$, openSheet, toast, observeReveals } from '../util.js';
import { openPointSheet } from './theory.js';

const LEVELS = [
  { v: 1, label: '缺失', hint: '几乎没做，或做了但没有效果' },
  { v: 2, label: '薄弱', hint: '有动作，但不成体系，明显拖后腿' },
  { v: 3, label: '及格', hint: '能运转，但还有明显空档' },
  { v: 4, label: '良好', hint: '体系化，能支撑当前阶段' },
  { v: 5, label: '领先', hint: '成为优势，甚至能外溢为竞争力' },
];

export function renderCanvas(root) {
  const c = state.canvas;
  const stage = stageByKey[c.stage] || STAGES[0];

  root.innerHTML = `
    <div class="wrap wrap-wide canvas-view">
      <div class="canvas-toolbar">
        <div class="tb-title">战略画布 <span>12 要点 · 约 10 分钟</span></div>
        <label class="search-box" style="max-width:220px;flex:0 0 auto">
          <input class="input" id="companyInput" type="text" placeholder="输入企业名称（可选）" value="${escapeAttr(c.company)}" maxlength="30" aria-label="企业名称">
        </label>
        <button class="btn btn-sm btn-outline" id="btnMemo" type="button">生成备忘录</button>
        <button class="btn btn-sm btn-ghost" id="btnReset" type="button">重置</button>
      </div>

      <div class="stage-picker" role="group" aria-label="选择企业所处阶段">
        ${STAGES.map((s) => `
          <button type="button" class="stage-pick ${s.key === stage.key ? 'is-active' : ''}" data-pick="${s.key}" style="--c:${s.color}">
            <span class="sp-code">${s.code} · ${String(s.index).padStart(2, '0')}</span>
            <span class="sp-label">${s.label}</span>
            <span class="sp-span">${s.span}</span>
            <span class="sp-rule">${s.rule.op} · ${s.rule.formula}</span>
          </button>`).join('')}
      </div>

      <div class="canvas-hint" id="canvasHint">
        <div>
          <b>怎么用：</b>先选阶段，再为每个要点打 1–5 分（1 = 明显缺失，5 = 行业领先）。评分不是考试，而是把你对企业的直觉变成可讨论的数字。
          点要点名称可以看它在四个阶段的演化，也可以写备注。
        </div>
      </div>

      <div class="canvas-layout">
        <div>
          <div class="quad-tabs" role="tablist" aria-label="四要素切换">
            ${ELEMENTS.map((el, i) => `
              <button type="button" role="tab" class="${i === 0 ? 'is-active' : ''}" data-qt="${el.key}" style="--c:${el.color}" aria-selected="${i === 0}">
                <i></i>${el.label}
              </button>`).join('')}
          </div>
          <div class="quad-grid">
            ${ELEMENTS.map((el, i) => quadHTML(el, stage, i === 0))}
          </div>
          <div class="btn-row" style="margin-top:20px">
            <a class="btn btn-gold" href="#/workspace">生成一页纸备忘录 →</a>
            <a class="btn btn-outline" href="#/cases">去看同阶段的案例</a>
            <span class="tiny muted" style="margin-left:auto">数据仅保存在本机浏览器，可随时导出</span>
          </div>
        </div>

        <aside class="diag-panel" id="diagPanel"></aside>
      </div>
    </div>
  `;

  paintDiagnosis(root);
  bind(root);
  observeReveals(root);
}

/* ------------------------- 四象限 HTML ------------------------- */

function quadHTML(el, stage, active = false) {
  const c = state.canvas;
  const pts = el.points.map((k) => POINTS.find((p) => p.key === k));
  const filled = pts.filter((p) => (c.scores[p.key] || 0) > 0);
  const avg = filled.length ? (filled.reduce((a, p) => a + c.scores[p.key], 0) / filled.length).toFixed(1) : '0.0';
  const note = c.elementNotes[el.key] || '';

  return `
  <section class="quad ${active ? 'is-mobile-active' : ''}" data-quad="${el.key}" style="--c:${el.color};--cs:${el.colorSoft}">
    <div class="quad-head">
      <div>
        <div class="quad-title"><strong>${el.label}</strong><em>${el.en}</em></div>
        <div class="quad-axis">${el.axis} · ${el.tagline}</div>
      </div>
      <div class="quad-score"><span data-quad-score-value>${avg}</span><small>/5</small></div>
    </div>
    ${pts.map((p) => {
      const v = c.scores[p.key] || 0;
      const hasNote = !!(c.notes[p.key] || '').trim();
      return `
      <div class="point-row" data-point-row="${p.key}">
        <div class="point-name">
          <button type="button" class="pn-label" data-point-info="${p.key}" title="查看演化与备注">${stage.points[p.key].label}</button>
          <span class="pn-orig">${p.label}</span>
          ${hasNote ? '<span class="point-note-dot" title="有备注"></span>' : ''}
        </div>
        <div class="rating" role="group" aria-label="${stage.points[p.key].label} 评分">
          ${LEVELS.map((lv) => `<button type="button" data-rate="${p.key}" data-level="${lv.v}" class="${v >= lv.v ? 'is-on' : ''}" aria-label="${lv.label}" aria-pressed="${v === lv.v}">${lv.v}</button>`).join('')}
        </div>
      </div>`;
    }).join('')}
    <button type="button" class="quad-note-btn ${note ? 'has-note' : ''}" data-el-note="${el.key}">
      ${note ? '✎ 查看要素备注' : '＋ 添加要素备注'}
    </button>
    ${note ? `<p class="quad-note-text">${escapeHtml(note)}</p>` : ''}
  </section>`;
}

/* ------------------------- 诊断面板 ------------------------- */

function paintDiagnosis(root) {
  const panel = root.querySelector('#diagPanel');
  if (!panel) return;
  const d = diagnose();
  const c = state.canvas;
  const stage = stageByKey[c.stage];
  const pct = d.filledCount / 12;

  const icons = {
    ok: '<svg viewBox="0 0 24 24"><path d="M4 12.5 9 17.5 20 6.5"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4.5M12 17.6h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8h.01"/></svg>',
    partial: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    empty: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/></svg>',
  };

  panel.innerHTML = `
    <div class="diag-card lifecycle-card">
      <h3>生命周期定位 <span class="tiny muted" style="letter-spacing:0;text-transform:none">点击曲线切换阶段</span></h3>
      ${dualSCurve({ active: c.stage, compact: true, id: 'cv' })}
    </div>

    <div class="diag-card">
      <h3>完成度 <span class="num" style="color:var(--text-1)">${d.filledCount}/12</span></h3>
      <div style="display:flex;align-items:center;gap:16px">
        ${progressRing(pct, { size: 84, stroke: 7, label: `${Math.round(pct * 100)}%`, sub: '已评分' })}
        <div class="diag-bars" style="flex:1">
          ${ELEMENTS.map((el) => {
            const s = d.elScores[el.key];
            return `<div class="diag-bar" style="--c:${el.color}">
              <span class="db-name">${el.label}</span>
              <span class="db-track"><i class="db-fill" style="width:${(s.avg / 5) * 100}%"></i></span>
              <span class="db-val">${s.filled ? s.avg.toFixed(1) : '—'}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="diag-card">
      <h3>要素均衡度</h3>
      <div class="diag-radar">${elementRadar(Object.fromEntries(ELEMENTS.map((el) => [el.key, d.elScores[el.key].avg])), { size: 240 })}</div>
      ${d.imbalances.length ? `
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
          ${d.imbalances.map((im) => `<span class="badge badge-warn">${elName(im.el)} 低 ${im.gap} 分</span>`).join('')}
        </div>` : ''}
    </div>

    <div class="diag-card">
      <h3>诊断</h3>
      <div class="diag-verdict ${d.verdict.level}">
        <span class="dv-icon">${icons[d.verdict.level] || icons.info}</span>
        <div>
          <b>${d.verdict.title}</b>
          ${d.verdict.text}
        </div>
      </div>
      ${d.maturityStage ? `
        <div class="tiny" style="margin-top:10px;color:var(--text-3);display:flex;justify-content:space-between">
          <span>自评阶段：<b style="color:var(--text-1)">${stage.label}</b></span>
          <span>要素显示：<b style="color:var(--text-1)">${stageByKey[d.maturityStage].label}</b></span>
        </div>` : ''}
    </div>

    <div class="diag-card">
      <h3>优先动作</h3>
      <div class="priority-list">
        ${d.priorities.map((p, i) => `
          <div class="priority-item">
            <span class="pi-num">${i + 1}</span>
            <div><strong>${p.title}</strong><span>${p.why}</span></div>
          </div>`).join('')}
      </div>
    </div>
  `;

  // 曲线点击
  $$('[data-stage]', panel).forEach((g) => {
    const go = () => {
      setStage(g.dataset.stage);
      refreshStage(root);
      toast(`已切换到「${stageByKey[g.dataset.stage].label}」阶段视角`);
    };
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });
}

function elName(key) {
  return elementByKey[key]?.label || key;
}

/* ------------------------- 交互绑定 ------------------------- */

function bind(root) {
  // 阶段切换
  $$('[data-pick]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      setStage(btn.dataset.pick);
      refreshStage(root);
      paintDiagnosis(root);
    });
  });

  // 移动端象限切换
  $$('[data-qt]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = btn.dataset.qt;
      $$('[data-qt]', root).forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      $$('.quad', root).forEach((q) => q.classList.toggle('is-mobile-active', q.dataset.quad === el));
    });
  });

  // 评分（事件委托）
  root.addEventListener('click', (e) => {
    const rateBtn = e.target.closest('[data-rate]');
    if (rateBtn) {
      const key = rateBtn.dataset.rate;
      const level = Number(rateBtn.dataset.level);
      const cur = state.canvas.scores[key] || 0;
      const next = cur === level ? 0 : level;
      setScore(key, next);
      updateRow(root, key);
      updateQuadScore(root, POINTS.find((p) => p.key === key).el);
      paintDiagnosis(root);
      if (next > 0) {
        const stage = stageByKey[state.canvas.stage];
        toast(`${stage.points[key].label}：${LEVELS[next - 1].label}`);
      }
      return;
    }

    const infoBtn = e.target.closest('[data-point-info]');
    if (infoBtn) {
      openPointSheet(infoBtn.dataset.pointInfo, { stage: state.canvas.stage });
      return;
    }

    const noteBtn = e.target.closest('[data-el-note]');
    if (noteBtn) {
      openElementNote(noteBtn.dataset.elNote, root);
    }
  });

  // 企业名
  const comp = root.querySelector('#companyInput');
  comp?.addEventListener('input', () => setCompany({ company: comp.value.slice(0, 30) }));

  // 备忘录
  root.querySelector('#btnMemo')?.addEventListener('click', () => {
    location.hash = '#/workspace';
  });

  // 重置
  root.querySelector('#btnReset')?.addEventListener('click', () => {
    if (confirm('确定要清空画布上的所有评分与备注吗？此操作不可撤销。')) {
      resetCanvas({ keepCompany: true });
      renderCanvas(document.getElementById('viewRoot'));
      toast('画布已重置');
    }
  });

  // 键盘：焦点在要点行时，按 1-5 评分
  root.addEventListener('keydown', (e) => {
    const row = e.target.closest?.('[data-point-row]');
    if (!row) return;
    if (/^[1-5]$/.test(e.key)) {
      const key = row.dataset.pointRow;
      setScore(key, Number(e.key));
      updateRow(root, key);
      updateQuadScore(root, POINTS.find((p) => p.key === key).el);
      paintDiagnosis(root);
    }
  });

  // Escape 收起提示
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') root.querySelector('#canvasHint')?.classList.add('hidden');
    },
    { once: true }
  );
}

function updateRow(root, key) {
  const row = root.querySelector(`[data-point-row="${key}"]`);
  if (!row) return;
  const v = state.canvas.scores[key] || 0;
  $$('[data-rate]', row).forEach((btn) => {
    const lv = Number(btn.dataset.level);
    btn.classList.toggle('is-on', v >= lv);
    btn.setAttribute('aria-pressed', String(v === lv));
  });
}

function updateQuadScore(root, elKey) {
  const quad = root.querySelector(`[data-quad="${elKey}"]`);
  if (!quad) return;
  const el = elementByKey[elKey];
  const vals = el.points.map((k) => state.canvas.scores[k] || 0).filter((v) => v > 0);
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '0.0';
  const target = quad.querySelector('[data-quad-score-value]');
  if (target) target.textContent = avg;
}

function refreshStage(root) {
  const stage = stageByKey[state.canvas.stage];
  $$('[data-pick]', root).forEach((b) => b.classList.toggle('is-active', b.dataset.pick === stage.key));
  ELEMENTS.forEach((el) => {
    const quad = root.querySelector(`[data-quad="${el.key}"]`);
    if (!quad) return;
    const labels = $$('[data-point-info]', quad);
    el.points.forEach((k, i) => {
      if (labels[i]) labels[i].textContent = stage.points[k].label;
    });
  });
}

function openElementNote(elKey, root) {
  const el = elementByKey[elKey];
  const content = h('div.stack');
  content.innerHTML = `
    <p class="small muted">写一句话：这个要素在你的企业里，最关键的判断是什么？例如「用户增长很快，但复购低，说明需求强度不足」。</p>
    <div class="field">
      <label for="elNoteInput">${el.label} · 要素备注</label>
      <textarea class="textarea" id="elNoteInput" maxlength="800" rows="6" placeholder="例：我们的用户主要来自老客转介绍，获客成本低，但用户结构偏老，新客占比不足 20%…">${escapeHtml(state.canvas.elementNotes[elKey] || '')}</textarea>
    </div>
    <div class="btn-row">
      <button class="btn btn-gold" type="button" data-save>保存备注</button>
      <button class="btn btn-ghost" type="button" data-close>取消</button>
    </div>
  `;
  const dlg = openSheet(`${el.label} · 要素备注`, content);
  content.querySelector('[data-save]').addEventListener('click', () => {
    setElementNote(elKey, content.querySelector('#elNoteInput').value);
    dlg.close();
    renderCanvas(root);
    toast('备注已保存');
  });
  content.querySelector('[data-close]').addEventListener('click', () => dlg.close());
}

/* ------------------------- 小工具 ------------------------- */

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function escapeAttr(s) {
  return escapeHtml(s);
}
