// General utility functions
class CharityApp {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
    }

    // Show loading state
    showLoading(element) {
        element.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }

    // Show error message
    showError(element, message) {
        element.innerHTML = `
            <div class="error-message">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
            </div>
        `;
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format price
    formatPrice(price) {
        if (parseFloat(price) === 0) {
            return '<span class="event-free">FREE</span>';
        }
        return `$${parseFloat(price).toFixed(2)}`;
    }

    // Calculate progress percentage
    calculateProgress(current, goal) {
        return Math.min(Math.round((current / goal) * 100), 100);
    }

    // Get URL parameters
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Set page title
    setPageTitle(title) {
        document.title = `${title} - HopeBridge`;
    }
}

// Initialize application
const app = new CharityApp();