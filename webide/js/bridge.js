// bridge.js - 封装 Android Bridge 调用

/**
 * 文件系统 Bridge
 */
const FileSystem = {
    /**
     * 读取文件
     * @param {string} path 文件路径
     * @returns {Promise<string>} 文件内容
     */
    async readFile(path) {
        try {
            const result = JSON.parse(window.FileSystem.readFile(path));
            if (result.success) {
                return result.content;
            } else {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error('读取文件失败:', e);
            throw e;
        }
    },

    /**
     * 写入文件
     * @param {string} path 文件路径
     * @param {string} content 文件内容
     */
    async writeFile(path, content) {
        try {
            const result = JSON.parse(window.FileSystem.writeFile(path, content));
            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error('写入文件失败:', e);
            throw e;
        }
    },

    /**
     * 列出目录文件
     * @param {string} dirPath 目录路径
     * @returns {Promise<Array>} 文件列表
     */
    async listFiles(dirPath) {
        try {
            const result = JSON.parse(window.FileSystem.listFiles(dirPath));
            if (result.success) {
                return result.files;
            } else {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error('读取目录失败:', e);
            return [];
        }
    },

    /**
     * 创建文件或文件夹
     * @param {string} path 路径
     * @param {boolean} isDirectory 是否为文件夹
     */
    async createFile(path, isDirectory = false) {
        try {
            const result = JSON.parse(window.FileSystem.createFile(path, isDirectory));
            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error('创建失败:', e);
            throw e;
        }
    },

    /**
     * 删除文件或文件夹
     * @param {string} path 路径
     */
    async deleteFile(path) {
        try {
            const result = JSON.parse(window.FileSystem.deleteFile(path));
            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error('删除失败:', e);
            throw e;
        }
    },

    /**
     * 重命名文件或文件夹
     * @param {string} oldPath 原路径
     * @param {string} newPath 新路径
     */
    async renameFile(oldPath, newPath) {
        try {
            const result = JSON.parse(window.FileSystem.renameFile(oldPath, newPath));
            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error('重命名失败:', e);
            throw e;
        }
    },

    /**
     * 检查文件是否存在
     * @param {string} path 路径
     * @returns {Promise<boolean>}
     */
    async exists(path) {
        try {
            const result = JSON.parse(window.FileSystem.exists(path));
            return result.success && result.exists;
        } catch (e) {
            console.error('检查文件失败:', e);
            return false;
        }
    },

    /**
     * 获取工作区目录
     * @returns {string} 工作区路径
     */
    getWorkspaceDir() {
        return window.FileSystem.getWorkspaceDir();
    }
};

/**
 * 系统功能 Bridge
 */
const System = {
    /**
     * 显示 Toast 提示
     * @param {string} message 提示信息
     * @param {string} duration 持续时间 'short' | 'long'
     */
    showToast(message, duration = 'short') {
        window.System.showToast(message, duration);
    },

    /**
     * 获取配置
     * @param {string} key 配置键
     * @returns {string} 配置值
     */
    getConfig(key) {
        return window.System.getConfig(key);
    },

    /**
     * 设置配置
     * @param {string} key 配置键
     * @param {string} value 配置值
     */
    setConfig(key, value) {
        window.System.setConfig(key, value);
    },

    /**
     * 批量获取配置
     * @param {Array<string>} keys 配置键数组
     * @returns {Object} 配置对象
     */
    getConfigs(keys) {
        try {
            const result = JSON.parse(window.System.getConfigs(JSON.stringify(keys)));
            return result;
        } catch (e) {
            console.error('获取配置失败:', e);
            return {};
        }
    },

    /**
     * 批量设置配置
     * @param {Object} configs 配置对象
     */
    setConfigs(configs) {
        window.System.setConfigs(JSON.stringify(configs));
    },

    /**
     * 震动反馈
     * @param {number} duration 震动时长（毫秒）
     */
    vibrate(duration = 50) {
        window.System.vibrate(duration);
    },

    /**
     * 复制到剪贴板
     * @param {string} text 文本内容
     */
    copyToClipboard(text) {
        window.System.copyToClipboard(text);
    },

    /**
     * 从剪贴板获取文本
     * @returns {string}
     */
    getClipboardText() {
        return window.System.getClipboardText();
    },

    /**
     * 记录日志
     * @param {string} level 日志级别
     * @param {string} tag 标签
     * @param {string} message 消息
     */
    log(level, tag, message) {
        window.System.log(level, tag, message);
    }
};

// 导出到全局
window.Bridge = {
    FileSystem,
    System
};
