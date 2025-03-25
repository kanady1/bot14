import { binanceApi } from './binanceApi.js';
import { config } from './config.js';
import { marketAnalysis } from './marketAnalysis.js';

class TradingEngine {
    constructor() {
        this.isRunning = false;
        this.tradingMode = config.tradingMode;
        this.activeTrades = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const startBtn = document.getElementById('startTradingBtn');
            const stopBtn = document.getElementById('stopTradingBtn');
            const newTradeBtn = document.getElementById('newTradeBtn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => this.start());
            }
            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stop());
            }
            if (newTradeBtn) {
                newTradeBtn.addEventListener('click', () => this.showNewTradeModal());
            }
        });
    }

    async executeTrade(symbol, side, quantity, leverage = 1, stopLoss = null, takeProfit = null, strategy = null) {
        const tradeDetails = {
            symbol,
            side,
            quantity,
            leverage,
            stopLoss,
            takeProfit,
            strategy,
            timestamp: new Date(),
            id: `trade-${Date.now()}`
        };
        
        if (this.tradingMode === 'simulated') {
            console.log(`(Simulation) Executing ${side} trade for ${symbol} with amount ${quantity}, leverage: ${leverage}`);
            tradeDetails.orderId = `SIM-${Date.now()}`;
            tradeDetails.status = 'active';
            
            this.activeTrades.push(tradeDetails);
            this.updateTradesUI();
            
            return { success: true, orderId: tradeDetails.orderId, details: tradeDetails };
        } else {
            const result = await binanceApi.placeOrder(symbol, side, quantity, leverage, stopLoss, takeProfit);
            if (result && result.orderId) {
                tradeDetails.orderId = result.orderId;
                tradeDetails.status = 'active';
                this.activeTrades.push(tradeDetails);
                this.updateTradesUI();
            }
            return result;
        }
    }

    updateTradesUI() {
        const tradesLog = document.getElementById('tradesLog');
        if (!tradesLog) return;
        
        tradesLog.innerHTML = '';
        
        if (this.activeTrades.length === 0) {
            tradesLog.innerHTML = '<p class="log-entry">لا توجد صفقات نشطة حاليًا</p>';
            return;
        }
        
        this.activeTrades.forEach(trade => {
            const tradeEl = document.createElement('div');
            tradeEl.classList.add('trade-item');
            tradeEl.innerHTML = `
                <div class="trade-item-header">
                    <span>${trade.symbol} - ${trade.side === 'buy' ? 'شراء' : 'بيع'}</span>
                    <button class="remove-trade" data-trade-id="${trade.id}">إغلاق</button>
                </div>
                <div class="trade-item-details">
                    <p>الكمية: ${trade.quantity}</p>
                    <p>الرافعة: ${trade.leverage}x</p>
                    ${trade.strategy ? `<p>الاستراتيجية: ${trade.strategy}</p>` : ''}
                    ${trade.stopLoss ? `<p>وقف الخسارة: ${trade.stopLoss}%</p>` : ''}
                    ${trade.takeProfit ? `<p>هدف الربح: ${trade.takeProfit}%</p>` : ''}
                    <p>التاريخ: ${trade.timestamp.toLocaleString()}</p>
                </div>
            `;
            tradesLog.appendChild(tradeEl);
            
            // Add event listener to close buttons
            tradeEl.querySelector('.remove-trade').addEventListener('click', () => {
                this.closeTrade(trade.id);
            });
        });
        
        // Update trade stats
        document.getElementById('totalTrades').textContent = this.activeTrades.length;
    }
    
    closeTrade(tradeId) {
        const tradeIndex = this.activeTrades.findIndex(t => t.id === tradeId);
        if (tradeIndex !== -1) {
            const trade = this.activeTrades[tradeIndex];
            // In a real app, would send close order to exchange
            console.log(`Closing trade: ${trade.symbol}`);
            this.activeTrades.splice(tradeIndex, 1);
            this.updateTradesUI();
        }
    }

    showNewTradeModal() {
        const symbolOptions = config.availablePairs.map(pair => 
            `<option value="${pair}">${pair}</option>`
        ).join('');
        
        const leverageOptions = config.leverageOptions.map(lev => 
            `<option value="${lev}">${lev}x</option>`
        ).join('');
        
        const strategyOptions = Object.entries(config.strategies).map(([key, value]) => 
            `<option value="${key}">${value}</option>`
        ).join('');
        
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <h2>إنشاء صفقة جديدة</h2>
                    <form id="newTradeForm" class="trade-form">
                        <div class="form-group">
                            <label for="tradeSymbol">زوج التداول</label>
                            <select id="tradeSymbol" required>
                                ${symbolOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="tradeSide">نوع الصفقة</label>
                            <select id="tradeSide" required>
                                <option value="buy">شراء</option>
                                <option value="sell">بيع</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="tradeAmount">الكمية (USDT)</label>
                            <input type="number" id="tradeAmount" min="10" step="1" value="100" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="tradeLeverage">الرافعة المالية</label>
                            <select id="tradeLeverage">
                                ${leverageOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="tradeStrategy">استراتيجية التداول</label>
                            <select id="tradeStrategy">
                                <option value="">بدون استراتيجية</option>
                                ${strategyOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="tradeStopLoss">وقف الخسارة (%)</label>
                            <input type="number" id="tradeStopLoss" min="0.1" step="0.1" value="${config.defaultStopLoss}">
                        </div>
                        
                        <div class="form-group">
                            <label for="tradeTakeProfit">هدف الربح (%)</label>
                            <input type="number" id="tradeTakeProfit" min="0.1" step="0.1" value="${config.defaultTakeProfit}">
                        </div>
                        
                        <div class="form-group risk-ratio">
                            <label>نسبة المخاطرة للربح:</label>
                            <span id="riskRatioDisplay">1:2</span>
                        </div>
                        
                        <div class="modal-buttons">
                            <button type="submit" class="btn success">إنشاء الصفقة</button>
                            <button type="button" class="btn danger" id="cancelNewTrade">إلغاء</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Calculate and update risk ratio
        const updateRiskRatio = () => {
            const stopLoss = parseFloat(document.getElementById('tradeStopLoss').value) || config.defaultStopLoss;
            const takeProfit = parseFloat(document.getElementById('tradeTakeProfit').value) || config.defaultTakeProfit;
            const ratio = (takeProfit / stopLoss).toFixed(2);
            document.getElementById('riskRatioDisplay').textContent = `1:${ratio}`;
        };
        
        document.getElementById('tradeStopLoss').addEventListener('input', updateRiskRatio);
        document.getElementById('tradeTakeProfit').addEventListener('input', updateRiskRatio);
        updateRiskRatio();
        
        document.getElementById('newTradeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const symbol = document.getElementById('tradeSymbol').value;
            const side = document.getElementById('tradeSide').value;
            const amount = parseFloat(document.getElementById('tradeAmount').value);
            const leverage = parseInt(document.getElementById('tradeLeverage').value);
            const strategy = document.getElementById('tradeStrategy').value;
            const stopLoss = parseFloat(document.getElementById('tradeStopLoss').value);
            const takeProfit = parseFloat(document.getElementById('tradeTakeProfit').value);
            
            this.executeTrade(symbol, side, amount, leverage, stopLoss, takeProfit, strategy);
            document.querySelector('.modal-overlay').remove();
        });
        
        document.getElementById('cancelNewTrade').addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            const botStatus = document.getElementById('botStatus');
            if (botStatus) {
                botStatus.textContent = "حالة البوت: نشط";
                botStatus.style.color = 'var(--success-color)';
            }
            console.log("Trading bot started");
            
            // If market analysis is available, start it
            if (marketAnalysis) {
                marketAnalysis.startAnalysis();
            }
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            const botStatus = document.getElementById('botStatus');
            if (botStatus) {
                botStatus.textContent = "حالة البوت: غير نشط";
                botStatus.style.color = 'var(--danger-color)';
            }
            console.log("Trading bot stopped");
            
            // Stop market analysis if running
            if (marketAnalysis) {
                marketAnalysis.stopAnalysis();
            }
        }
    }
}

export const tradingEngine = new TradingEngine();
