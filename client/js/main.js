// 通用工具函数
class CharityApp {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
    }

    // 显示加载状态
    showLoading(element) {
        element.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }

    // 显示错误信息
    showError(element, message) {
        element.innerHTML = `
            <div class="error-message">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
            </div>
        `;
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 格式化价格
    formatPrice(price) {
        if (parseFloat(price) === 0) {
            return '<span class="event-free">FREE</span>';
        }
        return `$${parseFloat(price).toFixed(2)}`;
    }

    // 计算进度百分比
    calculateProgress(current, goal) {
        return Math.min(Math.round((current / goal) * 100), 100);
    }

    // 获取URL参数
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // 设置页面标题
    setPageTitle(title) {
        document.title = `${title} - HopeBridge`;
    }
}

// 初始化应用
const app = new CharityApp();