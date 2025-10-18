/**
 * 文件树管理器
 */
class FileTree {
    constructor() {
        this.treeEl = document.getElementById('file-tree');
        this.projectPath = '';
        this.expandedFolders = new Set(); // 记录展开的文件夹
        this.activeFile = null; // 当前打开的文件
        this.onFileSelect = null; // 文件选择回调
    }

    /**
     * 初始化文件树
     */
    async init(projectPath) {
        this.projectPath = projectPath;
        await this.loadTree();
    }

    /**
     * 加载文件树
     */
    async loadTree() {
        try {
            this.treeEl.innerHTML = '<div class="loading">加载中...</div>';
            const items = await this.loadDirectory(this.projectPath);
            this.treeEl.innerHTML = '';
            this.renderItems(items, this.treeEl, this.projectPath);
        } catch (error) {
            console.error('加载文件树失败:', error);
            Bridge.System.showToast('加载文件树失败');
            this.treeEl.innerHTML = '<div class="empty-text">加载失败</div>';
        }
    }

    /**
     * 加载目录内容
     */
    async loadDirectory(path) {
        const files = await Bridge.FileSystem.listFiles(path);

        // 文件已经包含所有信息，直接使用
        const items = files.map(file => ({
            name: file.name,
            path: file.path,
            isDirectory: file.isDirectory
        }));

        // 排序：文件夹在前，文件在后，同类按名称排序
        items.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
        });

        return items;
    }

    /**
     * 渲染文件树项目
     */
    renderItems(items, containerEl, parentPath) {
        items.forEach(item => {
            const itemEl = this.createTreeItem(item, parentPath);
            containerEl.appendChild(itemEl);

            // 如果是已展开的文件夹，自动展开
            if (item.isDirectory && this.expandedFolders.has(item.path)) {
                this.expandFolder(itemEl, item.path);
            }
        });
    }

    /**
     * 创建文件树项目元素
     */
    createTreeItem(item, parentPath) {
        const itemEl = document.createElement('div');
        itemEl.className = 'tree-item';
        itemEl.dataset.path = item.path;
        itemEl.dataset.isDirectory = item.isDirectory;

        if (item.isDirectory) {
            itemEl.classList.add('folder');
        }

        // 文件夹展开/收起图标
        if (item.isDirectory) {
            const toggleEl = document.createElement('div');
            toggleEl.className = 'tree-item-toggle';
            toggleEl.innerHTML = '▶';
            itemEl.appendChild(toggleEl);
        }

        // 文件/文件夹图标
        const iconEl = document.createElement('div');
        iconEl.className = 'tree-item-icon';
        iconEl.textContent = this.getFileIcon(item.name, item.isDirectory);
        itemEl.appendChild(iconEl);

        // 文件名
        const nameEl = document.createElement('div');
        nameEl.className = 'tree-item-name';
        nameEl.textContent = item.name;
        itemEl.appendChild(nameEl);

        // 绑定事件
        this.bindItemEvents(itemEl, item);

        return itemEl;
    }

    /**
     * 绑定文件树项目事件
     */
    bindItemEvents(itemEl, item) {
        // 点击事件
        itemEl.addEventListener('click', async (e) => {
            e.stopPropagation();

            if (item.isDirectory) {
                // 展开/收起文件夹
                this.toggleFolder(itemEl, item.path);
            } else {
                // 打开文件
                this.selectFile(itemEl, item.path);
            }
        });

        // 长按事件（右键菜单）
        let longPressTimer;
        itemEl.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                this.showContextMenu(e, item);
            }, 500);
        });

        itemEl.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        itemEl.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    /**
     * 切换文件夹展开/收起
     */
    async toggleFolder(itemEl, path) {
        const isExpanded = this.expandedFolders.has(path);

        if (isExpanded) {
            this.collapseFolder(itemEl, path);
        } else {
            await this.expandFolder(itemEl, path);
        }
    }

    /**
     * 展开文件夹
     */
    async expandFolder(itemEl, path) {
        try {
            // 更新展开状态
            this.expandedFolders.add(path);
            const toggleEl = itemEl.querySelector('.tree-item-toggle');
            if (toggleEl) {
                toggleEl.classList.add('expanded');
            }

            // 检查是否已加载
            let childrenEl = itemEl.querySelector('.tree-item-children');
            if (!childrenEl) {
                // 加载子项目
                childrenEl = document.createElement('div');
                childrenEl.className = 'tree-item-children';
                itemEl.appendChild(childrenEl);

                const items = await this.loadDirectory(path);
                this.renderItems(items, childrenEl, path);
            }
        } catch (error) {
            console.error('展开文件夹失败:', error);
            Bridge.System.showToast('展开文件夹失败');
        }
    }

    /**
     * 收起文件夹
     */
    collapseFolder(itemEl, path) {
        this.expandedFolders.delete(path);
        const toggleEl = itemEl.querySelector('.tree-item-toggle');
        if (toggleEl) {
            toggleEl.classList.remove('expanded');
        }

        const childrenEl = itemEl.querySelector('.tree-item-children');
        if (childrenEl) {
            childrenEl.remove();
        }
    }

    /**
     * 选择文件
     */
    selectFile(itemEl, path) {
        // 更新激活状态
        const allItems = this.treeEl.querySelectorAll('.tree-item');
        allItems.forEach(el => el.classList.remove('active'));
        itemEl.classList.add('active');

        this.activeFile = path;

        // 触发回调
        if (this.onFileSelect) {
            this.onFileSelect(path);
        }
    }

    /**
     * 获取文件图标
     */
    getFileIcon(name, isDirectory) {
        if (isDirectory) {
            return '📁';
        }

        // 根据文件扩展名返回图标
        const ext = name.split('.').pop().toLowerCase();
        const iconMap = {
            'html': '📄',
            'css': '🎨',
            'js': '📜',
            'json': '📋',
            'md': '📝',
            'txt': '📃',
            'png': '🖼️',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'gif': '🖼️',
            'svg': '🖼️',
            'xml': '📄',
            'java': '☕',
            'kt': '🔷',
            'py': '🐍',
            'c': '🔧',
            'cpp': '🔧',
            'h': '🔧',
            'gradle': '🐘'
        };

        return iconMap[ext] || '📄';
    }

    /**
     * 显示右键菜单
     */
    showContextMenu(event, item) {
        const contextMenu = document.getElementById('context-menu');

        // 定位菜单
        contextMenu.classList.remove('hidden');
        contextMenu.style.left = `${event.touches[0].clientX}px`;
        contextMenu.style.top = `${event.touches[0].clientY}px`;

        // 存储当前操作的文件
        contextMenu.dataset.path = item.path;
        contextMenu.dataset.isDirectory = item.isDirectory;

        // 震动反馈
        Bridge.System.vibrate(50);
    }

    /**
     * 刷新文件树
     */
    async refresh() {
        await this.loadTree();

        // 如果有激活的文件，重新选中
        if (this.activeFile) {
            const itemEl = this.treeEl.querySelector(`[data-path="${this.activeFile}"]`);
            if (itemEl) {
                itemEl.classList.add('active');
            }
        }
    }

    /**
     * 新建文件
     */
    async createFile(parentPath, fileName) {
        try {
            const filePath = `${parentPath}/${fileName}`;
            await Bridge.FileSystem.writeFile(filePath, '');
            Bridge.System.showToast('文件创建成功');
            await this.refresh();

            // 自动打开新创建的文件
            const itemEl = this.treeEl.querySelector(`[data-path="${filePath}"]`);
            if (itemEl) {
                this.selectFile(itemEl, filePath);
            }
        } catch (error) {
            console.error('创建文件失败:', error);
            Bridge.System.showToast('创建文件失败');
        }
    }

    /**
     * 新建文件夹
     */
    async createFolder(parentPath, folderName) {
        try {
            const folderPath = `${parentPath}/${folderName}`;
            await Bridge.FileSystem.createFile(folderPath, true);
            Bridge.System.showToast('文件夹创建成功');
            await this.refresh();
        } catch (error) {
            console.error('创建文件夹失败:', error);
            Bridge.System.showToast('创建文件夹失败');
        }
    }

    /**
     * 重命名
     */
    async rename(oldPath, newName) {
        try {
            const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
            const newPath = `${parentPath}/${newName}`;

            await Bridge.FileSystem.renameFile(oldPath, newPath);
            Bridge.System.showToast('重命名成功');
            await this.refresh();

            // 如果重命名的是当前打开的文件，更新路径
            if (this.activeFile === oldPath) {
                this.activeFile = newPath;
                if (this.onFileSelect) {
                    this.onFileSelect(newPath);
                }
            }
        } catch (error) {
            console.error('重命名失败:', error);
            Bridge.System.showToast('重命名失败');
        }
    }

    /**
     * 删除
     */
    async delete(path) {
        try {
            await Bridge.FileSystem.deleteFile(path);
            Bridge.System.showToast('删除成功');
            await this.refresh();

            // 如果删除的是当前打开的文件，清除激活状态
            if (this.activeFile === path) {
                this.activeFile = null;
            }
        } catch (error) {
            console.error('删除失败:', error);
            Bridge.System.showToast('删除失败');
        }
    }
}
