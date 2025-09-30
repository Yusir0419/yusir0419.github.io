// 站点脚本入口
// - 主题切换（深/浅色，持久化 localStorage）
// - 导航高亮（根据 pathname 匹配）
// - 注册 Service Worker（提供基础离线缓存）
(function () {
  console.debug('[ting1127.top] main.js loaded');

  // 主题：初始化与切换
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  }
  var btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', function () {
      var cur = root.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  }

  // 导航：设置 active
  try {
    var path = location.pathname.replace(/\/$/, '/');
    var map = {
      '/': 'home',
      '/about.html': 'about',
      '/contact.html': 'contact'
    };
    var key = map[path] || (path === '' ? 'home' : null);
    if (key) {
      var link = document.querySelector('[data-nav="' + key + '"]');
      if (link) link.classList.add('active');
    }
  } catch (e) {}

  // Service Worker：注册
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function (err) {
        console.debug('SW register failed:', err);
      });
    });
  }
})();
