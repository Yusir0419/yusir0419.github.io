// projectList.js - 项目列表管理

class ProjectList {
    constructor() {
        this.projects = [];
        this.projectsRoot = getProjectsRoot();
        this.currentContextProject = null;

        this.listEl = document.getElementById('project-list');
        this.emptyStateEl = document.getElementById('empty-state');
        this.fabBtn = document.getElementById('fab-new-project');
        this.contextMenu = document.getElementById('context-menu');
        this.containerEl = document.getElementById('project-list-container');
        this.pullRefreshEl = document.getElementById('pull-refresh');
        this.pullRefreshText = this.pullRefreshEl.querySelector('.pull-refresh-text');

        // 下拉刷新状态
        this.pullState = {
            startY: 0,
            pullDistance: 0,
            isRefreshing: false,
            threshold: 60
        };

        console.log('ProjectList 初始化');
        console.log('项目根目录:', this.projectsRoot);

        this.init();
    }

    async init() {
        console.log('开始初始化...');

        // 检查 Bridge 是否存在
        if (!window.FileSystem) {
            console.error('FileSystem Bridge 不存在！');
            alert('FileSystem Bridge 不存在，请检查 MainActivity');
            return;
        }

        if (!window.System) {
            console.error('System Bridge 不存在！');
            alert('System Bridge 不存在，请检查 MainActivity');
            return;
        }

        console.log('Bridge 检查通过');

        // 绑定事件
        this.fabBtn.addEventListener('click', () => this.createNewProject());

        // 绑定右键菜单事件
        this.bindContextMenuEvents();

        // 隐藏右键菜单（点击其他地方）
        document.addEventListener('click', () => this.hideContextMenu());

        // 绑定下拉刷新事件
        this.bindPullRefreshEvents();

        // 加载项目列表
        await this.loadProjects();
    }

    /**
     * 绑定下拉刷新事件
     */
    bindPullRefreshEvents() {
        this.containerEl.addEventListener('touchstart', (e) => {
            if (this.containerEl.scrollTop === 0 && !this.pullState.isRefreshing) {
                this.pullState.startY = e.touches[0].clientY;
            }
        });

        this.containerEl.addEventListener('touchmove', (e) => {
            if (this.pullState.isRefreshing) return;

            if (this.containerEl.scrollTop === 0 && this.pullState.startY > 0) {
                const currentY = e.touches[0].clientY;
                this.pullState.pullDistance = currentY - this.pullState.startY;

                if (this.pullState.pullDistance > 0) {
                    e.preventDefault();

                    const distance = Math.min(this.pullState.pullDistance * 0.5, 80);
                    this.pullRefreshEl.style.transform = `translateY(${distance}px)`;

                    if (distance >= this.pullState.threshold) {
                        this.pullRefreshText.textContent = '释放刷新';
                        this.pullRefreshEl.querySelector('.pull-refresh-icon').style.transform = 'rotate(180deg)';
                    } else {
                        this.pullRefreshText.textContent = '下拉刷新';
                        this.pullRefreshEl.querySelector('.pull-refresh-icon').style.transform = 'rotate(0deg)';
                    }
                }
            }
        });

        this.containerEl.addEventListener('touchend', () => {
            if (this.pullState.isRefreshing) return;

            const distance = Math.min(this.pullState.pullDistance * 0.5, 80);

            if (distance >= this.pullState.threshold) {
                this.triggerRefresh();
            } else {
                this.pullRefreshEl.style.transform = 'translateY(0)';
            }

            this.pullState.startY = 0;
            this.pullState.pullDistance = 0;
        });
    }

    /**
     * 触发刷新
     */
    async triggerRefresh() {
        if (this.pullState.isRefreshing) return;

        this.pullState.isRefreshing = true;
        this.pullRefreshEl.classList.add('refreshing');
        this.pullRefreshText.textContent = '刷新中...';
        this.pullRefreshEl.querySelector('.pull-refresh-icon').style.transform = 'rotate(0deg)';

        Bridge.System.vibrate(30);

        try {
            await this.loadProjects();
            await new Promise(resolve => setTimeout(resolve, 300)); // 最少显示 300ms
        } catch (e) {
            console.error('刷新失败:', e);
        } finally {
            this.pullRefreshEl.style.transform = 'translateY(0)';
            this.pullRefreshEl.classList.remove('refreshing');
            this.pullRefreshText.textContent = '下拉刷新';
            this.pullState.isRefreshing = false;
        }
    }

    /**
     * 加载项目列表
     */
    async loadProjects() {
        console.log('开始加载项目列表...');

        try {
            // 确保项目根目录存在（如果已存在则忽略错误）
            console.log('创建项目根目录:', this.projectsRoot);
            try {
                await Bridge.FileSystem.createFile(this.projectsRoot, true);
            } catch (e) {
                // 目录已存在，忽略错误
                console.log('目录已存在，继续...');
            }

            // 读取项目列表
            console.log('读取项目列表...');
            const files = await Bridge.FileSystem.listFiles(this.projectsRoot);
            console.log('读取到文件:', files);

            // 过滤出文件夹
            const projectFolders = files.filter(f => f.isDirectory);
            console.log('项目文件夹:', projectFolders);

            // 读取每个项目的配置
            this.projects = [];
            for (const folder of projectFolders) {
                const configPath = getProjectConfigPath(folder.name);
                console.log('检查配置文件:', configPath);

                const exists = await Bridge.FileSystem.exists(configPath);

                if (exists) {
                    try {
                        const configContent = await Bridge.FileSystem.readFile(configPath);
                        console.log('配置内容:', configContent);

                        const config = JSON.parse(configContent);

                        this.projects.push({
                            name: folder.name,
                            path: folder.path,
                            appName: config.app_name || folder.name,
                            packageName: config.package_name || 'com.example.app',
                            lastModified: folder.lastModified
                        });
                    } catch (e) {
                        console.error(`读取项目配置失败: ${folder.name}`, e);
                    }
                }
            }

            // 按修改时间排序
            this.projects.sort((a, b) => b.lastModified - a.lastModified);

            console.log('最终项目列表:', this.projects);

            // 渲染列表
            this.render();
        } catch (e) {
            console.error('加载项目列表失败:', e);
            alert('加载项目列表失败: ' + e.message);
            Bridge.System.showToast('加载项目列表失败');
        }
    }

    /**
     * 渲染项目列表
     */
    render() {
        // 清空列表
        this.listEl.innerHTML = '';

        if (this.projects.length === 0) {
            // 显示空状态
            this.emptyStateEl.style.display = 'block';
        } else {
            // 隐藏空状态
            this.emptyStateEl.style.display = 'none';

            // 渲染项目卡片
            this.projects.forEach(project => {
                const card = this.createProjectCard(project);
                this.listEl.appendChild(card);
            });
        }
    }

    /**
     * 创建项目卡片
     */
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectName = project.name;

        card.innerHTML = `
            <div class="project-card-icon">📦</div>
            <div class="project-card-content">
                <div class="project-card-name">${project.appName}</div>
                <div class="project-card-package">${project.packageName}</div>
            </div>
        `;

        // 点击打开项目
        card.addEventListener('click', () => this.openProject(project));

        // 长按显示菜单
        let pressTimer = null;
        card.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                Bridge.System.vibrate(30);
                this.showContextMenu(e, project);
            }, 500);
        });

        card.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        card.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });

        // PC 端右键
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, project);
        });

        return card;
    }

    /**
     * 创建新项目
     */
    async createNewProject() {
        try {
            const projectName = await Dialog.prompt('新建项目', '请输入项目名称');

            if (!projectName) {
                return;
            }

            // 验证项目名称
            if (!isValidProjectName(projectName)) {
                Bridge.System.showToast('项目名称包含非法字符');
                return;
            }

            // 检查项目是否已存在
            const projectPath = getProjectPath(projectName);
            const exists = await Bridge.FileSystem.exists(projectPath);

            if (exists) {
                Bridge.System.showToast('项目已存在');
                return;
            }

            // 创建项目文件夹
            await Bridge.FileSystem.createFile(projectPath, true);

            // 生成包名
            const packageName = generatePackageName(projectName);

            // 创建项目配置文件
            const config = {
                app_name: projectName,
                package_name: packageName
            };

            const configPath = getProjectConfigPath(projectName);
            await Bridge.FileSystem.writeFile(configPath, JSON.stringify(config, null, 2));

            Bridge.System.showToast('项目创建成功');

            // 重新加载项目列表
            await this.loadProjects();

        } catch (e) {
            console.error('创建项目失败:', e);
            Bridge.System.showToast('创建项目失败');
        }
    }

    /**
     * 打开项目
     */
    openProject(project) {
        // 保存当前项目名称到配置
        Bridge.System.setConfig('current_project', project.name);

        // 跳转到编辑器页面
        window.location.href = `editor.html?project=${encodeURIComponent(project.name)}`;
    }

    /**
     * 重命名项目
     */
    async renameProject(project) {
        try {
            const newName = await Dialog.prompt('重命名项目', '请输入新名称', project.name);

            if (!newName || newName === project.name) {
                return;
            }

            // 验证项目名称
            if (!isValidProjectName(newName)) {
                Bridge.System.showToast('项目名称包含非法字符');
                return;
            }

            // 检查新名称是否已存在
            const newPath = getProjectPath(newName);
            const exists = await Bridge.FileSystem.exists(newPath);

            if (exists) {
                Bridge.System.showToast('项目名称已存在');
                return;
            }

            // 重命名文件夹
            await Bridge.FileSystem.renameFile(project.path, newPath);

            // 更新配置文件
            const configPath = getProjectConfigPath(newName);
            const configContent = await Bridge.FileSystem.readFile(configPath);
            const config = JSON.parse(configContent);
            config.app_name = newName;
            await Bridge.FileSystem.writeFile(configPath, JSON.stringify(config, null, 2));

            Bridge.System.showToast('重命名成功');

            // 重新加载项目列表
            await this.loadProjects();

        } catch (e) {
            console.error('重命名项目失败:', e);
            Bridge.System.showToast('重命名失败');
        }
    }

    /**
     * 删除项目
     */
    async deleteProject(project) {
        try {
            const confirmed = await Dialog.confirm(
                '删除项目',
                `确定要删除项目 "${project.appName}" 吗？此操作不可恢复！`
            );

            if (!confirmed) {
                return;
            }

            // 删除项目文件夹
            await Bridge.FileSystem.deleteFile(project.path);

            Bridge.System.showToast('项目已删除');

            // 重新加载项目列表
            await this.loadProjects();

        } catch (e) {
            console.error('删除项目失败:', e);
            Bridge.System.showToast('删除失败');
        }
    }

    /**
     * 显示右键菜单
     */
    showContextMenu(event, project) {
        event.preventDefault();
        event.stopPropagation();

        this.currentContextProject = project;

        const x = event.touches ? event.touches[0].clientX : event.clientX;
        const y = event.touches ? event.touches[0].clientY : event.clientY;

        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.contextMenu.classList.remove('hidden');
    }

    /**
     * 隐藏右键菜单
     */
    hideContextMenu() {
        this.contextMenu.classList.add('hidden');
        this.currentContextProject = null;
    }

    /**
     * 绑定右键菜单事件
     */
    bindContextMenuEvents() {
        const menuItems = this.contextMenu.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const action = item.dataset.action;
                const project = this.currentContextProject;

                if (!project) return;

                switch (action) {
                    case 'open':
                        this.openProject(project);
                        break;
                    case 'rename':
                        this.renameProject(project);
                        break;
                    case 'delete':
                        this.deleteProject(project);
                        break;
                }

                this.hideContextMenu();
            });
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ProjectList();
});
