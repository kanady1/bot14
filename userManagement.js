export class User {
    constructor(username, password, apiKeys = {}, subscription = {}) {
        this.username = username;
        this.password = password;
        this.apiKeys = apiKeys;
        this.subscription = subscription;
        this.trades = [];
    }
}

class UserManager {
    constructor() {
        this.users = new Map();
        this.loadUsers();
    }

    loadUsers() {
        const savedUsers = localStorage.getItem('trading_bot_users');
        if (savedUsers) {
            const userArray = JSON.parse(savedUsers);
            userArray.forEach(user => {
                this.users.set(user.username, new User(
                    user.username,
                    user.password,
                    user.apiKeys,
                    user.subscription
                ));
            });
        }

        // Ensure admin account exists
        if (!this.getUser('admin')) {
            this.addUser('admin', 'admin123', 'admin', new Date());
        }
    }

    saveUsers() {
        localStorage.setItem('trading_bot_users', 
            JSON.stringify(Array.from(this.users.values())));
    }

    addUser(username, password, subscriptionType, startDate) {
        let endDate = new Date(startDate);
        
        if (subscriptionType === 'admin') {
            // Admin never expires
            endDate = null;
        } else {
            switch (subscriptionType) {
                case 'monthly':
                    endDate.setMonth(endDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    endDate.setMonth(endDate.getMonth() + 3);
                    break;
                case 'yearly':
                    endDate.setFullYear(endDate.getFullYear() + 1);
                    break;
            }
        }

        const user = new User(username, password, {}, {
            type: subscriptionType,
            startDate,
            endDate,
            fee: subscriptionType === 'admin' ? 0 : config.subscriptionFees[subscriptionType]
        });

        this.users.set(username, user);
        this.saveUsers();
        return user;
    }

    validateUser(username, password) {
        const user = this.users.get(username);
        return user && user.password === password ? user : null;
    }

    getUser(username) {
        return this.users.get(username) || null;
    }

    updateUserApiKeys(username, apiKeys) {
        const user = this.getUser(username);
        if (user) {
            user.apiKeys = apiKeys;
            this.saveUsers();
        }
    }
}

import { config } from './config.js';
export const userManager = new UserManager();
