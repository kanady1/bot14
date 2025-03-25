import { config } from './config.js';

class MarketAnalysis {
    constructor() {
        this.isAnalyzing = false;
        this.marketData = {};
        this.analysisInterval = null;
    }
    
    startAnalysis() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        console.log("Market analysis started");
        
        // Update UI
        const analysisStatus = document.getElementById('analysisStatus');
        if (analysisStatus) {
            analysisStatus.textContent = "حالة التحليل: نشط";
            analysisStatus.classList.add('active');
        }
        
        // Simulate continuous market analysis
        this.analysisInterval = setInterval(() => {
            this.analyzeMarket();
        }, 30000); // Analyze every 30 seconds
        
        // Do initial analysis
        this.analyzeMarket();
    }
    
    stopAnalysis() {
        if (!this.isAnalyzing) return;
        
        this.isAnalyzing = false;
        console.log("Market analysis stopped");
        
        // Update UI
        const analysisStatus = document.getElementById('analysisStatus');
        if (analysisStatus) {
            analysisStatus.textContent = "حالة التحليل: متوقف";
            analysisStatus.classList.remove('active');
        }
        
        // Clear interval
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
    }
    
    analyzeMarket() {
        const currentPair = document.getElementById('tradingPair')?.value || config.defaultTradingPair;
        
        // In a real application, you would fetch actual market data here
        // This is a placeholder to demonstrate the concept
        const marketSentiment = ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)];
        const trendStrength = Math.floor(Math.random() * 100);
        const volatility = Math.random() * 5;
        
        this.marketData = {
            pair: currentPair,
            sentiment: marketSentiment,
            trendStrength: trendStrength,
            volatility: volatility,
            timestamp: new Date()
        };
        
        // Update UI with analysis results
        this.updateAnalysisUI();
    }
    
    updateAnalysisUI() {
        const analysisContainer = document.getElementById('marketAnalysis');
        if (!analysisContainer) return;
        
        let sentimentText = '';
        let sentimentClass = '';
        
        switch(this.marketData.sentiment) {
            case 'bullish':
                sentimentText = 'صاعد';
                sentimentClass = 'bullish';
                break;
            case 'bearish':
                sentimentText = 'هابط';
                sentimentClass = 'bearish';
                break;
            default:
                sentimentText = 'محايد';
                sentimentClass = 'neutral';
        }
        
        analysisContainer.innerHTML = `
            <h3>تحليل السوق (${this.marketData.pair})</h3>
            <div class="analysis-data">
                <div class="analysis-item">
                    <span class="label">اتجاه السوق:</span>
                    <span class="value ${sentimentClass}">${sentimentText}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">قوة الاتجاه:</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${this.marketData.trendStrength}%"></div>
                    </div>
                    <span class="value">${this.marketData.trendStrength}%</span>
                </div>
                <div class="analysis-item">
                    <span class="label">التقلبات:</span>
                    <span class="value">${this.marketData.volatility.toFixed(2)}</span>
                </div>
                <div class="analysis-timestamp">
                    آخر تحديث: ${this.marketData.timestamp.toLocaleTimeString()}
                </div>
            </div>
        `;
    }
    
    getSuggestion() {
        if (!this.marketData.sentiment) return null;
        
        // Simple suggestion logic based on sentiment and trend strength
        if (this.marketData.sentiment === 'bullish' && this.marketData.trendStrength > 70) {
            return {
                action: 'buy',
                reason: 'اتجاه صاعد قوي في السوق',
                confidence: this.marketData.trendStrength
            };
        } else if (this.marketData.sentiment === 'bearish' && this.marketData.trendStrength > 70) {
            return {
                action: 'sell',
                reason: 'اتجاه هابط قوي في السوق',
                confidence: this.marketData.trendStrength
            };
        } else if (this.marketData.volatility > 4) {
            return {
                action: 'wait',
                reason: 'تقلبات عالية في السوق',
                confidence: Math.round(this.marketData.volatility * 20)
            };
        }
        
        return {
            action: 'wait',
            reason: 'لا توجد إشارات واضحة',
            confidence: 50
        };
    }
}

export const marketAnalysis = new MarketAnalysis();
