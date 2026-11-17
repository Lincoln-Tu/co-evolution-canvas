/**
 * 关于：方法论说明、教学建议、致谢与声明
 */

import { META, SOURCES, GLOSSARY, SESSIONS } from '../data/theory.js';
import { observeReveals } from '../util.js';

export function renderAbout(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="page-head">
        <div class="breadcrumb"><a href="#/">总览</a><span class="sep">/</span><span>关于</span></div>
        <span class="eyebrow">About</span>
        <h1 class="h1" style="margin-top:12px">关于这套工具</h1>
        <p class="lead" style="margin-top:12px">
          一个为 EMBA 课堂设计的「共演战略画布」交互工具。它不替代原书，也不替代老师的讲授——
          它只做一件事：把抽象的框架，变成你可以动手、可以讨论、可以带走的东西。
        </p>
      </div>

      <div class="prose">
        <h2>为什么做这个工具</h2>
        <p>
          共演战略的价值，不在于记住「四要素、四阶段、12 个要点」这些名词，而在于建立一个<strong>可以反复使用的判断结构</strong>：
          当企业面对一个具体决策时，能迅速问出「这是哪个要素的问题」「这个要素是否落后于阶段」「四个要素是否在同步演化」。
        </p>
        <p>
          但课堂时间有限。如果课前没有共同语言，课中就不得不花大量时间解释概念；如果课后没有落地工具，认知很快会退回到原来的经验。
          所以这套工具按 <strong>课前—课中—课后</strong> 三段来设计：
        </p>
        <ul>
          <li><strong>课前</strong>：阅读理论图谱，完成测评与画布初填，带着自己的问题进课堂。</li>
          <li><strong>课中</strong>：用案例做「选择—对照—复盘」，再把案例的要素演化投射到自己的画布上。</li>
          <li><strong>课后</strong>：生成一页纸备忘录与 30 天行动，一个月后回来复盘评分变化。</li>
        </ul>

        <h2>工具的边界</h2>
        <div class="callout callout-warn">
          <div>
            <b>这不是一个「诊断准确」的评分系统。</b>
            画布上的分数只是把你对企业的直觉显性化，价值在于它让你和同事「看见同一组数字」并开始讨论。
            任何把分数当作客观测量的用法，都背离了工具的初衷。
          </div>
        </div>
        <ul>
          <li>评分是主观的，且会随情境变化——建议每季度重评一次，观察变化而非绝对值。</li>
          <li>阶段标签是教学判断，真实企业常常同时处于两个阶段（老业务扩张、新业务创业）。</li>
          <li>案例数据来自公开信息，存在时滞与口径差异；涉及具体决策，请以企业官方披露为准。</li>
          <li>工具不提供「标准答案」。所有诊断与建议都是讨论的起点，而非结论。</li>
        </ul>

        <h2>理论基石</h2>
        <p>
          ${META.title}（Co-Evolution Strategy Canvas）由北京大学光华管理学院<span class="strong">${META.author}</span>教授提出。
          方法论骨架来自《共演战略：重新定义企业生命周期》（2018）与《共演战略画布》（2019，机械工业出版社）。
        </p>
        <p>
          核心结构：<span class="strong">1 个环境特征</span>（复杂性 = 不确定性 × 不连续性）、
          <span class="strong">2 个维度</span>（人与事、内与外）、
          <span class="strong">4 个要素</span>（用户、组织、产品、市场）、
          <span class="strong">4 个阶段</span>（精益创业、专益成长、增益扩张、升益转型）、
          <span class="strong">6 个战略问题</span>（5W1H）、
          <span class="strong">12 个战略要点</span>、
          <span class="strong">48 个战略演化</span>。
        </p>

        <h2>使用建议</h2>
        ${['pre', 'in', 'post'].map((k) => {
          const s = SESSIONS[k];
          return `<h3>${s.title}（约 ${s.minutes} 分钟）</h3>
          <p>${s.goal}</p>
          <ul>${s.steps.map((st) => `<li><strong>${st.t}</strong>：${st.d}</li>`).join('')}</ul>
          <p class="tiny muted">产出：${s.deliverable}</p>`;
        }).join('')}

        <h2 id="credits">致谢与声明</h2>
        <p>
          本工具是<strong>教学辅助材料</strong>，由学习者基于公开资料自主构建，<strong>非北京大学光华管理学院官方产品</strong>，
          亦未获得作者或出版社的商业授权。理论框架、四要素、四阶段与 48 演化的知识产权归原作者所有；
          本工具中的教学化解释、案例整理、交互设计与诊断逻辑，由本工具团队完成。
        </p>
        <p>
          如用于正式课程或商业培训，请以原著与作者授权材料为准。若权利人认为本工具存在不当使用，请联系我们删除相关内容。
        </p>

        <h2>术语表</h2>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th style="width:130px">术语</th><th style="width:160px">English</th><th>释义</th></tr></thead>
            <tbody>
              ${GLOSSARY.map((g) => `<tr><td><b>${g.term}</b></td><td class="mono small" style="color:var(--text-3)">${g.en}</td><td class="small">${g.desc}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <h2>主要参考</h2>
        <div class="credit-list">
          ${SOURCES.map((s, i) => `
            <div class="credit-item">
              <span class="ci-idx">${String(i + 1).padStart(2, '0')}</span>
              <div>
                <p>${s.label}</p>
                <a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.url}</a>
              </div>
            </div>`).join('')}
        </div>

        <h2>技术说明</h2>
        <p>
          纯静态站点：无框架、无构建步骤、无追踪脚本。所有交互由原生 JavaScript 实现，图表为手写 SVG。
          数据保存在浏览器 localStorage，不上传服务器。适配桌面、平板与手机，支持深色模式、键盘操作与打印。
        </p>
      </div>
    </div>
  `;
  observeReveals(root);
}
