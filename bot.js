import { userManager } from './userManagement.js';
import { config } from './config.js';
import { tradingEngine } from './tradingEngine.js';

class TradingBot {
    constructor() {
        this.currentUser = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener("DOMContentLoaded", () => {
            this.setupButtons();
            this.updateUserStatus();
            this.updateUI();
        });
    }

    setupButtons() {
        document.getElementById("loginBtn")?.addEventListener("click", () => this.showLoginModal());
        document.getElementById("registerBtn")?.addEventListener("click", () => this.showRegisterModal());
        document.getElementById("settingsBtn")?.addEventListener("click", () => this.showSettingsModal());
        document.getElementById("viewUsersBtn")?.addEventListener("click", () => this.showUsersModal());
        document.getElementById("startTradingBtn")?.addEventListener("click", () => this.startTrading());
        document.getElementById("stopTradingBtn")?.addEventListener("click", () => this.stopTrading());
        document.getElementById("logoutBtn")?.addEventListener("click", () => this.logout());
    }

    updateUserStatus() {
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            try {
                const userData = JSON.parse(loggedInUser);
                const user = userManager.getUser(userData.username);
                if (user) {
                    this.currentUser = user;
                    console.log("User logged in:", this.currentUser.username);
                }
            } catch (error) {
                console.error("Error checking login:", error);
                localStorage.removeItem('currentUser');
            }
        }
    }

    updateUI() {
        const isLoggedIn = !!this.currentUser;
        const isAdmin = isLoggedIn && this.currentUser.subscription?.type === 'admin';
        
        document.getElementById('loginBtn')?.classList.toggle('hidden', isLoggedIn);
        document.getElementById('registerBtn')?.classList.toggle('hidden', isLoggedIn);
        document.getElementById('logoutBtn')?.classList.toggle('hidden', !isLoggedIn);
        document.getElementById('settingsBtn')?.classList.toggle('hidden', !isLoggedIn);
        document.getElementById('startTradingBtn')?.classList.toggle('hidden', !isLoggedIn);
        document.getElementById('stopTradingBtn')?.classList.toggle('hidden', !isLoggedIn);
        document.getElementById('viewUsersBtn')?.classList.toggle('hidden', !isAdmin);
    }

    showLoginModal() {
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <h2>تسجيل الدخول</h2>
                    <form id="loginForm" class="api-key-form">
                        <input type="text" id="loginUsername" placeholder="اسم المستخدم" required>
                        <input type="password" id="loginPassword" placeholder="كلمة المرور" required>
                        <div class="modal-buttons">
                            <button type="submit" class="btn primary">دخول</button>
                            <button type="button" class="btn danger" id="cancelLogin">إلغاء</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            const user = userManager.validateUser(username, password);
            if (user) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify({username: user.username}));
                this.updateUI();
                document.querySelector('.modal-overlay').remove();
                alert(config.translations.success.login);
            } else {
                alert(config.translations.errors.invalidCredentials);
            }
        });
        
        document.getElementById('cancelLogin').addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }

    showRegisterModal() {
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <h2>تسجيل جديد</h2>
                    <form id="registerForm" class="api-key-form">
                        <input type="text" id="registerUsername" placeholder="اسم المستخدم" required>
                        <input type="password" id="registerPassword" placeholder="كلمة المرور" required>
                        <select id="registerType" class="subscription-select">
                            <option value="user">مستخدم</option>
                            <option value="employee">موظف</option>
                        </select>
                        <div id="subscriptionOptions">
                            <select id="subscriptionType" class="subscription-select">
                                <option value="monthly">اشتراك شهري (${config.subscriptionFees.monthly} $)</option>
                                <option value="quarterly">اشتراك ربع سنوي (${config.subscriptionFees.quarterly} $)</option>
                                <option value="yearly">اشتراك سنوي (${config.subscriptionFees.yearly} $)</option>
                            </select>
                            <div class="date-container">
                                <label>تاريخ بداية الاشتراك:</label>
                                <input type="date" id="subscriptionStartDate" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        <div class="modal-buttons">
                            <button type="submit" class="btn primary">تسجيل</button>
                            <button type="button" class="btn danger" id="cancelRegister">إلغاء</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show/hide subscription options based on user type
        document.getElementById('registerType').addEventListener('change', (e) => {
            const isEmployee = e.target.value === 'employee';
            document.getElementById('subscriptionOptions').style.display = isEmployee ? 'none' : 'block';
        });
        
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const userType = document.getElementById('registerType').value;
            let subscriptionType = userType === 'employee' ? 'employee' : document.getElementById('subscriptionType').value;
            const startDate = new Date(document.getElementById('subscriptionStartDate').value);
            
            if (userManager.getUser(username)) {
                alert("اسم المستخدم موجود بالفعل");
                return;
            }
            
            if (password.length < config.minPasswordLength) {
                alert(`كلمة المرور يجب أن تكون على الأقل ${config.minPasswordLength} أحرف`);
                return;
            }
            
            userManager.addUser(username, password, subscriptionType, startDate);
            document.querySelector('.modal-overlay').remove();
            alert(config.translations.success.register);
        });
        
        document.getElementById('cancelRegister').addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }

    showUsersModal() {
        const users = Array.from(userManager.users.values());
        let userHtml = users.map(user => `<p>${user.username} - اشتراك: ${user.subscription.type}</p>`).join('');

        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <h2>قائمة المستخدمين</h2>
                    <div id="usersList">${userHtml}</div>
                    <div class="modal-buttons">
                        <button type="button" class="btn danger" id="closeUsersModal">إغلاق</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('closeUsersModal').addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }

    showSettingsModal() {
        if (!this.currentUser) return;
        
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <h2>إعدادات الحساب</h2>
                    <form id="settingsForm" class="api-key-form">
                        <label for="apiKey">مفتاح API</label>
                        <input type="text" id="apiKey" placeholder="مفتاح API من Binance" value="${this.currentUser.apiKeys.key || ''}">
                        <label for="apiSecret">سر API</label>
                        <input type="password" id="apiSecret" placeholder="سر API من Binance" value="${this.currentUser.apiKeys.secret || ''}">
                        <div class="modal-buttons">
                            <button type="submit" class="btn primary">حفظ</button>
                            <button type="button" class="btn danger" id="cancelSettings">إلغاء</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const apiKey = document.getElementById('apiKey').value;
            const apiSecret = document.getElementById('apiSecret').value;
            
            userManager.updateUserApiKeys(this.currentUser.username, { key: apiKey, secret: apiSecret });
            localStorage.setItem('binance_api_key', apiKey);
            localStorage.setItem('binance_api_secret', apiSecret);
            
            document.querySelector('.modal-overlay').remove();
            alert("تم حفظ إعدادات API بنجاح");
        });
        
        document.getElementById('cancelSettings').addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateUI();
        alert(config.translations.success.logout);
    }

    startTrading() {
        tradingEngine.start();
    }

    stopTrading() {
        tradingEngine.stop();
    }

    toggleTradingMode() {
        // This is already handled by tradingModeManager
    }
}

window.tradingBot = new TradingBot();
