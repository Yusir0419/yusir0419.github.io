// utils.js - 工具函数

/**
 * 格式化时间
 * @param {number} timestamp 时间戳
 * @returns {string} 格式化后的时间
 */
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;

    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + ' 分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + ' 小时前';
    } else if (diff < week) {
        return Math.floor(diff / day) + ' 天前';
    } else if (diff < month) {
        return Math.floor(diff / week) + ' 周前';
    } else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 验证项目名称
 * @param {string} name 项目名称
 * @returns {boolean} 是否有效
 */
function isValidProjectName(name) {
    if (!name || name.trim().length === 0) {
        return false;
    }
    // 不能包含特殊字符
    const invalidChars = /[<>:"/\\|?*]/;
    return !invalidChars.test(name);
}

/**
 * 验证包名
 * @param {string} packageName 包名
 * @returns {boolean} 是否有效
 */
function isValidPackageName(packageName) {
    // 包名格式：com.example.app
    const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
    return regex.test(packageName);
}

/**
 * 生成默认包名
 * @param {string} projectName 项目名称
 * @returns {string} 包名
 */
function generatePackageName(projectName) {
    // 移除特殊字符，转小写
    const cleanName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/^[0-9]+/, ''); // 移除开头的数字

    return `com.example.${cleanName || 'app'}`;
}

/**
 * 防抖函数
 * @param {Function} func 函数
 * @param {number} wait 等待时间
 * @returns {Function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * 节流函数
 * @param {Function} func 函数
 * @param {number} wait 等待时间
 * @returns {Function}
 */
function throttle(func, wait = 300) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            func.apply(this, args);
        }
    };
}

/**
 * 获取文件扩展名
 * @param {string} filename 文件名
 * @returns {string} 扩展名
 */
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * 获取文件名（不含扩展名）
 * @param {string} filename 文件名
 * @returns {string} 文件名
 */
function getFileNameWithoutExt(filename) {
    const parts = filename.split('.');
    if (parts.length > 1) {
        parts.pop();
    }
    return parts.join('.');
}

/**
 * 路径拼接
 * @param {...string} parts 路径片段
 * @returns {string} 完整路径
 */
function joinPath(...parts) {
    return parts
        .filter(p => p)
        .join('/')
        .replace(/\/+/g, '/');
}

/**
 * 获取存储根目录
 * @returns {string} 存储根目录
 */
function getStorageRoot() {
    return '/storage/emulated/0';
}

/**
 * 获取项目根目录
 * @returns {string} 项目根目录
 */
function getProjectsRoot() {
    return joinPath(getStorageRoot(), 'WebIDE+', 'Projects');
}

/**
 * 获取项目路径
 * @param {string} projectName 项目名称
 * @returns {string} 项目路径
 */
function getProjectPath(projectName) {
    return joinPath(getProjectsRoot(), projectName);
}

/**
 * 获取项目配置文件路径
 * @param {string} projectName 项目名称
 * @returns {string} 配置文件路径
 */
function getProjectConfigPath(projectName) {
    return joinPath(getProjectPath(projectName), 'web.json');
}
