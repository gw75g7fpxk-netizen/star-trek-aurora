// Login Modal Controller - Manages the crew authentication overlay UI
// Works with PlayFabManager (playfabConfig.js) and ProgressConfig (progressConfig.js)

const LoginModal = {
    _onClose: null,

    // Show the modal. onClose is called when the modal is dismissed (login or cancel).
    show(onClose) {
        this._onClose = onClose || null
        const modal = document.getElementById('login-modal')
        if (!modal) return
        this._refresh()
        modal.style.display = 'flex'
    },

    hide() {
        const modal = document.getElementById('login-modal')
        if (modal) modal.style.display = 'none'
        if (this._onClose) {
            const cb = this._onClose
            this._onClose = null
            cb()
        }
    },

    _refresh() {
        const loggedIn = typeof PlayFabManager !== 'undefined' && PlayFabManager.isLoggedIn
        const optionsEl = document.getElementById('login-options')
        const statusEl = document.getElementById('login-status-panel')
        const userEl = document.getElementById('login-user-label')
        const msgEl = document.getElementById('login-message')
        if (optionsEl) optionsEl.style.display = loggedIn ? 'none' : 'block'
        if (statusEl) statusEl.style.display = loggedIn ? 'block' : 'none'
        if (msgEl) msgEl.textContent = ''
        if (loggedIn && userEl) {
            const name = PlayFabManager.displayName || PlayFabManager.playFabId || 'Unknown'
            userEl.textContent = 'Connected: ' + name
        }
    },

    _setMessage(text, color) {
        const el = document.getElementById('login-message')
        if (!el) return
        el.textContent = text
        el.style.color = color || '#AAAAEE'
    },

    _setButtons(enabled) {
        const btns = document.querySelectorAll('#login-modal button')
        btns.forEach(b => {
            b.disabled = !enabled
            b.style.opacity = enabled ? '1' : '0.5'
            b.style.cursor = enabled ? 'pointer' : 'default'
        })
    },

    triggerGoogle() {
        if (typeof PlayFabManager === 'undefined') {
            this._setMessage('Service unavailable. Try again later.', '#FF6666')
            return
        }
        this._setButtons(false)
        this._setMessage('Connecting to Google\u2026', '#AAAAEE')
        PlayFabManager.loginWithGoogle((error, data) => {
            this._setButtons(true)
            if (error) {
                this._setMessage(error.message, '#FF6666')
                return
            }
            this._setMessage('Login successful! Syncing\u2026', '#00CC88')
            if (typeof ProgressConfig !== 'undefined') {
                ProgressConfig.syncFromCloud(() => {
                    setTimeout(() => this.hide(), 1200)
                })
            } else {
                setTimeout(() => this.hide(), 1200)
            }
        })
    },

    triggerLogout() {
        if (typeof PlayFabManager !== 'undefined') {
            PlayFabManager.logout()
        }
        this._refresh()
        this.hide()
    }
}
