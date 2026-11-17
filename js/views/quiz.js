/**
 * 战略测评：情境判断题 + 即时解析
 */

import { QUIZ, QUIZ_PROFILES } from '../data/quiz.js';
import { ELEMENTS } from '../data/theory.js';
import { state, quizAnswer, quizSetIndex, quizFinish, quizReset } from '../store.js';
import { toast, observeReveals, download } from '../util.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function renderQuiz(root) {
  if (state.quiz.done) {
    renderResult(root);
    return;
  }
  renderQuestion(root);
}

function answeredCount() {
  return Object.keys(state.quiz.answers).length;
}

function renderQuestion(root) {
  const idx = Math.min(state.quiz.index || 0, QUIZ.length - 1);
  const q = QUIZ[idx];
  const chosen = state.quiz.answers[q.id];
  const isAnswered = chosen != null;
  const pct = (answeredCount() / QUIZ.length) * 100;

  root.innerHTML = `
    <div class="wrap">
      <div class="quiz-shell">
        <div class="page-head" style="padding-bottom:20px">
          <div class="breadcrumb"><a href="#/">总览</a><span class="sep">/</span><span>战略测评</span></div>
          <span class="eyebrow">检验理解 · 不是背名词</span>
          <h1 class="h2" style="margin-top:10px">你会怎么判断？</h1>
          <p class="small muted" style="margin-top:8px;max-width:58ch">15 道情境题，覆盖四要素与四个阶段。每题选完立即看到解析——解析比答案更重要。</p>
        </div>

        <div class="quiz-progress">
          <div class="meter"><i style="width:${pct}%"></i></div>
          <span>${idx + 1} / ${QUIZ.length}</span>
        </div>

        <article class="question-card" id="qCard">
          <div class="question-meta">
            <span class="badge badge-gold">${q.tag}</span>
            <span class="badge badge-outline">${elLabel(q.el)}要素</span>
            <span class="badge badge-outline">${stageLabel(q.stage)}</span>
            <span class="tiny muted" style="margin-left:auto">已答 ${answeredCount()} 题</span>
          </div>

          <div class="question-scenario">${q.scenario}</div>
          <h2>${q.question}</h2>

          <div class="option-list" id="options">
            ${q.options.map((o, i) => {
              let cls = 'option';
              if (isAnswered) {
                if (i === q.answer) cls += ' is-correct';
                else if (i === chosen) cls += ' is-wrong';
              }
              return `<button type="button" class="${cls}" data-opt="${i}" ${isAnswered ? 'disabled' : ''}>
                <span class="o-letter">${LETTERS[i]}</span>
                <span>${o}</span>
              </button>`;
            }).join('')}
          </div>

          <div id="explain"></div>

          <div class="btn-row" style="margin-top:22px;justify-content:space-between">
            <button class="btn btn-ghost" type="button" id="btnPrev" ${idx === 0 ? 'disabled' : ''}>← 上一题</button>
            <div style="display:flex;gap:10px">
              ${idx < QUIZ.length - 1
                ? `<button class="btn btn-outline" type="button" id="btnNext">下一题 →</button>`
                : `<button class="btn btn-gold" type="button" id="btnFinish">查看结果</button>`}
            </div>
          </div>
        </article>

        <p class="tiny muted" style="text-align:center;margin-top:18px">可以跳题，未答的题不计分。你的答案只保存在本机。</p>
      </div>
    </div>
  `;

  if (isAnswered) showExplain(root, q, chosen);

  root.querySelector('#options').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-opt]');
    if (!btn) return;
    const i = Number(btn.dataset.opt);
    quizAnswer(q.id, i);
    // 就地更新选项状态
    root.querySelectorAll('[data-opt]').forEach((b) => {
      const bi = Number(b.dataset.opt);
      b.disabled = true;
      b.classList.toggle('is-correct', bi === q.answer);
      b.classList.toggle('is-wrong', bi === i && bi !== q.answer);
    });
    showExplain(root, q, i);
    const meter = root.querySelector('.meter > i');
    if (meter) meter.style.width = `${(answeredCount() / QUIZ.length) * 100}%`;
  });

  root.querySelector('#btnPrev')?.addEventListener('click', () => {
    quizSetIndex(idx - 1);
    renderQuestion(root);
  });
  root.querySelector('#btnNext')?.addEventListener('click', () => {
    quizSetIndex(idx + 1);
    renderQuestion(root);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  root.querySelector('#btnFinish')?.addEventListener('click', () => {
    if (answeredCount() < QUIZ.length) {
      const rest = QUIZ.length - answeredCount();
      if (!confirm(`还有 ${rest} 题未作答，未答的题将计为错误。确定要查看结果吗？`)) return;
    }
    quizFinish();
    renderResult(root);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  observeReveals(root);
}

function showExplain(root, q, chosen) {
  const box = root.querySelector('#explain');
  if (!box) return;
  const right = chosen === q.answer;
  box.innerHTML = `
    <div class="explain-box">
      <b>${right ? '✓ 判断正确' : '△ 再想一层'}</b>
      ${q.explain}
    </div>`;
}

function renderResult(root) {
  const total = QUIZ.length;
  const correct = QUIZ.filter((q) => state.quiz.answers[q.id] === q.answer).length;
  const rate = correct / total;
  const profile = QUIZ_PROFILES.find((p) => rate >= p.min) || QUIZ_PROFILES[QUIZ_PROFILES.length - 1];

  const byEl = ELEMENTS.map((el) => {
    const qs = QUIZ.filter((q) => q.el === el.key);
    const ok = qs.filter((q) => state.quiz.answers[q.id] === q.answer).length;
    return { el, ok, total: qs.length };
  });

  const wrong = QUIZ.filter((q) => state.quiz.answers[q.id] !== q.answer);

  root.innerHTML = `
    <div class="wrap">
      <div class="quiz-shell">
        <div class="quiz-result">
          <span class="eyebrow" style="justify-content:center">测评完成</span>
          <div class="score-big">${correct}<span style="font-size:0.4em;color:var(--text-4)"> / ${total}</span></div>
          <p class="score-sub">正确率 ${Math.round(rate * 100)}%</p>
          <h2 class="h2" style="margin-top:18px">${profile.title}</h2>
          <p class="lead" style="margin:10px auto 0;text-align:left">${profile.desc}</p>
        </div>

        <div class="quiz-el-breakdown">
          ${byEl.map(({ el, ok, total: t }) => `
            <div class="qeb" style="--el:${el.color}">
              <b>${ok}<span style="font-size:0.55em;color:var(--text-4)">/${t}</span></b>
              <span>${el.label}</span>
            </div>`).join('')}
        </div>

        ${wrong.length ? `
          <section style="margin-top:40px">
            <h3 class="h4" style="margin-bottom:12px">需要再想一层的 ${wrong.length} 题</h3>
            <div class="stack">
              ${wrong.map((q) => `
                <details class="card" style="padding:0;overflow:hidden">
                  <summary style="cursor:pointer;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;list-style:none">
                    <span class="badge badge-danger" style="flex-shrink:0">${q.tag}</span>
                    <span class="small" style="color:var(--text-1)">${q.question}</span>
                  </summary>
                  <div style="padding:0 16px 16px">
                    <p class="tiny muted" style="margin-bottom:8px">你选了：${LETTERS[state.quiz.answers[q.id]] ?? '未作答'}　
                      正确答案：${LETTERS[q.answer]}</p>
                    <p class="small" style="color:var(--text-2);line-height:1.8">${q.explain}</p>
                  </div>
                </details>`).join('')}
            </div>
          </section>` : `
          <div class="callout callout-ok" style="margin-top:32px">
            <div><b>全部正确。</b> 但是要小心：测评考的是「识别」，实战考的是「取舍」。建议进入画布，用自己企业的真实处境再检验一次。</div>
          </div>`}

        <div class="btn-row" style="margin-top:32px;justify-content:center">
          <a class="btn btn-gold" href="#/canvas">去画布推演我的企业</a>
          <a class="btn btn-outline" href="#/cases">看案例再练一次</a>
          <button class="btn btn-ghost" type="button" id="retry">重新测评</button>
          <button class="btn btn-ghost" type="button" id="downloadReport">下载测评报告</button>
        </div>

        <p class="tiny muted" style="text-align:center;margin-top:20px">
          测评结果保存在本机。重新测评会覆盖当前结果。
        </p>
      </div>
    </div>
  `;

  root.querySelector('#retry').addEventListener('click', () => {
    if (confirm('重新测评会清空本次答案，确定吗？')) {
      quizReset();
      renderQuiz(root);
    }
  });
  root.querySelector('#downloadReport').addEventListener('click', () => {
    const md = [
      '# 共演战略 · 测评报告',
      '',
      `生成时间：${new Date().toLocaleString('zh-CN')}`,
      `得分：${correct} / ${total}（${Math.round(rate * 100)}%）`,
      `画像：${profile.title}`,
      '',
      profile.desc,
      '',
      '## 分要素得分',
      ...byEl.map(({ el, ok, total: t }) => `- ${el.label}：${ok} / ${t}`),
      '',
      '## 错题与解析',
      ...(wrong.length
        ? wrong.flatMap((q) => [
            `### ${q.question}`,
            `- 你的选择：${LETTERS[state.quiz.answers[q.id]] ?? '未作答'}`,
            `- 正确答案：${LETTERS[q.answer]}`,
            `- 解析：${q.explain}`,
            '',
          ])
        : ['全部正确。']),
      '',
      '---',
      '由「共演战略画布」生成 · 理论基石：路江涌《共演战略画布》',
    ].join('\n');
    download('共演战略-测评报告.md', md, 'text/markdown;charset=utf-8');
    toast('测评报告已下载');
  });

  observeReveals(root);
}

function elLabel(key) {
  return ELEMENTS.find((e) => e.key === key)?.label || '综合';
}

function stageLabel(key) {
  return { startup: '创业', growth: '成长', expansion: '扩张', transformation: '转型' }[key] || '综合';
}
