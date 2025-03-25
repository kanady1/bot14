export const config = {
    tradingMode: localStorage.getItem('tradingMode') || 'real',

    // Admin Configuration
    adminUsername: localStorage.getItem('adminUsername') || 'admin',
    adminPassword: localStorage.getItem('adminPassword') || 'admin123',

    // Trading Modes Text
    tradingModes: {
        real: 'حقيقي',
        simulated: 'وهمي'
    },

    // Subscription Plans
    subscriptionFees: {
        monthly: 100,
        quarterly: 250,
        yearly: 800
    },

    // Exchange Configuration
    supportedExchanges: {
        binance: {
            name: 'Binance',
            wsEndpoint: 'wss://stream.binance.com:9443/ws',
            restEndpoint: 'https://api.binance.com',
            testnetEndpoint: 'https://testnet.binance.vision'
        }
    },

    // Trading Parameters
    defaultTradingPair: 'BTCUSDT',
    availablePairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT'],
    defaultLeverage: 5,
    strategies: {
        trendFollowing: 'اتباع الاتجاه',
        breakout: 'اختراق السعر',
        meanReversion: 'العودة للمتوسط',
        scalping: 'سكالبينج',
        grid: 'شبكي'
    },

    // Risk Management
    maxTradesPerDay: 10,
    defaultRiskPercentage: 2,
    defaultStopLoss: 5,
    defaultTakeProfit: 10,
    leverageOptions: [1, 2, 3, 5, 10, 20, 50, 100],

    // Trading mode translations
    tradingModeText: {
        real: 'حقيقي',
        simulated: 'وهمي'
    },

    // User registration settings
    minPasswordLength: 6,
    allowedSubscriptionTypes: ['monthly', 'quarterly', 'yearly'],
    
    // UI text
    translations: {
        success: {
            login: 'تم تسجيل الدخول بنجاح!',
            register: 'تم التسجيل بنجاح!',
            logout: 'تم تسجيل الخروج بنجاح!'
        },
        errors: {
            login: 'خطأ في تسجيل الدخول',
            register: 'خطأ في التسجيل',
            invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        }
    }
};
