// PlayFab Integration - User authentication and cross-device cloud saves
// Microsoft Azure PlayFab - Title ID: 1A2EEC
//
// NOTE: Before deployment, configure OAuth credentials:
//   Google: https://console.cloud.google.com/ → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application)

const PlayFabManager = {
    TITLE_ID: '1A2EEC',

    // Replace with your Google OAuth 2.0 Client ID (Web application type)
    GOOGLE_CLIENT_ID: '661838243073-qca79m7g1ct4of9ron7fjbpcuftnp4k6.apps.googleusercontent.com',

    isLoggedIn: false,
    playFabId: null,
    sessionTicket: null,
    displayName: null,

    // Initialize PlayFab SDK and restore any existing session
    initialize() {
        if (typeof PlayFab !== 'undefined') {
            PlayFab.settings.titleId = this.TITLE_ID
        }
        this._restoreSession()
    },

    _restoreSession() {
        try {
            const raw = localStorage.getItem('playfabSession')
            if (!raw) return
            const data = JSON.parse(raw)
            if (data.playFabId && data.sessionTicket) {
                this.playFabId = data.playFabId
                this.sessionTicket = data.sessionTicket
                this.displayName = data.displayName || null
                this.isLoggedIn = true
                if (typeof PlayFab !== 'undefined') {
                    PlayFab.settings.sessionTicket = this.sessionTicket
                }
                console.log('PlayFab: Session restored for', this.playFabId)
            }
        } catch (e) {
            // Clear any corrupted session data to prevent stale state
            try { localStorage.removeItem('playfabSession') } catch (_) {}
            console.warn('PlayFab: Failed to restore session — cleared', e)
        }
    },

    _persistSession() {
        try {
            localStorage.setItem('playfabSession', JSON.stringify({
                playFabId: this.playFabId,
                sessionTicket: this.sessionTicket,
                displayName: this.displayName
            }))
        } catch (e) {
            console.warn('PlayFab: Failed to persist session', e)
        }
    },

    _applySession(playFabId, sessionTicket, displayName) {
        this.playFabId = playFabId
        this.sessionTicket = sessionTicket
        this.displayName = displayName || null
        this.isLoggedIn = true
        if (typeof PlayFab !== 'undefined') {
            PlayFab.settings.sessionTicket = sessionTicket
        }
        this._persistSession()
    },

    // Log out the current user
    logout() {
        this.playFabId = null
        this.sessionTicket = null
        this.displayName = null
        this.isLoggedIn = false
        try {
            localStorage.removeItem('playfabSession')
        } catch (e) {}
        console.log('PlayFab: Logged out')
    },

    // Initiate Google Sign-In flow and authenticate with PlayFab
    loginWithGoogle(callback) {
        if (typeof google === 'undefined' || !google.accounts) {
            callback(new Error('Google Sign-In is not available. Check your connection.'), null)
            return
        }
        if (this.GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
            callback(new Error('Google Sign-In is not configured. Set GOOGLE_CLIENT_ID in playfabConfig.js.'), null)
            return
        }
        try {
            const client = google.accounts.oauth2.initTokenClient({
                client_id: this.GOOGLE_CLIENT_ID,
                scope: 'openid profile email',
                callback: (response) => {
                    if (response.error) {
                        callback(new Error(response.error_description || response.error), null)
                        return
                    }
                    this._playfabLoginGoogle(response.access_token, callback)
                },
                error_callback: (err) => {
                    // Handles popup blocked / user closed window etc.
                    callback(new Error(err.message || 'Google Sign-In was cancelled or blocked'), null)
                }
            })
            client.requestAccessToken()
        } catch (e) {
            callback(new Error('Google Sign-In failed: ' + e.message), null)
        }
    },

    _playfabLoginGoogle(accessToken, callback) {
        if (typeof PlayFabClientSDK === 'undefined') {
            callback(new Error('PlayFab SDK not loaded'), null)
            return
        }
        PlayFabClientSDK.LoginWithGoogleAccount({
            AccessToken: accessToken,
            TitleId: this.TITLE_ID,
            CreateAccount: true,
            InfoRequestParameters: { GetUserAccountInfo: true }
        }, (result, error) => {
            if (error) {
                callback(new Error(error.errorMessage || 'PlayFab Google login failed'), null)
                return
            }
            const name = result.data.InfoResultPayload?.AccountInfo?.TitleInfo?.DisplayName || null
            this._applySession(result.data.PlayFabId, result.data.SessionTicket, name)
            callback(null, result.data)
        })
    },

    // Save progress data to PlayFab cloud (fire-and-forget)
    saveProgressToCloud(data) {
        if (!this.isLoggedIn || typeof PlayFabClientSDK === 'undefined') return
        PlayFabClientSDK.UpdateUserData({
            Data: { starTrekAuroraProgress: JSON.stringify(data) }
        }, (result, error) => {
            if (error) {
                console.warn('PlayFab: Cloud save failed —', error.errorMessage)
            } else {
                console.log('PlayFab: Progress saved to cloud')
            }
        })
    },

    // Load progress from PlayFab cloud
    loadProgressFromCloud(callback) {
        if (!this.isLoggedIn || typeof PlayFabClientSDK === 'undefined') {
            callback(new Error('Not logged in'), null)
            return
        }
        PlayFabClientSDK.GetUserData({
            Keys: ['starTrekAuroraProgress']
        }, (result, error) => {
            if (error) {
                callback(new Error(error.errorMessage || 'Cloud load failed'), null)
                return
            }
            const entry = result.data?.Data?.starTrekAuroraProgress
            if (entry?.Value) {
                try {
                    callback(null, JSON.parse(entry.Value))
                } catch (e) {
                    callback(new Error('Failed to parse cloud save data'), null)
                }
            } else {
                callback(null, null) // No cloud save exists yet for this account
            }
        })
    }
}
