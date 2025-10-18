/**
 * 编辑器管理器
 */
class EditorManager {
    constructor() {
        this.editor = null;
        this.fileTree = null;
        this.currentFile = null;
        this.projectPath = '';
        this.projectName = '';
        this.isDirty = false; // 文件是否被修改

        // UI 元素
        this.editorEl = document.getElementById('ace-editor');
        this.emptyEl = document.getElementById('editor-empty');
        this.projectNameEl = document.getElementById('project-name');
        this.statusFileEl = document.getElementById('status-file');
        this.statusPositionEl = document.getElementById('status-position');
        this.statusLanguageEl = document.getElementById('status-language');
    }

    /**
     * 初始化编辑器
     */
    async init() {
        // 从 URL 参数获取项目路径
        const params = new URLSearchParams(window.location.search);
        const projectName = params.get('project');

        if (!projectName) {
            Bridge.System.showToast('缺少项目参数');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            return;
        }

        this.projectName = projectName;
        this.projectPath = getProjectPath(projectName);
        this.projectNameEl.textContent = projectName;

        // 初始化 Ace Editor
        this.initAceEditor();

        // 初始化文件树
        this.fileTree = new FileTree();
        this.fileTree.onFileSelect = (path) => this.openFile(path);
        await this.fileTree.init(this.projectPath);

        // 绑定事件
        this.bindEvents();

        Bridge.System.showToast('项目加载成功');
    }

    /**
     * 初始化 Ace Editor
     */
    initAceEditor() {
        this.editor = ace.edit('ace-editor');

        // 设置主题（浅色）
        this.editor.setTheme('ace/theme/chrome');

        // 设置基础选项
        this.editor.setOptions({
            fontSize: '14px',
            showPrintMargin: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            tabSize: 4,
            useSoftTabs: true,
            wrap: true
        });

        // 监听内容变化
        this.editor.on('change', () => {
            if (this.currentFile) {
                this.isDirty = true;
                this.updateStatusBar();
            }
        });

        // 监听光标位置变化
        this.editor.on('changeSelection', () => {
            this.updateStatusBar();
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 菜单按钮（切换文件树）
        document.getElementById('btn-toggle-menu').addEventListener('click', () => {
            const sidebar = document.getElementById('file-tree-sidebar');
            sidebar.classList.toggle('collapsed');
        });

        // 保存按钮
        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveFile();
        });

        // 更多按钮（暂时显示菜单）
        document.getElementById('btn-more').addEventListener('click', (e) => {
            Bridge.System.showToast('功能开发中');
        });

        // 文件树切换按钮
        const toggleBtn = document.getElementById('btn-toggle-tree');
        const sidebar = document.getElementById('file-tree-sidebar');

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        // 文件树展开按钮
        const expandBtn = document.getElementById('btn-expand-tree');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                sidebar.classList.remove('collapsed');
            });
        }

        // 右键菜单事件
        this.bindContextMenuEvents();

        // 点击其他地方关闭右键菜单
        document.addEventListener('click', () => {
            const contextMenu = document.getElementById('context-menu');
            contextMenu.classList.add('hidden');
        });
    }

    /**
     * 绑定右键菜单事件
     */
    bindContextMenuEvents() {
        const contextMenu = document.getElementById('context-menu');
        const menuItems = contextMenu.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();

                const action = item.dataset.action;
                const targetPath = contextMenu.dataset.path;
                const isDirectory = contextMenu.dataset.isDirectory === 'true';

                contextMenu.classList.add('hidden');

                // 处理不同的菜单操作
                switch (action) {
                    case 'new-file':
                        await this.handleNewFile(targetPath, isDirectory);
                        break;
                    case 'new-folder':
                        await this.handleNewFolder(targetPath, isDirectory);
                        break;
                    case 'rename':
                        await this.handleRename(targetPath);
                        break;
                    case 'delete':
                        await this.handleDelete(targetPath);
                        break;
                }
            });
        });
    }

    /**
     * 处理新建文件
     */
    async handleNewFile(targetPath, isDirectory) {
        const parentPath = isDirectory ? targetPath : targetPath.substring(0, targetPath.lastIndexOf('/'));

        const fileName = await Dialog.prompt('新建文件', '请输入文件名');
        if (!fileName) return;

        if (!isValidFileName(fileName)) {
            Bridge.System.showToast('文件名不合法');
            return;
        }

        await this.fileTree.createFile(parentPath, fileName);
    }

    /**
     * 处理新建文件夹
     */
    async handleNewFolder(targetPath, isDirectory) {
        const parentPath = isDirectory ? targetPath : targetPath.substring(0, targetPath.lastIndexOf('/'));

        const folderName = await Dialog.prompt('新建文件夹', '请输入文件夹名称');
        if (!folderName) return;

        if (!isValidFileName(folderName)) {
            Bridge.System.showToast('文件夹名称不合法');
            return;
        }

        await this.fileTree.createFolder(parentPath, folderName);
    }

    /**
     * 处理重命名
     */
    async handleRename(targetPath) {
        const oldName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

        const newName = await Dialog.prompt('重命名', '请输入新名称', oldName);
        if (!newName || newName === oldName) return;

        if (!isValidFileName(newName)) {
            Bridge.System.showToast('名称不合法');
            return;
        }

        await this.fileTree.rename(targetPath, newName);
    }

    /**
     * 处理删除
     */
    async handleDelete(targetPath) {
        const confirmed = await Dialog.confirm('确定要删除吗？', '此操作不可恢复');
        if (confirmed) {
            await this.fileTree.delete(targetPath);
        }
    }

    /**
     * 打开文件
     */
    async openFile(filePath) {
        try {
            // 如果当前有未保存的文件，提示保存
            if (this.isDirty && this.currentFile !== filePath) {
                const shouldSave = await Dialog.confirm('当前文件未保存', '是否保存当前文件？');
                if (shouldSave) {
                    await this.saveFile();
                }
            }

            // 读取文件内容
            const content = await Bridge.FileSystem.readFile(filePath);

            // 设置编辑器内容
            this.editor.setValue(content, -1);
            this.currentFile = filePath;
            this.isDirty = false;

            // 设置语法模式
            this.setLanguageMode(filePath);

            // 显示编辑器，隐藏空状态
            this.editorEl.classList.add('active');
            this.emptyEl.classList.add('hidden');

            // 更新状态栏
            this.updateStatusBar();

            Bridge.System.showToast('文件已打开');
        } catch (error) {
            console.error('打开文件失败:', error);
            Bridge.System.showToast('打开文件失败');
        }
    }

    /**
     * 保存文件
     */
    async saveFile() {
        if (!this.currentFile) {
            Bridge.System.showToast('没有打开的文件');
            return;
        }

        try {
            const content = this.editor.getValue();
            await Bridge.FileSystem.writeFile(this.currentFile, content);
            this.isDirty = false;
            this.updateStatusBar();
            Bridge.System.showToast('保存成功');
        } catch (error) {
            console.error('保存文件失败:', error);
            Bridge.System.showToast('保存失败');
        }
    }

    /**
     * 设置语言模式
     */
    setLanguageMode(filePath) {
        const ext = filePath.split('.').pop().toLowerCase();

        const modeMap = {
            'js': 'javascript',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'xml': 'xml',
            'md': 'markdown',
            'java': 'java',
            'kt': 'kotlin',
            'py': 'python',
            'c': 'c_cpp',
            'cpp': 'c_cpp',
            'h': 'c_cpp',
            'gradle': 'groovy',
            'txt': 'text'
        };

        const mode = modeMap[ext] || 'text';
        this.editor.session.setMode(`ace/mode/${mode}`);
    }

    /**
     * 更新状态栏
     */
    updateStatusBar() {
        // 文件路径
        if (this.currentFile) {
            const fileName = this.currentFile.substring(this.currentFile.lastIndexOf('/') + 1);
            this.statusFileEl.textContent = this.isDirty ? `● ${fileName}` : fileName;
        } else {
            this.statusFileEl.textContent = '未打开文件';
        }

        // 光标位置
        const cursor = this.editor.getCursorPosition();
        this.statusPositionEl.textContent = `Ln ${cursor.row + 1}, Col ${cursor.column + 1}`;

        // 语言
        const mode = this.editor.session.getMode().$id;
        const language = mode.split('/').pop();
        this.statusLanguageEl.textContent = this.getLanguageName(language);
    }

    /**
     * 获取语言显示名称
     */
    getLanguageName(mode) {
        const nameMap = {
            'javascript': 'JavaScript',
            'json': 'JSON',
            'html': 'HTML',
            'css': 'CSS',
            'xml': 'XML',
            'markdown': 'Markdown',
            'java': 'Java',
            'kotlin': 'Kotlin',
            'python': 'Python',
            'c_cpp': 'C/C++',
            'groovy': 'Groovy',
            'text': '纯文本'
        };

        return nameMap[mode] || mode;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    const editorManager = new EditorManager();
    await editorManager.init();
});
