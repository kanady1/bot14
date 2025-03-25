import { config } from './config.js';

class BinanceApi {
    constructor() {
        if (!config.supportedExchanges || !config.supportedExchanges.binance) {
            throw new Error("Missing Binance exchange configuration in config.js.");
        }

        this.apiKey = localStorage.getItem('binance_api_key') || '';
        this.apiSecret = localStorage.getItem('binance_api_secret') || '';
        this.endpoint = config.supportedExchanges.binance.restEndpoint;

        if (!this.endpoint) {
            throw new Error("Binance API endpoint is undefined.");
        }
    }

    async placeOrder(symbol, side, quantity, leverage = 1, stopLoss = null, takeProfit = null) {
        if (!this.apiKey || !this.apiSecret) {
            console.error("API Key or Secret is missing.");
            return null;
        }

        // First set leverage if provided
        if (leverage > 1) {
            try {
                await this.setLeverage(symbol, leverage);
            } catch (error) {
                console.error("Error setting leverage:", error);
                return null;
            }
        }

        const timestamp = Date.now();
        const params = new URLSearchParams({
            symbol,
            side: side.toUpperCase(),
            type: 'MARKET',
            quantity,
            timestamp
        });

        try {
            const response = await fetch(`${this.endpoint}/api/v3/order`, {
                method: 'POST',
                headers: {
                    'X-MBX-APIKEY': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            const data = await response.json();
            if (data.orderId) {
                console.log(`Order placed successfully: ${data.orderId}`);
                
                // If stop loss or take profit are provided, place those orders
                if (stopLoss) {
                    this.placeStopLossOrder(symbol, side === 'buy' ? 'sell' : 'buy', quantity, stopLoss, data.price);
                }
                
                if (takeProfit) {
                    this.placeTakeProfitOrder(symbol, side === 'buy' ? 'sell' : 'buy', quantity, takeProfit, data.price);
                }
                
                return data;
            } else {
                console.error("Order failed:", data);
                return null;
            }
        } catch (error) {
            console.error('Order error:', error);
            return null;
        }
    }
    
    async setLeverage(symbol, leverage) {
        const timestamp = Date.now();
        const params = new URLSearchParams({
            symbol,
            leverage,
            timestamp
        });
        
        try {
            const response = await fetch(`${this.endpoint}/fapi/v1/leverage`, {
                method: 'POST',
                headers: {
                    'X-MBX-APIKEY': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            
            const data = await response.json();
            if (data.leverage) {
                console.log(`Leverage set to ${data.leverage}x for ${symbol}`);
                return true;
            } else {
                console.error("Failed to set leverage:", data);
                return false;
            }
        } catch (error) {
            console.error('Error setting leverage:', error);
            return false;
        }
    }
    
    async placeStopLossOrder(symbol, side, quantity, percentage, entryPrice) {
        // Calculate stop price based on percentage and entry price
        const stopPrice = side === 'sell' 
            ? entryPrice * (1 - percentage/100)  // For long positions
            : entryPrice * (1 + percentage/100); // For short positions
            
        // Place stop loss order
        console.log(`Placing stop loss order at ${stopPrice}`);
        // Implementation would go here in a real system
    }
    
    async placeTakeProfitOrder(symbol, side, quantity, percentage, entryPrice) {
        // Calculate take profit price based on percentage and entry price
        const takeProfitPrice = side === 'sell' 
            ? entryPrice * (1 + percentage/100)  // For long positions
            : entryPrice * (1 - percentage/100); // For short positions
            
        // Place take profit order
        console.log(`Placing take profit order at ${takeProfitPrice}`);
        // Implementation would go here in a real system
    }
}

export const binanceApi = new BinanceApi();
