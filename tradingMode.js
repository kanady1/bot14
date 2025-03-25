import { config } from './config.js';

class TradingModeManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateTradingModeText();
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('toggleTradingModeBtn');
        const refreshBtn = document.getElementById('refreshTradingModeBtn');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTradingMode());
        }
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateTradingModeText());
        }
    }

    updateTradingModeText() {
        const tradingModeText = document.getElementById('tradingModeText');
        if (tradingModeText) {
            tradingModeText.textContent = `وضع التداول: ${config.tradingModeText[config.tradingMode]}`;
        }
    }

    toggleTradingMode() {
        config.tradingMode = config.tradingMode === 'real' ? 'simulated' : 'real';
        localStorage.setItem('tradingMode', config.tradingMode);
        this.updateTradingModeText();
        alert(`تم تغيير وضع التداول إلى: ${config.tradingModeText[config.tradingMode]}`);
    }
}

export const tradingModeManager = new TradingModeManager();
