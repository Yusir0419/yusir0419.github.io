// store.js - 插件商店管理

/**
 * 插件商店管理器
 */
class PluginStore {
    constructor() {
        this.plugins = [];
        this.filteredPlugins = [];
        this.currentCategory = 'all';
        this.searchKeyword = '';
        this.installedPlugins = new Set();

        this.pluginListEl = document.getElementById('plugin-list');
        this.loadingStateEl = document.getElementById('loading-state');
        this.emptyStateEl = document.getElementById('empty-state');
        this.searchBarEl = document.getElementById('search-bar');
        this.searchInputEl = document.getElementById('search-input');

        console.log('PluginStore 初始化');
        this.init();
    }

    async init() {
        // 加载已安装插件列表
        this.loadInstalledPlugins();

        // 绑定事件
        this.bindEvents();

        // 加载插件列表
        await this.loadPlugins();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 返回按钮
        document.getElementById('btn-back').addEventListener('click', () => {
            window.history.back();
        });

        // 搜索按钮
        document.getElementById('btn-search').addEventListener('click', () => {
            this.toggleSearch();
        });

        // 清除搜索
        document.getElementById('btn-clear-search').addEventListener('click', () => {
            this.searchInputEl.value = '';
            this.searchKeyword = '';
            this.filterPlugins();
        });

        // 搜索输入
        this.searchInputEl.addEventListener('input', (e) => {
            this.searchKeyword = e.target.value.trim().toLowerCase();
            this.filterPlugins();
        });

        // 分类标签
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCategory = tab.dataset.category;
                this.filterPlugins();
            });
        });

        // 关闭详情对话框
        document.getElementById('btn-close-detail').addEventListener('click', () => {
            this.closePluginDetail();
        });

        // 点击遮罩层关闭
        document.getElementById('plugin-detail-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'plugin-detail-overlay') {
                this.closePluginDetail();
            }
        });
    }

    /**
     * 切换搜索栏
     */
    toggleSearch() {
        this.searchBarEl.classList.toggle('hidden');
        if (!this.searchBarEl.classList.contains('hidden')) {
            this.searchInputEl.focus();
        }
    }

    /**
     * 加载已安装插件
     */
    loadInstalledPlugins() {
        try {
            const installed = localStorage.getItem('installed_plugins');
            if (installed) {
                this.installedPlugins = new Set(JSON.parse(installed));
            }
        } catch (e) {
            console.error('加载已安装插件失败:', e);
        }
    }

    /**
     * 保存已安装插件
     */
    saveInstalledPlugins() {
        try {
            localStorage.setItem('installed_plugins', JSON.stringify([...this.installedPlugins]));
        } catch (e) {
            console.error('保存已安装插件失败:', e);
        }
    }

    /**
     * 加载插件列表
     */
    async loadPlugins() {
        this.showLoading();

        try {
            // 模拟从服务器加载插件数据
            // 实际使用时应该从远程API获取
            this.plugins = this.getMockPlugins();

            this.filteredPlugins = [...this.plugins];
            this.render();
        } catch (e) {
            console.error('加载插件列表失败:', e);
            this.showEmpty();
        }
    }

    /**
     * 获取模拟插件数据
     */
    getMockPlugins() {
        return [
            {
                id: 'theme-monokai',
                name: 'Monokai Pro',
                author: 'monokai',
                description: '经典 Monokai 配色主题，适合长时间编码',
                category: 'theme',
                icon: '🎨',
                version: '1.0.0',
                downloads: 15420,
                rating: 4.8,
                features: ['深色主题', '护眼配色', '语法高亮优化'],
                longDescription: 'Monokai Pro 是一款经典的深色主题，专为长时间编码设计，提供舒适的视觉体验。'
            },
            {
                id: 'lang-python',
                name: 'Python Language Support',
                author: 'python-dev',
                description: 'Python 语言支持，包含语法高亮、自动补全',
                category: 'language',
                icon: '🐍',
                version: '2.1.0',
                downloads: 28560,
                rating: 4.9,
                features: ['语法高亮', '智能补全', '代码片段'],
                longDescription: '为 Python 开发提供完整的语言支持，包括语法高亮、智能补全、代码片段等功能。'
            },
            {
                id: 'tool-formatter',
                name: 'Code Formatter',
                author: 'formatters',
                description: '代码格式化工具，支持多种语言',
                category: 'tools',
                icon: '🔧',
                version: '1.5.2',
                downloads: 22340,
                rating: 4.7,
                features: ['多语言支持', '自定义规则', '快捷键格式化'],
                longDescription: '强大的代码格式化工具，支持 JavaScript、Python、HTML、CSS 等多种语言。'
            },
            {
                id: 'snippet-js',
                name: 'JavaScript Snippets',
                author: 'js-team',
                description: '常用 JavaScript 代码片段集合',
                category: 'snippets',
                icon: '📜',
                version: '3.0.1',
                downloads: 18920,
                rating: 4.6,
                features: ['ES6+ 语法', '常用模式', '快速插入'],
                longDescription: '包含 200+ 个常用 JavaScript 代码片段，帮助你快速编写代码。'
            },
            {
                id: 'theme-dracula',
                name: 'Dracula Theme',
                author: 'dracula',
                description: '流行的 Dracula 深色主题',
                category: 'theme',
                icon: '🦇',
                version: '1.2.0',
                downloads: 12450,
                rating: 4.9,
                features: ['深色主题', '高对比度', '多平台一致'],
                longDescription: 'Dracula 是一款跨平台的深色主题，在全球拥有数百万用户。'
            },
            {
                id: 'lang-html',
                name: 'HTML & CSS Support',
                author: 'web-dev',
                description: 'HTML 和 CSS 语言支持增强',
                category: 'language',
                icon: '🌐',
                version: '2.3.0',
                downloads: 31200,
                rating: 4.8,
                features: ['标签补全', 'CSS 类名提示', 'Emmet 支持'],
                longDescription: '增强的 HTML 和 CSS 开发体验，包括智能补全、Emmet 支持等。'
            },
            {
                id: 'tool-git',
                name: 'Git Integration',
                author: 'git-tools',
                description: 'Git 版本控制集成工具',
                category: 'tools',
                icon: '🔀',
                version: '1.8.0',
                downloads: 25670,
                rating: 4.7,
                features: ['可视化操作', '分支管理', '提交历史'],
                longDescription: '在编辑器中直接进行 Git 操作，无需切换到命令行。'
            },
            {
                id: 'snippet-react',
                name: 'React Snippets',
                author: 'react-team',
                description: 'React 开发代码片段',
                category: 'snippets',
                icon: '⚛️',
                version: '2.0.0',
                downloads: 16780,
                rating: 4.8,
                features: ['组件模板', 'Hooks 片段', 'TypeScript 支持'],
                longDescription: '包含 React 组件、Hooks、生命周期等常用代码片段。'
            }
        ];
    }

    /**
     * 过滤插件
     */
    filterPlugins() {
        this.filteredPlugins = this.plugins.filter(plugin => {
            // 分类过滤
            if (this.currentCategory !== 'all' && plugin.category !== this.currentCategory) {
                return false;
            }

            // 搜索过滤
            if (this.searchKeyword) {
                const keyword = this.searchKeyword;
                return plugin.name.toLowerCase().includes(keyword) ||
                       plugin.description.toLowerCase().includes(keyword) ||
                       plugin.author.toLowerCase().includes(keyword);
            }

            return true;
        });

        this.render();
    }

    /**
     * 渲染插件列表
     */
    render() {
        this.hideLoading();
        this.pluginListEl.innerHTML = '';

        if (this.filteredPlugins.length === 0) {
            this.showEmpty();
            return;
        }

        this.hideEmpty();

        this.filteredPlugins.forEach(plugin => {
            const card = this.createPluginCard(plugin);
            this.pluginListEl.appendChild(card);
        });
    }

    /**
     * 创建插件卡片
     */
    createPluginCard(plugin) {
        const card = document.createElement('div');
        card.className = 'plugin-card';
        card.dataset.pluginId = plugin.id;

        const isInstalled = this.installedPlugins.has(plugin.id);

        card.innerHTML = `
            <div class="plugin-card-header">
                <div class="plugin-icon">${plugin.icon}</div>
                <div class="plugin-info">
                    <div class="plugin-name">${plugin.name}</div>
                    <div class="plugin-author">by ${plugin.author}</div>
                </div>
                <button class="plugin-install-btn ${isInstalled ? 'installed' : ''}" data-plugin-id="${plugin.id}">
                    ${isInstalled ? '已安装' : '安装'}
                </button>
            </div>
            <div class="plugin-description">${plugin.description}</div>
            <div class="plugin-meta">
                <div class="plugin-meta-item plugin-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                    </svg>
                    ${plugin.rating}
                </div>
                <div class="plugin-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M480-320 280-120l-56-56 216-216-216-216 56-56 200 200 200-200 56 56-216 216 216 216-56 56-200-200Z"/>
                    </svg>
                    ${this.formatNumber(plugin.downloads)}
                </div>
                <div class="plugin-category">${this.getCategoryName(plugin.category)}</div>
            </div>
        `;

        // 点击卡片显示详情
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('plugin-install-btn')) {
                this.showPluginDetail(plugin);
            }
        });

        // 安装按钮
        const installBtn = card.querySelector('.plugin-install-btn');
        installBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleInstall(plugin.id);
        });

        return card;
    }

    /**
     * 切换安装状态
     */
    toggleInstall(pluginId) {
        if (this.installedPlugins.has(pluginId)) {
            this.installedPlugins.delete(pluginId);
            Bridge.System.showToast('插件已卸载');
        } else {
            this.installedPlugins.add(pluginId);
            Bridge.System.showToast('插件已安装');
        }

        this.saveInstalledPlugins();
        this.render();
    }

    /**
     * 显示插件详情
     */
    showPluginDetail(plugin) {
        const overlay = document.getElementById('plugin-detail-overlay');
        const body = document.getElementById('plugin-detail-body');

        const isInstalled = this.installedPlugins.has(plugin.id);

        body.innerHTML = `
            <div class="detail-header">
                <div class="detail-icon">${plugin.icon}</div>
                <div class="detail-info">
                    <div class="detail-name">${plugin.name}</div>
                    <div class="detail-author">by ${plugin.author}</div>
                    <div class="detail-version">版本 ${plugin.version}</div>
                </div>
            </div>

            <div class="detail-actions">
                <button class="detail-btn detail-btn-primary" data-plugin-id="${plugin.id}">
                    ${isInstalled ? '卸载' : '安装'}
                </button>
                <button class="detail-btn detail-btn-secondary">
                    分享
                </button>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">描述</div>
                <div class="detail-section-content">${plugin.longDescription || plugin.description}</div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">主要功能</div>
                <ul class="detail-features">
                    ${plugin.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">统计信息</div>
                <div class="detail-stats">
                    <div class="detail-stat">
                        <div class="detail-stat-value">${plugin.rating}</div>
                        <div class="detail-stat-label">评分</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${this.formatNumber(plugin.downloads)}</div>
                        <div class="detail-stat-label">下载量</div>
                    </div>
                </div>
            </div>
        `;

        // 绑定安装按钮
        const installBtn = body.querySelector('.detail-btn-primary');
        installBtn.addEventListener('click', () => {
            this.toggleInstall(plugin.id);
            this.closePluginDetail();
        });

        overlay.classList.remove('hidden');
    }

    /**
     * 关闭插件详情
     */
    closePluginDetail() {
        const overlay = document.getElementById('plugin-detail-overlay');
        overlay.classList.add('hidden');
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.loadingStateEl.classList.remove('hidden');
        this.emptyStateEl.classList.add('hidden');
        this.pluginListEl.innerHTML = '';
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        this.loadingStateEl.classList.add('hidden');
    }

    /**
     * 显示空状态
     */
    showEmpty() {
        this.emptyStateEl.classList.remove('hidden');
    }

    /**
     * 隐藏空状态
     */
    hideEmpty() {
        this.emptyStateEl.classList.add('hidden');
    }

    /**
     * 格式化数字
     */
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * 获取分类名称
     */
    getCategoryName(category) {
        const map = {
            'theme': '主题',
            'language': '语言',
            'tools': '工具',
            'snippets': '代码片段'
        };
        return map[category] || category;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PluginStore();
});
