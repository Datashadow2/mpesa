/**
 * M-PESA Message Generator - Complete Production JavaScript
 * Google Messages Style Conversation Simulator
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        PROMO_LINE: 'Download My OneApp on https://saf.cx/kWQpy',
        DAILY_LIMIT: 499500,
        STORAGE_KEY: 'mpesa_conversation_data',
        REFS_STORAGE_KEY: 'mpesa_transaction_refs'
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
   const Utils = {
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    },

    formatCurrency: function(amount) {
        return 'Ksh' + Number(amount).toFixed(2);
    },

    formatCurrencyWithCommas: function(amount) {
        return 'KSh ' + Number(amount).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    formatDate: function(date) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    },

    formatTime: function(date) {
        return date.toLocaleTimeString('en-KE', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    },

    getTodayStart: function() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },

    isToday: function(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    isYesterday: function(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
    },

    isValidPhone: function(phone) {
        const cleaned = phone.replace(/\s/g, '');

        return (
            /^07\d{8}$/.test(cleaned) ||
            /^01\d{8}$/.test(cleaned) ||
            /^2547\d{8}$/.test(cleaned) ||
            /^2541\d{8}$/.test(cleaned)
        );
    },

    formatPhone: function(phone) {
        let cleaned = phone.replace(/\s/g, '');

        if (cleaned.startsWith('254')) {
            cleaned = '0' + cleaned.substring(3);
        }

        if (/^0\d{9}$/.test(cleaned)) {
            return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1$2$3');
        }

        return cleaned;
    }
};
    // ============================================
    // REFERENCE GENERATOR
    // ============================================
    const ReferenceGenerator = {
        _usedRefs: new Set(),

        loadUsedRefs: function() {
            try {
                const saved = localStorage.getItem(CONFIG.REFS_STORAGE_KEY);
                if (saved) {
                    const refs = JSON.parse(saved);
                    this._usedRefs = new Set(refs);
                }
            } catch (e) {
                console.warn('Failed to load references:', e);
            }
        },

        saveUsedRefs: function() {
            try {
                const refs = Array.from(this._usedRefs);
                localStorage.setItem(CONFIG.REFS_STORAGE_KEY, JSON.stringify(refs));
            } catch (e) {
                console.warn('Failed to save references:', e);
            }
        },

        generate: function() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let ref;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                ref = 'U';
                for (let i = 0; i < 9; i++) {
                    ref += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                attempts++;
            } while (this._usedRefs.has(ref) && attempts < maxAttempts);

            if (attempts >= maxAttempts) {
                ref = 'U' + Date.now().toString(36).toUpperCase();
            }

            this._usedRefs.add(ref);
            this.saveUsedRefs();
            return ref;
        },

        clear: function() {
            this._usedRefs.clear();
            this.saveUsedRefs();
        }
    };

    // ============================================
    // STORAGE MANAGER
    // ============================================
    const StorageManager = {
        saveState: function(data) {
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                console.warn('Failed to save state:', e);
            }
        },

        loadState: function() {
            try {
                const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.warn('Failed to load state:', e);
            }
            return null;
        },

        clearState: function() {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
        }
    };

    // ============================================
    // BALANCE MANAGER
    // ============================================
    const BalanceManager = {
        _balance: 5000,
        _dailyUsage: 0,
        _lastResetDate: null,

        initialize: function(savedBalance, savedDailyUsage, savedDate) {
            this._balance = savedBalance || 5000;
            this._dailyUsage = savedDailyUsage || 0;
            this._lastResetDate = savedDate ? new Date(savedDate) : Utils.getTodayStart();

            this._checkDailyReset();
        },

        _checkDailyReset: function() {
            const today = Utils.getTodayStart();
            const lastReset = new Date(this._lastResetDate);
            
            if (today > lastReset) {
                this._dailyUsage = 0;
                this._lastResetDate = today;
            }
        },

        getBalance: function() {
            return this._balance;
        },

        getDailyRemaining: function() {
            this._checkDailyReset();
            return Math.max(0, CONFIG.DAILY_LIMIT - this._dailyUsage);
        },

        canTransact: function(amount) {
            if (amount <= 0) return false;
            if (amount > this._balance) return false;
            if (amount > this.getDailyRemaining()) return false;
            return true;
        },

        processTransaction: function(amount, fee) {
            if (!this.canTransact(amount)) {
                throw new Error('Invalid transaction');
            }

            const balanceBefore = this._balance;
            const newBalance = balanceBefore - amount - fee;
            
            this._balance = newBalance;
            this._dailyUsage += amount;
            this._checkDailyReset();

            return {
                balanceBefore: balanceBefore,
                balanceAfter: newBalance,
                dailyRemaining: this.getDailyRemaining()
            };
        },

        getState: function() {
            return {
                balance: this._balance,
                dailyUsage: this._dailyUsage,
                lastResetDate: this._lastResetDate
            };
        }
    };

    // ============================================
    // TRANSACTION ENGINE
    // ============================================
  // ============================================
// TRANSACTION ENGINE
// ============================================
const TransactionEngine = {
    FEE_TABLE: [
        { max: 49, fee: 0 },
        { max: 100, fee: 0 },
        { max: 500, fee: 7 },
        { max: 1000, fee: 13 },
        { max: 1500, fee: 23 },
        { max: 2500, fee: 33 },
        { max: 3500, fee: 53 },
        { max: 5000, fee: 57 },
        { max: 7500, fee: 78 },
        { max: 10000, fee: 90 },
        { max: 15000, fee: 100 },
        { max: 20000, fee: 105 },
        { max: 35000, fee: 108 },
        { max: 50000, fee: 108 },
        { max: 150000, fee: 108 },
        { max: Infinity, fee: 108 }
    ],

    calculateFee: function(amount) {
        const feeEntry = this.FEE_TABLE.find(f => amount <= f.max);
        return feeEntry ? feeEntry.fee : 108;
    },

    createTransaction: function(type, data) {
        const amount = Number(data.amount);
        const fee = this.calculateFee(amount);
        const reference = ReferenceGenerator.generate();
        const timestamp = new Date();

        const balanceResult = BalanceManager.processTransaction(amount, fee);

        return {
            id: Utils.generateId(),
            type: type,
            transactionReference: reference,
            timestamp: timestamp,
            amount: amount,
            fee: fee,
            balanceBefore: balanceResult.balanceBefore,
            balanceAfter: balanceResult.balanceAfter,
            dailyRemaining: balanceResult.dailyRemaining,
            recipient: data.recipient || null,
            business: data.business || null,
            till: data.till || null,
            phone: data.phone || null
        };
    }
};

    // ============================================
    // TEMPLATE ENGINE
    // ============================================
    const TemplateEngine = {
        _templates: {
            send: function(tx) {
                const phone = tx.phone ? Utils.formatPhone(tx.phone) : '';
                return `${tx.transactionReference} Confirmed. ${Utils.formatCurrencyWithCommas(tx.amount)} sent to ${tx.recipient} ${phone} on ${Utils.formatDate(tx.timestamp)} at ${Utils.formatTime(tx.timestamp)}. New M-PESA balance is ${Utils.formatCurrencyWithCommas(tx.balanceAfter)}. Transaction cost, ${Utils.formatCurrencyWithCommas(tx.fee)}. Amount you can transact within the day is ${Utils.formatCurrencyWithCommas(tx.dailyRemaining)}. ${CONFIG.PROMO_LINE}`;
            },

            pochi: function(tx) {
                return `${tx.transactionReference} Confirmed. ${Utils.formatCurrencyWithCommas(tx.amount)} sent to ${tx.business}  on ${Utils.formatDate(tx.timestamp)} at ${Utils.formatTime(tx.timestamp)}. New M-PESA balance is ${Utils.formatCurrencyWithCommas(tx.balanceAfter)}. Transaction cost, ${Utils.formatCurrencyWithCommas(tx.fee)}. Amount you can transact within the day is ${Utils.formatCurrencyWithCommas(tx.dailyRemaining)}. ${CONFIG.PROMO_LINE}`;
            },

            goods: function(tx) {
                return `${tx.transactionReference} Confirmed. ${Utils.formatCurrencyWithCommas(tx.amount)} paid to ${tx.business} Till ${tx.till} on ${Utils.formatDate(tx.timestamp)} at ${Utils.formatTime(tx.timestamp)}. New M-PESA balance is ${Utils.formatCurrencyWithCommas(tx.balanceAfter)}. Transaction cost, ${Utils.formatCurrencyWithCommas(tx.fee)}. Amount you can transact within the day is ${Utils.formatCurrencyWithCommas(tx.dailyRemaining)}. ${CONFIG.PROMO_LINE}`;
            }
        },

        generateMessage: function(tx) {
            const template = this._templates[tx.type];
            if (!template) {
                throw new Error('Unknown transaction type: ' + tx.type);
            }
            return template(tx);
        },

        generatePreview: function(tx) {
            const labels = {
                send: 'Send Money',
                pochi: 'Pochi',
                goods: 'Buy Goods'
            };
            return `${Utils.formatCurrencyWithCommas(tx.amount)} · ${labels[tx.type] || 'Transaction'}`;
        }
    };

    // ============================================
    // CONVERSATION MANAGER
    // ============================================
    const ConversationManager = {
        _messages: [],
        _listeners: [],

        initialize: function() {
            const saved = StorageManager.loadState();
            if (saved && saved.messages) {
                this._messages = saved.messages;
                BalanceManager.initialize(
                    saved.balance,
                    saved.dailyUsage,
                    saved.lastResetDate
                );
                ReferenceGenerator.loadUsedRefs();
            } else {
                BalanceManager.initialize();
                ReferenceGenerator.loadUsedRefs();
                this._messages = [];
            }
            this._notifyListeners();
        },

        addMessage: function(type, data) {
            const tx = TransactionEngine.createTransaction(type, data);
            const message = {
                id: tx.id,
                type: tx.type,
                transactionReference: tx.transactionReference,
                timestamp: tx.timestamp,
                amount: tx.amount,
                fee: tx.fee,
                balanceBefore: tx.balanceBefore,
                balanceAfter: tx.balanceAfter,
                recipient: tx.recipient,
                business: tx.business,
                till: tx.till,
                phone: tx.phone,
                message: TemplateEngine.generateMessage(tx),
                preview: TemplateEngine.generatePreview(tx)
            };

            this._messages.push(message);
            this._saveState();
            this._notifyListeners();
            return message;
        },

        deleteMessage: function(id) {
            const index = this._messages.findIndex(msg => msg.id === id);
            if (index !== -1) {
                this._messages.splice(index, 1);
                this._saveState();
                this._notifyListeners();
                return true;
            }
            return false;
        },

        clearAll: function() {
            if (this._messages.length === 0) return false;
            this._messages = [];
            ReferenceGenerator.clear();
            BalanceManager.initialize();
            this._saveState();
            this._notifyListeners();
            return true;
        },

        getMessages: function() {
            return this._messages.slice();
        },

        getLastMessage: function() {
            return this._messages.length > 0 ? this._messages[this._messages.length - 1] : null;
        },

        getMessageCount: function() {
            return this._messages.length;
        },

        _saveState: function() {
            const state = {
                messages: this._messages,
                balance: BalanceManager.getBalance(),
                dailyUsage: BalanceManager._dailyUsage,
                lastResetDate: BalanceManager._lastResetDate
            };
            StorageManager.saveState(state);
        },

        _notifyListeners: function() {
            this._listeners.forEach(listener => {
                try {
                    listener(this._messages);
                } catch (e) {
                    console.warn('Listener error:', e);
                }
            });
        },

        addListener: function(callback) {
            if (typeof callback === 'function') {
                this._listeners.push(callback);
            }
        },

        removeListener: function(callback) {
            const index = this._listeners.indexOf(callback);
            if (index !== -1) {
                this._listeners.splice(index, 1);
            }
        }
    };

    // ============================================
    // UI MANAGER
    // ============================================
    const UIManager = {
        _selectedMessageId: null,
        _contextMenuOpen: false,
        _longPressTimer: null,

        initialize: function() {
            this._setupNavigation();
            this._setupGenerator();
            this._setupSettings();
            this._setupConversation();
            this._setupDeleteHandlers();

            ConversationManager.addListener(this._onMessagesChanged.bind(this));

            // Show home screen by default
            this.showScreen('home-screen');
        },

        _onMessagesChanged: function(messages) {
            this._renderAllMessages(messages);
            this._updateBalanceDisplay();
        },

        _setupNavigation: function() {
            // Home buttons
            document.querySelectorAll('.home-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget.dataset.target;
                    const transaction = e.currentTarget.dataset.transaction;
                    
                    if (target) {
                        this.showScreen(target);
                    } else if (transaction) {
                        this._setTransactionType(transaction);
                        this.showScreen('generator-screen');
                    }
                });
            });

            // Header back button
            const backBtn = document.querySelector('.header-back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.showScreen('home-screen');
                });
            }

            // Header menu button
            const menuBtn = document.querySelector('.header-menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    this._showConversationMenu(rect.left, rect.bottom);
                });
            }

            // Navigation buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget.dataset.target;
                    if (target === 'home-screen') this.showScreen('home-screen');
                    else if (target === 'generator-screen') {
                        this._setTransactionType('send');
                        this.showScreen('generator-screen');
                    }
                    else if (target === 'conversation-screen') this.showScreen('conversation-screen');
                    else if (target === 'settings-screen') this.showScreen('settings-screen');
                });
            });
        },

        _setupGenerator: function() {
            const form = document.getElementById('generator-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this._handleGenerate();
                });
            }
        },

        _setupSettings: function() {
            const saveBtn = document.getElementById('save-settings');
            const resetBtn = document.getElementById('reset-settings');
            const defaultBalance = document.getElementById('default-balance');
            const rememberBalance = document.getElementById('remember-balance');

            // Load settings
            const saved = StorageManager.loadState();
            if (saved && saved.settings) {
                if (defaultBalance) defaultBalance.value = saved.settings.defaultBalance || 5000;
                if (rememberBalance) rememberBalance.checked = saved.settings.rememberBalance !== false;
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    const state = StorageManager.loadState() || {};
                    const settings = {
                        defaultBalance: parseFloat(defaultBalance?.value) || 5000,
                        rememberBalance: rememberBalance?.checked !== false
                    };
                    state.settings = settings;
                    StorageManager.saveState(state);
                    
                    if (settings.rememberBalance) {
                        BalanceManager._balance = settings.defaultBalance;
                        this._updateBalanceDisplay();
                    }
                    alert('Settings saved successfully.');
                });
            }

            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    if (confirm('Reset all settings to default?')) {
                        const state = StorageManager.loadState() || {};
                        state.settings = {
                            defaultBalance: 5000,
                            rememberBalance: true
                        };
                        StorageManager.saveState(state);
                        BalanceManager._balance = 5000;
                        if (defaultBalance) defaultBalance.value = 5000;
                        if (rememberBalance) rememberBalance.checked = true;
                        this._updateBalanceDisplay();
                        alert('Settings reset to default.');
                    }
                });
            }
        },

        _setupConversation: function() {
            // Initial render
            this._renderAllMessages(ConversationManager.getMessages());
            this._updateBalanceDisplay();
        },

        _setupDeleteHandlers: function() {
            // Global click to hide context menus
            document.addEventListener('click', () => {
                this._hideContextMenu();
                this._hideConversationMenu();
            });

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this._hideContextMenu();
                    this._hideConversationMenu();
                }
            });
        },

        _setTransactionType: function(type) {
            const titles = {
                send: 'Send Money',
                pochi: 'Pochi la Biashara',
                goods: 'Buy Goods & Services'
            };
            
            const titleEl = document.getElementById('generator-title');
            if (titleEl) titleEl.textContent = titles[type] || 'Send Money';

            const fieldsContainer = document.getElementById('form-fields');
            if (!fieldsContainer) return;

            const currentBalance = BalanceManager.getBalance();
            let html = '';

            const commonFields = `
                <div class="field-group">
                    <label for="amount">Amount (Ksh)</label>
                    <input type="number" id="amount" placeholder="e.g. 500" min="1" step="0.01" required />
                </div>
                <div class="field-group">
                    <label for="balance">Current M-PESA Balance (Ksh)</label>
                    <input type="number" id="balance" min="0" step="0.01" value="${currentBalance.toFixed(2)}" required />
                </div>
            `;

            if (type === 'send') {
                html = `
                    <div class="field-group">
                        <label for="recipient">Recipient Name</label>
                        <input type="text" id="recipient" placeholder="e.g. John Doe" required />
                    </div>
                    <div class="field-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" placeholder="0712345678" required />
                    </div>
                    ${commonFields}
                `;
            } else if (type === 'pochi') {
                html = `
                    <div class="field-group">
                        <label for="business">Business Name</label>
                        <input type="text" id="business" placeholder="e.g. Mama Mboga" required />
                    </div>
                    ${commonFields}
                `;
            } else if (type === 'goods') {
                html = `
                    <div class="field-group">
                        <label for="business">Business Name</label>
                        <input type="text" id="business" placeholder="e.g. Supermarket" required />
                    </div>
                    <div class="field-group">
                        <label for="till">Till Number</label>
                        <input type="text" id="till" placeholder="e.g. 123456" required />
                    </div>
                    ${commonFields}
                `;
            }

            fieldsContainer.innerHTML = html;

            // Store current type for form submission
            fieldsContainer.dataset.transactionType = type;
        },

        _handleGenerate: function() {
            const fieldsContainer = document.getElementById('form-fields');
            const type = fieldsContainer?.dataset?.transactionType || 'send';

            const amountInput = document.getElementById('amount');
            const balanceInput = document.getElementById('balance');
            
            const amount = parseFloat(amountInput?.value);
            const currentBalance = parseFloat(balanceInput?.value);

            // Validation
            if (!amount || amount <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            if (isNaN(currentBalance) || currentBalance < 0) {
                alert('Please enter a valid balance.');
                return;
            }

            if (amount > currentBalance) {
                alert('Insufficient balance. Please top up or adjust amount.');
                return;
            }

            const data = { amount: amount };

            // Get transaction-specific fields
            if (type === 'send') {
                const recipient = document.getElementById('recipient');
                const phone = document.getElementById('phone');
                
                if (!recipient?.value.trim()) {
                    alert('Recipient name required.');
                    return;
                }
                if (!phone?.value.trim() || !Utils.isValidPhone(phone.value.trim())) {
                    alert('Enter a valid phone number (07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX).');
                    return;
                }
                data.recipient = recipient.value.trim();
                data.phone = phone.value.trim();
            } else if (type === 'pochi') {
                const business = document.getElementById('business');
                if (!business?.value.trim()) {
                    alert('Business name required.');
                    return;
                }
                data.business = business.value.trim();
            } else if (type === 'goods') {
                const business = document.getElementById('business');
                const till = document.getElementById('till');
                
                if (!business?.value.trim()) {
                    alert('Business name required.');
                    return;
                }
                if (!till?.value.trim() || !/^[0-9]{5,7}$/.test(till.value.trim())) {
                    alert('Enter a valid Till Number (5-7 digits).');
                    return;
                }
                data.business = business.value.trim();
                data.till = till.value.trim();
            }

            try {
                const message = ConversationManager.addMessage(type, data);
                
                // Update balance display
                this._updateBalanceDisplay();
                
                // Navigate to conversation
                this.showScreen('conversation-screen');
            } catch (error) {
                alert(error.message || 'Transaction failed. Please try again.');
            }
        },

        _renderAllMessages: function(messages) {
    const container = document.getElementById('message-list');
    if (!container) return;

    container.innerHTML = '';
    
    if (messages.length === 0) {
        return;
    }

    // Create a reversed copy of the messages array (newest first)
    const reversedMessages = [...messages].reverse();
    
    let lastDate = null;
    reversedMessages.forEach((msg, index) => {
        const date = new Date(msg.timestamp);
        const dateLabel = Utils.formatDate(date);
        
        // Add date separator
        if (dateLabel !== lastDate) {
            const separator = document.createElement('div');
            separator.className = 'date-separator';
            separator.textContent = dateLabel;
            separator.style.cssText = `
                text-align: center;
                color: #9AA0A6;
                font-size: 12px;
                padding: 12px 0 8px;
                letter-spacing: 0.3px;
            `;
            container.appendChild(separator);
            lastDate = dateLabel;
        }

        const messageEl = this._createMessageElement(msg);
        container.appendChild(messageEl);
    });

    // Remove this line to prevent auto-scrolling
    // this._scrollToBottom();
},
        _createMessageElement: function(msg) {
            const div = document.createElement('div');
            div.className = 'message-item';
            div.dataset.id = msg.id;

            // SMS Bubble
            const bubble = document.createElement('div');
            bubble.className = 'sms-bubble';
            bubble.textContent = msg.message;
            div.appendChild(bubble);

            // Preview Card
            const preview = document.createElement('div');
            preview.className = 'preview-card';
            preview.textContent = msg.preview || 'Tap to load preview';
            div.appendChild(preview);

            // Timestamp
            const time = document.createElement('div');
            time.className = 'timestamp';
            const date = new Date(msg.timestamp);
            time.textContent = Utils.formatTime(date);
            div.appendChild(time);

            // Event listeners for delete
            this._addMessageEvents(div);

            return div;
        },

        _addMessageEvents: function(element) {
            // Right-click (desktop)
            element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const id = element.dataset.id;
                this._showContextMenu(id, e.clientX, e.clientY);
            });

            // Long press (mobile)
            element.addEventListener('touchstart', (e) => {
                this._longPressTimer = setTimeout(() => {
                    const id = element.dataset.id;
                    const rect = element.getBoundingClientRect();
                    this._showContextMenu(id, rect.left + 10, rect.top + 10);
                }, 500);
            });

            element.addEventListener('touchend', () => {
                clearTimeout(this._longPressTimer);
            });

            element.addEventListener('touchmove', () => {
                clearTimeout(this._longPressTimer);
            });
        },

        _showContextMenu: function(messageId, x, y) {
            this._hideContextMenu();

            const menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.style.cssText = `
                position: fixed;
                left: ${Math.min(x, window.innerWidth - 180)}px;
                top: ${Math.min(y, window.innerHeight - 120)}px;
                background: #2A2A2A;
                border-radius: 12px;
                padding: 8px 0;
                box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                z-index: 1000;
                min-width: 160px;
                border: 1px solid #333;
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete Message';
            deleteBtn.style.cssText = `
                display: block;
                width: 100%;
                padding: 12px 20px;
                background: transparent;
                border: none;
                color: #FF4444;
                font-size: 14px;
                text-align: left;
                cursor: pointer;
                font-family: 'Roboto', Arial, sans-serif;
            `;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this message?')) {
                    ConversationManager.deleteMessage(messageId);
                }
                this._hideContextMenu();
            });

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.cssText = `
                display: block;
                width: 100%;
                padding: 12px 20px;
                background: transparent;
                border: none;
                color: #9AA0A6;
                font-size: 14px;
                text-align: left;
                cursor: pointer;
                font-family: 'Roboto', Arial, sans-serif;
                border-top: 1px solid #333;
            `;
            cancelBtn.addEventListener('click', () => {
                this._hideContextMenu();
            });

            menu.appendChild(deleteBtn);
            menu.appendChild(cancelBtn);
            document.body.appendChild(menu);

            this._contextMenuOpen = true;

            // Auto-hide on outside click
            setTimeout(() => {
                document.addEventListener('click', this._handleOutsideClick);
            }, 10);
        },

        _handleOutsideClick: function(e) {
            if (!e.target.closest('.context-menu')) {
                UIManager._hideContextMenu();
            }
        },

        _hideContextMenu: function() {
            const menu = document.querySelector('.context-menu');
            if (menu) menu.remove();
            document.removeEventListener('click', this._handleOutsideClick);
            this._contextMenuOpen = false;
        },

        _showConversationMenu: function(x, y) {
            this._hideConversationMenu();

            const menu = document.createElement('div');
            menu.className = 'conversation-menu';
            menu.style.cssText = `
                position: fixed;
                left: ${Math.min(x, window.innerWidth - 200)}px;
                top: ${Math.min(y, window.innerHeight - 160)}px;
                background: #2A2A2A;
                border-radius: 12px;
                padding: 8px 0;
                box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                z-index: 1000;
                min-width: 180px;
                border: 1px solid #333;
            `;

            const options = [
                { 
                    text: 'Clear Conversation', 
                    action: () => {
                        if (confirm('Delete all messages?')) {
                            ConversationManager.clearAll();
                        }
                    }, 
                    color: '#FF4444' 
                },
                { 
                    text: 'Settings', 
                    action: () => this.showScreen('settings-screen'), 
                    color: '#FFFFFF' 
                },
                { 
                    text: 'Close', 
                    action: () => this._hideConversationMenu(), 
                    color: '#9AA0A6' 
                }
            ];

            options.forEach((opt, index) => {
                const btn = document.createElement('button');
                btn.textContent = opt.text;
                btn.style.cssText = `
                    display: block;
                    width: 100%;
                    padding: 12px 20px;
                    background: transparent;
                    border: none;
                    color: ${opt.color};
                    font-size: 14px;
                    text-align: left;
                    cursor: pointer;
                    font-family: 'Roboto', Arial, sans-serif;
                    ${index > 0 ? 'border-top: 1px solid #333;' : ''}
                `;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    opt.action();
                    this._hideConversationMenu();
                });
                menu.appendChild(btn);
            });

            document.body.appendChild(menu);

            // Auto-hide on outside click
            setTimeout(() => {
                document.addEventListener('click', this._handleConversationMenuOutside);
            }, 10);
        },

        _handleConversationMenuOutside: function(e) {
            if (!e.target.closest('.conversation-menu')) {
                UIManager._hideConversationMenu();
            }
        },

        _hideConversationMenu: function() {
            const menu = document.querySelector('.conversation-menu');
            if (menu) menu.remove();
            document.removeEventListener('click', this._handleConversationMenuOutside);
        },

        _updateBalanceDisplay: function() {
            const balance = BalanceManager.getBalance();
            const dailyRemaining = BalanceManager.getDailyRemaining();

            const balanceInputs = document.querySelectorAll('#balance');
            balanceInputs.forEach(input => {
                input.value = balance.toFixed(2);
            });

            // Update any balance display elements
            const balanceDisplays = document.querySelectorAll('.balance-display');
            balanceDisplays.forEach(el => {
                el.textContent = Utils.formatCurrencyWithCommas(balance);
            });
        },

        _scrollToBottom: function() {
            const container = document.getElementById('message-list');
            if (container) {
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 50);
            }
        },

        showScreen: function(screenId) {
            const screens = {
                home: document.getElementById('home-screen'),
                generator: document.getElementById('generator-screen'),
                conversation: document.getElementById('conversation-screen'),
                settings: document.getElementById('settings-screen')
            };

            Object.keys(screens).forEach(key => {
                const el = screens[key];
                if (el) {
                    el.classList.toggle('active', el.id === screenId);
                }
            });

            if (screenId === 'conversation-screen') {
                this._renderAllMessages(ConversationManager.getMessages());
            }

            if (screenId === 'generator-screen') {
                this._updateBalanceDisplay();
            }
        }
    };

    // ============================================
    // APP INITIALIZATION
    // ============================================
    const App = {
        initialize: function() {
            // Initialize core systems
            ReferenceGenerator.loadUsedRefs();
            
            const saved = StorageManager.loadState();
            if (saved) {
                BalanceManager.initialize(
                    saved.balance,
                    saved.dailyUsage,
                    saved.lastResetDate
                );
                if (saved.messages) {
                    ConversationManager._messages = saved.messages;
                }
            } else {
                BalanceManager.initialize();
            }

            // Initialize UI
            UIManager.initialize();

            console.log('M-PESA Message Generator initialized successfully.');
            console.log(`Messages: ${ConversationManager.getMessageCount()}, Balance: ${Utils.formatCurrencyWithCommas(BalanceManager.getBalance())}`);
        }
    };

    // ============================================
    // START
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.initialize);
    } else {
        App.initialize();
    }

})();
