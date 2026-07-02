// script.js
(function() {
    'use strict';

    // ----- DOM refs -----
    const screens = {
        home: document.getElementById('home-screen'),
        generator: document.getElementById('generator-screen'),
        conversation: document.getElementById('conversation-screen'),
        settings: document.getElementById('settings-screen'),
    };
    const navBtns = document.querySelectorAll('.nav-btn');
    const formFields = document.getElementById('form-fields');
    const generatorTitle = document.getElementById('generator-title');
    const generatorForm = document.getElementById('generator-form');
    const messageList = document.getElementById('message-list');
    const defaultBalanceInput = document.getElementById('default-balance');
    const rememberBalanceCheck = document.getElementById('remember-balance');
    const saveSettingsBtn = document.getElementById('save-settings');
    const resetSettingsBtn = document.getElementById('reset-settings');

    // ----- State -----
    let currentTransaction = 'send'; // 'send' | 'pochi' | 'goods'
    let balance = 5000; // current balance (Ksh)
    let dailyLimitRemaining = 499500; // fixed for demo, real M-PESA daily limit

    // ----- Settings / LocalStorage -----
    function loadSettings() {
        try {
            const saved = localStorage.getItem('mpesa_settings');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.balance !== undefined) balance = data.balance;
                if (data.remember !== undefined) {
                    rememberBalanceCheck.checked = data.remember;
                }
                if (data.dailyLimit !== undefined) dailyLimitRemaining = data.dailyLimit;
                defaultBalanceInput.value = balance;
            }
        } catch (_) { /* ignore */ }
    }

    function saveSettingsToStorage() {
        const settings = {
            balance: parseFloat(defaultBalanceInput.value) || 0,
            remember: rememberBalanceCheck.checked,
            dailyLimit: dailyLimitRemaining,
        };
        localStorage.setItem('mpesa_settings', JSON.stringify(settings));
        if (settings.remember) {
            balance = settings.balance;
        }
        // update default balance field
        defaultBalanceInput.value = balance;
    }

    function resetSettings() {
        localStorage.removeItem('mpesa_settings');
        balance = 5000;
        dailyLimitRemaining = 499500;
        defaultBalanceInput.value = balance;
        rememberBalanceCheck.checked = true;
        saveSettingsToStorage();
        // also reset any balance in state
    }

    // ----- Navigation -----
    function showScreen(screenId) {
        Object.keys(screens).forEach(key => {
            const el = screens[key];
            el.classList.toggle('active', el.id === screenId);
        });
        // update nav active
        navBtns.forEach(btn => {
            const target = btn.dataset.target;
            btn.classList.toggle('active', target === screenId);
        });
        // if conversation, scroll to bottom
        if (screenId === 'conversation-screen') {
            messageList.scrollTop = messageList.scrollHeight;
        }
    }

    // ----- Transaction form builder -----
    function buildForm(transaction) {
        let html = '';
        const common = `
            <div class="field-group">
                <label for="amount">Amount (Ksh)</label>
                <input type="number" id="amount" placeholder="e.g. 500" min="1" step="0.01" required />
            </div>
            <div class="field-group">
                <label for="balance">Current M-PESA Balance (Ksh)</label>
                <input type="number" id="balance" placeholder="e.g. 5000" min="0" step="0.01" value="${balance}" required />
            </div>
        `;

        if (transaction === 'send') {
            html = `
                <div class="field-group">
                    <label for="recipient">Recipient Name</label>
                    <input type="text" id="recipient" placeholder="e.g. John Doe" required />
                </div>
                <div class="field-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="0712345678" pattern="[0-9]{10,12}" required />
                </div>
                ${common}
            `;
        } else if (transaction === 'pochi') {
            html = `
                <div class="field-group">
                    <label for="business">Business Name</label>
                    <input type="text" id="business" placeholder="e.g. Mama Mboga" required />
                </div>
                ${common}
            `;
        } else if (transaction === 'goods') {
            html = `
                <div class="field-group">
                    <label for="business">Business Name</label>
                    <input type="text" id="business" placeholder="e.g. Supermarket" required />
                </div>
                <div class="field-group">
                    <label for="till">Till Number</label>
                    <input type="text" id="till" placeholder="e.g. 123456" pattern="[0-9]{5,7}" required />
                </div>
                ${common}
            `;
        }
        formFields.innerHTML = html;
        // bind balance input to update state if remember is off? we keep as is
        const balInput = document.getElementById('balance');
        if (balInput) {
            balInput.value = balance;
            balInput.addEventListener('change', function() {
                const val = parseFloat(this.value);
                if (!isNaN(val) && val >= 0) balance = val;
            });
        }
        // set title
        const titles = {
            send: 'Send Money',
            pochi: 'Pochi la Biashara',
            goods: 'Buy Goods & Services',
        };
        generatorTitle.textContent = titles[transaction] || 'Send Money';
    }

    // ----- SMS generation -----
    function generateSMS(data) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const transCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const amt = parseFloat(data.amount);
        const bal = parseFloat(data.balance);
        let fee = 0;
        let newBal = bal - amt;

        // charges (Kenyan M-PESA consumer rates)
        if (amt <= 100) fee = 0;
        else if (amt <= 500) fee = 6;
        else if (amt <= 1000) fee = 12;
        else if (amt <= 1500) fee = 18;
        else if (amt <= 2500) fee = 28;
        else if (amt <= 3500) fee = 38;
        else if (amt <= 5000) fee = 48;
        else if (amt <= 7500) fee = 58;
        else if (amt <= 10000) fee = 68;
        else if (amt <= 15000) fee = 88;
        else if (amt <= 20000) fee = 108;
        else fee = 118;

        newBal = newBal - fee;
        if (newBal < 0) newBal = 0; // shouldn't happen if validation passes

        // daily limit (we keep a static 499500 for demo, subtract if needed)
        dailyLimitRemaining = Math.max(0, dailyLimitRemaining - amt);

        // Build message
        let msg = `${transCode} Confirmed. `;
        if (data.transaction === 'send') {
            msg += `Ksh${amt.toFixed(2)} sent to ${data.recipient} ${data.phone} on ${dateStr} at ${timeStr}. `;
        } else if (data.transaction === 'pochi') {
            msg += `Ksh${amt.toFixed(2)} sent to ${data.business} (Pochi) on ${dateStr} at ${timeStr}. `;
        } else if (data.transaction === 'goods') {
            msg += `Ksh${amt.toFixed(2)} sent to ${data.business} Till ${data.till} on ${dateStr} at ${timeStr}. `;
        }
        msg += `New M-PESA balance is Ksh${newBal.toFixed(2)}. Transaction cost, Ksh${fee.toFixed(2)}. `;
        msg += `Amount you can transact within the day is Ksh${dailyLimitRemaining.toFixed(2)}. Download My OneApp on https://saf.cx/kWQpy`;

        return { message: msg, newBalance: newBal, fee, dailyLimit: dailyLimitRemaining };
    }

    // ----- Add message to conversation -----
    function addMessageToConversation(smsText, previewText) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-item';

        const bubble = document.createElement('div');
        bubble.className = 'sms-bubble';
        bubble.textContent = smsText;
        messageDiv.appendChild(bubble);

        const preview = document.createElement('div');
        preview.className = 'preview-card';
        preview.textContent = previewText || 'Tap to load preview';
        messageDiv.appendChild(preview);

        const time = document.createElement('div');
        time.className = 'timestamp';
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        time.textContent = `${dateStr}, ${timeStr}`;
        messageDiv.appendChild(time);

        messageList.appendChild(messageDiv);
        messageList.scrollTop = messageList.scrollHeight;
    }

    // ----- Form handler -----
    function handleGenerate(e) {
        e.preventDefault();
        const form = generatorForm;
        const amtInput = document.getElementById('amount');
        const balInput = document.getElementById('balance');
        const amount = parseFloat(amtInput.value);
        const currentBal = parseFloat(balInput.value);

        // validation
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (isNaN(currentBal) || currentBal < 0) {
            alert('Please enter a valid balance.');
            return;
        }
        if (amount > currentBal) {
            alert('Insufficient balance. Please top up or adjust amount.');
            return;
        }

        const data = { transaction: currentTransaction, amount, balance: currentBal };

        if (currentTransaction === 'send') {
            const recip = document.getElementById('recipient');
            const phone = document.getElementById('phone');
            if (!recip.value.trim()) { alert('Recipient name required.'); return; }
            if (!phone.value.trim() || !/^[0-9]{10,12}$/.test(phone.value.trim())) {
                alert('Enter a valid phone number (10-12 digits).');
                return;
            }
            data.recipient = recip.value.trim();
            data.phone = phone.value.trim();
        } else if (currentTransaction === 'pochi') {
            const biz = document.getElementById('business');
            if (!biz.value.trim()) { alert('Business name required.'); return; }
            data.business = biz.value.trim();
        } else if (currentTransaction === 'goods') {
            const biz = document.getElementById('business');
            const till = document.getElementById('till');
            if (!biz.value.trim()) { alert('Business name required.'); return; }
            if (!till.value.trim() || !/^[0-9]{5,7}$/.test(till.value.trim())) {
                alert('Enter a valid Till Number (5-7 digits).');
                return;
            }
            data.business = biz.value.trim();
            data.till = till.value.trim();
        }

        // generate
        const result = generateSMS(data);
        // update balance state and input
        balance = result.newBalance;
        const balField = document.getElementById('balance');
        if (balField) balField.value = balance.toFixed(2);
        // daily limit update
        dailyLimitRemaining = result.dailyLimit;

        // add to conversation
        addMessageToConversation(result.message, `Ksh${amount.toFixed(2)} · ${currentTransaction === 'send' ? 'Send Money' : currentTransaction === 'pochi' ? 'Pochi' : 'Goods'}`);

        // Save settings if remember balance is on
        if (rememberBalanceCheck.checked) {
            saveSettingsToStorage();
        }

        // reset form? we keep values
        // navigate to conversation
        showScreen('conversation-screen');
    }

    // ----- Event listeners -----
    // Home buttons
    document.querySelectorAll('.home-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            if (target) {
                showScreen(target);
                return;
            }
            const tx = this.dataset.transaction;
            if (tx) {
                currentTransaction = tx;
                buildForm(tx);
                showScreen('generator-screen');
            }
        });
    });

    // Bottom nav
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            if (target) {
                // if generator, keep current transaction
                if (target === 'generator-screen') {
                    buildForm(currentTransaction);
                }
                showScreen(target);
            }
        });
    });

    // Generator submit
    generatorForm.addEventListener('submit', handleGenerate);

    // Settings
    saveSettingsBtn.addEventListener('click', function() {
        saveSettingsToStorage();
        alert('Settings saved.');
    });
    resetSettingsBtn.addEventListener('click', function() {
        resetSettings();
        // refresh balance in form if visible
        const balField = document.getElementById('balance');
        if (balField) balField.value = balance;
        defaultBalanceInput.value = balance;
        alert('Settings reset to default.');
    });

    // init
    function init() {
        loadSettings();
        // if remember is off, reset balance to default? we respect loaded
        if (!rememberBalanceCheck.checked) {
            // set balance from default input
            balance = parseFloat(defaultBalanceInput.value) || 5000;
        }
        // ensure default input reflects balance
        defaultBalanceInput.value = balance;
        buildForm('send');
        showScreen('home-screen');
        // add a sample message so conversation isn't empty
        addMessageToConversation(
            'QWE123ABC Confirmed. Ksh500.00 sent to John Doe 0712345678 on 02/07/26 at 11:58 AM. New M-PESA balance is Ksh5200.00. Transaction cost, Ksh13.00. Amount you can transact within the day is Ksh499500.00. Download My OneApp on https://saf.cx/kWQpy',
            'Ksh500.00 · Send Money'
        );
        // add one more for demo
        addMessageToConversation(
            'XYZ987DEF Confirmed. Ksh250.00 sent to Mama Mboga (Pochi) on 02/07/26 at 12:15 PM. New M-PESA balance is Ksh4950.00. Transaction cost, Ksh6.00. Amount you can transact within the day is Ksh499250.00. Download My OneApp on https://saf.cx/kWQpy',
            'Ksh250.00 · Pochi'
        );
    }

    init();
})();
