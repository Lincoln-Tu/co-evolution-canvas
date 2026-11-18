/**
 * 应用入口：主题、导航、路由注册、全局交互
 */

import { start, route, setNotFound } from './router.js';
import { state, setTheme } from './store.js';
import { renderHome } from './views/home.js';
import { renderTheory } from './views/theory.js';
import { renderCanvas } from './views/canvas.js';
import { renderCases, renderCaseDetail } from './views/cases.js';
import { renderQuiz } from './views/quiz.js';
import { renderWorkspace } from './views/workspace.js';
import { renderAbout } from './views/about.js';
import { $$, sharePage, toast } from './util.js';

/* ---------------------------- 主题 ---------------------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A1721' : '#0E2233');
}

function initTheme() {
  const saved = state.ui.theme;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
    toast(next === 'dark' ? '已切换到深色模式' : '已切换到浅色模式');
  });
}

/* ---------------------------- 视图注册 ---------------------------- */

function main() {
  initTheme();
  document.getElementById('year').textContent = new Date().getFullYear();

  route('/', () => renderHome(document.getElementById('viewRoot')));
  route('/theory', (meta) => renderTheory(document.getElementById('viewRoot'), meta));
  route('/canvas', () => renderCanvas(document.getElementById('viewRoot')));
  route('/cases', (meta) => renderCases(document.getElementById('viewRoot'), meta));
  route('/cases/:id', (meta) => renderCaseDetail(document.getElementById('viewRoot'), meta));
  route('/quiz', () => renderQuiz(document.getElementById('viewRoot')));
  route('/workspace', () => renderWorkspace(document.getElementById('viewRoot')));
  route('/about', () => renderAbout(document.getElementById('viewRoot')));

  setNotFound((meta) => {
    const root = document.getElementById('viewRoot');
    root.innerHTML = `
      <div class="wrap" style="padding-block:120px;text-align:center">
        <div class="display" style="font-size:6rem;line-height:1;color:var(--gold-400)">404</div>
        <h1 class="h2" style="margin-top:16px">这一页还没有演化出来</h1>
        <p class="lead" style="margin:12px auto 28px">你访问的地址不存在。也许是链接过期，也许是我们在重构时挪动了位置。</p>
        <div class="btn-row" style="justify-content:center">
          <a class="btn btn-gold" href="#/">回到总览</a>
          <a class="btn btn-outline" href="#/canvas">打开画布</a>
        </div>
      </div>`;
  });

  start();
  initChrome();

  // 路由变化时关闭移动菜单、更新标题
  document.addEventListener('dsh:route', (e) => {
    closeMenu();
    if (e.detail.path.startsWith('/cases/')) return; // 案例详情页自行设置标题
    const titles = {
      '/': '共演战略画布 · 企业生命周期战略推演工作台',
      '/theory': '理论图谱 · 四要素与四阶段',
      '/canvas': '战略画布 · 为自己的企业推演',
      '/cases': '案例库 · 真实企业的关键抉择',
      '/quiz': '战略测评 · 检验你的判断',
      '/workspace': '我的工作台 · 备忘录与行动',
      '/about': '关于 · 共演战略画布',
    };
    document.title = titles[e.detail.path] || '共演战略画布';
  });
}

/* ---------------------------- 页面外壳 ---------------------------- */

function initChrome() {
  // 滚动状态
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('readProgress');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = h > 0 ? `${Math.min(100, (y / h) * 100)}%` : '0%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 移动菜单
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  menuBtn?.addEventListener('click', () => {
    const open = menu.hasAttribute('hidden');
    if (open) {
      menu.removeAttribute('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      closeMenu();
    }
  });
  $$('#mobileMenu a').forEach((a) => a.addEventListener('click', closeMenu));
  window.addEventListener('hashchange', closeMenu);
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) closeMenu();
  });

  // 分享
  document.getElementById('shareBtn')?.addEventListener('click', () => sharePage());

  // Sheet 关闭
  const dlg = document.getElementById('globalSheet');
  dlg?.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });
  $$('[data-close-sheet]').forEach((b) => b.addEventListener('click', () => dlg?.close()));

  // 键盘：g + 数字快速导航（不干扰输入框）
  let lastG = 0;
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
    if (e.key === 'g' || e.key === 'G') {
      lastG = Date.now();
      return;
    }
    if (Date.now() - lastG < 900 && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
      const map = { 1: '/', 2: '/theory', 3: '/canvas', 4: '/cases', 5: '/quiz', 6: '/workspace' };
      location.hash = '#' + map[e.key];
      lastG = 0;
    }
  });
}

function closeMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('menuBtn');
  if (!menu || menu.hasAttribute('hidden')) return;
  menu.setAttribute('hidden', '');
  btn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

main();
