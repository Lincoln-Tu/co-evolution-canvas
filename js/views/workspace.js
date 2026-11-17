/**
 * 我的工作台：一页纸战略备忘录 + 30 天行动 + 课前/课中/课后指引 + 导出
 */

import { ELEMENTS, STAGES, POINTS, SESSIONS, stageByKey, elementByKey } from '../data/theory.js';
import { state, diagnose, addAction, toggleAction, removeAction, exportCanvas, importCanvas, clearAllData } from '../store.js';
import { elementRadar, progressRing } from '../charts.js';
import { toast, download, openSheet, formatDate, observeReveals } from '../util.js';
import { caseById } from '../data/cases.js';
import { QUIZ } from '../data/quiz.js';

const QUIZ_LOOKUP = Object.fromEntries(QUIZ.map((q) => [q.id, q]));

export function renderWorkspace(root) {
  const d = diagnose();
  const c = state.canvas;
  const stage = stageByKey[c.stage];
  const quizDone = state.quiz.done;
  const quizCorrect = quizDone ? Object.entries(state.quiz.answers).filter(([id, ans]) => {
    const q = QUIZ_LOOKUP[id];
    return q && q.answer === ans;
  }).length : 0;
  const quizTotal = Object.keys(QUIZ_LOOKUP).length;

  const doneActions = state.actions.filter((a) => a.done).length;

  root.innerHTML = `
    <div class="wrap wrap-wide">
      <div class="page-head">
        <div class="breadcrumb"><a href="#/">总览</a><span class="sep">/</span><span>我的工作台</span></div>
        <span class="eyebrow">课前 · 课中 · 课后</span>
        <h1 class="h1" style="margin-top:12px">把认知，变成下一件事</h1>
        <p class="lead" style="margin-top:12px">
          这里汇集了你的画布诊断、测评结果与 30 天行动。所有数据都保存在本机浏览器——不上传、不追踪。
        </p>
        <div class="tag-row" style="margin-top:16px">
          <span class="badge badge-outline">画布更新：${c.updatedAt ? formatDate(c.updatedAt) : '尚未填写'}</span>
          <span class="badge badge-outline">测评：${quizDone ? `${quizCorrect} / ${quizTotal}` : '未开始'}</span>
          <span class="badge badge-outline">行动：${doneActions} / ${state.actions.length} 完成</span>
        </div>
      </div>

      <div class="ws-grid">
        <div class="stack-lg">
          ${renderMemo(c, d, stage)}
          ${renderActions()}
        </div>

        <aside class="stack-lg">
          <section class="card">
            <span class="eyebrow">学习进度</span>
            <div style="display:flex;align-items:center;gap:18px;margin-top:14px">
              ${progressRing(d.filledCount / 12, { size: 92, stroke: 7, label: `${d.filledCount}/12`, sub: '画布' })}
              <div style="flex:1" class="grid">
                <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs)">
                  <span class="muted">理论图谱</span><span class="badge badge-ok">已浏览</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs)">
                  <span class="muted">案例学习</span>
                  <span class="badge ${Object.keys(state.caseChoices || {}).length ? 'badge-ok' : 'badge-outline'}">${Object.keys(state.caseChoices || {}).length} 个已做抉择</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs)">
                  <span class="muted">战略测评</span>
                  <span class="badge ${quizDone ? 'badge-ok' : 'badge-outline'}">${quizDone ? `${quizCorrect}/${quizTotal}` : '未开始'}</span>
                </div>
              </div>
            </div>
          </section>

          ${renderSessions()}

          <section class="card">
            <span class="eyebrow">工具</span>
            <div class="tool-grid" style="margin-top:14px">
              <button class="tool-btn" type="button" id="btnExportMd">
                <svg viewBox="0 0 24 24"><path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16"/></svg>
                <span><b>导出 Markdown</b><small>一页纸备忘录</small></span>
              </button>
              <button class="tool-btn" type="button" id="btnExportJson">
                <svg viewBox="0 0 24 24"><path d="M8 4H5v16h3M16 4h3v16h-3"/><path d="M10 9h4M10 13h4"/></svg>
                <span><b>备份为 JSON</b><small>可换设备恢复</small></span>
              </button>
              <button class="tool-btn" type="button" id="btnImportJson">
                <svg viewBox="0 0 24 24"><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M4 20h16"/></svg>
                <span><b>导入备份</b><small>恢复画布与行动</small></span>
              </button>
              <button class="tool-btn" type="button" id="btnPrint">
                <svg viewBox="0 0 24 24"><path d="M6 9V4h12v5M6 18H4v-8h16v8h-2M8 14h8v6H8z"/></svg>
                <span><b>打印 / 存为 PDF</b><small>适合投屏或提交</small></span>
              </button>
            </div>
            <button class="btn btn-danger btn-block" type="button" id="btnClear" style="margin-top:14px">清空本机全部数据</button>
          </section>

          <section class="card card-flat">
            <div class="tiny" style="line-height:1.8;color:var(--text-3)">
              <b style="color:var(--text-1)">隐私说明：</b>本工具不使用账号、不上传数据。画布、备注、行动与测评结果均保存在浏览器 localStorage 中，清除浏览器数据会一并清除。建议定期「备份为 JSON」。
            </div>
          </section>
        </aside>
      </div>
    </div>
  `;

  bindWorkspace(root);
  observeReveals(root);
}

/* ---------------------------- 备忘录 ---------------------------- */

function renderMemo(c, d, stage) {
  const hasAny = c.company || d.filledCount > 0;
  const topEls = [...ELEMENTS].sort((a, b) => d.elScores[a.key].avg - d.elScores[b.key].avg);
  const strongest = [...ELEMENTS].sort((a, b) => d.elScores[b.key].avg - d.elScores[a.key].avg)[0];
  const weakest = topEls[0];

  return `
    <article class="memo reveal" id="memo">
      <div class="memo-head">
        <div>
          <h2>${c.company || '我的企业'} · 共演战略备忘录</h2>
          <div class="memo-meta">
            ${c.industry ? `${c.industry} · ` : ''}阶段：${stage.label}（${stage.span}） · 生成于 ${new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>
        <div class="badge badge-gold">一页纸</div>
      </div>

      ${!hasAny ? `
        <div class="empty" style="margin-block:20px">
          <p>你还没有填写画布。</p>
          <a class="btn btn-gold btn-sm" href="#/canvas" style="margin-top:12px">去画布做一次 10 分钟推演</a>
        </div>` : `
        <div class="memo-section">
          <h4>01 · 诊断结论</h4>
          <p><b style="color:var(--gold-600)">${d.verdict.title}。</b>${d.verdict.text}</p>
          ${d.maturityStage ? `<p class="small muted" style="margin-top:6px">自评阶段「${stage.label}」，要素表现对应「${stageByKey[d.maturityStage].label}」。</p>` : ''}
        </div>

        <div class="memo-section">
          <h4>02 · 四要素现状</h4>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px">
            ${ELEMENTS.map((el) => {
              const s = d.elScores[el.key];
              return `<div style="padding:10px;border-radius:8px;background:var(--paper-2);border-left:3px solid ${el.color}">
                <div class="tiny" style="font-weight:700;color:${el.color}">${el.label}</div>
                <div class="num" style="font-size:1.25rem;font-weight:700;margin-top:2px">${s.filled ? s.avg.toFixed(1) : '—'}<span class="tiny muted">/5</span></div>
              </div>`;
            }).join('')}
          </div>
          ${d.filledCount > 0 ? `
            <p class="small" style="margin-top:10px">
              最强要素是<b>${strongest.label}</b>（${d.elScores[strongest.key].avg.toFixed(1)}），
              ${d.imbalances.length ? `最需要关注的是<b>${weakest.label}</b>（${d.elScores[weakest.key].avg.toFixed(1)}）——它与整体水平相差 ${d.imbalances[0].gap} 分。` : '四要素之间暂未出现显著失衡。'}
            </p>` : ''}
        </div>

        <div class="memo-section">
          <h4>03 · 优先动作</h4>
          <ol style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
            ${d.priorities.map((p, i) => `
              <li style="display:flex;gap:10px;font-size:var(--fs-sm);line-height:1.7;color:var(--text-2)">
                <span class="tag-num">${i + 1}</span>
                <span><b style="color:var(--text-1)">${p.title}</b><br><span class="tiny muted">${p.why}</span></span>
              </li>`).join('')}
          </ol>
        </div>

        <div class="memo-section">
          <h4>04 · 本阶段的关键一问</h4>
          <p class="serif" style="font-size:var(--fs-lg);color:var(--text-1);line-height:1.7">「${stage.question}」</p>
          <p class="tiny muted" style="margin-top:6px">这个问题回答不了，12 个要点的评分就只是数字。</p>
        </div>

        <div class="memo-section">
          <h4>05 · 同阶段案例对照</h4>
          <p class="small">${suggestCases(stage.key)}</p>
        </div>

        <div class="memo-section">
          <h4>06 · 30 天行动</h4>
          ${state.actions.length ? `
            <ul style="display:flex;flex-direction:column;gap:5px;margin-top:4px">
              ${state.actions.slice(0, 6).map((a) => `
                <li style="display:flex;gap:8px;font-size:var(--fs-sm);color:var(--text-2);line-height:1.6">
                  <span style="color:${a.done ? 'var(--ok)' : 'var(--text-4)'}">${a.done ? '✓' : '○'}</span>
                  <span style="${a.done ? 'text-decoration:line-through;opacity:.65' : ''}">${a.text}</span>
                </li>`).join('')}
            </ul>` : `
            <p class="memo-empty">还没有行动项。在下方「30 天行动」中，为最薄弱的要点写一个 30 天内可验证的动作。</p>`}
        </div>
      `}
    </article>`;
}

function suggestCases(stageKey) {
  const list = Object.values(caseById).filter((c) => c.stageFit.includes(stageKey)).slice(0, 3);
  if (!list.length) return '案例库中暂无对应阶段的案例。';
  return list.map((c) => `<a href="#/cases/${c.id}" style="color:var(--gold-600);font-weight:600">${c.name}</a>（${c.tagline}）`).join('；') + '。';
}

/* ---------------------------- 行动 ---------------------------- */

function renderActions() {
  const pointOptions = ELEMENTS.map((el) => {
    const opts = el.points.map((k) => {
      const p = POINTS.find((x) => x.key === k);
      return `<option value="${k}">${el.label} · ${p.label}</option>`;
    }).join('');
    return `<optgroup label="${el.label}">${opts}</optgroup>`;
  }).join('');

  return `
    <section class="card reveal" id="actions">
      <div class="card-head">
        <div>
          <span class="eyebrow">课后 · 行动转化</span>
          <h3 class="h4" style="margin-top:8px">30 天行动清单</h3>
          <p class="tiny muted" style="margin-top:4px">写「可验证的动作」，不写「加强」「提升」这类形容词。</p>
        </div>
        <span class="badge badge-outline">${state.actions.filter((a) => a.done).length}/${state.actions.length}</span>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <select class="select" id="actPoint" style="flex:0 0 auto;width:auto;max-width:210px" aria-label="关联战略要点">
          <option value="">关联要点（可选）</option>
          ${pointOptions}
        </select>
        <input class="input" id="actText" type="text" placeholder="例：访谈 10 位流失用户，找出他们不再复购的真实原因" style="flex:1;min-width:200px" maxlength="240">
        <button class="btn btn-gold" type="button" id="actAdd">添加</button>
      </div>

      <div class="action-list" id="actionList">
        ${state.actions.length ? state.actions.map((a) => actionHTML(a)).join('') : `
          <div class="empty" style="padding:24px 16px">
            还没有行动项。最好的方式：从「优先动作」里挑第一条，翻译成一个 30 天内能做完、能验证的具体动作。
          </div>`}
      </div>
    </section>`;
}

function actionHTML(a) {
  const p = a.point ? POINTS.find((x) => x.key === a.point) : null;
  return `
    <div class="action-item ${a.done ? 'is-done' : ''}" data-act="${a.id}">
      <button class="action-check" type="button" data-toggle="${a.id}" aria-label="${a.done ? '标记为未完成' : '标记为完成'}" aria-pressed="${a.done}">
        <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7"/></svg>
      </button>
      <div style="flex:1;min-width:0">
        <div class="ai-text">${escapeHtml(a.text)}</div>
        <div class="ai-meta">
          ${p ? `<span>${elementByKey[p.el].label} · ${p.label}</span>` : ''}
          <span>${a.days} 天</span>
          ${a.done && a.doneAt ? `<span>完成于 ${formatDate(a.doneAt)}</span>` : ''}
        </div>
      </div>
      <button class="ai-del" type="button" data-del="${a.id}" aria-label="删除">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>`;
}

/* ---------------------------- 场景指引 ---------------------------- */

function renderSessions() {
  const keys = ['pre', 'in', 'post'];
  return `
    <section class="card reveal" id="sessions">
      <span class="eyebrow">使用指引</span>
      <div class="session-tabs" style="margin-top:12px" role="tablist" aria-label="课前课中课后">
        ${keys.map((k, i) => `<button type="button" class="chip ${i === 0 ? 'is-active' : ''}" data-session="${k}" role="tab" aria-selected="${i === 0}">${SESSIONS[k].title.split(' · ')[0]}</button>`).join('')}
      </div>
      <div id="sessionBody"></div>
    </section>`;
}

function sessionBody(key) {
  const s = SESSIONS[key];
  return `
    <div class="session-card" style="border:none;padding:0">
      <h4 class="h5">${s.title}</h4>
      <p class="tiny muted" style="margin-top:4px">建议 ${s.minutes} 分钟 · ${s.goal}</p>
      <div class="session-steps">
        ${s.steps.map((st, i) => `
          <div class="session-step">
            <span class="ss-num">${i + 1}</span>
            <div><strong>${st.t}</strong><p>${st.d}</p></div>
            <a class="ss-link" href="${st.link}">前往 →</a>
          </div>`).join('')}
      </div>
      <div class="callout" style="margin-top:14px"><div><b>产出：</b>${s.deliverable}</div></div>
    </div>`;
}

/* ---------------------------- 绑定 ---------------------------- */

function bindWorkspace(root) {
  // 行动
  const addBtn = root.querySelector('#actAdd');
  const input = root.querySelector('#actText');
  const pointSel = root.querySelector('#actPoint');

  const doAdd = () => {
    const text = input.value.trim();
    if (!text) {
      input.focus();
      toast('先写下要做的事');
      return;
    }
    addAction({ text, point: pointSel.value || null });
    input.value = '';
    pointSel.value = '';
    repaintActions(root);
    toast('行动已添加');
  };
  addBtn?.addEventListener('click', doAdd);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doAdd();
  });

  root.querySelector('#actionList')?.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle]');
    if (t) {
      toggleAction(t.dataset.toggle);
      repaintActions(root);
      return;
    }
    const d = e.target.closest('[data-del]');
    if (d) {
      removeAction(d.dataset.del);
      repaintActions(root);
      toast('已删除');
    }
  });

  // 场景切换
  root.querySelectorAll('[data-session]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-session]').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      const body = root.querySelector('#sessionBody');
      body.innerHTML = sessionBody(btn.dataset.session);
    });
  });
  const first = root.querySelector('#sessionBody');
  if (first) first.innerHTML = sessionBody('pre');

  // 导出
  root.querySelector('#btnExportMd')?.addEventListener('click', () => {
    download('共演战略备忘录.md', buildMemoMarkdown(), 'text/markdown;charset=utf-8');
    toast('备忘录已导出');
  });
  root.querySelector('#btnExportJson')?.addEventListener('click', () => {
    download('共演战略备份.json', JSON.stringify(exportCanvas(), null, 2), 'application/json');
    toast('备份已下载');
  });
  root.querySelector('#btnImportJson')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        importCanvas(JSON.parse(text));
        toast('已导入备份');
        renderWorkspace(root);
      } catch (err) {
        toast('导入失败：' + (err?.message || '文件格式不正确'));
      }
    });
    input.click();
  });
  root.querySelector('#btnPrint')?.addEventListener('click', () => window.print());
  root.querySelector('#btnClear')?.addEventListener('click', () => {
    if (!confirm('将清空画布、备注、行动与测评结果，且不可恢复。确定吗？')) return;
    if (!confirm('再确认一次：清空后只能通过之前导出的 JSON 恢复。')) return;
    clearAllData();
    toast('已清空本机数据');
    location.hash = '#/';
    location.reload();
  });
}

function repaintActions(root) {
  const list = root.querySelector('#actionList');
  if (!list) return;
  list.innerHTML = state.actions.length
    ? state.actions.map((a) => actionHTML(a)).join('')
    : `<div class="empty" style="padding:24px 16px">还没有行动项。</div>`;
  const badge = root.querySelector('#actions .badge-outline');
  if (badge) badge.textContent = `${state.actions.filter((a) => a.done).length}/${state.actions.length}`;
}

function buildMemoMarkdown() {
  const d = diagnose();
  const c = state.canvas;
  const stage = stageByKey[c.stage];
  const lines = [
    `# ${c.company || '我的企业'} · 共演战略备忘录`,
    '',
    `- 行业：${c.industry || '未填写'}`,
    `- 自评阶段：${stage.label}（${stage.span}）`,
    `- 生成时间：${new Date().toLocaleString('zh-CN')}`,
    '',
    '## 诊断结论',
    `**${d.verdict.title}**`,
    '',
    d.verdict.text,
    '',
    '## 四要素现状',
    '',
    '| 要素 | 均分 | 主要要点 |',
    '| --- | --- | --- |',
    ...ELEMENTS.map((el) => {
      const s = d.elScores[el.key];
      const pts = el.points.map((k) => `${stage.points[k].label}(${c.scores[k] || 0})`).join('、');
      return `| ${el.label} | ${s.filled ? s.avg.toFixed(1) : '—'} | ${pts} |`;
    }),
    '',
    '## 优先动作',
    ...d.priorities.map((p, i) => `${i + 1}. **${p.title}** —— ${p.why}`),
    '',
    '## 本阶段关键一问',
    `> ${stage.question}`,
    '',
    '## 30 天行动',
    ...(state.actions.length ? state.actions.map((a, i) => `${i + 1}. [${a.done ? 'x' : ' '}] ${a.text}`) : ['（尚未填写）']),
    '',
    '## 备注',
    ...ELEMENTS.filter((el) => c.elementNotes[el.key]).map((el) => `- **${el.label}**：${c.elementNotes[el.key]}`),
    ...POINTS.filter((p) => (c.notes[p.key] || '').trim()).map((p) => `- **${p.label}**：${c.notes[p.key]}`),
    '',
    '---',
    '由「共演战略画布」生成 · 理论基石：路江涌《共演战略画布》（机械工业出版社，2019）',
  ];
  return lines.join('\n');
}

/* 测评题查找（同源数据，静态导入） */

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
