/**
 * 案例库：沉浸式案例 + 关键抉择模拟
 */

import { STAGES, ELEMENTS, stageByKey } from '../data/theory.js';
import { CASES, COUNTER_CASES, INDUSTRIES, caseById, CASE_STAGE_MATRIX } from '../data/cases.js';
import { state, setCaseChoice } from '../store.js';
import { h, $$, toast, openSheet, observeReveals, download } from '../util.js';
import { caseCard, stageShort } from './home.js';

/* ==============================  列表页  ============================== */

export function renderCases(root, meta) {
  const initialStage = meta?.query?.stage && STAGES.some((s) => s.key === meta.query.stage) ? meta.query.stage : 'all';
  const initialIndustry = meta?.query?.industry && INDUSTRIES.some((i) => i.key === meta.query.industry) ? meta.query.industry : 'all';
  const initialSort = meta?.query?.sort || 'stage';

  root.innerHTML = `
    <div class="wrap wrap-wide">
      <div class="page-head">
        <div class="breadcrumb"><a href="#/">总览</a><span class="sep">/</span><span>案例库</span></div>
        <span class="eyebrow">沉浸式学习</span>
        <h1 class="h1" style="margin-top:12px">十个真实企业，十次关键抉择</h1>
        <p class="lead" style="margin-top:12px">
          案例不是用来「背结论」的。每个案例都停在一个当时没有标准答案的抉择时刻——
          先做选择，再看结果，最后用四要素解释「为什么」。
        </p>
      </div>

      <div class="filters">
        <label class="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input class="input" id="caseSearch" type="search" placeholder="搜索企业、行业或关键词…" aria-label="搜索案例">
        </label>
        <div class="segmented" id="stageFilter" role="group" aria-label="按阶段筛选">
          <button type="button" data-fstage="all" aria-pressed="${initialStage === 'all'}">全部阶段</button>
          ${STAGES.map((s) => `<button type="button" data-fstage="${s.key}" aria-pressed="${initialStage === s.key}">${s.label}</button>`).join('')}
        </div>
        <select class="select" id="industryFilter" style="max-width:150px" aria-label="按行业筛选">
          ${INDUSTRIES.map((i) => `<option value="${i.key}" ${i.key === initialIndustry ? 'selected' : ''}>${i.label}</option>`).join('')}
        </select>
        <select class="select" id="sortFilter" style="max-width:150px" aria-label="排序方式">
          <option value="stage" ${initialSort === 'stage' ? 'selected' : ''}>按阶段推荐</option>
          <option value="year" ${initialSort === 'year' ? 'selected' : ''}>按创立年份</option>
          <option value="name" ${initialSort === 'name' ? 'selected' : ''}>按名称</option>
        </select>
      </div>

      <div id="caseCount" class="tiny muted" style="margin-bottom:16px"></div>
      <div class="cases-grid" id="caseGrid"></div>
      <div id="caseEmpty" class="empty hidden">没有匹配的案例，换个筛选条件试试。</div>

      ${renderMatrix()}

      <section style="margin-top:56px">
        <div class="section-head">
          <div>
            <span class="eyebrow" style="color:var(--danger)">反例 · 要素失衡的代价</span>
            <h2 class="h2" style="margin-top:10px">失败不是运气不好，是要素没跟上</h2>
            <p>每个反例都对应一个具体的失衡结构。课堂上可以用它们做「诊断练习」：先猜哪个要素先崩，再对照。</p>
          </div>
        </div>
        <div class="grid g2">
          ${COUNTER_CASES.map((cc) => `
            <div class="counter-card reveal">
              <h4>${cc.name} <small>${cc.years}</small></h4>
              <div class="tag-row" style="margin-top:6px">
                ${cc.imbalance.map((el) => `<span class="badge badge-danger">${elemName(el)} 失衡</span>`).join('')}
                <span class="badge badge-outline">${cc.stage}</span>
              </div>
              <p>${cc.story}</p>
              <p class="cc-lesson"><b>教学启示：</b>${cc.lesson}</p>
            </div>`).join('')}
        </div>
      </section>

      <div class="callout callout-info" style="margin-top:40px">
        <div>
          <b>数据说明：</b>案例中的数字来自公开年报、官方新闻与权威财经媒体；标注「未证实」的为单一来源或媒体口径。
          阶段标签是教学判断，不代表企业官方表述。每个案例页都附有来源链接，便于进一步查证。
        </div>
      </div>
    </div>
  `;

  // 状态
  let fStage = initialStage;
  let fIndustry = initialIndustry;
  let fSort = initialSort;
  let keyword = '';

  const grid = root.querySelector('#caseGrid');
  const countEl = root.querySelector('#caseCount');
  const emptyEl = root.querySelector('#caseEmpty');

  const apply = () => {
    let list = CASES.filter((c) => {
      if (fStage !== 'all' && !c.stageFit.includes(fStage)) return false;
      if (fIndustry !== 'all' && c.industryKey !== fIndustry) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        const hay = `${c.name} ${c.enName} ${c.tagline} ${c.industry} ${c.teachingInsight} ${c.foundingYear}`.toLowerCase();
        if (!hay.includes(k)) return false;
      }
      return true;
    });

    if (fSort === 'stage') {
      const order = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));
      list.sort((a, b) => order[a.primaryStage] - order[b.primaryStage] || a.foundedYear - b.foundedYear);
    } else if (fSort === 'year') {
      list.sort((a, b) => a.foundedYear - b.foundedYear);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    }

    grid.innerHTML = list.map((c, i) => caseCard(c, i)).join('');
    countEl.textContent = `共 ${list.length} 个案例${fStage !== 'all' ? ` · ${stageByKey[fStage].label}` : ''}${keyword ? ` · 关键词「${keyword}」` : ''}`;
    emptyEl.classList.toggle('hidden', list.length > 0);
    observeReveals(grid);

    const q = new URLSearchParams();
    if (fStage !== 'all') q.set('stage', fStage);
    if (fIndustry !== 'all') q.set('industry', fIndustry);
    if (fSort !== 'stage') q.set('sort', fSort);
    history.replaceState(null, '', `#/cases${q.toString() ? '?' + q.toString() : ''}`);
  };

  $$('[data-fstage]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      fStage = btn.dataset.fstage;
      $$('[data-fstage]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      apply();
    });
  });
  root.querySelector('#industryFilter').addEventListener('change', (e) => {
    fIndustry = e.target.value;
    apply();
  });
  root.querySelector('#sortFilter').addEventListener('change', (e) => {
    fSort = e.target.value;
    apply();
  });
  let timer = null;
  root.querySelector('#caseSearch').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      keyword = e.target.value.trim();
      apply();
    }, 180);
  });

  apply();
  observeReveals(root);
}

function elemName(key) {
  return ELEMENTS.find((e) => e.key === key)?.label || key;
}

function renderMatrix() {
  return `
    <section style="margin-top:56px">
      <div class="section-head">
        <div>
          <span class="eyebrow">教学地图</span>
          <h2 class="h2" style="margin-top:10px">案例—阶段矩阵</h2>
          <p>● 主阶段（建议重点讲）　○ 次阶段（可作对照切片）。课堂上可按阶段顺序推进，也可让学员选择与自己企业同阶段的案例。</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data" style="min-width:560px">
          <thead>
            <tr><th>案例</th>${STAGES.map((s) => `<th style="text-align:center">${s.label}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${CASE_STAGE_MATRIX.map((row) => {
              const c = caseById[row.caseId];
              if (!c) return '';
              return `<tr>
                <td><a href="#/cases/${c.id}" style="font-weight:600">${c.name}</a> <span class="tiny muted">${c.industry.split(' / ')[0]}</span></td>
                ${STAGES.map((s) => {
                  const fit = row.fit[s.key];
                  return `<td style="text-align:center;font-size:1rem;color:${fit === 'primary' ? 'var(--gold-600)' : fit === 'secondary' ? 'var(--text-3)' : 'var(--text-4)'}">
                    ${fit === 'primary' ? '●' : fit === 'secondary' ? '○' : '·'}
                  </td>`;
                }).join('')}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>`;
}

/* ==============================  详情页  ============================== */

export function renderCaseDetail(root, meta) {
  const id = meta?.params?.id;
  const c = caseById[id];
  if (!c) {
    root.innerHTML = `<div class="wrap"><div class="empty">找不到这个案例。<a class="link-arrow" href="#/cases" style="margin-left:8px">返回案例库</a></div></div>`;
    return;
  }

  const idx = CASES.findIndex((x) => x.id === id);
  const prev = CASES[(idx - 1 + CASES.length) % CASES.length];
  const next = CASES[(idx + 1) % CASES.length];
  const stageColor = (s) => stageByKey[s]?.color || 'var(--gold-500)';

  root.innerHTML = `
    <div class="case-hero" style="--cc:${c.color}">
      <div class="wrap wrap-wide case-hero-inner">
        <div class="breadcrumb"><a href="#/">总览</a><span class="sep">/</span><a href="#/cases">案例库</a><span class="sep">/</span><span>${c.name}</span></div>
        <div class="case-kicker">
          <span class="badge" style="background:${c.color}22;color:${c.color}">${c.industry}</span>
          <span>创立于 ${c.foundedYear} · ${c.founders}</span>
        </div>
        <div class="case-title-row">
          <div>
            <div class="en">${c.enName}</div>
            <h1>${c.name}</h1>
            <p class="case-tagline">${c.tagline}</p>
          </div>
          <div class="tag-row">
            ${c.stageFit.map((s) => `<span class="badge ${s === c.primaryStage ? 'badge-gold' : 'badge-outline'}">${stageByKey[s].label}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="wrap wrap-wide">
      <div class="case-layout">
        <div class="stack-lg">
          <section class="reveal">
            <span class="eyebrow">阶段旅程</span>
            <h2 class="h3" style="margin:10px 0 18px">它走过的四个阶段</h2>
            <div class="timeline">
              ${c.journey.map((j) => `
                <div class="timeline-item" style="--tl:${stageColor(j.stage)}">
                  <span class="tl-year num">${j.year}</span><span class="tl-stage">${stageByKey[j.stage]?.label || ''}</span>
                  <p>${j.event}</p>
                </div>`).join('')}
            </div>
          </section>

          <section class="reveal">
            <span class="eyebrow">四要素拆解</span>
            <h2 class="h3" style="margin:10px 0 8px">同步演化，还是各自为战？</h2>
            <p class="small muted" style="margin-bottom:18px">读案例时不要只看「做了什么」，要看「四个要素是否在同一阶段」。任何一个要素滞后，都会在下一个阶段变成瓶颈。</p>
            <div class="el-quad">
              ${ELEMENTS.map((el) => `
                <div class="el-quad-item" style="--el:${el.color}">
                  <h4>${el.label} <small>${el.axis}</small></h4>
                  <ul>
                    ${(c.elements[el.key] || []).map((x) => `<li>${x}</li>`).join('')}
                  </ul>
                </div>`).join('')}
            </div>
          </section>

          <section class="reveal">
            ${turningHTML(c)}
          </section>

          <section class="reveal">
            <div class="insight-box">
              <div class="ib-label">教学启示 · Teaching Insight</div>
              <p>${c.teachingInsight}</p>
            </div>
            <h3 class="h4" style="margin:24px 0 10px">留给课堂的讨论</h3>
            <div class="grid" style="gap:8px">
              ${c.discussion.map((q, i) => `
                <div style="display:flex;gap:12px;padding:12px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--line)">
                  <span class="tag-num">Q${i + 1}</span>
                  <span class="small" style="color:var(--text-2);line-height:1.7">${q}</span>
                </div>`).join('')}
            </div>
          </section>

          <section class="reveal">
            <h3 class="h4" style="margin-bottom:10px">信息来源</h3>
            <div class="src-list">
              ${c.sources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label || s.url}</a>`).join('')}
            </div>
          </section>
        </div>

        <aside class="case-aside stack-lg">
          <section class="card reveal">
            <span class="eyebrow">关键数字</span>
            <div class="facts-grid" style="margin-top:14px">
              ${c.keyFacts.map((f) => `
                <div class="fact">
                  <div class="f-year">${f.year} · ${f.metric}</div>
                  <div class="f-value">${f.value}</div>
                  ${f.unverified ? '<div class="f-metric" style="color:var(--warn)">※ 未证实 / 媒体口径</div>' : ''}
                </div>`).join('')}
            </div>
          </section>

          <section class="card reveal">
            <span class="eyebrow">把它带回你的画布</span>
            <p class="small" style="margin-top:10px;color:var(--text-2);line-height:1.8">
              看完 ${c.name} 的四要素与转折点，回到自己的企业：同样的问题，你会怎么答？
            </p>
            <div class="stack" style="margin-top:14px">
              <a class="btn btn-gold btn-block" href="#/canvas">开始我的画布推演</a>
              <button class="btn btn-outline btn-block" type="button" id="downloadCase">下载案例学习卡</button>
            </div>
          </section>

          <section class="card reveal">
            <span class="eyebrow">其它案例</span>
            <div class="stack" style="margin-top:14px">
              <a href="#/cases/${prev.id}" style="display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px dashed var(--line)">
                <span class="small" style="color:var(--text-3)">← 上一个</span><b class="small">${prev.name}</b>
              </a>
              <a href="#/cases/${next.id}" style="display:flex;justify-content:space-between;gap:10px;padding:10px 0">
                <span class="small" style="color:var(--text-3)">下一个 →</span><b class="small">${next.name}</b>
              </a>
            </div>
          </section>
        </aside>
      </div>
    </div>
  `;

  bindTurning(root, c);
  root.querySelector('#downloadCase')?.addEventListener('click', () => exportCaseCard(c));
  observeReveals(root);
}

function turningHTML(c) {
  const tp = c.turningPoint;
  return `
    <div class="turning" id="turning">
      <div class="turning-head">
        <h3>关键抉择 · 如果是你，会怎么选？</h3>
        <span class="badge">沉浸式模拟</span>
      </div>
      <div class="turning-body">
        <div class="badge badge-outline" style="margin-bottom:10px">情境</div>
        <p class="turning-bg">${tp.background}</p>
        <p class="tiny muted" style="margin-bottom:10px">从下面四个选项中选一个——没有提示，也没有标准答案。选完再看解析。</p>
        <div class="choice-list" id="choiceList">
          ${tp.options.map((o, i) => `
            <button type="button" class="choice-btn" data-choice="${i}">
              <span class="letter">${String.fromCharCode(65 + i)}</span>
              <span>${o}</span>
            </button>`).join('')}
        </div>
        <div id="turningResult"></div>
      </div>
    </div>`;
}

function bindTurning(root, c) {
  const list = root.querySelector('#choiceList');
  if (!list) return;
  const result = root.querySelector('#turningResult');
  const tp = c.turningPoint;

  // 恢复上次选择
  const saved = state.caseChoices?.[c.id];
  if (saved != null) revealChoice(saved, false);

  $$('[data-choice]', list).forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.choice);
      setCaseChoice(c.id, i);
      revealChoice(i, true);
    });
  });

  function revealChoice(chosen, animate) {
    const isBest = chosen === tp.best;
    $$('[data-choice]', list).forEach((btn) => {
      const i = Number(btn.dataset.choice);
      btn.disabled = true;
      btn.classList.remove('is-chosen', 'is-best', 'is-wrong');
      if (i === chosen && isBest) btn.classList.add('is-best');
      else if (i === chosen) btn.classList.add('is-wrong');
      else if (i === tp.best) btn.classList.add('is-best');
    });
    result.innerHTML = `
      <div class="reveal-panel" ${animate ? '' : 'style="animation:none"'}>
        <h4>${isBest ? '✓ 你选对了方向' : '△ 这个选择值得再想一层'}</h4>
        <p><b>实际选择：</b>${tp.options[tp.best]}</p>
        <p style="margin-top:6px"><b>后来发生了什么：</b>${tp.result}</p>
        <div class="rp-why">
          <p><b style="color:var(--gold-600)">用共演战略看：</b>${tp.why}</p>
        </div>
        <p class="tiny muted" style="margin-top:10px">这不代表唯一答案。真实决策的约束远多于案例所呈现的信息——关键是看你能否说清「为什么」。${isBest ? '' : ' 换个选项再试一次，也是一次很好的对照练习。'}</p>
      </div>`;
    if (animate) toast(isBest ? '判断与历史选择一致' : '已展示历史选择，可对照差异');
  }
}

function exportCaseCard(c) {
  const md = [
    `# 案例学习卡 · ${c.name}（${c.enName}）`,
    '',
    `> ${c.tagline}`,
    `> 行业：${c.industry}　创立：${c.foundedYear}　创始人：${c.founders}　阶段：${c.stageLabel}`,
    '',
    '## 阶段旅程',
    ...c.journey.map((j) => `- **${j.year}｜${stageByKey[j.stage]?.label}**：${j.event}`),
    '',
    '## 四要素',
    ...ELEMENTS.flatMap((el) => [`### ${el.label}（${el.axis}）`, ...(c.elements[el.key] || []).map((x) => `- ${x}`)]),
    '',
    '## 关键抉择',
    `- 情境：${c.turningPoint.background}`,
    `- 历史选择：${c.turningPoint.options[c.turningPoint.best]}`,
    `- 结果：${c.turningPoint.result}`,
    `- 共演解读：${c.turningPoint.why}`,
    '',
    '## 教学启示',
    c.teachingInsight,
    '',
    '## 讨论问题',
    ...c.discussion.map((q) => `- ${q}`),
    '',
    '## 来源',
    ...c.sources.map((s) => `- ${s.label || ''} ${s.url}`),
    '',
    '---',
    '由「共演战略画布」生成 · 理论基石：路江涌《共演战略画布》',
  ].join('\n');
  download(`${c.name}-案例学习卡.md`, md, 'text/markdown;charset=utf-8');
  toast('案例学习卡已下载');
}
