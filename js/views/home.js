/**
 * 首页：一页看懂方法论，并给出三条使用路径
 */

import { ELEMENTS, STAGES, META, CURVES, SIX_QUESTIONS } from '../data/theory.js';
import { CASES, caseById } from '../data/cases.js';
import { dualSCurve, quadMatrix } from '../charts.js';
import { h, $$, observeReveals } from '../util.js';

const ICON = {
  theory: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 5.5v15M8 7h8M8 11h6"/></svg>',
  canvas: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M12 3.5v17M3.5 12h17"/></svg>',
  cases: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5A2 2 0 0 1 5.5 5.5H10l2 2h6.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/></svg>',
  quiz: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M9.4 9a2.7 2.7 0 1 1 3.9 2.4c-.8.5-1.3 1-1.3 2M12 17.2h.01"/></svg>',
  sprint: '<svg viewBox="0 0 24 24"><path d="M4 18 9 9l4 5 3-4 4 8z"/><path d="M4 21h16"/></svg>',
};

const pathCards = [
  {
    step: 'Step 01 · 课前',
    icon: ICON.theory,
    title: '看懂：四要素与四阶段',
    desc: '用一张 2×2 矩阵把「内与外、人与事」讲清楚，再用双 S 曲线理解为什么转型必须在最高点之前。',
    meta: [['阅读', '20 分钟'], ['产出', '共同语言']],
    href: '#/theory',
    cta: '进入理论图谱',
  },
  {
    step: 'Step 02 · 课中',
    icon: ICON.cases,
    title: '想透：真实企业的关键抉择',
    desc: '每个案例都有一个「当时没人知道答案」的抉择时刻。先做选择，再看结果，最后对照四要素找失衡。',
    meta: [['案例', `${CASES.length} 个`], ['方式', '选择—对照—复盘']],
    href: '#/cases',
    cta: '进入案例库',
  },
  {
    step: 'Step 03 · 课后',
    icon: ICON.canvas,
    title: '用上：为自己企业推演',
    desc: '在画布上为 12 个战略要点打分，得到要素失衡图与优先行动建议，一键生成一页纸战略备忘录。',
    meta: [['时长', '10 分钟'], ['产出', '诊断卡 + 行动']],
    href: '#/canvas',
    cta: '打开战略画布',
  },
];

export function renderHome(root) {
  root.innerHTML = `
    <section class="hero">
      <div class="wrap wrap-wide">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="hero-badge"><b>EMBA · 共演战略</b> 课前 · 课中 · 课后 一体化学习工具</div>
            <h1 class="display">
              四要素，<br>在企业生命周期中<span class="accent-gradient">共同演化</span>
              <span class="line-2">用户 · 组织 · 产品 · 市场 —— 不是四张清单，而是一个系统</span>
            </h1>
            <p class="hero-lead">
              基于北京大学路江涌教授的《共演战略画布》。用<strong>一张矩阵</strong>理解战略的空间，
              用<strong>一条曲线</strong>理解战略的时间，再用<strong>十个真实案例</strong>和<strong>一张可交互画布</strong>，
              把方法论变成你自己的判断力。
            </p>
            <div class="hero-actions">
              <a class="btn btn-lg btn-gold" href="#/canvas">
                ${ICON.sprint} 开始推演我的画布
              </a>
              <a class="btn btn-lg btn-outline" href="#/theory">先看方法论</a>
            </div>
            <div class="hero-stats">
              <div class="stat"><span class="stat-value num">4 × 4</span><span class="stat-label">要素 × 阶段</span></div>
              <div class="stat"><span class="stat-value num">48</span><span class="stat-label">个战略演化</span></div>
              <div class="stat"><span class="stat-value num">${CASES.length}</span><span class="stat-label">个真实企业案例</span></div>
            </div>
          </div>

          <div class="hero-visual" aria-hidden="true">
            <div class="hero-orbit"></div>
            <div class="matrix-wrap">${quadMatrix({})}</div>
            <div class="hero-center-badge">
              <span class="n">4×4</span>
              <span class="t">ELEMENTS × STAGES</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-tight">
      <div class="wrap wrap-wide">
        ${formulaStrip()}
      </div>
    </section>

    <section class="section" id="elements">
      <div class="wrap wrap-wide">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">空间维度 · 四要素</span>
            <h2 class="h2" style="margin-top:12px">战略之妙，方寸之间</h2>
            <p>横轴是「内与外」，纵轴是「人与事」。四个象限，对应企业必须同时管理的四件事——缺一个，另外三个都会变形。</p>
          </div>
          <a class="link-arrow" href="#/theory">查看完整理论图谱</a>
        </div>
        <div class="elements-grid">
          ${ELEMENTS.map((el, i) => `
            <a class="element-card reveal" href="#/theory#element-${el.key}" style="--el:${el.color};--el-soft:${el.colorSoft};--el-ink:${el.colorInk};transition-delay:${i * 60}ms">
              <div class="el-top">
                <div>
                  <div class="el-name">${el.label}</div>
                  <div class="el-axis">${el.axis}</div>
                </div>
                <span class="el-en">${el.en}</span>
              </div>
              <p class="el-desc">${el.desc}</p>
              <div class="el-points">${el.points.map((p) => `<span>${pointLabel(p)}</span>`).join('')}</div>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" id="lifecycle" style="background:var(--paper-2);border-block:1px solid var(--line)">
      <div class="wrap wrap-wide">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">时间维度 · 四阶段</span>
            <h2 class="h2" style="margin-top:12px">战略不是一次选择，而是一串时机</h2>
            <p>精益创业、专益成长、增益扩张、升益转型。A 曲线走完之前，B 曲线必须已经在路上。</p>
          </div>
          <a class="link-arrow" href="#/theory#curve">理解双 S 曲线</a>
        </div>
        <div class="curve-wrap reveal" id="homeCurve">
          ${dualSCurve({ interactive: true, compact: false, id: 'home' })}
        </div>
        <div class="stage-cards" style="margin-top:24px">
          ${STAGES.map((s, i) => `
            <a class="stage-card reveal" href="#/theory#stage-${s.key}" data-code="${s.code}" style="--c:${s.color};transition-delay:${i * 70}ms">
              <div class="stage-card-top">
                <span class="sc-badge"><i></i>${s.span}</span>
                <span class="sc-span">${String(i + 1).padStart(2, '0')} / 04</span>
              </div>
              <h3>${s.label}</h3>
              <div class="sc-rule"><b>${s.rule.op}</b><span>${s.rule.formula}</span></div>
              <p class="sc-gist">${s.gist}</p>
              <div class="sc-meta"><span>${s.curve}</span><span>${s.metaphor}</span></div>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" id="scenarios">
      <div class="wrap wrap-wide">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">学习设计 · 三个场景</span>
            <h2 class="h2" style="margin-top:12px">课前建立语言，课中练习判断，课后落到行动</h2>
            <p>这不是一份可以「看完就算」的资料。每个场景都有明确的输入、互动与产出。</p>
          </div>
        </div>
        <div class="paths">
          ${pathCards.map((c, i) => `
            <a class="path-card reveal" href="${c.href}" style="transition-delay:${i * 70}ms">
              <div class="pc-top"><span class="pc-step">${c.step}</span><span class="pc-icon">${c.icon}</span></div>
              <h3>${c.title}</h3>
              <p>${c.desc}</p>
              <div class="pc-meta">${c.meta.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('')}</div>
              <span class="link-arrow">${c.cta}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--paper-2);border-block:1px solid var(--line)">
      <div class="wrap wrap-wide">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">沉浸式案例</span>
            <h2 class="h2" style="margin-top:12px">在别人的抉择里，练习自己的判断</h2>
            <p>十个真实企业，覆盖四个阶段。每一个都有四要素演化、关键数字、以及一个「当时没有标准答案」的转折点。</p>
          </div>
          <a class="link-arrow" href="#/cases">查看全部案例</a>
        </div>
        <div class="cases-grid">
          ${['saturnbird', 'pinduoduo', 'catl', 'meituan', 'byd', 'huawei'].map((id, i) => caseCard(caseById[id], i)).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap wrap-wide">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">六个战略问题</span>
            <h2 class="h2" style="margin-top:12px">从 Why 到 How，把战略问成一张网</h2>
            <p>5W1H 不是检查清单，而是六个相互牵连的追问。任何一个问题答不上来，另外五个都会松。</p>
          </div>
        </div>
        <div class="grid g3 reveal">
          ${SIX_QUESTIONS.map((q) => `
            <div class="card card-hover" style="border-top:3px solid ${q.mapsEl ? `var(--el-${q.mapsEl})` : 'var(--gold-400)'}">
              <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">
                <span class="num" style="font-size:1.5rem;font-weight:700;color:var(--gold-600)">${q.label}</span>
                <span class="tiny muted">${q.cn}</span>
              </div>
              <div class="badge" style="margin-top:10px">${q.maps}</div>
              <p class="small" style="margin-top:10px;color:var(--text-2);line-height:1.8">${q.desc}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-tight">
      <div class="wrap wrap-wide">
        <div class="cta-band reveal">
          <div>
            <h2>现在，把方法论变成你自己的画布</h2>
            <p>10 分钟，12 个要点。工具会告诉你：哪个要素正在拖住其他要素，下一步最该动的是哪一颗棋子。数据只保存在你的浏览器里。</p>
          </div>
          <div class="cta-actions">
            <a class="btn btn-lg btn-gold" href="#/canvas">开始推演</a>
            <a class="btn btn-lg btn-outline" href="#/quiz">先做一次测评</a>
          </div>
        </div>
      </div>
    </section>
  `;

  bindHome(root);
  observeReveals(root);
}

function formulaStrip() {
  return `
  <div class="formula-strip reveal" role="list" aria-label="共演战略密码">
    ${META.formulaMeaning.map((f) => `
      <div class="formula-cell" role="listitem">
        <b>${f.n}</b>
        <strong>${f.label}</strong>
        <span>${f.desc}</span>
      </div>`).join('')}
  </div>`;
}

function pointLabel(key) {
  const map = {
    characteristics: '用户特征', needs: '用户需求', choice: '用户选择',
    leader: '领导者', team: '团队员工', structure: '组织管理',
    development: '产品开发', marketing: '营销推广', businessModel: '商业模式',
    tech: '技术趋势', capital: '资本资源', competition: '市场竞合',
  };
  return map[key] || key;
}

export function caseCard(c, i = 0) {
  if (!c) return '';
  return `
  <a class="case-card reveal" href="#/cases/${c.id}" style="--cc:${c.color};transition-delay:${i * 55}ms">
    <div class="case-card-top">
      <span class="cc-name">${c.name}</span>
      <span class="cc-year">${c.enName} · ${c.foundedYear}</span>
    </div>
    <div class="case-card-body">
      <h3>${c.tagline}</h3>
      <p>${c.teachingInsight.length > 62 ? c.teachingInsight.slice(0, 62) + '…' : c.teachingInsight}</p>
    </div>
    <div class="case-card-foot">
      <div class="case-stage-tags">
        ${c.stageFit.map((s) => `<span class="stage-pill ${s === c.primaryStage ? 'is-primary' : ''}">${stageShort(s)}</span>`).join('')}
      </div>
      <span class="tiny muted">${c.industry.split(' / ')[0]}</span>
    </div>
  </a>`;
}

function stageShort(key) {
  const s = STAGES.find((x) => x.key === key);
  return s ? s.short : key;
}

function bindHome(root) {
  // 首页双 S 曲线点击阶段 → 跳转理论
  $$('[data-stage]', root).forEach((g) => {
    const go = () => {
      location.hash = `#/theory#stage-${g.dataset.stage}`;
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

/* 供其它视图复用 */
export { ICON, pointLabel, stageShort };
