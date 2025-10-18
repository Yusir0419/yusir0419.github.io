// dialog.js - 对话框管理

class Dialog {
    constructor() {
        this.overlay = document.getElementById('dialog-overlay');
        this.titleEl = document.getElementById('dialog-title');
        this.inputEl = document.getElementById('dialog-input');
        this.cancelBtn = document.getElementById('dialog-cancel');
        this.confirmBtn = document.getElementById('dialog-confirm');

        this.resolveFunc = null;
        this.rejectFunc = null;

        this.init();
    }

    init() {
        // 取消按钮
        this.cancelBtn.addEventListener('click', () => {
            this.hide();
            if (this.rejectFunc) {
                this.rejectFunc('cancel');
            }
        });

        // 确定按钮
        this.confirmBtn.addEventListener('click', () => {
            const value = this.inputEl.value.trim();
            this.hide();
            if (this.resolveFunc) {
                this.resolveFunc(value);
            }
        });

        // 点击遮罩关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
                if (this.rejectFunc) {
                    this.rejectFunc('cancel');
                }
            }
        });

        // 回车确认
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmBtn.click();
            }
        });
    }

    /**
     * 显示对话框
     * @param {string} title 标题
     * @param {string} placeholder 输入框提示
     * @param {string} defaultValue 默认值
     * @returns {Promise<string>} 用户输入的值
     */
    show(title, placeholder = '', defaultValue = '') {
        return new Promise((resolve, reject) => {
            this.resolveFunc = resolve;
            this.rejectFunc = reject;

            this.titleEl.textContent = title;
            this.inputEl.placeholder = placeholder;
            this.inputEl.value = defaultValue;

            this.overlay.classList.remove('hidden');

            // 延迟聚焦，避免键盘弹出问题
            setTimeout(() => {
                this.inputEl.focus();
                this.inputEl.select();
            }, 100);
        });
    }

    /**
     * 隐藏对话框
     */
    hide() {
        this.overlay.classList.add('hidden');
        this.inputEl.value = '';
        this.inputEl.blur();
    }

    /**
     * 显示确认对话框
     * @param {string} title 标题
     * @param {string} message 消息
     * @returns {Promise<boolean>} 是否确认
     */
    confirm(title, message) {
        // 临时修改对话框样式显示消息
        return new Promise((resolve, reject) => {
            this.resolveFunc = () => resolve(true);
            this.rejectFunc = () => resolve(false);

            this.titleEl.textContent = title;
            this.inputEl.placeholder = '';
            this.inputEl.value = message;
            this.inputEl.disabled = true;

            this.overlay.classList.remove('hidden');
        }).finally(() => {
            this.inputEl.disabled = false;
        });
    }
}

// 创建全局对话框实例
let dialogInstance = null;

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dialogInstance = new Dialog();
    });
} else {
    dialogInstance = new Dialog();
}

// 导出到全局
window.Dialog = {
    /**
     * 显示输入对话框
     */
    prompt(title, placeholder = '', defaultValue = '') {
        return dialogInstance.show(title, placeholder, defaultValue);
    },

    /**
     * 显示确认对话框
     */
    confirm(title, message) {
        return dialogInstance.confirm(title, message);
    },

    /**
     * 隐藏对话框
     */
    hide() {
        if (dialogInstance) {
            dialogInstance.hide();
        }
    }
};
